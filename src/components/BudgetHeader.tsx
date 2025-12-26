import { useState, useEffect } from 'react';
import { db } from '../utils/db';
import './BudgetHeader.css';

interface BudgetHeaderProps {
  onBudgetUpdate?: () => void;
}

export function BudgetHeader({ onBudgetUpdate }: BudgetHeaderProps) {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [spent, setSpent] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [error, setError] = useState<string>('');

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
  }, []);
  
  // Expose refresh method for parent components
  useEffect(() => {
    interface WindowWithRefresh extends Window {
      __refreshBudgetHeader?: () => Promise<void>;
    }
    
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
    
    (window as WindowWithRefresh).__refreshBudgetHeader = loadBudgetData;
    return () => {
      delete (window as WindowWithRefresh).__refreshBudgetHeader;
    };
  }, []);

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(editValue);
    
    if (editValue === '') {
      setError('Please enter a budget amount');
      return;
    }
    
    if (isNaN(newBudget)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (newBudget < 0) {
      setError('Budget cannot be negative');
      return;
    }
    
    await db.updateBudgetSettings(newBudget);
    setMonthlyBudget(newBudget);
    setIsEditing(false);
    setError('');
    
    if (onBudgetUpdate) {
      onBudgetUpdate();
    }
  };

  const handleEditClick = () => {
    setEditValue(monthlyBudget.toString());
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleSaveBudget();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const remaining = monthlyBudget - spent;
  const percentUsed = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlyBudget > 0 && remaining < 0;

  return (
    <header className="budget-header">
      <div className="budget-container">
        <h1 className="budget-title">Smart Budget</h1>
        
        {isOverBudget && (
          <div className="budget-warning">
            ⚠️ You've exceeded your budget by ${Math.abs(remaining).toFixed(2)}
          </div>
        )}
        
        <div className="budget-info">
          {isEditing ? (
            <div className="budget-edit">
              <label htmlFor="budget-input">Monthly Budget:</label>
              <input
                id="budget-input"
                type="number"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyPress}
                className={`budget-input ${error ? 'input-error' : ''}`}
                autoFocus
                step="0.01"
                min="0"
              />
              {error && <span className="error-text">{error}</span>}
              <button onClick={handleSaveBudget} className="btn-save">
                Save
              </button>
              <button onClick={handleCancel} className="btn-cancel">
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

        {monthlyBudget > 0 && (
          <div className="budget-bar">
            <div
              className={`budget-bar-fill ${percentUsed > 100 ? 'over-budget' : percentUsed > 90 ? 'warning' : ''}`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
