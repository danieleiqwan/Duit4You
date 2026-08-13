"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import TransactionFormModal, { TransactionData } from "@/components/transactions/TransactionFormModal";
import TransactionFilters, { FilterState } from "@/components/transactions/TransactionFilters";
import TransactionList from "@/components/transactions/TransactionList";
import DeleteConfirmModal from "@/components/transactions/DeleteConfirmModal";

export default function TransactionsPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "user";
  const userEmail = session?.user?.email || "";

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "ALL",
    category: "ALL",
    dateFilter: "ALL",
    startDate: "",
    endDate: "",
  });

  // Modal Controls
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionData | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.type !== "ALL") params.append("type", filters.type);
      if (filters.category !== "ALL") params.append("category", filters.category);
      if (filters.dateFilter !== "ALL") params.append("dateFilter", filters.dateFilter);
      if (filters.dateFilter === "CUSTOM") {
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
      }

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to load your transactions. Please try again.");
        return;
      }

      setTransactions(data.transactions || []);
      setTotalCount(typeof data.totalCount === "number" ? data.totalCount : (data.transactions?.length || 0));
      setError(null);
    } catch {
      setError("Unable to load your transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.type !== "ALL") params.append("type", filters.type);
        if (filters.category !== "ALL") params.append("category", filters.category);
        if (filters.dateFilter !== "ALL") params.append("dateFilter", filters.dateFilter);
        if (filters.dateFilter === "CUSTOM") {
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);
        }

        const res = await fetch(`/api/transactions?${params.toString()}`);
        const data = await res.json();

        if (ignore) return;

        if (!res.ok) {
          setError(data.error || "Unable to load your transactions. Please try again.");
          return;
        }

        setTransactions(data.transactions || []);
        setTotalCount(typeof data.totalCount === "number" ? data.totalCount : (data.transactions?.length || 0));
        setError(null);
      } catch {
        if (!ignore) {
          setError("Unable to load your transactions. Please try again.");
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
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setIsLoading(true);
    setFilters({
      search: "",
      type: "ALL",
      category: "ALL",
      dateFilter: "ALL",
      startDate: "",
      endDate: "",
    });
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (transaction: TransactionData) => {
    setEditingTransaction(transaction);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (transaction: TransactionData) => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar userName={userName} userEmail={userEmail} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Transactions
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Track and manage your financial activity.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center rounded-lg bg-[#181E29] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              Add transaction
            </button>
          </div>

          {/* Filters Toolbar */}
          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Table / Loading / Error / Empty */}
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-slate-900 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-3 text-xs font-medium text-slate-500">
                Loading transactions...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-xs">
              <p className="text-xs font-medium text-red-700">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  fetchTransactions();
                }}
                className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-500"
              >
                Try Again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            totalCount === 0 ? (
              /* Case A: True Empty State */
              <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
                <h3 className="text-base font-bold text-slate-900">
                  No transactions yet
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Add your first transaction to start tracking your finances.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center rounded-lg bg-[#181E29] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
                  >
                    + Add Transaction
                  </button>
                </div>
              </div>
            ) : (
              /* Case B: Filtered Empty State */
              <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
                <h3 className="text-base font-bold text-slate-900">
                  No transactions found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  No transactions match your selected filters.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )
          ) : (
            <TransactionList
              transactions={transactions}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          )}
        </div>
      </main>

      {/* Form Modal */}
      <TransactionFormModal
        key={editingTransaction ? `edit-${editingTransaction.id}` : isFormModalOpen ? "add-open" : "closed"}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchTransactions}
        transactionToEdit={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchTransactions}
        transaction={deletingTransaction}
      />
    </div>
  );
}
