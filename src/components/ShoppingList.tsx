import { useState, useEffect } from 'react';
import { db, type ShoppingItem } from '../utils/db';
import type { BudgetRecommendation } from '../utils/budgetRecommendations';
import './ShoppingList.css';

interface ShoppingListProps {
  items: ShoppingItem[];
  recommendation: BudgetRecommendation;
  onDataChange: () => void;
}

interface PurchasedItem extends ShoppingItem {
  purchasedAt: number;
}

const PURCHASE_ANIMATION_DURATION = 300;
const UNDO_TIMEOUT_MS = 5000;

export function ShoppingList({ items: propItems, recommendation, onDataChange }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [undoItem, setUndoItem] = useState<PurchasedItem | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    // Only show unpurchased items
    const unpurchased = propItems.filter(item => !item.purchased);
    setItems(unpurchased.sort((a, b) => {
      // Sort by category priority, then by order
      const categoryOrder = { need: 0, good: 1, nice: 2 };
      if (categoryOrder[a.category] !== categoryOrder[b.category]) {
        return categoryOrder[a.category] - categoryOrder[b.category];
      }
      return a.order - b.order;
    }));
  }, [propItems]);

  const handlePurchase = async (item: ShoppingItem) => {
    // Start fade-out animation
    setPurchasingItem(item.id);

    // Wait for animation to complete
    setTimeout(async () => {
      try {
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

        // Trigger data reload
        onDataChange();

        // Auto-hide undo after timeout
        setTimeout(() => {
          setShowUndo(false);
          setUndoItem(null);
        }, UNDO_TIMEOUT_MS);
      } catch (error) {
        console.error('Failed to purchase item:', error);
        setPurchasingItem(null);
      }
    }, PURCHASE_ANIMATION_DURATION);
  };

  const handleUndo = async () => {
    if (!undoItem) return;

    try {
      // Mark as unpurchased
      await db.updateItem(undoItem.id, { purchased: false });
      
      // Hide undo toast
      setShowUndo(false);
      
      // Trigger data reload
      onDataChange();
      
      setUndoItem(null);
    } catch (error) {
      console.error('Failed to undo purchase:', error);
    }
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

  const isItemAffordable = (item: ShoppingItem) => {
    return recommendation.affordableItems.some(i => i.id === item.id);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const categories = ['need', 'good', 'nice'] as const;
  const totalUnpurchased = items.length;
  const affordableCount = recommendation.affordableItems.length;
  const unaffordableCount = recommendation.unaffordableItems.length;

  return (
    <div className="shopping-list">
      {/* Affordability Summary */}
      {totalUnpurchased > 0 && (
        <div className="affordability-summary">
          <h3>Smart Budget Recommendation</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Affordable</span>
              <span className="stat-value">{affordableCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Over Budget</span>
              <span className="stat-value exceeded">{unaffordableCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Suggested Total</span>
              <span className="stat-value suggested">
                ${recommendation.suggestedTotal.toFixed(2)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{totalUnpurchased}</span>
            </div>
          </div>
        </div>
      )}

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
              groupedItems[category].map(item => {
                const affordable = isItemAffordable(item);
                return (
                  <div
                    key={item.id}
                    className={`item-card ${purchasingItem === item.id ? 'purchasing' : ''} ${affordable ? 'affordable' : 'unaffordable'}`}
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

                    <div className="affordability-indicator">
                      {affordable ? '✓' : '⚠️'}
                    </div>
                  </div>
                );
              })
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
