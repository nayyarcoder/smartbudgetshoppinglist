import type { ShoppingItem } from './db';

export interface BudgetRecommendation {
  affordableItems: ShoppingItem[];
  unaffordableItems: ShoppingItem[];
  suggestedTotal: number;
}

/**
 * Calculates which items fit within the remaining budget
 * Logic: Always includes all "Need to Have" items if possible, 
 * then "Good to Have", then "Nice to Have", in price order
 */
export function calculateBudgetRecommendations(
  items: ShoppingItem[],
  remainingBudget: number
): BudgetRecommendation {
  // Filter out already purchased items
  const unpurchasedItems = items.filter(item => !item.purchased);
  
  // Sort items by priority (need > good > nice) and then by price
  const priorityOrder = { need: 1, good: 2, nice: 3 };
  const sortedItems = [...unpurchasedItems].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.category] - priorityOrder[b.category];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by price (lowest first)
    return a.price - b.price;
  });
  
  const affordableItems: ShoppingItem[] = [];
  const unaffordableItems: ShoppingItem[] = [];
  let currentTotal = 0;
  
  // Greedily add items while they fit in the budget
  for (const item of sortedItems) {
    if (currentTotal + item.price <= remainingBudget) {
      affordableItems.push(item);
      currentTotal += item.price;
    } else {
      unaffordableItems.push(item);
    }
  }
  
  return {
    affordableItems,
    unaffordableItems,
    suggestedTotal: currentTotal
  };
}

/**
 * Check if a specific item is affordable based on recommendations
 */
export function isItemAffordable(
  item: ShoppingItem,
  recommendation: BudgetRecommendation
): boolean {
  return recommendation.affordableItems.some(i => i.id === item.id);
}
