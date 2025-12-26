import { useState } from 'react';
import { BudgetHeader } from '../components/BudgetHeader';
import {
  ItemCard,
  DragHandle,
  Badge,
  CategorySection,
  Checkbox,
  FloatingActionButton,
  PlusIcon,
  Dialog,
  Input,
  Button,
} from '../components/ui';
import './Home.css';

export function Home() {
  const [showDialog, setShowDialog] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number | null>(null);
  const [demoItems] = useState([
    { id: '1', name: 'Milk', price: 3.99, category: 'need' as const, purchased: false },
    { id: '2', name: 'Bread', price: 2.49, category: 'need' as const, purchased: false },
    { id: '3', name: 'Coffee', price: 8.99, category: 'good' as const, purchased: false },
    { id: '4', name: 'Cookies', price: 4.99, category: 'nice' as const, purchased: false },
  ]);

  const handleAddItem = () => {
    setShowDialog(true);
  };

  const handleSaveItem = () => {
    // This would save to the database
    console.log('Saving item:', itemName, itemPrice);
    setShowDialog(false);
    setItemName('');
    setItemPrice(null);
  };

  return (
    <div className="home">
      <BudgetHeader />
      <main className="main-content">
        <div className="welcome-section">
          <h2>Component Showcase</h2>
          <p>Interactive demonstration of all core UI components</p>

          {/* Category Sections Demo */}
          <div className="components-demo">
            <CategorySection
              title="Need to Have"
              category="need"
              itemCount={2}
              sticky={false}
            >
              {demoItems
                .filter((item) => item.category === 'need')
                .map((item) => (
                  <ItemCard key={item.id} priority="need">
                    <DragHandle />
                    <div className="item-content">
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <Badge variant="need">Need</Badge>
                      </div>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <Checkbox large={true} />
                  </ItemCard>
                ))}
            </CategorySection>

            <CategorySection
              title="Good to Have"
              category="good"
              itemCount={1}
              sticky={false}
            >
              {demoItems
                .filter((item) => item.category === 'good')
                .map((item) => (
                  <ItemCard key={item.id} priority="good">
                    <DragHandle />
                    <div className="item-content">
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <Badge variant="good">Good</Badge>
                      </div>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <Checkbox large={true} />
                  </ItemCard>
                ))}
            </CategorySection>

            <CategorySection
              title="Nice to Have"
              category="nice"
              itemCount={1}
              sticky={false}
            >
              {demoItems
                .filter((item) => item.category === 'nice')
                .map((item) => (
                  <ItemCard key={item.id} priority="nice">
                    <DragHandle />
                    <div className="item-content">
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <Badge variant="nice">Nice</Badge>
                      </div>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <Checkbox large={true} />
                  </ItemCard>
                ))}
            </CategorySection>
          </div>

          {/* Button variants demo */}
          <div className="button-demo">
            <h3>Button Variants</h3>
            <div className="button-grid">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
        </div>
      </main>

      <FloatingActionButton
        icon={<PlusIcon />}
        label="Add Item"
        onClick={handleAddItem}
      />

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Add New Item"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveItem}>
              Save Item
            </Button>
          </>
        }
      >
        <div className="dialog-form">
          <Input
            label="Item Name"
            placeholder="Enter item name"
            value={itemName}
            onChange={(value) => setItemName(value)}
          />
          <Input
            label="Price"
            placeholder="0.00"
            currency={true}
            value={itemPrice?.toString() || ''}
            onChange={(_, rawValue) => setItemPrice(rawValue)}
          />
        </div>
      </Dialog>
    </div>
  );
}
