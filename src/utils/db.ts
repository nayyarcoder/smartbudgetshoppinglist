import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  category: 'need' | 'good' | 'nice';
  purchased: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

interface BudgetSettings {
  id: string;
  monthlyBudget: number;
  updatedAt: number;
}

interface ThemeSettings {
  id: string;
  theme: 'light' | 'dark';
  updatedAt: number;
}

interface SmartBudgetDB extends DBSchema {
  items: {
    key: string;
    value: ShoppingItem;
    indexes: { 'by-category': string; 'by-purchased': number };
  };
  settings: {
    key: string;
    value: BudgetSettings | ThemeSettings;
  };
}

class DatabaseManager {
  private dbPromise: Promise<IDBPDatabase<SmartBudgetDB>> | null = null;
  private readonly DB_NAME = 'smart-budget-shopping-list';
  private readonly DB_VERSION = 1;

  async init(): Promise<IDBPDatabase<SmartBudgetDB>> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = openDB<SmartBudgetDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create items store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-category', 'category');
          itemStore.createIndex('by-purchased', 'purchased');
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });

    return this.dbPromise;
  }

  // Shopping Items CRUD operations
  async addItem(item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await this.init();
    const id = crypto.randomUUID();
    const now = Date.now();
    
    await db.add('items', {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    });
    
    return id;
  }

  async getItem(id: string): Promise<ShoppingItem | undefined> {
    const db = await this.init();
    return db.get('items', id);
  }

  async getAllItems(): Promise<ShoppingItem[]> {
    const db = await this.init();
    return db.getAll('items');
  }

  async getItemsByCategory(category: 'need' | 'good' | 'nice'): Promise<ShoppingItem[]> {
    const db = await this.init();
    return db.getAllFromIndex('items', 'by-category', category);
  }

  async updateItem(id: string, updates: Partial<ShoppingItem>): Promise<void> {
    const db = await this.init();
    const item = await db.get('items', id);
    
    if (item) {
      await db.put('items', {
        ...item,
        ...updates,
        id,
        updatedAt: Date.now(),
      });
    }
  }

  async deleteItem(id: string): Promise<void> {
    const db = await this.init();
    await db.delete('items', id);
  }

  async clearAllItems(): Promise<void> {
    const db = await this.init();
    await db.clear('items');
  }

  // Budget Settings operations
  async getBudgetSettings(): Promise<BudgetSettings | undefined> {
    const db = await this.init();
    const settings = await db.get('settings', 'budget');
    return settings as BudgetSettings | undefined;
  }

  async updateBudgetSettings(monthlyBudget: number): Promise<void> {
    const db = await this.init();
    await db.put('settings', {
      id: 'budget',
      monthlyBudget,
      updatedAt: Date.now(),
    });
  }

  // Theme Settings operations
  async getThemePreference(): Promise<'light' | 'dark' | undefined> {
    const db = await this.init();
    const settings = await db.get('settings', 'theme') as ThemeSettings | undefined;
    return settings?.theme;
  }

  async saveThemePreference(theme: 'light' | 'dark'): Promise<void> {
    const db = await this.init();
    await db.put('settings', {
      id: 'theme',
      theme,
      updatedAt: Date.now(),
    });
  }
}

// Export singleton instance
export const db = new DatabaseManager();
export type { ShoppingItem, BudgetSettings, ThemeSettings };
