import { useState, useEffect } from 'react';
import { db, type ShoppingItem } from '../utils/db';
import './ShoppingList.css';

type Category = 'need' | 'good' | 'nice';
type UndoAction = {
  type: 'add' | 'delete' | 'update' | 'purchase';
  item: ShoppingItem;
  previousState?: ShoppingItem;
};

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>('need');
  const [priceError, setPriceError] = useState('');
  const [filters, setFilters] = useState<Set<Category>>(new Set(['need', 'good', 'nice']));
  const [searchQuery, setSearchQuery] = useState('');
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Load items on mount
  useEffect(() => {
    loadItems();
    
    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check budget exceeded status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const settings = await db.getBudgetSettings();
        if (settings) {
          const totalSpent = items
            .filter(item => item.purchased)
            .reduce((sum, item) => sum + item.price, 0);
          setBudgetExceeded(totalSpent > settings.monthlyBudget);
        }
      } catch (error) {
        console.error('Failed to check budget:', error);
      }
    };
    
    checkStatus();
  }, [items]);

  const loadItems = async () => {
    try {
      const allItems = await db.getAllItems();
      setItems(allItems.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePrice = (priceStr: string): number | null => {
    const price = parseFloat(priceStr);
    
    if (isNaN(price)) {
      setPriceError('Please enter a valid number');
      return null;
    }
    
    if (price <= 0) {
      setPriceError('Price must be greater than zero');
      return null;
    }
    
    setPriceError('');
    return price;
  };

  const addItem = async () => {
    const price = validatePrice(newItemPrice);
    if (!price || !newItemName.trim()) {
      return;
    }

    try {
      const order = items.filter(i => i.category === newItemCategory).length;
      const id = await db.addItem({
        name: newItemName.trim(),
        price,
        category: newItemCategory,
        purchased: false,
        order,
      });

      const newItem = await db.getItem(id);
      if (newItem) {
        setItems([...items, newItem]);
        setUndoStack([...undoStack, { type: 'add', item: newItem }]);
        setNewItemName('');
        setNewItemPrice('');
        setPriceError('');
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const deleteItem = async (item: ShoppingItem) => {
    try {
      await db.deleteItem(item.id);
      setItems(items.filter(i => i.id !== item.id));
      setUndoStack([...undoStack, { type: 'delete', item }]);
      setShowUndo(true);
      const timeoutId = setTimeout(() => setShowUndo(false), 5000);
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const togglePurchased = async (item: ShoppingItem) => {
    try {
      const updated = { ...item, purchased: !item.purchased };
      await db.updateItem(item.id, { purchased: !item.purchased });
      setItems(items.map(i => i.id === item.id ? updated : i));
      setUndoStack([...undoStack, { type: 'purchase', item: updated, previousState: item }]);
      setShowUndo(true);
      const timeoutId = setTimeout(() => setShowUndo(false), 5000);
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const undo = async () => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    try {
      switch (lastAction.type) {
        case 'add':
          await db.deleteItem(lastAction.item.id);
          setItems(items.filter(i => i.id !== lastAction.item.id));
          break;
        case 'delete':
          await db.addItem({
            name: lastAction.item.name,
            price: lastAction.item.price,
            category: lastAction.item.category,
            purchased: lastAction.item.purchased,
            order: lastAction.item.order,
          });
          await loadItems();
          break;
        case 'purchase':
          if (lastAction.previousState) {
            await db.updateItem(lastAction.item.id, { 
              purchased: lastAction.previousState.purchased 
            });
            setItems(items.map(i => 
              i.id === lastAction.item.id ? lastAction.previousState! : i
            ));
          }
          break;
      }
      setUndoStack(undoStack.slice(0, -1));
      setShowUndo(false);
    } catch (error) {
      console.error('Failed to undo:', error);
    }
  };

  const toggleFilter = (category: Category) => {
    const newFilters = new Set(filters);
    
    // Always keep at least one filter active
    if (newFilters.has(category) && newFilters.size > 1) {
      newFilters.delete(category);
    } else if (!newFilters.has(category)) {
      newFilters.add(category);
    }
    
    setFilters(newFilters);
  };

  const getFilteredItems = () => {
    return items.filter(item => {
      const matchesFilter = filters.has(item.category);
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const getCategoryItems = (category: Category) => {
    return getFilteredItems().filter(item => item.category === category);
  };

  const getCategoryTitle = (category: Category) => {
    switch (category) {
      case 'need': return 'Need to Have';
      case 'good': return 'Good to Have';
      case 'nice': return 'Nice to Have';
    }
  };

  const getCategoryEmptyMessage = (category: Category) => {
    switch (category) {
      case 'need': return 'Add essential items you absolutely need';
      case 'good': return 'Add items that would be helpful but not critical';
      case 'nice': return 'Add items that would be nice to have if budget allows';
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'need': return '🎯';
      case 'good': return '👍';
      case 'nice': return '✨';
    }
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return <div className="shopping-list-loading">Loading...</div>;
  }

  return (
    <div className="shopping-list">
      {isOffline && (
        <div className="offline-banner">
          📡 You're offline - All changes are saved locally
        </div>
      )}

      {/* Add Item Form */}
      <div className="add-item-form">
        <h3>Add New Item</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="item-name-input"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            className="item-price-input"
            step="0.01"
            min="0.01"
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as Category)}
            className="category-select"
          >
            <option value="need">Need</option>
            <option value="good">Good</option>
            <option value="nice">Nice</option>
          </select>
          <button onClick={addItem} disabled={!newItemName.trim() || !newItemPrice}>
            Add
          </button>
        </div>
        {priceError && <div className="price-error">{priceError}</div>}
      </div>

      {/* Search and Filters */}
      <div className="controls">
        <input
          type="search"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="filters">
          <button
            className={`filter-btn ${filters.has('need') ? 'active' : ''}`}
            onClick={() => toggleFilter('need')}
          >
            Need
          </button>
          <button
            className={`filter-btn ${filters.has('good') ? 'active' : ''}`}
            onClick={() => toggleFilter('good')}
          >
            Good
          </button>
          <button
            className={`filter-btn ${filters.has('nice') ? 'active' : ''}`}
            onClick={() => toggleFilter('nice')}
          >
            Nice
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="categories">
        {(['need', 'good', 'nice'] as Category[]).map(category => {
          if (!filters.has(category)) return null;
          
          const categoryItems = getCategoryItems(category);
          
          return (
            <div key={category} className={`category ${category}`}>
              <div className="category-header sticky">
                <span className="category-icon">{getCategoryIcon(category)}</span>
                <h2>{getCategoryTitle(category)}</h2>
                <span className="item-count">{categoryItems.length}</span>
              </div>
              
              {categoryItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{getCategoryIcon(category)}</div>
                  <p className="empty-message">{getCategoryEmptyMessage(category)}</p>
                </div>
              ) : (
                <div className="items-list">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`item-card ${item.purchased ? 'purchased' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => togglePurchased(item)}
                        className="item-checkbox"
                      />
                      <div className="item-details">
                        <div className="item-name" title={item.name}>
                          {item.name}
                        </div>
                        <div className="item-price">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem(item)}
                        className="delete-btn"
                        aria-label="Delete item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredItems.length === 0 && items.length > 0 && (
        <div className="no-results">
          <p>No items found matching your search</p>
          <button onClick={() => setSearchQuery('')}>Clear search</button>
        </div>
      )}

      {/* Undo Toast */}
      {showUndo && undoStack.length > 0 && (
        <div className="undo-toast">
          <span>Action completed</span>
          <button onClick={undo}>Undo</button>
        </div>
      )}

      {/* Budget Warning */}
      {budgetExceeded && (
        <div className="budget-warning shake">
          ⚠️ Budget exceeded! Consider deferring some items.
        </div>
      )}
    </div>
  );
}
