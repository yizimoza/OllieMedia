import '../styles/card.css';

// Thumbnail widths (px) for row view at each zoom level (1–5)
const ROW_THUMB_W = [48, 56, 64, 80, 96];
// Card min-heights (px) for row view at each zoom level
const ROW_CARD_H  = [72, 84, 96, 112, 128];
// Thumbnail widths (px) for list view (2:3 ratio, height derived)
const LIST_THUMB_W = [22, 27, 32, 40, 48];
const LIST_THUMB_H = [33, 40, 48, 60, 72];

// Reusable poster image with fallback initial
function PosterImg({ poster, title, placeholderClass }) {
  return (
    <>
      {poster ? (
        <img
          src={poster}
          alt={title}
          loading="lazy"
          onError={e => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={placeholderClass}
        style={{ display: poster ? 'none' : 'flex' }}
        aria-hidden="true"
      >
        {title.charAt(0).toUpperCase()}
      </div>
    </>
  );
}

// Small thumbnail used in row + list views
function Thumb({ poster, title, className, style }) {
  return (
    <div className={className} style={style}>
      <PosterImg poster={poster} title={title} placeholderClass="thumb-placeholder" />
    </div>
  );
}

// ── Spotlight card (poster-only; siblings dim on hover) ──────────────────────
// Sized by the grid's auto-fill columns — no per-card size overrides needed
function SpotlightCard({ item, onClick }) {
  return (
    <button className="media-card--spotlight" onClick={onClick} aria-label={`Open ${item.title}`}>
      <PosterImg poster={item.poster} title={item.title} placeholderClass="spotlight-placeholder" />
      <div className="spotlight-overlay">
        <p className="spotlight-title">{item.title}</p>
        <div className="spotlight-meta">
          {item.year    && <span>{item.year}</span>}
          {item.runtime && <span>{item.runtime}m</span>}
        </div>
        {item.genres.length > 0 && (
          <div className="spotlight-genres">
            {item.genres.slice(0, 3).map(g => (
              <span key={g} className="spotlight-genre">{g}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Flip card (rotates 180° on hover to show info on the back) ───────────────
// Sized by the grid's auto-fill columns — no per-card size overrides needed
function FlipCard({ item, onClick }) {
  return (
    <div
      className="flip-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.title}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="flip-inner">
        <div className="flip-front">
          <PosterImg poster={item.poster} title={item.title} placeholderClass="flip-front-placeholder" />
        </div>
        <div className="flip-back">
          <h3 className="flip-back-title">{item.title}</h3>
          <div className="flip-back-meta">
            {item.year    && <span>{item.year}</span>}
            {item.runtime && <span>{item.runtime}m</span>}
          </div>
          {item.genres.length > 0 && (
            <div className="flip-back-genres">
              {item.genres.slice(0, 3).map(g => (
                <span key={g} className="flip-back-genre">{g}</span>
              ))}
            </div>
          )}
          {item.plot && <p className="flip-back-plot">{item.plot}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Row card (thumbnail left, metadata right) ────────────────────────────────
function RowCard({ item, onClick, thumbW, cardH }) {
  return (
    <button
      className="media-card media-card--row"
      onClick={onClick}
      aria-label={`Open ${item.title}`}
      style={{ minHeight: `${cardH}px` }}
    >
      <Thumb
        poster={item.poster}
        title={item.title}
        className="card-row-thumb"
        style={{ width: `${thumbW}px` }}
      />
      <div className="card-row-body">
        <p className="card-row-title">{item.title}</p>
        <div className="card-row-meta">
          {item.year    && <span>{item.year}</span>}
          {item.runtime && <span>{item.runtime} min</span>}
        </div>
        {item.genres.length > 0 && (
          <p className="card-row-genres">{item.genres.slice(0, 3).join(' · ')}</p>
        )}
        {item.plot && <p className="card-row-plot">{item.plot}</p>}
      </div>
    </button>
  );
}

// ── List card (ultra-compact rows) ──────────────────────────────────────────
function ListCard({ item, onClick, thumbW, thumbH }) {
  return (
    <button className="media-card media-card--list" onClick={onClick} aria-label={`Open ${item.title}`}>
      <Thumb
        poster={item.poster}
        title={item.title}
        className="card-list-thumb"
        style={{ width: `${thumbW}px`, height: `${thumbH}px` }}
      />
      <p className="card-list-title">{item.title}</p>
      {item.genres.length > 0 && (
        <p className="card-list-genre">{item.genres[0]}</p>
      )}
      {item.year && <span className="card-list-year">{item.year}</span>}
    </button>
  );
}

// ── Root export ──────────────────────────────────────────────────────────────
export default function MediaCard({ item, viewMode = 'spotlight', onClick, tileZoom = 3 }) {
  const z = Math.max(0, Math.min(4, tileZoom - 1)); // clamp to 0–4 index
  if (viewMode === 'spotlight') return <SpotlightCard item={item} onClick={onClick} />;
  if (viewMode === 'flip')      return <FlipCard      item={item} onClick={onClick} />;
  if (viewMode === 'list')      return <ListCard item={item} onClick={onClick} thumbW={LIST_THUMB_W[z]} thumbH={LIST_THUMB_H[z]} />;
  return <RowCard item={item} onClick={onClick} thumbW={ROW_THUMB_W[z]} cardH={ROW_CARD_H[z]} />;
}
