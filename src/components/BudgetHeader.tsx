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
  const [budgetError, setBudgetError] = useState<string>('');

  const loadBudgetData = async () => {
    try {
      const settings = await db.getBudgetSettings();
      if (settings) {
        setMonthlyBudget(settings.monthlyBudget);
      }
    } catch (error) {
      console.error('Failed to load budget data:', error);
    }
  };

  useEffect(() => {
    const load = () => {
      void loadBudgetData();
    };
    
    load();

    // Listen for budget updates from purchases
    const handleBudgetUpdate = () => {
      void loadBudgetData();
    };

    window.addEventListener('budgetUpdate', handleBudgetUpdate);
    return () => {
      window.removeEventListener('budgetUpdate', handleBudgetUpdate);
    };
  }, []);

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(editValue);
    
    if (isNaN(newBudget)) {
      setBudgetError('Please enter a valid number');
      return;
    }
    
    if (newBudget < 0) {
      setBudgetError('Budget cannot be negative');
      return;
    }
    
    if (newBudget === 0) {
      setBudgetError('Budget must be greater than zero');
      return;
    }
    
    try {
      await db.updateBudgetSettings(newBudget);
      setMonthlyBudget(newBudget);
      setIsEditing(false);
      setBudgetError('');
      if (onBudgetChange) {
        onBudgetChange();
      }
    } catch (error) {
      console.error('Failed to save budget:', error);
      setBudgetError('Failed to save budget. Please try again.');
    }
  };

  const handleEditClick = () => {
    setEditValue(monthlyBudget.toString());
    setIsEditing(true);
    setBudgetError('');
  };

  const remaining = monthlyBudget - spent;
  const percentUsed = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;
  const isOverBudget = remaining < 0;

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
                step="0.01"
                min="0.01"
              />
              {budgetError && (
                <div className="budget-error">{budgetError}</div>
              )}
              <button onClick={handleSaveBudget} className="btn-save">
                Save
              </button>
              <button onClick={() => {
                setIsEditing(false);
                setBudgetError('');
              }} className="btn-cancel">
                Cancel
              </button>
              {budgetError && <div className="budget-error">{budgetError}</div>}
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
                <span className={`budget-value ${isOverBudget ? 'over-budget' : ''}`}>
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
            className={`budget-bar-fill ${percentUsed > 100 ? 'over-budget' : ''} ${isOverBudget ? 'pulse' : ''}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>
    </header>
  );
}
