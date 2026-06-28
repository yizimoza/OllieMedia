import { useState, useEffect } from 'react';
import CategoryNav from './components/CategoryNav';
import MediaGrid   from './components/MediaGrid';
import DetailModal from './components/DetailModal';
import SearchBar   from './components/SearchBar';
import HelpPage    from './components/HelpPage';

export default function App() {
  const [library, setLibrary]           = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems]               = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [showHelp, setShowHelp]         = useState(false);

  // Fetch library summary on mount
  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => {
        setLibrary(data);
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

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
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
      />

      <main className="main-content">
        {showHelp ? (
          <HelpPage />
        ) : (
          <>
            <header className="content-header">
              <h1 className="category-title">{activeCategory ?? 'Loading…'}</h1>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </header>
            <MediaGrid
              items={filteredItems}
              loading={loading}
              onSelect={setSelectedItem}
            />
          </>
        )}
      </main>

      {selectedItem && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
