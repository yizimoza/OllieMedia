import { useEffect } from 'react';
import '../styles/modal.css';

const AUDIO_EXTS = new Set(['mp3', 'flac', 'm4a', 'aac', 'ogg', 'wav', 'opus']);

function StarRating({ rating }) {
  const stars = Math.round(rating / 2); // convert 0-10 → 0-5
  return (
    <span className="star-rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14"
          fill={i < stars ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="rating-num">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function DetailModal({ item, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const cat = item.category ? item.category.toLowerCase() : '';
  const isAudio = cat === 'music' || cat === 'podcasts';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={item.title}>

        {/* Backdrop hero */}
        <div
          className="modal-hero"
          style={item.backdrop ? { backgroundImage: `url(${item.backdrop})` } : {}}
        >
          <div className="modal-hero-gradient" />
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>

          {/* Poster thumbnail in hero */}
          {item.poster && (
            <img className="modal-poster" src={item.poster} alt={item.title} />
          )}

          <div className="modal-hero-text">
            <h2 className="modal-title">{item.title}</h2>
            <div className="modal-meta-row">
              {item.year    && <span className="meta-tag">{item.year}</span>}
              {item.runtime && <span className="meta-tag">{item.runtime} min</span>}
              {item.rating  && <StarRating rating={item.rating} />}
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
          {item.studio && <p className="modal-studio">{item.studio}</p>}
          {item.plot   && <p className="modal-plot">{item.plot}</p>}

          {item.files.length > 0 && (
            <div className="modal-files">
              <h3 className="files-heading">
                {isAudio ? 'Tracks' : item.files.length === 1 ? 'File' : 'Files'}
              </h3>
              <ul className="file-list">
                {item.files.map(f => (
                  <li key={f.path} className="file-item">
                    <span className="file-name">{f.name}</span>
                    <div className="file-actions">
                      {/* Inline audio player for music/podcasts */}
                      {isAudio && AUDIO_EXTS.has(f.ext) && (
                        <audio
                          className="audio-player"
                          controls
                          preload="none"
                          src={`/media/${f.path}`}
                        />
                      )}

                      {/* Video: Play via vlc:// protocol handler.
                          VLC registers this scheme on install; the browser shows
                          an "Open with VLC?" prompt (tick "always allow" once). */}
                      {!isAudio && (() => {
                        const encodedPath = f.path.split('/').map(encodeURIComponent).join('/');
                        const vlcUrl = `vlc://${window.location.origin}/media/${encodedPath}`;
                        return (
                          <a className="play-btn" href={vlcUrl} title="Open in VLC">
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Play
                          </a>
                        );
                      })()}

                      {/* Download — always shown */}
                      <a
                        className="download-btn"
                        href={`/media/${f.path}`}
                        download
                      >
                        Download
                      </a>
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
