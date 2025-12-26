import { useState, useEffect } from 'react';
import { db } from '../utils/db';
import type { ShoppingItem } from '../utils/db';
import { AddItemDialog } from './AddItemDialog';
import { ItemCard } from './ItemCard';
import './ShoppingList.css';

type CategoryType = 'need' | 'good' | 'nice';

interface CategoryConfig {
  id: CategoryType;
  title: string;
  emptyMessage: string;
  badgeClass: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'need',
    title: 'Need to Have',
    emptyMessage: 'Add your first essential item',
    badgeClass: 'category-badge-need',
  },
  {
    id: 'good',
    title: 'Good to Have',
    emptyMessage: 'Add your first important item',
    badgeClass: 'category-badge-good',
  },
  {
    id: 'nice',
    title: 'Nice to Have',
    emptyMessage: 'Add your first nice-to-have item',
    badgeClass: 'category-badge-nice',
  },
];

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const allItems = await db.getAllItems();
      // Sort by price (lowest to highest) within each category
      const sorted = allItems.sort((a, b) => {
        if (a.category !== b.category) {
          return CATEGORIES.findIndex(c => c.id === a.category) - 
                 CATEGORIES.findIndex(c => c.id === b.category);
        }
        return a.price - b.price;
      });
      setItems(sorted);
    };
    void loadData();
  }, [refreshKey]);

  const refreshItems = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAddItem = async (name: string, price: number, category: CategoryType) => {
    const maxOrder = items
      .filter(item => item.category === category)
      .reduce((max, item) => Math.max(max, item.order), 0);
    
    await db.addItem({
      name,
      price,
      category,
      purchased: false,
      order: maxOrder + 1,
    });
    
    refreshItems();
  };

  const handleUpdateItem = async (name: string, price: number, category: CategoryType) => {
    if (editingItem) {
      await db.updateItem(editingItem.id, { name, price, category });
      refreshItems();
      setEditingItem(null);
    }
  };

  const handleEditClick = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await db.deleteItem(id);
      refreshItems();
    }
  };

  const handleTogglePurchased = async (id: string, purchased: boolean) => {
    await db.updateItem(id, { purchased });
    refreshItems();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const getItemsByCategory = (category: CategoryType) => {
    return items.filter(item => item.category === category && !item.purchased);
  };

  return (
    <div className="shopping-list">
      <div className="shopping-list-header">
        <h2>Shopping List</h2>
        <button
          className="btn-add"
          onClick={() => setIsDialogOpen(true)}
          aria-label="Add new item"
        >
          + Add Item
        </button>
      </div>

      <div className="categories">
        {CATEGORIES.map(category => {
          const categoryItems = getItemsByCategory(category.id);
          
          return (
            <div key={category.id} className="category-section">
              <div className="category-header">
                <h3 className="category-title">{category.title}</h3>
                <span className={`category-badge ${category.badgeClass}`}>
                  {categoryItems.length}
                </span>
              </div>

              {categoryItems.length === 0 ? (
                <div className="empty-state">
                  <p>{category.emptyMessage}</p>
                </div>
              ) : (
                <div className="items-list">
                  {categoryItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteItem}
                      onTogglePurchased={handleTogglePurchased}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddItemDialog
        key={editingItem ? editingItem.id : 'new'}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSave={editingItem ? handleUpdateItem : handleAddItem}
        initialData={editingItem ? {
          name: editingItem.name,
          price: editingItem.price,
          category: editingItem.category,
        } : undefined}
      />
    </div>
  );
}
