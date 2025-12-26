import { useState, useEffect } from 'react';
import { db } from '../utils/db';
import './BudgetHeader.css';

interface BudgetHeaderProps {
  suggestedTotal?: number;
  spent?: number;
  onBudgetChange?: () => void;
}

export function BudgetHeader({ suggestedTotal = 0, spent = 0, onBudgetChange }: BudgetHeaderProps) {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const loadBudgetData = async () => {
      const settings = await db.getBudgetSettings();
      if (settings) {
        setMonthlyBudget(settings.monthlyBudget);
      }
    };

    void loadBudgetData();
  }, []);

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(editValue);
    if (!isNaN(newBudget) && newBudget >= 0) {
      await db.updateBudgetSettings(newBudget);
      setMonthlyBudget(newBudget);
      setIsEditing(false);
      if (onBudgetChange) {
        onBudgetChange();
      }
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
              {suggestedTotal > 0 && (
                <div className="budget-row">
                  <span className="budget-label">Suggested:</span>
                  <span className="budget-value suggested">
                    ${suggestedTotal.toFixed(2)}
                  </span>
                </div>
              )}
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
