const SORT_OPTIONS = [
  { value: 'alpha',    label: 'Alphabetical' },
  { value: 'year',     label: 'Year' },
  { value: 'episodes', label: 'Episodes' },
  { value: 'rating',   label: 'Rating' },
  { value: 'mtime',    label: 'Recently Added' },
];

export default function SortControl({ sortKey, sortDir, onChange }) {
  return (
    <div className="sort-control">
      <select
        className="sort-select"
        value={sortKey}
        onChange={e => onChange(e.target.value, sortDir)}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        className="sort-dir-btn"
        onClick={() => onChange(sortKey, sortDir === 'asc' ? 'desc' : 'asc')}
        title={sortDir === 'asc' ? 'Switch to descending' : 'Switch to ascending'}
        aria-label={sortDir === 'asc' ? 'Ascending' : 'Descending'}
      >
        {/* Up arrow for asc, down arrow for desc */}
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: sortDir === 'asc' ? 'none' : 'rotate(180deg)', transition: '150ms ease' }}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}
