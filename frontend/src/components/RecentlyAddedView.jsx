import { useState, useEffect } from 'react';
import '../styles/card.css';

// Fallback gradient when no backdrop is available, keyed by category
const CAT_GRADIENT = {
  movies: 'linear-gradient(120deg, #1a0a2e 0%, #2e1a0a 100%)',
  tv:     'linear-gradient(120deg, #0a1a2e 0%, #0a2a1a 100%)',
  anime:  'linear-gradient(120deg, #2e0a1a 0%, #1a0a2e 100%)',
};

// Poster widths (px) and card min-heights (px) at each zoom level (1–5)
const POSTER_W = [65, 75, 85, 100, 115];
const CARD_H   = [130, 150, 170, 200, 230];

export default function RecentlyAddedView({ onSelect, tileZoom = 3 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recently-added?limit=5')
      .then(r => r.json())
      .then(data => { setItems(data.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid-status">
        <img src="/ollie.jpg" className="status-beagle" alt="" />
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid-status">
        <img src="/ollie.jpg" className="status-beagle" alt="" />
        <p className="empty-msg">Nothing recently added.</p>
      </div>
    );
  }

  const z = Math.max(0, Math.min(4, tileZoom - 1));
  const posterW = POSTER_W[z];
  const cardH   = CARD_H[z];

  return (
    <div className="recent-container">
      <p className="recent-subtitle">
        Last {items.length} item{items.length !== 1 ? 's' : ''} added across your library
      </p>
      {items.map((item, i) => {
        const catKey = item.category?.toLowerCase();
        const bg = item.backdrop
          ? { backgroundImage: `url(${item.backdrop})` }
          : { background: CAT_GRADIENT[catKey] || 'linear-gradient(120deg, #1a1a2e 0%, #0a1a2e 100%)' };

        return (
          <button
            key={item.id || i}
            className="recent-card"
            onClick={() => onSelect(item)}
            aria-label={`Open ${item.title}`}
            style={{ ...bg, minHeight: `${cardH}px` }}
          >
            <div className="recent-card-scrim" />
            <div className="recent-card-content" style={{ minHeight: `${cardH}px` }}>
              {item.poster && (
                <img
                  className="recent-card-poster"
                  src={item.poster}
                  alt={item.title}
                  loading="lazy"
                  style={{ width: `${posterW}px` }}
                />
              )}
              <div className="recent-card-body">
                <div className="recent-card-eyebrow">
                  {item.category && (
                    <span className="recent-category-badge">{item.category}</span>
                  )}
                  {item.year && <span className="recent-year">{item.year}</span>}
                  {item.runtime && <span className="recent-year">{item.runtime} min</span>}
                </div>
                <h3 className="recent-card-title">{item.title}</h3>
                {item.genres?.length > 0 && (
                  <div className="recent-genres">
                    {item.genres.slice(0, 4).map(g => (
                      <span key={g} className="recent-genre">{g}</span>
                    ))}
                  </div>
                )}
                {item.plot && <p className="recent-plot">{item.plot}</p>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
