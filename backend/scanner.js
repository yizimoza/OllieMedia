const fs = require('fs');
const path = require('path');
const { parseNfo } = require('./nfo');

// File extensions treated as playable media
const VIDEO_EXTS = new Set(['.mkv', '.mp4', '.avi', '.mov', '.wmv', '.m4v', '.ts', '.m2ts', '.webm']);
const AUDIO_EXTS = new Set(['.mp3', '.flac', '.m4a', '.aac', '.ogg', '.wav', '.opus']);
const MEDIA_EXTS = new Set([...VIDEO_EXTS, ...AUDIO_EXTS]);
const SUBTITLE_EXTS = new Set(['.srt', '.vtt', '.ass', '.ssa', '.sub']);

// Find a subtitle file sitting next to a video file, matching by basename.
// Handles both exact matches ("S01E01.srt") and language-tagged matches
// ("S01E01.en.srt") by requiring the subtitle name to start with the video's
// basename (extension stripped).
function findSubtitle(dirPath, videoBaseName) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath);
  } catch {
    return null;
  }
  const match = entries.find(name => {
    const ext = path.extname(name).toLowerCase();
    if (!SUBTITLE_EXTS.has(ext)) return false;
    return path.basename(name, ext).startsWith(videoBaseName);
  });
  return match || null;
}

// Artwork filenames checked in priority order
const POSTER_NAMES   = ['poster.jpg',  'poster.jpeg',  'poster.png',  'folder.jpg'];
const BACKDROP_NAMES = ['backdrop.jpg', 'backdrop.jpeg', 'backdrop.png', 'fanart.jpg', 'fanart.png'];
const COVER_NAMES    = ['cover.jpg',   'cover.jpeg',   'cover.png',   'folder.jpg'];
const BANNER_NAMES   = ['banner.jpg',  'banner.jpeg',  'banner.png'];
const LOGO_NAMES     = ['clearlogo.png', 'logo.png',   'clearart.png', 'logo.jpg'];
const THUMB_NAMES    = ['thumb.jpg',   'landscape.jpg', 'thumb.jpeg',  'landscape.png'];

// Return the first matching artwork filename found in dirPath, or null
function findArtwork(dirPath, candidates) {
  for (const name of candidates) {
    if (fs.existsSync(path.join(dirPath, name))) return name;
  }
  return null;
}

// Find and parse the first .nfo file in a directory
async function findNfo(dirPath) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath);
  } catch {
    return null;
  }
  const nfoFile = entries.find(f => f.toLowerCase().endsWith('.nfo'));
  if (!nfoFile) return null;
  return parseNfo(path.join(dirPath, nfoFile));
}

// Recursively collect media files under dirPath, returning paths relative to mediaRoot
function listMediaFiles(dirPath, mediaRoot, recursive) {
  const files = [];
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory() && recursive) {
      files.push(...listMediaFiles(full, mediaRoot, true));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (MEDIA_EXTS.has(ext)) {
        const rel = path.relative(mediaRoot, full).replace(/\\/g, '/');
        const videoBaseName = path.basename(entry.name, ext);
        const subtitleName = findSubtitle(dirPath, videoBaseName);
        const subtitlePath = subtitleName
          ? path.relative(mediaRoot, path.join(dirPath, subtitleName)).replace(/\\/g, '/')
          : null;
        files.push({ name: entry.name, path: rel, ext: ext.slice(1), subtitle: subtitlePath });
      }
    }
  }
  return files;
}

