"use client";

import { formatCurrency } from "@/lib/currency";

interface IncomeVsExpenseChartProps {
  income: number;
  expenses: number;
}

export default function IncomeVsExpenseChart({
  income,
  expenses,
}: IncomeVsExpenseChartProps) {
  const total = income + expenses;
  const incomePct = total > 0 ? (income / total) * 100 : 0;
  const expensePct = total > 0 ? (expenses / total) * 100 : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        Income vs Expense
      </h3>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        Comparative overview of incoming vs outgoing funds
      </p>

      {total === 0 ? (
        <div className="mt-6 flex h-32 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No income or expense records for this period.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {/* Visual Stacked Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-green-600 dark:text-green-400">
                Income ({incomePct.toFixed(1)}%)
              </span>
              <span className="text-red-600 dark:text-red-400">
                Expense ({expensePct.toFixed(1)}%)
              </span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                style={{ width: `${incomePct}%` }}
                className="bg-green-500 transition-all duration-500"
                title={`Income: ${formatCurrency(income, "INCOME")}`}
              />
              <div
                style={{ width: `${expensePct}%` }}
                className="bg-red-500 transition-all duration-500"
                title={`Expense: ${formatCurrency(expenses, "EXPENSE")}`}
              />
            </div>
          </div>

          {/* Numerical Breakdown */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="rounded-lg bg-green-50/50 p-3 border border-green-100 dark:bg-green-950/30 dark:border-green-900/40">
              <span className="block text-xs font-medium text-green-700 dark:text-green-400">
                Total Income
              </span>
              <span className="mt-1 block text-lg font-bold text-green-700 dark:text-green-300">
                {formatCurrency(income, "INCOME")}
              </span>
            </div>
            <div className="rounded-lg bg-red-50/50 p-3 border border-red-100 dark:bg-red-950/30 dark:border-red-900/40">
              <span className="block text-xs font-medium text-red-700 dark:text-red-400">
                Total Expense
              </span>
              <span className="mt-1 block text-lg font-bold text-red-700 dark:text-red-300">
                {formatCurrency(expenses, "EXPENSE")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
