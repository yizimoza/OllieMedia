import MediaCard from './MediaCard';
import '../styles/card.css';

export default function MediaGrid({ items, loading, viewMode = 'grid', onSelect }) {
  if (loading) {
    return (
      <div className="grid-status">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid-status">
        <p className="empty-msg">No items found.</p>
      </div>
    );
  }

  return (
    <div className={`media-grid media-grid--${viewMode}`}>
      {items.map(item => (
        <MediaCard key={item.id} item={item} viewMode={viewMode} onClick={() => onSelect(item)} />
      ))}
    </div>
  );
}
