import { useState } from 'react';
import type { ShoppingItem as ShoppingItemType } from '../utils/db';
import { ShoppingItem } from './ShoppingItem';
import type { BudgetRecommendation } from '../utils/budgetRecommendations';
import './ShoppingList.css';

interface ShoppingListProps {
  items: ShoppingItemType[];
  recommendation: BudgetRecommendation;
  onAddItem: (name: string, price: number, category: 'need' | 'good' | 'nice') => void;
  onTogglePurchased: (id: string, purchased: boolean) => void;
  onDeleteItem: (id: string) => void;
}

export function ShoppingList({ 
  items, 
  recommendation, 
  onAddItem, 
  onTogglePurchased, 
  onDeleteItem 
}: ShoppingListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'need' | 'good' | 'nice'>('need');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(price) || price <= 0) {
      alert('Please enter a valid item name and price');
      return;
    }

    onAddItem(newItemName.trim(), price, newItemCategory);
    
    // Reset form
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('need');
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('need');
    setShowAddForm(false);
  };

  // Organize items by category
  const needItems = items.filter(item => item.category === 'need' && !item.purchased);
  const goodItems = items.filter(item => item.category === 'good' && !item.purchased);
  const niceItems = items.filter(item => item.category === 'nice' && !item.purchased);

  const isItemAffordable = (item: ShoppingItemType) => {
    return recommendation.affordableItems.some(i => i.id === item.id);
  };

  const renderCategorySection = (
    title: string,
    icon: string,
    categoryItems: ShoppingItemType[],
    categoryType: 'need' | 'good' | 'nice'
  ) => {
    if (categoryItems.length === 0) {
      return (
        <div className="category-section" key={categoryType}>
          <div className="category-header">
            <h2 className="category-title">
              <span className="category-icon">{icon}</span>
              {title}
            </h2>
            <span className="category-count">0 items</span>
          </div>
          <div className="empty-category">
            No {title.toLowerCase()} items yet
          </div>
        </div>
      );
    }

    return (
      <div className="category-section" key={categoryType}>
        <div className="category-header">
          <h2 className="category-title">
            <span className="category-icon">{icon}</span>
            {title}
          </h2>
          <span className="category-count">{categoryItems.length} items</span>
        </div>
        <div className="items-container">
          {categoryItems.map(item => (
            <ShoppingItem
              key={item.id}
              item={item}
              isAffordable={isItemAffordable(item)}
              onTogglePurchased={onTogglePurchased}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      </div>
    );
  };

  const totalUnpurchased = needItems.length + goodItems.length + niceItems.length;
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

      {/* Category Sections */}
      {renderCategorySection('Need to Have', '🔴', needItems, 'need')}
      {renderCategorySection('Good to Have', '🟠', goodItems, 'good')}
      {renderCategorySection('Nice to Have', '🔵', niceItems, 'nice')}

      {/* Add Item Section */}
      <div className="add-item-section">
        {!showAddForm ? (
          <button 
            className="add-item-button"
            onClick={() => setShowAddForm(true)}
          >
            <span>+</span>
            Add New Item
          </button>
        ) : (
          <form className="add-item-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="item-name">Item Name</label>
              <input
                id="item-name"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Milk, Bread, Laptop"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="item-price">Price ($)</label>
              <input
                id="item-price"
                type="number"
                step="0.01"
                min="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="item-category">Priority</label>
              <select
                id="item-category"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as 'need' | 'good' | 'nice')}
              >
                <option value="need">Need to Have</option>
                <option value="good">Good to Have</option>
                <option value="nice">Nice to Have</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit">Add Item</button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
