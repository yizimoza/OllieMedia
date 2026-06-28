import MediaCard from './MediaCard';
import ShelfView from './ShelfView';
import '../styles/card.css';

export default function MediaGrid({ items, loading, viewMode = 'spotlight', onSelect }) {
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

  if (viewMode === 'shelf') {
    return <ShelfView items={items} onSelect={onSelect} />;
  }

  return (
    <div className="grid-wrapper">
      <div className={`media-grid media-grid--${viewMode}`}>
        {items.map(item => (
          <MediaCard key={item.id} item={item} viewMode={viewMode} onClick={() => onSelect(item)} />
        ))}
      </div>
    </div>
  );
}
