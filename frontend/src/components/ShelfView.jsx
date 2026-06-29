import { useMemo, useRef } from 'react';
import '../styles/card.css';

// Card width in px for each zoom level (1–5); level 3 matches the original 130px default
const TILE_WIDTHS = [90, 110, 130, 160, 200];

function ShelfCard({ item, onClick, cardWidth }) {
  return (
    <button
      className="shelf-card"
      onClick={onClick}
      aria-label={`Open ${item.title}`}
      style={{ width: `${cardWidth}px` }}
    >
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

export default function ShelfView({ items, onSelect, tileZoom = 3 }) {
  const shelves = useMemo(() => groupByGenre(items), [items]);
  const cardWidth = TILE_WIDTHS[Math.max(0, Math.min(4, tileZoom - 1))];

  // One ref per shelf row, keyed by genre label
  const scrollRefs = useRef({});

  function scrollShelf(genre, direction) {
    const el = scrollRefs.current[genre];
    if (!el) return;
    // Scroll by ~3 cards worth of width
    el.scrollBy({ left: direction * (cardWidth + 12) * 3, behavior: 'smooth' });
  }

  return (
    <div className="shelf-container">
      {shelves.map(shelf => (
        <div key={shelf.genre} className="shelf-row">
          <h2 className="shelf-label">{shelf.genre}</h2>
          <div className="shelf-track">
            <button
              className="shelf-arrow shelf-arrow--left"
              onClick={() => scrollShelf(shelf.genre, -1)}
              aria-label={`Scroll ${shelf.genre} left`}
            >&#8249;</button>
            <div
              className="shelf-scroll"
              ref={el => { scrollRefs.current[shelf.genre] = el; }}
            >
              {shelf.items.map(item => (
                <ShelfCard
                  key={item.id}
                  item={item}
                  onClick={() => onSelect(item)}
                  cardWidth={cardWidth}
                />
              ))}
            </div>
            <button
              className="shelf-arrow shelf-arrow--right"
              onClick={() => scrollShelf(shelf.genre, 1)}
              aria-label={`Scroll ${shelf.genre} right`}
            >&#8250;</button>
          </div>
        </div>
      ))}
    </div>
  );
}
