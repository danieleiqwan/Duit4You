"use client";

import { formatCurrency } from "@/lib/currency";

export interface MonthlyTrendData {
  month: string;
  expenses: number;
}

interface MonthlyTrendChartProps {
  trend: MonthlyTrendData[];
}

export default function MonthlyTrendChart({ trend }: MonthlyTrendChartProps) {
  const maxExpense = trend.reduce((max, item) => Math.max(max, item.expenses), 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        Monthly Spending Trend
      </h3>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        Chronological expense history over time
      </p>

      {trend.length === 0 ? (
        <div className="mt-6 flex h-40 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No expense trend data available for this period.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex h-44 items-end justify-between gap-2 border-b border-gray-200 pb-2 dark:border-gray-800 sm:gap-4">
            {trend.map((item) => {
              const heightPct = maxExpense > 0 ? (item.expenses / maxExpense) * 100 : 0;
              return (
                <div
                  key={item.month}
                  className="flex flex-1 flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 hidden rounded-md bg-gray-900 px-2 py-1 text-xs font-semibold text-white shadow-md group-hover:block dark:bg-gray-700 whitespace-nowrap z-10">
                    {formatCurrency(item.expenses)}
                  </div>

                  {/* Column bar */}
                  <div
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    className="w-full max-w-[48px] rounded-t-md bg-blue-600 transition-all duration-500 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                  />

                  {/* Month Label */}
                  <span className="mt-2 text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate max-w-full">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Historical Expense Activity</span>
            <span>Peak: {formatCurrency(maxExpense)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
