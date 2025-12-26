import type { ShoppingItem } from '../utils/db';
import './ItemCard.css';

interface ItemCardProps {
  item: ShoppingItem;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onTogglePurchased: (id: string, purchased: boolean) => void;
}

export function ItemCard({ item, onEdit, onDelete, onTogglePurchased }: ItemCardProps) {
  return (
    <div className={`item-card ${item.purchased ? 'purchased' : ''}`}>
      <div className="item-card-main">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={(e) => onTogglePurchased(item.id, e.target.checked)}
          className="item-checkbox"
          aria-label={`Mark ${item.name} as ${item.purchased ? 'not purchased' : 'purchased'}`}
        />
        
        <div className="item-info">
          <h3 className="item-name">{item.name}</h3>
          <span className="item-price">${item.price.toFixed(2)}</span>
        </div>
      </div>

      <div className="item-actions">
        <button
          onClick={() => onEdit(item)}
          className="btn-icon btn-edit"
          aria-label="Edit item"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="btn-icon btn-delete"
          aria-label="Delete item"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
