const VIEWS = [
  {
    id: 'grid',
    label: 'Grid',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <rect x="2"  y="2"  width="9" height="9" rx="1.5"/>
        <rect x="13" y="2"  width="9" height="9" rx="1.5"/>
        <rect x="2"  y="13" width="9" height="9" rx="1.5"/>
        <rect x="13" y="13" width="9" height="9" rx="1.5"/>
      </svg>
    ),
  },
  {
    id: 'row',
    label: 'Comfortable',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="16" height="16">
        <rect x="2" y="3"  width="6" height="5" rx="1" fill="currentColor" stroke="none"/>
        <line x1="11" y1="4.5" x2="22" y2="4.5"/>
        <line x1="11" y1="7"   x2="18" y2="7"/>
        <rect x="2" y="10" width="6" height="5" rx="1" fill="currentColor" stroke="none"/>
        <line x1="11" y1="11.5" x2="22" y2="11.5"/>
        <line x1="11" y1="14"   x2="18" y2="14"/>
        <rect x="2" y="17" width="6" height="5" rx="1" fill="currentColor" stroke="none"/>
        <line x1="11" y1="18.5" x2="22" y2="18.5"/>
        <line x1="11" y1="21"   x2="18" y2="21"/>
      </svg>
    ),
  },
  {
    id: 'list',
    label: 'List',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
        <line x1="3" y1="6"  x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    ),
  },
];

export default function ViewToggle({ mode, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label="View mode">
      {VIEWS.map(v => (
        <button
          key={v.id}
          className={`view-btn ${mode === v.id ? 'active' : ''}`}
          onClick={() => onChange(v.id)}
          title={v.label}
          aria-pressed={mode === v.id}
        >
          {v.icon}
        </button>
      ))}
    </div>
  );
}
