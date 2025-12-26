import { useState, useEffect } from 'react';
import { db } from '../utils/db';
import './BudgetHeader.css';

export function BudgetHeader() {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [spent, setSpent] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const loadBudgetData = async () => {
      const settings = await db.getBudgetSettings();
      if (settings) {
        setMonthlyBudget(settings.monthlyBudget);
      }

      const items = await db.getAllItems();
      const totalSpent = items
        .filter(item => item.purchased)
        .reduce((sum, item) => sum + item.price, 0);
      setSpent(totalSpent);
    };

    void loadBudgetData();
    
    // Poll for updates every 5 seconds to keep budget in sync
    // This is a simple solution; a more efficient approach would use custom events
    const interval = setInterval(() => {
      void loadBudgetData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(editValue);
    if (!isNaN(newBudget) && newBudget >= 0) {
      await db.updateBudgetSettings(newBudget);
      setMonthlyBudget(newBudget);
      setIsEditing(false);
    }
  };

  const handleEditClick = () => {
    setEditValue(monthlyBudget.toString());
    setIsEditing(true);
  };

  const remaining = monthlyBudget - spent;
  const percentUsed = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;

  return (
    <header className="budget-header">
      <div className="budget-container">
        <h1 className="budget-title">Smart Budget</h1>
        
        <div className="budget-info">
          {isEditing ? (
            <div className="budget-edit">
              <label htmlFor="budget-input">Monthly Budget:</label>
              <input
                id="budget-input"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="budget-input"
                autoFocus
              />
              <button onClick={handleSaveBudget} className="btn-save">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          ) : (
            <div className="budget-display" onClick={handleEditClick}>
              <div className="budget-row">
                <span className="budget-label">Budget:</span>
                <span className="budget-value">
                  ${monthlyBudget.toFixed(2)}
                </span>
              </div>
              <div className="budget-row">
                <span className="budget-label">Spent:</span>
                <span className="budget-value spent">
                  ${spent.toFixed(2)}
                </span>
              </div>
              <div className="budget-row">
                <span className="budget-label">Remaining:</span>
                <span className={`budget-value ${remaining < 0 ? 'over-budget' : ''}`}>
                  ${remaining.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="budget-bar">
          <div
            className={`budget-bar-fill ${percentUsed > 100 ? 'over-budget' : ''}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>
    </header>
  );
}
