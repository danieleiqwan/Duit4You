"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import PeriodSelector, { PeriodOption } from "@/components/dashboard/PeriodSelector";
import SummaryCards from "@/components/dashboard/SummaryCards";
import IncomeVsExpenseChart from "@/components/dashboard/IncomeVsExpenseChart";
import CategoryBreakdown, { CategoryData } from "@/components/dashboard/CategoryBreakdown";
import MonthlyTrendChart, { MonthlyTrendData } from "@/components/dashboard/MonthlyTrendChart";
import RecentTransactionsWidget, { RecentTransactionData } from "@/components/dashboard/RecentTransactionsWidget";
import Link from "next/link";

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
  const { data: session } = useSession();
  const [period, setPeriod] = useState<PeriodOption>("THIS_MONTH");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "user";
  const userEmail = session?.user?.email || "";

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?period=${period}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Unable to load your financial data.");
        return;
      }

      setDashboardData(json);
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

        setDashboardData(json);
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

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Shell */}
      <Sidebar userName={userName} userEmail={userEmail} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {greeting}, {userName}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Here&apos;s your financial activity for this period.
              </p>
            </div>
            <div>
              <PeriodSelector selectedPeriod={period} onChange={handlePeriodChange} />
            </div>
          </div>

          {/* Loading / Error / Content */}
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-slate-900 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-3 text-xs font-medium text-slate-500">
                Loading financial overview...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-xs">
              <p className="text-xs font-medium text-red-700">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  fetchDashboardData();
                }}
                className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-500"
              >
                Try Again
              </button>
            </div>
          ) : !dashboardData?.hasAnyTransactions ? (
            /* True Empty State */
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
              <h3 className="text-base font-bold text-slate-900">
                No transactions yet
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Add your first transaction to start tracking your finances.
              </p>
              <div className="mt-6">
                <Link
                  href="/transactions"
                  className="inline-flex items-center rounded-lg bg-[#181E29] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
                >
                  + Add Transaction
                </Link>
              </div>
            </div>
          ) : (
            /* Dashboard Data Display */
            <div className="space-y-6">
              {/* Summary Hero Card */}
              <SummaryCards
                income={dashboardData.summary.income}
                expenses={dashboardData.summary.expenses}
                balance={dashboardData.summary.balance}
              />

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <IncomeVsExpenseChart
                  income={dashboardData.summary.income}
                  expenses={dashboardData.summary.expenses}
                />
                <CategoryBreakdown categories={dashboardData.categoryBreakdown} />
              </div>

              {/* Monthly Spending Trend */}
              <MonthlyTrendChart trend={dashboardData.monthlyTrend} />

              {/* Recent Transactions */}
              <RecentTransactionsWidget transactions={dashboardData.recentTransactions} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
