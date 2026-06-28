import '../styles/card.css';

// Placeholder shown when no poster artwork is available
function Placeholder({ title }) {
  return (
    <div className="card-placeholder">
      <span className="placeholder-initial">{title.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export default function MediaCard({ item, onClick }) {
  const isAudio = item.category === 'Music' || item.category === 'Podcasts';

  return (
    <button className="media-card" onClick={onClick} aria-label={`Open ${item.title}`}>
      <div className="card-art">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            onError={e => {
              // If the image fails to load, swap in the placeholder
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Placeholder: visible immediately when no poster, or as fallback on img error */}
        <div
          className="card-placeholder-wrap"
          style={{ display: item.poster ? 'none' : 'flex' }}
        >
          <Placeholder title={item.title} />
        </div>

        <div className="card-overlay">
          {item.year && <span className="card-year">{item.year}</span>}
          {item.rating && (
            <span className="card-rating">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {item.rating.toFixed(1)}
            </span>
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
