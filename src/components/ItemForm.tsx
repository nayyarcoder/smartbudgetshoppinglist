import { useState } from 'react';
import { db } from '../utils/db';
import './ItemForm.css';

interface ItemFormProps {
  onItemAdded?: () => void;
}

export function ItemForm({ onItemAdded }: ItemFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'need' | 'good' | 'nice'>('need');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price) return;

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }

    setError('');

    await db.addItem({
      name: name.trim(),
      price: priceNum,
      category,
      purchased: false,
      order: Date.now(), // Use timestamp for initial order
      manualOrder: null, // Start with price-based sorting
    });

    // Reset form
    setName('');
    setPrice('');
    setCategory('need');
    setIsExpanded(false);

    // Notify parent
    if (onItemAdded) {
      onItemAdded();
    }
  };

  if (!isExpanded) {
    return (
      <button 
        className="add-item-fab"
        onClick={() => setIsExpanded(true)}
        aria-label="Add new item"
      >
        +
      </button>
    );
  }

  return (
    <div className="item-form-overlay" onClick={() => setIsExpanded(false)}>
      <div className="item-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="item-form-header">
          <h2>Add New Item</h2>
          <button 
            className="close-button"
            onClick={() => setIsExpanded(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="item-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="item-name">Item Name</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk, Bread"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="item-price">Price ($)</label>
            <input
              id="item-price"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="item-category">Category</label>
            <select
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'need' | 'good' | 'nice')}
            >
              <option value="need">Need to Have</option>
              <option value="good">Good to Have</option>
              <option value="nice">Nice to Have</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsExpanded(false)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
