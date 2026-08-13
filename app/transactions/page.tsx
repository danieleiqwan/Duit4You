"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import TransactionFormModal, { TransactionData } from "@/components/transactions/TransactionFormModal";
import TransactionFilters, { FilterState } from "@/components/transactions/TransactionFilters";
import TransactionList from "@/components/transactions/TransactionList";
import DeleteConfirmModal from "@/components/transactions/DeleteConfirmModal";

export default function TransactionsPage() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Transactions
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your income and expenses securely.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Transaction
            </button>
          </div>

          {/* Filters */}
          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Main Content Area: Loading / Error / Empty / List */}
          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Loading transactions...
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
                  fetchTransactions();
                }}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
              >
                Try Again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            totalCount === 0 ? (
              /* CASE A: USER HAS ZERO TRANSACTIONS IN TOTAL */
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  No transactions yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add your first transaction to start tracking your finances.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
                  >
                    + Add Transaction
                  </button>
                </div>
              </div>
            ) : (
              /* CASE B: USER HAS TRANSACTIONS BUT CURRENT FILTERS RETURN ZERO RESULTS */
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  No transactions found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No transactions match your selected filters.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
