import { useState, useEffect, useCallback } from 'react';
import { db, type ShoppingItem } from '../utils/db';
import './ShoppingList.css';

type CategoryType = 'need' | 'good' | 'nice';

interface DragState {
  draggedItemId: string | null;
  draggedFromCategory: CategoryType | null;
}

interface UndoState {
  items: ShoppingItem[];
  timestamp: number;
}

const CATEGORY_INFO = {
  need: { label: 'Need to Have', color: '#EF4444' },
  good: { label: 'Good to Have', color: '#F59E0B' },
  nice: { label: 'Nice to Have', color: '#10B981' },
};

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    draggedItemId: null,
    draggedFromCategory: null,
  });
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '' });
  const [addingToCategory, setAddingToCategory] = useState<CategoryType | null>(null);
  const [addForm, setAddForm] = useState({ name: '', price: '' });

  const loadItems = useCallback(async () => {
    const allItems = await db.getAllItems();
    setItems(allItems);
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // Sort items within each category by manual order or price
  const sortItemsInCategory = (categoryItems: ShoppingItem[]): ShoppingItem[] => {
    return [...categoryItems].sort((a, b) => {
      // If both have manual order, use that
      if (a.manualOrder !== null && b.manualOrder !== null) {
        return a.manualOrder - b.manualOrder;
      }
      // If only one has manual order, it comes first
      if (a.manualOrder !== null) return -1;
      if (b.manualOrder !== null) return 1;
      // Otherwise sort by price (ascending)
      return a.price - b.price;
    });
  };

  const getItemsByCategory = (category: CategoryType): ShoppingItem[] => {
    const categoryItems = items.filter(
      (item) => item.category === category && !item.purchased
    );
    return sortItemsInCategory(categoryItems);
  };

  const handleDragStart = (e: React.DragEvent, item: ShoppingItem) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    setDragState({
      draggedItemId: item.id,
      draggedFromCategory: item.category,
    });
    
    // Add dragging class after a tiny delay to avoid flash
    setTimeout(() => {
      const element = e.currentTarget as HTMLElement;
      if (element && element.classList) {
        element.classList.add('dragging');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    if (element && element.classList) {
      element.classList.remove('dragging');
    }
    setDragState({
      draggedItemId: null,
      draggedFromCategory: null,
    });
  };

  const handleDragOver = (e: React.DragEvent, targetItem: ShoppingItem) => {
    e.preventDefault();
    
    // Prevent cross-category drops
    if (
      dragState.draggedFromCategory &&
      dragState.draggedFromCategory !== targetItem.category
    ) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetItem: ShoppingItem) => {
    e.preventDefault();
    
    const { draggedItemId, draggedFromCategory } = dragState;
    
    if (!draggedItemId || draggedFromCategory !== targetItem.category) {
      return;
    }

    // Save current state for undo
    setUndoStack((prev) => [...prev, { items: [...items], timestamp: Date.now() }]);
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 5000);

    // Reorder items in the category
    const categoryItems = getItemsByCategory(targetItem.category);
    const draggedIndex = categoryItems.findIndex((item) => item.id === draggedItemId);
    const targetIndex = categoryItems.findIndex((item) => item.id === targetItem.id);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...categoryItems];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Update manual order for all items in the category
    const updates = newOrder.map((item, index) => 
      db.updateItem(item.id, { manualOrder: index })
    );
    
    await Promise.all(updates);
    await loadItems();
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setShowUndo(false);
    
    // Restore items to database
    const updates = lastState.items.map((item) =>
      db.updateItem(item.id, { manualOrder: item.manualOrder })
    );
    
    await Promise.all(updates);
    await loadItems();
  };

  const handleAddItem = async (category: CategoryType) => {
    if (!addForm.name.trim() || !addForm.price) return;
    
    const price = parseFloat(addForm.price);
    if (isNaN(price) || price <= 0) return;

    await db.addItem({
      name: addForm.name.trim(),
      price,
      category,
      purchased: false,
      order: 0,
      manualOrder: null,
    });
    
    setAddForm({ name: '', price: '' });
    setAddingToCategory(null);
    await loadItems();
  };

  const handleEditItem = async (item: ShoppingItem) => {
    setEditingItemId(item.id);
    setEditForm({ name: item.name, price: item.price.toString() });
  };

  const handleSaveEdit = async (itemId: string) => {
    if (!editForm.name.trim() || !editForm.price) return;
    
    const price = parseFloat(editForm.price);
    if (isNaN(price) || price <= 0) return;

    await db.updateItem(itemId, {
      name: editForm.name.trim(),
      price,
    });
    
    setEditingItemId(null);
    await loadItems();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await db.deleteItem(itemId);
      await loadItems();
    }
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    await db.updateItem(item.id, { purchased: !item.purchased });
    await loadItems();
  };

  const renderItem = (item: ShoppingItem) => {
    const isEditing = editingItemId === item.id;
    const isDragging = dragState.draggedItemId === item.id;

    return (
      <div
        key={item.id}
        className={`item-card ${isDragging ? 'dragging' : ''}`}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, item)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, item)}
        onDrop={(e) => handleDrop(e, item)}
      >
        {!isEditing && (
          <div className="drag-handle" title="Drag to reorder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="7" cy="5" r="1.5" />
              <circle cx="13" cy="5" r="1.5" />
              <circle cx="7" cy="10" r="1.5" />
              <circle cx="13" cy="10" r="1.5" />
              <circle cx="7" cy="15" r="1.5" />
              <circle cx="13" cy="15" r="1.5" />
            </svg>
          </div>
        )}
        
        <div className="item-content">
          {isEditing ? (
            <div className="item-edit-form">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Item name"
                className="item-input"
              />
              <input
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                placeholder="Price"
                step="0.01"
                min="0"
                className="item-input item-price-input"
              />
              <div className="item-edit-actions">
                <button
                  onClick={() => handleSaveEdit(item.id)}
                  className="btn-save"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingItemId(null)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-price">${item.price.toFixed(2)}</span>
              </div>
              
              <div className="item-actions">
                <button
                  onClick={() => handleTogglePurchased(item)}
                  className="btn-icon"
                  title="Mark as purchased"
                >
                  ✓
                </button>
                <button
                  onClick={() => handleEditItem(item)}
                  className="btn-icon"
                  title="Edit item"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="btn-icon btn-delete"
                  title="Delete item"
                >
                  🗑
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCategory = (category: CategoryType) => {
    const categoryItems = getItemsByCategory(category);
    const info = CATEGORY_INFO[category];
    const isAdding = addingToCategory === category;

    return (
      <div key={category} className="category-section">
        <div className="category-header" style={{ borderLeftColor: info.color }}>
          <h2 className="category-title">{info.label}</h2>
          <span className="category-count">{categoryItems.length}</span>
        </div>
        
        {categoryItems.length === 0 && !isAdding ? (
          <div className="empty-category">
            <p>No items yet. Add your first {info.label.toLowerCase()} item!</p>
          </div>
        ) : (
          <div className="items-list">
            {categoryItems.map(renderItem)}
          </div>
        )}
        
        {isAdding ? (
          <div className="add-item-form">
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="Item name"
              className="item-input"
              autoFocus
            />
            <input
              type="number"
              value={addForm.price}
              onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
              placeholder="Price"
              step="0.01"
              min="0"
              className="item-input item-price-input"
            />
            <div className="add-item-actions">
              <button
                onClick={() => handleAddItem(category)}
                className="btn-save"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingToCategory(null);
                  setAddForm({ name: '', price: '' });
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingToCategory(category)}
            className="btn-add-item"
          >
            + Add Item
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="shopping-list">
      {(['need', 'good', 'nice'] as CategoryType[]).map(renderCategory)}
      
      {showUndo && undoStack.length > 0 && (
        <div className="undo-toast">
          <span>Item reordered</span>
          <button onClick={handleUndo} className="btn-undo">
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
