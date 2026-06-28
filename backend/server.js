const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const archiver = require('archiver');
const { buildLibrary, getItem } = require('./scanner');

const app       = express();
const PORT      = process.env.PORT || 3000;
const MEDIA_ROOT = process.env.MEDIA_ROOT || '/volume1/media';

app.use(express.json());

// Serve the built React SPA
app.use(express.static(path.join(__dirname, 'public')));

// Serve media files for "Open" links.
// Video files get Content-Disposition: attachment so the browser hands off to the OS
// rather than trying to play them inline.
app.use('/media', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const videoExts = new Set(['.mkv', '.avi', '.mov', '.wmv', '.m4v', '.ts', '.m2ts', '.webm']);
  if (videoExts.has(ext)) {
    res.setHeader('Content-Disposition', 'attachment');
  }
  next();
}, express.static(MEDIA_ROOT, { dotfiles: 'ignore' }));

// Serve artwork (poster.jpg, backdrop.jpg, cover.jpg, etc.)
app.use('/art', express.static(MEDIA_ROOT, { dotfiles: 'ignore' }));

// --- In-memory library cache ---
let libraryCache = null;
let lastScanTime = null;

async function rescan() {
  try {
    libraryCache = await buildLibrary(MEDIA_ROOT);
    lastScanTime = new Date().toISOString();
    const total = Object.values(libraryCache).reduce((n, items) => n + items.length, 0);
    console.log(`[library] Scan complete — ${total} items (${lastScanTime})`);
  } catch (err) {
    console.error('[library] Scan failed:', err.message);
  }
}

async function ensureLibrary() {
  if (!libraryCache) await rescan();
  return libraryCache;
}

// Scan on startup so the library is ready before the first request
rescan();

// Re-scan every 60 seconds to pick up newly added files automatically
setInterval(rescan, 60_000);

