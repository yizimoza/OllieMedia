const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false, trim: true });

// Parse a Kodi-format .nfo XML file into a normalized metadata object.
// Returns null if the file is missing, unreadable, or not a recognized format.
async function parseNfo(nfoPath) {
  let content;
  try {
    content = fs.readFileSync(nfoPath, 'utf8');
  } catch {
    return null;
  }

  let parsed;
  try {
    parsed = await parser.parseStringPromise(content);
  } catch {
    return null; // Malformed XML — skip gracefully
  }

  // Support <movie>, <tvshow>, and <episodedetails> root elements
  const root = parsed.movie || parsed.tvshow || parsed.episodedetails || null;
  if (!root) return null;

  // xml2js returns a string when there's one <genre> tag, array when there are many
  let genres = root.genre || [];
  if (typeof genres === 'string') genres = [genres];

  return {
    title: root.title || null,
    year: root.year ? parseInt(root.year, 10) : null,
    plot: root.plot || null,
    rating: root.rating ? parseFloat(root.rating) : null,
    genres,
    studio: root.studio || null,
    runtime: root.runtime ? parseInt(root.runtime, 10) : null,
  };
}

module.exports = { parseNfo };
