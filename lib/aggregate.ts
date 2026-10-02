import { CATEGORIES, type Category } from "./categories";
import type { CategoryBreakdown } from "./types";

export interface MinimalExpense {
  category: Category;
  amount: number;
}

/**
 * Groups expenses by category and sums the amounts. Shared by the dashboard
 * chart and the check-in prompt builder so the "group by category" logic
 * only lives in one place.
 */
export function aggregateByCategory(
  expenses: MinimalExpense[]
): CategoryBreakdown[] {
  const totals = new Map<Category, number>();
  for (const category of CATEGORIES) {
    totals.set(category, 0);
  }
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }
  return CATEGORIES.map((category) => ({
    category,
    total: Math.round((totals.get(category) ?? 0) * 100) / 100,
  })).filter((entry) => entry.total > 0);
}

export function sumAmounts(expenses: MinimalExpense[]): number {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return Math.round(total * 100) / 100;
}
