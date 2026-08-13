"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatTransactionDate } from "@/lib/date";

export interface RecentTransactionData {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description: string | null;
  transactionDate: string;
}

interface RecentTransactionsWidgetProps {
  transactions: RecentTransactionData[];
}

export default function RecentTransactionsWidget({ transactions }: RecentTransactionsWidgetProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Latest transaction activity for the selected period
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          View All Transactions →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 flex h-32 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No recent transactions found for this period.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-gray-100 dark:divide-gray-800">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                    t.type === "INCOME"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                  }`}
                >
                  {t.type === "INCOME" ? "↑" : "↓"}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t.description || t.category}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{t.category}</span>
                    <span>•</span>
                    <span>{formatTransactionDate(t.transactionDate)}</span>
                  </div>
                </div>
              </div>
              <span
                className={`text-sm font-bold ${
                  t.type === "INCOME"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(t.amount, t.type)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
