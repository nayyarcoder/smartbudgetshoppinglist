import { useState } from 'react';
import './AddItemDialog.css';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, price: number, category: 'need' | 'good' | 'nice') => void;
  initialData?: {
    name: string;
    price: number;
    category: 'need' | 'good' | 'nice';
  };
}

export function AddItemDialog({ isOpen, onClose, onSave, initialData }: AddItemDialogProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [category, setCategory] = useState<'need' | 'good' | 'nice'>(initialData?.category || 'need');

  if (!isOpen) return null;

  const handleSave = () => {
    const parsedPrice = parseFloat(price);
    if (name.trim() && !isNaN(parsedPrice) && parsedPrice > 0) {
      onSave(name.trim(), parsedPrice, category);
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setPrice('');
    setCategory('need');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog">
        <div className="dialog-header">
          <h2>{initialData ? 'Edit Item' : 'Add Item'}</h2>
          <button className="dialog-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="dialog-content">
          <div className="form-field">
            <label htmlFor="item-name">Item Name</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk, Bread"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="item-price">Price</label>
            <input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-field">
            <label>Priority</label>
            <div className="priority-options">
              <button
                type="button"
                className={`priority-btn priority-need ${category === 'need' ? 'active' : ''}`}
                onClick={() => setCategory('need')}
              >
                <span className="priority-badge priority-badge-need">Need to Have</span>
              </button>
              <button
                type="button"
                className={`priority-btn priority-good ${category === 'good' ? 'active' : ''}`}
                onClick={() => setCategory('good')}
              >
                <span className="priority-badge priority-badge-good">Good to Have</span>
              </button>
              <button
                type="button"
                className={`priority-btn priority-nice ${category === 'nice' ? 'active' : ''}`}
                onClick={() => setCategory('nice')}
              >
                <span className="priority-badge priority-badge-nice">Nice to Have</span>
              </button>
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!name.trim() || !price || parseFloat(price) <= 0}
          >
            {initialData ? 'Update' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
