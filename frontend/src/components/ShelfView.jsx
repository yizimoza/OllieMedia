import { useMemo } from 'react';
import '../styles/card.css';

function ShelfCard({ item, onClick }) {
  return (
    <button className="shelf-card" onClick={onClick} aria-label={`Open ${item.title}`}>
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
        className="shelf-card-placeholder"
        style={{ display: item.poster ? 'none' : 'flex' }}
        aria-hidden="true"
      >
        {item.title.charAt(0).toUpperCase()}
      </div>
      <div className="shelf-card-info">
        <p className="shelf-card-title">{item.title}</p>
        {item.year && <span className="shelf-card-year">{item.year}</span>}
      </div>
    </button>
  );
}

function groupByGenre(items) {
  const map = {};
  for (const item of items) {
    const genre = item.genres && item.genres.length > 0 ? item.genres[0] : 'Other';
    if (!map[genre]) map[genre] = [];
    map[genre].push(item);
  }
  return Object.entries(map)
    .sort(([a], [b]) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    })
    .map(([genre, items]) => ({ genre, items }));
}

export default function ShelfView({ items, onSelect }) {
  const shelves = useMemo(() => groupByGenre(items), [items]);

  return (
    <div className="shelf-container">
      {shelves.map(shelf => (
        <div key={shelf.genre} className="shelf-row">
          <h2 className="shelf-label">{shelf.genre}</h2>
          <div className="shelf-scroll">
            {shelf.items.map(item => (
              <ShelfCard key={item.id} item={item} onClick={() => onSelect(item)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
