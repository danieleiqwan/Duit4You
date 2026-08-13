"use client";

import { formatCurrency } from "@/lib/currency";

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  categories: CategoryData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-amber-500",
  Transport: "bg-blue-500",
  Bills: "bg-purple-500",
  Shopping: "bg-pink-500",
  Entertainment: "bg-emerald-500",
  Healthcare: "bg-red-500",
  Education: "bg-indigo-500",
  Others: "bg-gray-500",
};

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        Spending by Category
      </h3>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        Expense distribution across categories
      </p>

      {categories.length === 0 ? (
        <div className="mt-6 flex h-32 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No expenses recorded for this period.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {categories.map((cat) => {
            const colorClass = CATEGORY_COLORS[cat.category] || "bg-blue-600";
            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    {cat.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    <strong className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(cat.amount)}
                    </strong>{" "}
                    ({cat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
