import MediaCard from './MediaCard';
import '../styles/card.css';

export default function MediaGrid({ items, loading, onSelect }) {
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
    <div className="media-grid">
      {items.map(item => (
        <MediaCard key={item.id} item={item} onClick={() => onSelect(item)} />
      ))}
    </div>
  );
}
