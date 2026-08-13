export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Others",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Allowance",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type Category = ExpenseCategory | IncomeCategory;

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;

export function isValidCategory(category: string, type?: "INCOME" | "EXPENSE"): boolean {
  if (type === "EXPENSE") {
    return (EXPENSE_CATEGORIES as readonly string[]).includes(category);
  }
  if (type === "INCOME") {
    return (INCOME_CATEGORIES as readonly string[]).includes(category);
  }
  return (ALL_CATEGORIES as readonly string[]).includes(category);
}
