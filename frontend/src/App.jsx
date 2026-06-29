import { useState, useEffect } from 'react';
import CategoryNav  from './components/CategoryNav';
import MediaGrid    from './components/MediaGrid';
import DetailModal  from './components/DetailModal';
import SearchBar    from './components/SearchBar';
import ViewToggle   from './components/ViewToggle';
import SortControl  from './components/SortControl';
import HelpPage     from './components/HelpPage';

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('om-theme') || 'dark'
  );

  // Apply the theme attribute to <html> so CSS variables cascade everywhere
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('om-theme', theme);
  }, [theme]);

  const [library, setLibrary]           = useState(null);
  const [smbPath, setSmbPath]           = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems]               = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [showHelp, setShowHelp]         = useState(false);
  const [viewMode, setViewMode]         = useState(
    () => {
      const saved = localStorage.getItem('om-view');
      const valid = ['recent', 'flip', 'spotlight', 'shelf', 'row', 'list'];
      return valid.includes(saved) ? saved : 'spotlight';
    }
  );
  const [sortKey, setSortKey]           = useState(
    () => localStorage.getItem('om-sort-key') || 'alpha'
  );
  const [sortDir, setSortDir]           = useState(
    () => localStorage.getItem('om-sort-dir') || 'asc'
  );
  // Tile zoom: 1=smallest … 5=largest, default 3 (maps to card widths 90/110/130/160/200px)
  const [tileZoom, setTileZoom]         = useState(
    () => {
      const saved = parseInt(localStorage.getItem('om-tile-zoom'), 10);
      return saved >= 1 && saved <= 5 ? saved : 3;
    }
  );

  function handleViewChange(mode) {
    setViewMode(mode);
    localStorage.setItem('om-view', mode);
  }

  function handleSortChange(key, dir) {
    setSortKey(key);
    setSortDir(dir);
    localStorage.setItem('om-sort-key', key);
    localStorage.setItem('om-sort-dir', dir);
  }

  function handleZoomChange(level) {
    const clamped = Math.max(1, Math.min(5, level));
    setTileZoom(clamped);
    localStorage.setItem('om-tile-zoom', clamped);
  }

  function sortItems(list) {
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === 'alpha') {
        const cmp = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        return sortDir === 'asc' ? cmp : -cmp;
      }
      let va, vb;
      if (sortKey === 'year')     { va = a.year          ?? 0; vb = b.year          ?? 0; }
      if (sortKey === 'episodes') { va = a.files?.length  ?? 0; vb = b.files?.length  ?? 0; }
if (sortKey === 'mtime')    { va = a.mtime          ?? 0; vb = b.mtime          ?? 0; }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return sorted;
  }

  // Fetch library summary on mount
  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => {
        setLibrary(data);
        setSmbPath(data.smbPath || null);
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].name);
        }
      })
      .catch(() => setLibrary({ categories: [] }));
  }, []);

  // Re-fetch items whenever the selected category changes
  useEffect(() => {
    if (!activeCategory) return;
    setLoading(true);
    setSearchQuery('');
    setItems([]);
    fetch(`/api/category/${encodeURIComponent(activeCategory)}`)
      .then(r => r.json())
      .then(data => { setItems(data.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  const filteredItems = sortItems(
    items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function handleCategorySelect(name) {
    setActiveCategory(name);
    setShowHelp(false);
    setSelectedItem(null);
  }

  return (
    <div className="app-layout">
      <CategoryNav
        categories={library?.categories || []}
        active={activeCategory}
        onSelect={handleCategorySelect}
        onHelp={() => { setShowHelp(true); setSelectedItem(null); }}
        showHelp={showHelp}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main className="main-content">
        {showHelp ? (
          <HelpPage />
        ) : (
          <>
            <header className="content-header">
              <h1 className="category-title">
                {viewMode === 'recent' ? 'Recently Added' : (activeCategory ?? 'Loading…')}
              </h1>
              <div className="header-controls">
                <SortControl sortKey={sortKey} sortDir={sortDir} onChange={handleSortChange} />
                <ViewToggle mode={viewMode} onChange={handleViewChange} />
                {/* Tile size zoom — shown in all views */}
                <div className="zoom-control" title="Tile size">
                  <button
                    className="zoom-btn"
                    onClick={() => handleZoomChange(tileZoom - 1)}
                    disabled={tileZoom <= 1}
                    aria-label="Decrease tile size"
                  >−</button>
                  <button
                    className="zoom-btn"
                    onClick={() => handleZoomChange(tileZoom + 1)}
                    disabled={tileZoom >= 5}
                    aria-label="Increase tile size"
                  >+</button>
                </div>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            </header>
            <MediaGrid
              items={filteredItems}
              loading={loading}
              viewMode={viewMode}
              onSelect={setSelectedItem}
              tileZoom={tileZoom}
            />
          </>
        )}
      </main>

      {selectedItem && (
        <DetailModal item={selectedItem} smbPath={smbPath} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
