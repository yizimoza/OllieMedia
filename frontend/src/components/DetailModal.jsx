import { useEffect, useState } from 'react';
import '../styles/modal.css';

const AUDIO_EXTS = new Set(['mp3', 'flac', 'm4a', 'aac', 'ogg', 'wav', 'opus']);


// Play button — links to M3U endpoint so VLC streams directly from the server.
// First click: browser shows "Open" in the download bar → pick VLC → tick
// "Always open files of this type". After that VLC auto-launches every time.
function PlayBtn({ filePath }) {
  return (
    <a
      className="play-btn"
      href={`/api/play?path=${encodeURIComponent(filePath)}`}
      title="Stream in VLC"
    >
      <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Play
    </a>
  );
}

// Play Season — M3U of the whole season, opens as a queue in VLC.
function PlaySeasonBtn({ showPath, seasonName }) {
  const href =
    `/api/season-pack?show=${encodeURIComponent(showPath)}&season=${encodeURIComponent(seasonName)}`;
  return (
    <a className="play-season-btn" href={href} title={`Play all ${seasonName} episodes in VLC`}>
      <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Play Season
    </a>
  );
}

// Download Season — server streams a ZIP of every episode (STORE, no compression).
function DownloadSeasonBtn({ showPath, seasonName }) {
  const href =
    `/api/season-download?show=${encodeURIComponent(showPath)}&season=${encodeURIComponent(seasonName)}`;
  return (
    <a className="download-season-btn" href={href} title={`Download all ${seasonName} episodes as ZIP`}>
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download Season
    </a>
  );
}

