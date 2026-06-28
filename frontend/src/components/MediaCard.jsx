import '../styles/card.css';


// Small thumbnail used in row + list views
function Thumb({ poster, title, className }) {
  return (
    <div className={className}>
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
        className="thumb-placeholder"
        style={{ display: poster ? 'none' : 'flex' }}
        aria-hidden="true"
      >
        {title.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}

// ── Grid card (poster dominant, 2:3 aspect ratio) ───────────────────────────
function GridCard({ item, onClick, isAudio }) {
  return (
    <button className="media-card" onClick={onClick} aria-label={`Open ${item.title}`}>
      <div className="card-art">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            onError={e => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="card-placeholder-wrap"
          style={{ display: item.poster ? 'none' : 'flex' }}
        >
          <div className="card-placeholder">
            <span className="placeholder-initial">{item.title.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div className="card-overlay">
          <p className="hover-title">{item.title}</p>
          <div className="hover-meta">
            {item.year    && <span className="hover-year">{item.year}</span>}
            {item.runtime && <span className="hover-runtime">{item.runtime}m</span>}
          </div>
          {item.genres.length > 0 && (
            <div className="hover-genres">
              {item.genres.slice(0, 3).map(g => (
                <span key={g} className="hover-genre">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card-info">
        <p className="card-title">{item.title}</p>
        {isAudio && item.files.length > 0 && (
          <p className="card-sub">{item.files.length} track{item.files.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </button>
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
export default function MediaCard({ item, viewMode = 'grid', onClick }) {
  const cat = item.category ? item.category.toLowerCase() : '';
  const isAudio = cat === 'music' || cat === 'podcasts';

  if (viewMode === 'row')  return <RowCard  item={item} onClick={onClick} />;
  if (viewMode === 'list') return <ListCard item={item} onClick={onClick} />;
  return <GridCard item={item} onClick={onClick} isAudio={isAudio} />;
}
