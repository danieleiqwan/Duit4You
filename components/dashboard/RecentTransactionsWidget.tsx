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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Recent transactions
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Latest activity for the selected period
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          View all transactions →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500">
            No recent transactions found for this period.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3.5">
              <div className="flex items-center space-x-3.5">
                {/* Circular Arrow Badge */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs">
                  {t.type === "INCOME" ? "↖" : "↙"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {t.description || t.category}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t.category} · {formatTransactionDate(t.transactionDate)}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-bold ${
                  t.type === "INCOME"
                    ? "text-emerald-600"
                    : "text-slate-900"
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