// GET /api/library — category names and item counts
app.get('/api/library', async (req, res) => {
  try {
    const lib = await ensureLibrary();
    const categories = Object.entries(lib).map(([name, items]) => ({
      name,
      count: items.length,
    }));
    // smbPath lets the frontend build UNC paths for the "Open Folder" button
    res.json({ categories, lastScan: lastScanTime, smbPath: process.env.SMB_PATH || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/category/:name — all items in one category
app.get('/api/category/:name', async (req, res) => {
  try {
    const lib = await ensureLibrary();
    // Case-insensitive match so URLs are forgiving
    const key = Object.keys(lib).find(
      k => k.toLowerCase() === req.params.name.toLowerCase()
    );
    if (!key) return res.status(404).json({ error: 'Category not found' });
    res.json({ category: key, items: lib[key] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/item?path=Movies/Title+%282021%29 — single item detail
app.get('/api/item', async (req, res) => {
  try {
    const lib = await ensureLibrary();
    if (!req.query.path) return res.status(400).json({ error: 'Missing ?path= parameter' });
    const item = getItem(lib, req.query.path);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/play?path=... — returns an M3U playlist pointing at the media file's HTTP URL.
// The browser downloads the tiny .m3u file; VLC (set as default .m3u handler) opens it
// and streams the file directly from this server.
app.get('/api/play', (req, res) => {
  if (!req.query.path) return res.status(400).json({ error: 'Missing ?path= parameter' });

  // Build the full HTTP URL to the media file using the incoming request's host header
  // so the playlist works regardless of what IP or hostname the client used to reach us.
  const mediaUrl = `${req.protocol}://${req.get('host')}/media/${req.query.path}`;
  const filename = path.basename(req.query.path);

  const m3u = `#EXTM3U\n#EXTINF:-1,${filename}\n${mediaUrl}\n`;

  // inline (not attachment) skips the Save dialog; the .m3u extension lets Windows
  // hand the file to VLC automatically if VLC is the default .m3u handler.
  res.setHeader('Content-Type', 'audio/x-mpegurl');
  res.setHeader('Content-Disposition', `inline; filename="${filename}.m3u"`);
  res.send(m3u);
});

// GET /api/season-pack?show=tv/Breaking+Bad&season=Season+01
// Returns an M3U playlist for every episode in one season — opens in VLC as a queue.
app.get('/api/season-pack', async (req, res) => {
  if (!req.query.show || !req.query.season) {
    return res.status(400).json({ error: 'Missing ?show= and/or ?season= parameters' });
  }
  try {
    const lib = await ensureLibrary();
    const item = getItem(lib, req.query.show);
    if (!item || !item.seasons) {
      return res.status(404).json({ error: 'Show or seasons not found' });
    }
    const season = item.seasons.find(s => s.name === req.query.season);
    if (!season) return res.status(404).json({ error: 'Season not found' });

    const origin = `${req.protocol}://${req.get('host')}`;
    const lines = ['#EXTM3U'];
    for (const f of season.files) {
      lines.push(`#EXTINF:-1,${f.name}`);
      lines.push(`${origin}/media/${f.path}`);
    }

    // Safe filename: strip characters not allowed in Windows filenames
    const safeName = `${item.title} - ${req.query.season}`.replace(/[\\/:*?"<>|]/g, '_');
    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}.m3u"`);
    res.send(lines.join('\n') + '\n');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/season-download?show=...&season=...
// Streams a ZIP of every episode in the season. Uses STORE (no compression)
// since video files are already compressed — faster and same file size.
app.get('/api/season-download', async (req, res) => {
  if (!req.query.show || !req.query.season) {
    return res.status(400).json({ error: 'Missing ?show= and/or ?season= parameters' });
  }
  try {
    const lib = await ensureLibrary();
    const item = getItem(lib, req.query.show);
    if (!item || !item.seasons) {
      return res.status(404).json({ error: 'Show or seasons not found' });
    }
    const season = item.seasons.find(s => s.name === req.query.season);
    if (!season) return res.status(404).json({ error: 'Season not found' });

    const safeName = `${item.title} - ${req.query.season}`.replace(/[\\/:*?"<>|]/g, '_');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.zip"`);

    const archive = archiver('zip');
    archive.on('error', err => {
      console.error('[season-download] Archive error:', err.message);
      res.destroy(); // headers already sent, so just drop the connection
    });
    archive.pipe(res);

    for (const f of season.files) {
      // store: true = STORE method (no deflate), ideal for already-compressed video
      archive.file(path.join(MEDIA_ROOT, f.path), { name: f.name, store: true });
    }

    await archive.finalize();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// GET /api/album-download?artist=music%2FArtist+Name&album=Album+Title
// Streams a ZIP of every track in the album folder.
app.get('/api/album-download', async (req, res) => {
  if (!req.query.artist || !req.query.album) {
    return res.status(400).json({ error: 'Missing ?artist= and/or ?album= parameters' });
  }
  try {
    const lib = await ensureLibrary();
    const item = getItem(lib, req.query.artist);
    if (!item) return res.status(404).json({ error: 'Artist not found' });

    // Keep only files whose path sits inside this album subfolder
    const albumPrefix = `${req.query.artist}/${req.query.album}/`;
    const files = item.files.filter(f => f.path.startsWith(albumPrefix));
    if (files.length === 0) return res.status(404).json({ error: 'Album not found or empty' });

    const safeName = `${item.title} - ${req.query.album}`.replace(/[\\/:*?"<>|]/g, '_');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.zip"`);

    const archive = archiver('zip');
    archive.on('error', err => {
      console.error('[album-download] Archive error:', err.message);
      res.destroy();
    });
    archive.pipe(res);

    for (const f of files) {
      // store: true = no deflate; audio files are already compressed
      archive.file(path.join(MEDIA_ROOT, f.path), { name: f.name, store: true });
    }

    await archive.finalize();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// POST /api/rescan — force an immediate rescan (same logic as the auto interval)
app.post('/api/rescan', async (req, res) => {
  try {
    await rescan();
    const categories = Object.entries(libraryCache).map(([name, items]) => ({
      name,
      count: items.length,
    }));
    res.json({ categories, lastScan: lastScanTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All other routes — serve React SPA (client-side routing)
app.get('*', (req, res) => {
  const index = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.status(503).send('Frontend not built. Run: npm run build inside /frontend');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Media browser listening on http://0.0.0.0:${PORT}`);
  console.log(`Media root: ${MEDIA_ROOT}`);

  // Kick off initial library scan in the background
  ensureLibrary()
    .then(lib => {
      const total = Object.values(lib).reduce((n, items) => n + items.length, 0);
      console.log(`Library ready: ${total} items across ${Object.keys(lib).length} categories`);
    })
    .catch(err => console.error(`Initial scan failed: ${err.message}`));
});
