export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-wrap">
      <svg className="search-icon" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        className="search-input"
        type="search"
        placeholder="Search…"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Search"
      />
    </div>
  );
}
