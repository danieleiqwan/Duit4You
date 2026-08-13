"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PeriodSelector, { PeriodOption } from "@/components/dashboard/PeriodSelector";
import SummaryCards from "@/components/dashboard/SummaryCards";
import IncomeVsExpenseChart from "@/components/dashboard/IncomeVsExpenseChart";
import CategoryBreakdown, { CategoryData } from "@/components/dashboard/CategoryBreakdown";
import MonthlyTrendChart, { MonthlyTrendData } from "@/components/dashboard/MonthlyTrendChart";
import RecentTransactionsWidget, { RecentTransactionData } from "@/components/dashboard/RecentTransactionsWidget";

interface DashboardData {
  hasAnyTransactions: boolean;
  period: PeriodOption;
  summary: {
    income: number;
    expenses: number;
    balance: number;
  };
  categoryBreakdown: CategoryData[];
  monthlyTrend: MonthlyTrendData[];
  recentTransactions: RecentTransactionData[];
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodOption>("THIS_MONTH");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?period=${period}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Unable to load your financial data.");
        return;
      }

      setData(json);
      setError(null);
    } catch {
      setError("Unable to load your financial data.");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const res = await fetch(`/api/dashboard?period=${period}`);
        const json = await res.json();

        if (ignore) return;

        if (!res.ok) {
          setError(json.error || "Unable to load your financial data.");
          return;
        }

        setData(json);
        setError(null);
      } catch {
        if (!ignore) {
          setError("Unable to load your financial data.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [period]);

  const handlePeriodChange = (newPeriod: PeriodOption) => {
    setIsLoading(true);
    setPeriod(newPeriod);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header & Period Selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Financial Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Track and analyze your income, expenses, and financial trends.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <PeriodSelector selectedPeriod={period} onChange={handlePeriodChange} />
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
              >
                + Add Transaction
              </Link>
            </div>
          </div>

          {/* Main Content States */}
          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Loading financial overview...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-xs dark:border-red-900 dark:bg-red-950/40">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                {error}
              </p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  fetchDashboardData();
                }}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
              >
                Try Again
              </button>
            </div>
          ) : !data?.hasAnyTransactions ? (
            /* True Lifetime Empty State */
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No transactions yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add your first transaction to start tracking your finances.
              </p>
              <div className="mt-6">
                <Link
                  href="/transactions"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
                >
                  + Add Transaction
                </Link>
              </div>
            </div>
          ) : (
            /* Dashboard Data Display */
            <div className="space-y-6">
              {/* Summary Cards */}
              <SummaryCards
                income={data.summary.income}
                expenses={data.summary.expenses}
                balance={data.summary.balance}
                period={period}
              />

              {/* Analytics Grid: Income vs Expense & Category Breakdown */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <IncomeVsExpenseChart
                  income={data.summary.income}
                  expenses={data.summary.expenses}
                />
                <CategoryBreakdown categories={data.categoryBreakdown} />
              </div>

              {/* Monthly Spending Trend */}
              <MonthlyTrendChart trend={data.monthlyTrend} />

              {/* Recent Transactions Widget */}
              <RecentTransactionsWidget transactions={data.recentTransactions} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
