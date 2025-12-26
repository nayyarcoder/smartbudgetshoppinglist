import { useState, useEffect, useMemo } from 'react';
import { db, type ShoppingItem } from '../utils/db';
import './ShoppingList.css';

type Category = 'need' | 'good' | 'nice';

interface CategoryInfo {
  id: Category;
  label: string;
  emoji: string;
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'need', label: 'Need to Have', emoji: '🔴' },
  { id: 'good', label: 'Good to Have', emoji: '🟡' },
  { id: 'nice', label: 'Nice to Have', emoji: '🟢' },
];

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(['need', 'good', 'nice'])
  );
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>('need');

  useEffect(() => {
    const loadInitialItems = async () => {
      const allItems = await db.getAllItems();
      setItems(allItems.sort((a, b) => a.order - b.order));
    };
    
    void loadInitialItems();
  }, []);

  const loadItems = async () => {
    const allItems = await db.getAllItems();
    setItems(allItems.sort((a, b) => a.order - b.order));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) return;

    const maxOrder = items
      .filter(item => item.category === newItemCategory)
      .reduce((max, item) => Math.max(max, item.order), 0);

    await db.addItem({
      name: newItemName.trim(),
      price,
      category: newItemCategory,
      purchased: false,
      order: maxOrder + 1,
    });

    setNewItemName('');
    setNewItemPrice('');
    await loadItems();
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    await db.updateItem(item.id, { purchased: !item.purchased });
    await loadItems();
  };

  const handleDeleteItem = async (id: string) => {
    await db.deleteItem(id);
    await loadItems();
  };

  const toggleCategory = (category: Category) => {
    const newCategories = new Set(activeCategories);
    
    // Prevent deselecting the last category
    if (newCategories.has(category) && newCategories.size === 1) {
      return;
    }
    
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    
    setActiveCategories(newCategories);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategories(new Set(['need', 'good', 'nice']));
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return items.filter(item => {
      // Category filter
      if (!activeCategories.has(item.category)) {
        return false;
      }
      
      // Search filter (case-insensitive, mid-string matching)
      if (query && !item.name.toLowerCase().includes(query)) {
        return false;
      }
      
      return true;
    });
  }, [items, searchQuery, activeCategories]);

  // Group filtered items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<Category, ShoppingItem[]> = {
      need: [],
      good: [],
      nice: [],
    };
    
    filteredItems.forEach(item => {
      grouped[item.category].push(item);
    });
    
    return grouped;
  }, [filteredItems]);

  // Count items per category (from all items, not filtered)
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      need: 0,
      good: 0,
      nice: 0,
    };
    
    items.forEach(item => {
      counts[item.category]++;
    });
    
    return counts;
  }, [items]);

  const hasActiveFilters = searchQuery.trim() !== '' || activeCategories.size < 3;
  const totalVisible = filteredItems.length;
  const totalItems = items.length;

  return (
    <div className="shopping-list">
      <div className="list-controls">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-filter ${activeCategories.has(cat.id) ? 'active' : ''}`}
              onClick={() => toggleCategory(cat.id)}
              disabled={activeCategories.has(cat.id) && activeCategories.size === 1}
            >
              <span className="category-emoji">{cat.emoji}</span>
              <span className="category-label">{cat.label}</span>
              <span className="category-count">{categoryCounts[cat.id]}</span>
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <div className="active-filters">
            <span className="filter-label">Active filters:</span>
            {searchQuery && (
              <span className="filter-badge">
                Search: "{searchQuery}"
                <button 
                  className="badge-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search filter"
                >
                  ✕
                </button>
              </span>
            )}
            {activeCategories.size < 3 && (
              <span className="filter-badge">
                {Array.from(activeCategories).map(id => 
                  CATEGORIES.find(c => c.id === id)?.label
                ).join(', ')}
              </span>
            )}
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}

        <div className="item-count">
          Showing {totalVisible} of {totalItems} items
        </div>
      </div>

      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="item-input"
        />
        <input
          type="number"
          placeholder="Price"
          value={newItemPrice}
          onChange={(e) => setNewItemPrice(e.target.value)}
          step="0.01"
          min="0.01"
          className="price-input"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as Category)}
          className="category-select"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
        <button type="submit" className="add-btn">
          Add Item
        </button>
      </form>

      {totalVisible === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No items found</h3>
          {hasActiveFilters ? (
            <p>Try adjusting your search or filters</p>
          ) : (
            <p>Add your first item to get started</p>
          )}
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="categories-container">
          {CATEGORIES.map(cat => {
            const categoryItems = itemsByCategory[cat.id];
            
            // Only show category if it's active and has items
            if (!activeCategories.has(cat.id) || categoryItems.length === 0) {
              return null;
            }

            return (
              <div key={cat.id} className={`category-section category-${cat.id}`}>
                <h3 className="category-header">
                  <span className="category-emoji">{cat.emoji}</span>
                  <span className="category-title">{cat.label}</span>
                  <span className="category-badge">{categoryItems.length}</span>
                </h3>
                
                <div className="items-list">
                  {categoryItems.map(item => (
                    <div key={item.id} className={`item-card ${item.purchased ? 'purchased' : ''}`}>
                      <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => handleTogglePurchased(item)}
                        className="item-checkbox"
                        aria-label={`Mark ${item.name} as ${item.purchased ? 'unpurchased' : 'purchased'}`}
                      />
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">${item.price.toFixed(2)}</span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
