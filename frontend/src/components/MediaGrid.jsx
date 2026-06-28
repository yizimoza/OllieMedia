import { useState, useEffect } from 'react';
import MediaCard from './MediaCard';
import '../styles/card.css';

const PAGE_SIZES = [10, 25, 50];

export default function MediaGrid({ items, loading, viewMode = 'grid', onSelect }) {
  // Page size persisted in localStorage; defaults to 50
  const [pageSize, setPageSize] = useState(() => {
    const saved = parseInt(localStorage.getItem('om-grid-page-size'), 10);
    return PAGE_SIZES.includes(saved) ? saved : 50;
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the item list or page size changes
  useEffect(() => { setCurrentPage(1); }, [items, pageSize]);

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

  // Pagination only applies to grid view; row/list views render all items
  const paginate = viewMode === 'grid';
  const totalPages = paginate ? Math.ceil(items.length / pageSize) : 1;
  const visibleItems = paginate
    ? items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : items;

  function handlePageSize(size) {
    localStorage.setItem('om-grid-page-size', size);
    setPageSize(size);
  }

  return (
    <div className="grid-wrapper">
      <div className={`media-grid media-grid--${viewMode}`}>
        {visibleItems.map(item => (
          <MediaCard key={item.id} item={item} viewMode={viewMode} onClick={() => onSelect(item)} />
        ))}
      </div>

      {/* Pagination bar — only shown in grid mode when there is more than one page */}
      {paginate && totalPages > 1 && (
        <div className="pagination-bar">
          <div className="pagination-nav">
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
