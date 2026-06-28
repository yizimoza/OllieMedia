const express = require('express');
const path    = require('path');
const fs      = require('fs');
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

async function ensureLibrary() {
  if (!libraryCache) {
    libraryCache = await buildLibrary(MEDIA_ROOT);
    lastScanTime = new Date().toISOString();
  }
  return libraryCache;
}

// GET /api/library — category names and item counts
app.get('/api/library', async (req, res) => {
  try {
    const lib = await ensureLibrary();
    const categories = Object.entries(lib).map(([name, items]) => ({
      name,
      count: items.length,
    }));
    res.json({ categories, lastScan: lastScanTime });
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

// POST /api/rescan — drop cache and rebuild
app.post('/api/rescan', async (req, res) => {
  try {
    libraryCache = null;
    const lib = await buildLibrary(MEDIA_ROOT);
    libraryCache = lib;
    lastScanTime = new Date().toISOString();
    const categories = Object.entries(lib).map(([name, items]) => ({
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
