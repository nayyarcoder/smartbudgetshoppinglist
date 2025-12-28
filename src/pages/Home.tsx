import { BudgetHeader } from '../components/BudgetHeader';
import { ShoppingList } from '../components/ShoppingList';
import { ErrorBoundary } from '../components/ErrorBoundary';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <ErrorBoundary>
        <BudgetHeader />
      </ErrorBoundary>
      <main className="main-content">
        <ErrorBoundary>
          <ShoppingList />
        </ErrorBoundary>
      </main>
    </div>
  );
}
