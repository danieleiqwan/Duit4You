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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          Monthly spending trend
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Expense history over time
        </p>
      </div>

      {trend.length === 0 ? (
        <div className="mt-6 flex h-44 items-center justify-center rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500">
            No expense history available for this period.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="relative flex h-48 items-end justify-around gap-4 border-b border-slate-200 pb-2">
            {/* Subtle background grid lines */}
            <div className="absolute inset-x-0 top-0 border-b border-slate-100" />
            <div className="absolute inset-x-0 top-1/3 border-b border-slate-100" />
            <div className="absolute inset-x-0 top-2/3 border-b border-slate-100" />

            {trend.map((item) => {
              const heightPct = maxExpense > 0 ? (item.expenses / maxExpense) * 100 : 0;
              return (
                <div
                  key={item.month}
                  className="group relative z-10 flex flex-1 flex-col items-center justify-end h-full max-w-[56px]"
                >
                  {/* Hover tooltip */}
                  <div className="absolute -top-9 hidden rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow-md group-hover:block whitespace-nowrap">
                    {formatCurrency(item.expenses)}
                  </div>

                  {/* Column Bar */}
                  <div
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    className="w-full rounded-t-sm bg-[#2B5488] transition-all duration-300 hover:bg-slate-900"
                  />

                  {/* Label */}
                  <span className="mt-3 text-[11px] font-medium text-slate-500">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
