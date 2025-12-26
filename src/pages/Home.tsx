import { BudgetHeader } from '../components/BudgetHeader';
import { ShoppingList } from '../components/ShoppingList';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <BudgetHeader />
      <main className="main-content">
        <ShoppingList />
      </main>
    </div>
  );
}