// Group a flat file list into albums using the folder segment immediately under the artist dir.
// Files sitting directly under the artist root (no subfolder) go into a "(Loose Tracks)" bucket.
function groupByAlbum(files, artistPath) {
  const map = {};
  for (const f of files) {
    const rel = f.path.slice(artistPath.length).replace(/^\//, '');
    const parts = rel.split('/');
    const album = parts.length > 1 ? parts[0] : '(Loose Tracks)';
    if (!map[album]) map[album] = [];
    map[album].push(f);
  }
  return Object.entries(map).map(([name, files]) => ({ name, files }));
}

// Collapsible album block — heading with track count + download button, then track list.
function AlbumSection({ album, artistPath }) {
  const [open, setOpen] = useState(true);
  const downloadHref =
    `/api/album-download?artist=${encodeURIComponent(artistPath)}&album=${encodeURIComponent(album.name)}`;

  return (
    <div className="season-section">
      <div className="season-header">
        <button
          className="season-toggle"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '150ms ease' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
          {album.name}
          <span className="season-ep-count">{album.files.length} track{album.files.length !== 1 ? 's' : ''}</span>
        </button>
        <div className="season-actions">
          <a className="download-season-btn" href={downloadHref} title="Download album as ZIP">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Album
          </a>
        </div>
      </div>

      {open && (
        <ul className="file-list">
          {album.files.map(f => (
            <li key={f.path} className="file-item">
              <span className="file-name">{f.name}</span>
              <div className="file-actions">
                {AUDIO_EXTS.has(f.ext) && (
                  <audio className="audio-player" controls preload="none" src={`/media/${f.path}`} />
                )}
                <a className="download-btn" href={`/media/${f.path}`} download>Download</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Collapsible season block — header row with season name + pack button, then episode list.
function SeasonSection({ season, showPath }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="season-section">
      <div className="season-header">
        <button
          className="season-toggle"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '150ms ease' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
          {season.name}
          <span className="season-ep-count">{season.files.length} ep</span>
        </button>
        {season.files.length > 1 && (
          <div className="season-actions">
            <PlaySeasonBtn showPath={showPath} seasonName={season.name} />
            <DownloadSeasonBtn showPath={showPath} seasonName={season.name} />
          </div>
        )}
      </div>

      {open && (
        <ul className="file-list">
          {season.files.map(f => (
            <li key={f.path} className="file-item">
              <span className="file-name">{f.name}</span>
              <div className="file-actions">
                <PlayBtn filePath={f.path} />
                <a className="download-btn" href={`/media/${f.path}`} download>Download</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Opens the item folder in Windows Explorer via a file:// UNC link.
// Format: file:////server/share/path  (4 slashes = UNC host prefix)
// Works in Edge by default. Chrome requires enabling Allow file:// access in flags.
// If the browser blocks it, clicking also copies the UNC path as a fallback.
function OpenFolderBtn({ itemPath, smbPath }) {
  const [copied, setCopied] = useState(false);
  if (!smbPath) return null;

  // Build the file:// URI: strip any trailing backslash from smbPath, convert to forward
  // slashes, prefix with file:////, then append the item path.
  const base = smbPath.replace(/\\/g, '/').replace(/\/$/, '');
  const fileUri = 'file:////' + base.replace(/^\/+/, '') + '/' + itemPath;

  // UNC path for the clipboard fallback (paste into Explorer address bar)
  const uncPath = smbPath.replace(/\//g, '\\').replace(/\\$/, '') + '\\' + itemPath.replace(/\//g, '\\');

  function handleClick() {
    // Copy UNC path as fallback in case the browser blocks the file:// link
    navigator.clipboard.writeText(uncPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  }

  return (
    <a
      className="open-folder-btn"
      href={fileUri}
      title={`Open in Explorer: ${uncPath}`}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
      {copied ? 'Path copied!' : 'Open Folder'}
    </a>
  );
}

export default function DetailModal({ item, smbPath, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const cat      = item.category ? item.category.toLowerCase() : '';
  const isAudio  = cat === 'music' || cat === 'podcasts';
  const isSeries = cat === 'tv' || cat === 'anime';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={item.title}>

        {/* Backdrop hero — uses backdrop, falls back to thumb if available */}
        <div
          className="modal-hero"
          style={(item.backdrop || item.thumb)
            ? { backgroundImage: `url(${item.backdrop || item.thumb})` }
            : {}}
        >
          <div className="modal-hero-gradient" />
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>

          {item.poster && (
            <img className="modal-poster" src={item.poster} alt={item.title} />
          )}

          <div className="modal-hero-text">
            {/* Use clearlogo/logo image as title if available, otherwise plain text */}
            {item.logo
              ? <img className="modal-logo" src={item.logo} alt={item.title} />
              : <h2 className="modal-title">{item.title}</h2>
            }
            <div className="modal-meta-row">
              {item.year    && <span className="meta-tag">{item.year}</span>}
              {item.runtime && <span className="meta-tag">{item.runtime} min</span>}
            </div>
            {item.genres.length > 0 && (
              <div className="modal-genres">
                {item.genres.map(g => <span key={g} className="genre-chip">{g}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Banner image — full-width decorative header art, shown if available */}
          {item.banner && (
            <img className="modal-banner" src={item.banner} alt="" aria-hidden="true" />
          )}
          {!isAudio && (
            <OpenFolderBtn itemPath={item.path} smbPath={smbPath} />
          )}
          {item.studio && <p className="modal-studio">{item.studio}</p>}
          {item.plot   && <p className="modal-plot">{item.plot}</p>}

          {/* TV / Anime: collapsible season sections */}
          {isSeries && item.seasons && item.seasons.length > 0 && (
            <div className="modal-files">
              <h3 className="files-heading">Seasons</h3>
              {item.seasons.map(season => (
                <SeasonSection key={season.name} season={season} showPath={item.path} />
              ))}
            </div>
          )}

          {/* Music / Podcasts: tracks grouped by album subfolder */}
          {isAudio && item.files.length > 0 && (
            <div className="modal-files">
              <h3 className="files-heading">Albums</h3>
              {groupByAlbum(item.files, item.path).map(album => (
                <AlbumSection key={album.name} album={album} artistPath={item.path} />
              ))}
            </div>
          )}

          {/* Movies: flat file list */}
          {!isSeries && !isAudio && item.files.length > 0 && (
            <div className="modal-files">
              <h3 className="files-heading">{item.files.length === 1 ? 'File' : 'Files'}</h3>
              <ul className="file-list">
                {item.files.map(f => (
                  <li key={f.path} className="file-item">
                    <span className="file-name">{f.name}</span>
                    <div className="file-actions">
                      <PlayBtn filePath={f.path} />
                      <a className="download-btn" href={`/media/${f.path}`} download>Download</a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
