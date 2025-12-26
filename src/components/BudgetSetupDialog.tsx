import { useState } from 'react';
import './BudgetSetupDialog.css';

interface BudgetSetupDialogProps {
  onSave: (budget: number) => void;
  onSkip: () => void;
}

export function BudgetSetupDialog({ onSave, onSkip }: BudgetSetupDialogProps) {
  const [budgetValue, setBudgetValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    const budget = parseFloat(budgetValue);
    
    if (budgetValue === '') {
      setError('Please enter a budget amount');
      return;
    }
    
    if (isNaN(budget)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (budget < 0) {
      setError('Budget cannot be negative');
      return;
    }
    
    onSave(budget);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onSkip();
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>Set Your Monthly Budget</h2>
          <p className="dialog-subtitle">
            Track your spending and stay within your monthly shopping budget
          </p>
        </div>
        
        <div className="dialog-body">
          <label htmlFor="budget-setup-input" className="dialog-label">
            Monthly Budget Amount
          </label>
          <div className="input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              id="budget-setup-input"
              type="number"
              value={budgetValue}
              onChange={(e) => {
                setBudgetValue(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className={`dialog-input ${error ? 'input-error' : ''}`}
              placeholder="0.00"
              autoFocus
              step="0.01"
              min="0"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          
          <p className="dialog-help">
            💡 You can always change this later by clicking on the budget display
          </p>
        </div>
        
        <div className="dialog-actions">
          <button onClick={handleSave} className="btn-primary">
            Set Budget
          </button>
          <button onClick={onSkip} className="btn-secondary">
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}
