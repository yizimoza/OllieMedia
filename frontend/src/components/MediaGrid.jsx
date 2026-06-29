import { useState, useEffect } from 'react';
import MediaCard from './MediaCard';
import ShelfView from './ShelfView';
import RecentlyAddedView from './RecentlyAddedView';
import '../styles/card.css';

const PAGE_SIZES = [10, 25, 50];

// Only poster-grid views are paginated; row/list/shelf render everything
const PAGINATED = new Set(['spotlight', 'flip']);

// Minimum column width (px) for the auto-fill grid at each zoom level (1–5)
const GRID_MIN_PX = [120, 140, 160, 190, 220];

export default function MediaGrid({ items, loading, viewMode = 'spotlight', onSelect, tileZoom = 3 }) {
  const [pageSize, setPageSize] = useState(() => {
    const saved = parseInt(localStorage.getItem('om-page-size'), 10);
    return PAGE_SIZES.includes(saved) ? saved : 50;
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when items, page size, or view mode changes
  useEffect(() => { setCurrentPage(1); }, [items, pageSize, viewMode]);

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
        <p className="empty-msg">No items found.</p>
      </div>
    );
  }

  if (viewMode === 'shelf')  return <ShelfView items={items} onSelect={onSelect} tileZoom={tileZoom} />;
  if (viewMode === 'recent') return <RecentlyAddedView onSelect={onSelect} tileZoom={tileZoom} />;

  const paginate = PAGINATED.has(viewMode);
  const totalPages = paginate ? Math.ceil(items.length / pageSize) : 1;
  const visibleItems = paginate
    ? items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : items;

  // For spotlight/flip, override the grid column minimum based on zoom level
  const z = Math.max(0, Math.min(4, tileZoom - 1));
  const gridStyle = paginate
    ? { gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_PX[z]}px, 1fr))` }
    : undefined;

  function handlePageSize(size) {
    localStorage.setItem('om-page-size', size);
    setPageSize(size);
  }

  return (
    <div className="grid-wrapper">
      <div className={`media-grid media-grid--${viewMode}`} style={gridStyle}>
        {visibleItems.map(item => (
          <MediaCard key={item.id} item={item} viewMode={viewMode} onClick={() => onSelect(item)} tileZoom={tileZoom} />
        ))}
      </div>

      {paginate && (
        <div className="pagination-bar">
          <div className="pagination-nav">
            {totalPages > 1 && (
              <>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &#8249; Prev
                </button>
                <span className="page-info">Page {currentPage} of {totalPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next &#8250;
                </button>
              </>
            )}
          </div>
          <div className="page-size-group">
            <span className="page-size-label">Show</span>
            {PAGE_SIZES.map(size => (
              <button
                key={size}
                className={`page-size-btn${pageSize === size ? ' active' : ''}`}
                onClick={() => handlePageSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
