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
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          Income vs expenses
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Proportion of incoming and outgoing funds
        </p>
      </div>

      {total === 0 ? (
        <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500">
            No income or expense records for this period.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Proportion labels and progress bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-2">
              <span className="text-slate-700">
                Income <strong className="font-semibold text-slate-900">{incomePct.toFixed(1)}%</strong>
              </span>
              <span className="text-slate-700">
                Expenses <strong className="font-semibold text-slate-900">{expensePct.toFixed(1)}%</strong>
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                style={{ width: `${incomePct}%` }}
                className="bg-emerald-600 transition-all duration-500"
              />
              <div
                style={{ width: `${expensePct}%` }}
                className="bg-rose-600 transition-all duration-500"
              />
            </div>
          </div>

          {/* Bottom totals */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                INCOME
              </span>
              <span className="text-base font-bold text-emerald-600">
                {formatCurrency(income, "INCOME")}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                EXPENSES
              </span>
              <span className="text-base font-bold text-rose-600">
                {formatCurrency(expenses, "EXPENSE")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
