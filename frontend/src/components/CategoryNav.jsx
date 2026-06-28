import '../styles/nav.css';

// Inline SVG icons for known category names
const ICONS = {
  Movies: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  TV: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Anime: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Music: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Podcasts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8"  y1="23" x2="16" y2="23" />
    </svg>
  ),
  // Fallback for unknown categories
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const HELP_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function CategoryNav({ categories, active, onSelect, onHelp, showHelp }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <img src="/ollie.jpg" className="brand-beagle" alt="OllieMedia" />
        <span className="brand-name">OllieMedia</span>
      </div>

      <ul className="nav-list">
        {categories.map(cat => (
          <li key={cat.name}>
            <button
              className={`nav-item ${active === cat.name && !showHelp ? 'active' : ''}`}
              onClick={() => onSelect(cat.name)}
            >
              <span className="nav-icon">{
                // Match icon case-insensitively so "tv" hits the TV icon, etc.
                ICONS[cat.name] ||
                ICONS[cat.name.charAt(0).toUpperCase() + cat.name.slice(1).toLowerCase()] ||
                ICONS[cat.name.toUpperCase()] ||
                ICONS.default
              }</span>
              <span className="nav-label">{cat.name}</span>
              <span className="nav-count">{cat.count}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button
          className={`nav-item ${showHelp ? 'active' : ''}`}
          onClick={onHelp}
        >
          <span className="nav-icon">{HELP_ICON}</span>
          <span className="nav-label">Setup Guide</span>
        </button>
      </div>
    </nav>
  );
}
