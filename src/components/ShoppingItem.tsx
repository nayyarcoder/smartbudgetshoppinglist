import type { ShoppingItem as ShoppingItemType } from '../utils/db';
import './ShoppingItem.css';

interface ShoppingItemProps {
  item: ShoppingItemType;
  isAffordable: boolean;
  onTogglePurchased: (id: string, purchased: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ShoppingItem({ 
  item, 
  isAffordable, 
  onTogglePurchased, 
  onDelete,
  onEdit
}: ShoppingItemProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTogglePurchased(item.id, e.target.checked);
  };

  const categoryLabels = {
    need: 'Need',
    good: 'Good',
    nice: 'Nice'
  };

  return (
    <div className={`shopping-item ${isAffordable ? 'affordable' : 'unaffordable'}`}>
      <input
        type="checkbox"
        className="item-checkbox"
        checked={item.purchased}
        onChange={handleCheckboxChange}
        aria-label={`Mark ${item.name} as purchased`}
      />
      
      <div className="item-content">
        <div className="item-name">{item.name}</div>
        <div className="item-details">
          <span className="item-price">${item.price.toFixed(2)}</span>
          <span className={`item-category ${item.category}`}>
            {categoryLabels[item.category]}
          </span>
        </div>
        
        <div className="item-actions">
          {onEdit && (
            <button onClick={() => onEdit(item.id)} aria-label="Edit item">
              Edit
            </button>
          )}
          <button 
            className="delete" 
            onClick={() => onDelete(item.id)}
            aria-label="Delete item"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="affordability-indicator">
        {isAffordable ? '✓' : '⚠️'}
      </div>
    </div>
  );
}