// Build a single item descriptor for one media folder (movie, show, album, podcast)
async function scanItem(itemDir, mediaRoot, categoryName) {
  const itemName = path.basename(itemDir);
  const relPath = path.relative(mediaRoot, itemDir).replace(/\\/g, '/');

  const cat = categoryName.toLowerCase();
  const isAudio = cat === 'music' || cat === 'podcasts';
  const isSeries = cat === 'tv' || cat === 'anime';

  const posterFile   = isAudio ? findArtwork(itemDir, COVER_NAMES)    : findArtwork(itemDir, POSTER_NAMES);
  const backdropFile = isAudio ? null                                  : findArtwork(itemDir, BACKDROP_NAMES);
  const bannerFile   = isAudio ? null                                  : findArtwork(itemDir, BANNER_NAMES);
  const logoFile     = isAudio ? null                                  : findArtwork(itemDir, LOGO_NAMES);
  const thumbFile    = isAudio ? null                                  : findArtwork(itemDir, THUMB_NAMES);

  // mtime of the item folder — used by "Recently Added" sort on the frontend
  let mtime = 0;
  try { mtime = fs.statSync(itemDir).mtimeMs; } catch { /* leave as 0 */ }

  const nfo = await findNfo(itemDir);

  // Extract year from "Title (Year)" folder naming convention as fallback
  const yearMatch = itemName.match(/\((\d{4})\)$/);
  const folderYear  = yearMatch ? parseInt(yearMatch[1], 10) : null;
  const folderTitle = itemName.replace(/\s*\(\d{4}\)$/, '').trim();

  // TV/Anime: collect files grouped by season subfolder.
  // Music/Podcasts: recurse into subdirectories so nested album folders are found.
  // All other categories: flat file list.
  const files = listMediaFiles(itemDir, mediaRoot, isSeries || isAudio);

  // Build seasons map for TV/Anime: { "Season 01": [file, ...], ... }
  // Files sitting directly in the show root go into a "specials" bucket.
  let seasons = null;
  if (isSeries) {
    const map = {};
    for (const f of files) {
      // f.path is relative to mediaRoot, e.g. "tv/Breaking Bad/Season 01/S01E01.mkv"
      // We want the immediate subfolder under the show dir.
      const relToShow = f.path.slice(relPath.length).replace(/^\//, '');
      const parts = relToShow.split('/');
      const bucket = parts.length > 1 ? parts[0] : 'Specials';
      if (!map[bucket]) map[bucket] = [];
      map[bucket].push(f);
    }
    // Sort season buckets: numbered seasons first, then specials/other
    seasons = Object.keys(map)
      .sort((a, b) => {
        const na = a.match(/\d+/);
        const nb = b.match(/\d+/);
        if (na && nb) return parseInt(na[0]) - parseInt(nb[0]);
        if (na) return -1;
        if (nb) return 1;
        return a.localeCompare(b);
      })
      .map(name => ({ name, files: map[name] }));
  }

  return {
    id:       relPath,
    title:    (nfo && nfo.title)   || folderTitle,
    year:     (nfo && nfo.year)    || folderYear  || null,
    plot:     (nfo && nfo.plot)    || null,
    rating:   (nfo && nfo.rating)  || null,
    genres:   (nfo && nfo.genres)  || [],
    studio:   (nfo && nfo.studio)  || null,
    runtime:  (nfo && nfo.runtime) || null,
    category: categoryName,
    path:     relPath,
    poster:   posterFile   ? `/art/${relPath}/${posterFile}`   : null,
    backdrop: backdropFile ? `/art/${relPath}/${backdropFile}` : null,
    banner:   bannerFile   ? `/art/${relPath}/${bannerFile}`   : null,
    logo:     logoFile     ? `/art/${relPath}/${logoFile}`     : null,
    thumb:    thumbFile    ? `/art/${relPath}/${thumbFile}`    : null,
    files,
    seasons,  // null for non-series; array of { name, files[] } for TV/Anime
    mtime,    // folder modification time in ms — used for "Recently Added" sort
  };
}

// Walk mediaRoot and build a full library object keyed by category name
async function buildLibrary(mediaRoot) {
  const library = {};

  if (!fs.existsSync(mediaRoot)) {
    console.warn(`[scanner] Media root not found: ${mediaRoot}`);
    return library;
  }

  let topLevel;
  try {
    topLevel = fs.readdirSync(mediaRoot, { withFileTypes: true });
  } catch (err) {
    console.error(`[scanner] Cannot read media root: ${err.message}`);
    return library;
  }

  // Skip Synology system folders (#recycle, @eaDir, @tmp, etc.)
  const categoryDirs = topLevel.filter(e => e.isDirectory() && !e.name.startsWith('#') && !e.name.startsWith('@'));

  for (const catDir of categoryDirs) {
    const categoryPath = path.join(mediaRoot, catDir.name);
    const items = [];

    let itemEntries;
    try {
      itemEntries = fs.readdirSync(categoryPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const itemEntry of itemEntries) {
      // Skip hidden folders (. prefix) and Synology system folders (# or @ prefix)
      if (!itemEntry.isDirectory() || itemEntry.name.startsWith('.') || itemEntry.name.startsWith('#') || itemEntry.name.startsWith('@')) continue;
      try {
        const item = await scanItem(path.join(categoryPath, itemEntry.name), mediaRoot, catDir.name);
        items.push(item);
      } catch (err) {
        console.error(`[scanner] Failed on ${itemEntry.name}: ${err.message}`);
      }
    }

    items.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    library[catDir.name] = items;
  }

  return library;
}

// Locate a single item by its relative path across all categories
function getItem(library, itemPath) {
  for (const items of Object.values(library)) {
    const found = items.find(i => i.path === itemPath);
    if (found) return found;
  }
  return null;
}

// Locate a single media file by its relative path across all items (flat files and season files)
function getFile(library, filePath) {
  for (const items of Object.values(library)) {
    for (const item of items) {
      const flat = item.files && item.files.find(f => f.path === filePath);
      if (flat) return flat;
      if (item.seasons) {
        for (const season of item.seasons) {
          const found = season.files.find(f => f.path === filePath);
          if (found) return found;
        }
      }
    }
  }
  return null;
}

module.exports = { buildLibrary, getItem, getFile };
