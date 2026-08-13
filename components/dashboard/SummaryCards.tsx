"use client";

import { formatCurrency } from "@/lib/currency";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
}

export default function SummaryCards({
  income,
  expenses,
  balance,
}: SummaryCardsProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      {/* Top Hero Balance */}
      <div>
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          BALANCE
        </span>
        <p className="text-3xl font-extrabold tracking-tight text-slate-900">
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Subtle Separator & Sub-metrics */}
      <div className="mt-6 border-t border-slate-100 pt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            INCOME
          </span>
          <p className="text-base font-bold text-emerald-600">
            {formatCurrency(income, "INCOME")}
          </p>
        </div>

        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            EXPENSES
          </span>
          <p className="text-base font-bold text-rose-600">
            {formatCurrency(expenses, "EXPENSE")}
          </p>
        </div>
      </div>
    </div>
  );
}
