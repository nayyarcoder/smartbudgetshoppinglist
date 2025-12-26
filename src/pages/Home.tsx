import { useState, useEffect, useCallback } from 'react';
import { BudgetHeader } from '../components/BudgetHeader';
import { ShoppingList } from '../components/ShoppingList';
import { ItemForm } from '../components/ItemForm';
import { db, type ShoppingItem } from '../utils/db';
import { calculateBudgetRecommendations, type BudgetRecommendation } from '../utils/budgetRecommendations';
import './Home.css';

export function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [spent, setSpent] = useState<number>(0);
  const [recommendation, setRecommendation] = useState<BudgetRecommendation>({
    affordableItems: [],
    unaffordableItems: [],
    suggestedTotal: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    const settings = await db.getBudgetSettings();

    const allItems = await db.getAllItems();
    setItems(allItems);

    const totalSpent = allItems
      .filter(item => item.purchased)
      .reduce((sum, item) => sum + item.price, 0);
    setSpent(totalSpent);

    // Calculate recommendations
    const remaining = (settings?.monthlyBudget || 0) - totalSpent;
    const newRecommendation = calculateBudgetRecommendations(allItems, remaining);
    setRecommendation(newRecommendation);
  }, []);

  // Load data on component mount - this is the correct pattern for initial data fetching
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handleItemAdded = () => {
    // Force ShoppingList to refresh
    setRefreshKey(prev => prev + 1);
    // Reload data to update recommendations
    void loadData();
  };

  const handleBudgetChange = async () => {
    await loadData();
  };

  return (
    <div className="home">
      <BudgetHeader 
        suggestedTotal={recommendation.suggestedTotal}
        spent={spent}
        onBudgetChange={handleBudgetChange}
      />
      <main className="main-content">
        <ShoppingList 
          key={refreshKey}
          items={items}
          recommendation={recommendation}
          onDataChange={loadData}
        />
      </main>
      <ItemForm onItemAdded={handleItemAdded} />
    </div>
  );
}
