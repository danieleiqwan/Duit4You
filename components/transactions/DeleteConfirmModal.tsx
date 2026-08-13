"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { formatTransactionDate } from "@/lib/date";
import { TransactionData } from "./TransactionFormModal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: TransactionData | null;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete transaction.");
        setIsDeleting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Delete Transaction
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>

        {/* Transaction Summary Card */}
        <div className="mt-4 rounded-lg bg-gray-50 p-3 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-900 dark:text-white">
            <span>{transaction.description || transaction.category}</span>
            <span
              className={
                transaction.type === "INCOME"
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-900 dark:text-white"
              }
            >
              {formatCurrency(transaction.amount, transaction.type)}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{transaction.category}</span>
            <span>{formatTransactionDate(transaction.transactionDate)}</span>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-2.5 border border-red-200 dark:bg-red-950/50 dark:border-red-900">
            <p className="text-xs font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
