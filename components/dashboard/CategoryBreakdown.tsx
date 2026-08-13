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

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          Spending by category
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Ranked expense distribution
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500">
            No expenses recorded for this period.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {categories.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  {cat.category}
                </span>
                <span className="text-slate-500">
                  <strong className="font-semibold text-slate-900">
                    {formatCurrency(cat.amount)}
                  </strong>{" "}
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  className="h-full bg-slate-800 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
