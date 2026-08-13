"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { formatDateForInput } from "@/lib/date";
import { validateTransactionInput } from "@/lib/validations/transaction";

export interface TransactionData {
  id?: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description: string | null;
  transactionDate: string;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: TransactionData | null;
}

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}: TransactionFormModalProps) {
  const isEditing = !!transactionToEdit;
  const todayStr = formatDateForInput(new Date());

  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    transactionToEdit?.type || "EXPENSE"
  );
  const [amount, setAmount] = useState(
    transactionToEdit ? String(transactionToEdit.amount) : ""
  );
  const [category, setCategory] = useState<string>(
    transactionToEdit?.category || (transactionToEdit?.type === "INCOME" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  );
  const [description, setDescription] = useState(
    transactionToEdit?.description || ""
  );
  const [transactionDate, setTransactionDate] = useState(
    transactionToEdit
      ? formatDateForInput(transactionToEdit.transactionDate)
      : todayStr
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (newType: "INCOME" | "EXPENSE") => {
    setType(newType);
    const defaultCat = newType === "EXPENSE" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    setCategory(defaultCat);
    setErrors((prev) => ({ ...prev, category: "", type: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = validateTransactionInput({
      type,
      amount,
      category,
      description,
      transactionDate,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/transactions/${transactionToEdit.id}`
        : "/api/transactions";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount,
          category,
          description: description.trim() || null,
          transactionDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setServerError(data.error || "Failed to save transaction.");
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categoryOptions = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {serverError && (
          <div className="mt-4 rounded-md bg-red-50 p-3 border border-red-200 dark:bg-red-950/50 dark:border-red-900">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {serverError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("EXPENSE")}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                  type === "EXPENSE"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("INCOME")}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                  type === "INCOME"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                Income
              </button>
            </div>
            {errors.type && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.type}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (RM)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              id="description"
              type="text"
              placeholder="e.g. Lunch at McDonald's"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Transaction Date */}
          <div>
            <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input
              id="transactionDate"
              type="date"
              required
              max={todayStr}
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {errors.transactionDate && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.transactionDate}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
