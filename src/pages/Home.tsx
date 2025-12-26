import { BudgetHeader } from '../components/BudgetHeader';
import './Home.css';

export function Home() {
  return (
    <div className="home">
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
