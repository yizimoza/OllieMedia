import '../styles/card.css';

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
function Thumb({ poster, title, className }) {
  return (
    <div className={className}>
      <PosterImg poster={poster} title={title} placeholderClass="thumb-placeholder" />
    </div>
  );
}

// ── Spotlight card (poster-only; siblings dim on hover) ──────────────────────
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
function RowCard({ item, onClick }) {
  return (
    <button className="media-card media-card--row" onClick={onClick} aria-label={`Open ${item.title}`}>
      <Thumb poster={item.poster} title={item.title} className="card-row-thumb" />
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
function ListCard({ item, onClick }) {
  return (
    <button className="media-card media-card--list" onClick={onClick} aria-label={`Open ${item.title}`}>
      <Thumb poster={item.poster} title={item.title} className="card-list-thumb" />
      <p className="card-list-title">{item.title}</p>
      {item.genres.length > 0 && (
        <p className="card-list-genre">{item.genres[0]}</p>
      )}
      {item.year && <span className="card-list-year">{item.year}</span>}
    </button>
  );
}

// ── Root export ──────────────────────────────────────────────────────────────
export default function MediaCard({ item, viewMode = 'spotlight', onClick }) {
  if (viewMode === 'spotlight') return <SpotlightCard item={item} onClick={onClick} />;
  if (viewMode === 'flip')      return <FlipCard      item={item} onClick={onClick} />;
  if (viewMode === 'list')      return <ListCard      item={item} onClick={onClick} />;
  return <RowCard item={item} onClick={onClick} />;
}
