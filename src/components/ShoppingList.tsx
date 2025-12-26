import { useState, useEffect } from 'react';
import { db, type ShoppingItem } from '../utils/db';
import './ShoppingList.css';

interface PurchasedItem extends ShoppingItem {
  purchasedAt: number;
}

const PURCHASE_ANIMATION_DURATION = 300;
const UNDO_TIMEOUT_MS = 5000;

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [undoItem, setUndoItem] = useState<PurchasedItem | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const loadItems = async () => {
    const allItems = await db.getAllItems();
    // Only show unpurchased items
    const unpurchased = allItems.filter(item => !item.purchased);
    setItems(unpurchased.sort((a, b) => {
      // Sort by category priority, then by order
      const categoryOrder = { need: 0, good: 1, nice: 2 };
      if (categoryOrder[a.category] !== categoryOrder[b.category]) {
        return categoryOrder[a.category] - categoryOrder[b.category];
      }
      return a.order - b.order;
    }));
  };

  useEffect(() => {
    const fetchItems = async () => {
      await loadItems();
    };
    void fetchItems();
  }, []);

  const handlePurchase = async (item: ShoppingItem) => {
    // Start fade-out animation
    setPurchasingItem(item.id);

    // Wait for animation to complete
    setTimeout(async () => {
      // Mark as purchased in database
      await db.updateItem(item.id, { purchased: true });
      
      // Remove from list
      setItems(prev => prev.filter(i => i.id !== item.id));
      setPurchasingItem(null);

      // Show undo toast
      const purchasedItem: PurchasedItem = {
        ...item,
        purchased: true,
        purchasedAt: Date.now()
      };
      setUndoItem(purchasedItem);
      setShowUndo(true);

      // Trigger budget update in BudgetHeader
      window.dispatchEvent(new CustomEvent('budgetUpdate'));

      // Auto-hide undo after timeout
      setTimeout(() => {
        setShowUndo(false);
        setUndoItem(null);
      }, UNDO_TIMEOUT_MS);
    }, PURCHASE_ANIMATION_DURATION);
  };

  const handleUndo = async () => {
    if (!undoItem) return;

    // Mark as unpurchased
    await db.updateItem(undoItem.id, { purchased: false });
    
    // Hide undo toast
    setShowUndo(false);
    
    // Reload items
    await loadItems();
    
    // Trigger budget update
    window.dispatchEvent(new CustomEvent('budgetUpdate'));
    
    setUndoItem(null);
  };

  const handleDismissUndo = () => {
    setShowUndo(false);
    setUndoItem(null);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'need': return 'Need to Have';
      case 'good': return 'Good to Have';
      case 'nice': return 'Nice to Have';
      default: return category;
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const categories = ['need', 'good', 'nice'] as const;

  return (
    <div className="shopping-list">
      {categories.map(category => (
        <div key={category} className="category-section">
          <h2 className={`category-header category-${category}`}>
            {getCategoryLabel(category)}
            <span className="item-count">
              {groupedItems[category]?.length || 0}
            </span>
          </h2>
          
          <div className="items-container">
            {groupedItems[category]?.length > 0 ? (
              groupedItems[category].map(item => (
                <div
                  key={item.id}
                  className={`item-card ${purchasingItem === item.id ? 'purchasing' : ''}`}
                >
                  <button
                    className="purchase-button"
                    onClick={() => handlePurchase(item)}
                    aria-label="Mark as purchased"
                    disabled={purchasingItem === item.id}
                  >
                    <span className="checkbox-icon">
                      {purchasingItem === item.id ? '✓' : ''}
                    </span>
                  </button>
                  
                  <div className="item-content">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No {category} items yet</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {showUndo && undoItem && (
        <div className="undo-toast">
          <div className="undo-content">
            <span className="undo-message">
              {undoItem.name} purchased
            </span>
            <div className="undo-actions">
              <button className="undo-button" onClick={handleUndo}>
                Undo
              </button>
              <button className="dismiss-button" onClick={handleDismissUndo} aria-label="Dismiss">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
