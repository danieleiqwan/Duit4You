"use client";

import { formatCurrency } from "@/lib/currency";
import { PERIOD_LABELS, PeriodOption } from "./PeriodSelector";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
  period: PeriodOption;
}

export default function SummaryCards({
  income,
  expenses,
  balance,
  period,
}: SummaryCardsProps) {
  const periodLabel = PERIOD_LABELS[period] || "Selected Period";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Income Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Income
          </span>
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/60 dark:text-green-400">
            {periodLabel}
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">
          {formatCurrency(income, "INCOME")}
        </p>
      </div>

      {/* Expenses Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Expenses
          </span>
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-400">
            {periodLabel}
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
          {formatCurrency(expenses, "EXPENSE")}
        </p>
      </div>

      {/* Net Balance Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Period Balance
          </span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            {periodLabel}
          </span>
        </div>
        <p
          className={`mt-3 text-2xl font-bold tracking-tight ${
            balance >= 0
              ? "text-gray-900 dark:text-white"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}
