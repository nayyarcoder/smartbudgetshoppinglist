import { useState, useEffect } from 'react';
import { BudgetHeader } from '../components/BudgetHeader';
import { BudgetSetupDialog } from '../components/BudgetSetupDialog';
import { db } from '../utils/db';
import './Home.css';

export function Home() {
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      // Check if budget has been set or user has skipped
      const budgetPromptShown = localStorage.getItem('budgetPromptShown');
      
      if (budgetPromptShown !== 'true') {
        // Check if budget is already set (for existing users)
        const settings = await db.getBudgetSettings();
        if (!settings || settings.monthlyBudget === 0) {
          setShowBudgetSetup(true);
        } else {
          // Budget already set, mark prompt as shown
          localStorage.setItem('budgetPromptShown', 'true');
        }
      }
    };

    void checkFirstLaunch();
  }, []);

  const handleSaveBudget = async (budget: number) => {
    await db.updateBudgetSettings(budget);
    localStorage.setItem('budgetPromptShown', 'true');
    setShowBudgetSetup(false);
    
    // Refresh the budget header
    interface WindowWithRefresh extends Window {
      __refreshBudgetHeader?: () => Promise<void>;
    }
    const refreshFn = (window as WindowWithRefresh).__refreshBudgetHeader;
    if (refreshFn) {
      await refreshFn();
    }
  };

  const handleSkipBudget = () => {
    localStorage.setItem('budgetPromptShown', 'true');
    setShowBudgetSetup(false);
  };
  return (
    <div className="home">
      {showBudgetSetup && (
        <BudgetSetupDialog 
          onSave={handleSaveBudget} 
          onSkip={handleSkipBudget} 
        />
      )}
      
      <BudgetHeader />
      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome to Smart Budget Shopping List</h2>
          <p>Your intelligent shopping companion with prioritized budgeting</p>
          
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Organize Items</h3>
              <p>Categorize items as need to have, good to have, or nice to have</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Track Budget</h3>
              <p>Set your monthly budget and track spending in real-time</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Mark Purchases</h3>
              <p>Check off items as you buy them and see your budget adjust</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Works Offline</h3>
              <p>All data stored locally on your device, works without internet</p>
            </div>
          </div>
          
          <div className="cta-section">
            <button className="cta-button">Get Started</button>
            <p className="install-hint">
              💡 Tip: Install this app to your home screen for the best experience
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
