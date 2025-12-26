import { useState } from 'react';
import { BudgetHeader } from '../components/BudgetHeader';
import { ShoppingList } from '../components/ShoppingList';
import { ItemForm } from '../components/ItemForm';
import './Home.css';

export function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleItemAdded = () => {
    // Force ShoppingList to refresh
    setRefreshKey(prev => prev + 1);
    // Trigger budget update
    window.dispatchEvent(new CustomEvent('budgetUpdate'));
  };

  return (
    <div className="home">
      <BudgetHeader />
      <main className="main-content">
        <ShoppingList key={refreshKey} />
      </main>
      <ItemForm onItemAdded={handleItemAdded} />
    </div>
  );
}
