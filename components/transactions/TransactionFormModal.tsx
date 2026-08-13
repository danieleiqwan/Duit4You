"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { formatDateForInput } from "@/lib/date";

export interface TransactionData {
  id?: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description?: string | null;
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
  const isEditing = Boolean(transactionToEdit);

  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    transactionToEdit?.type || "EXPENSE"
  );
  const [amount, setAmount] = useState<string>(
    transactionToEdit ? String(transactionToEdit.amount) : ""
  );
  const [category, setCategory] = useState<string>(
    transactionToEdit?.category || "Food"
  );
  const [description, setDescription] = useState<string>(
    transactionToEdit?.description || ""
  );

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const [transactionDate, setTransactionDate] = useState<string>(
    transactionToEdit
      ? formatDateForInput(transactionToEdit.transactionDate)
      : todayStr
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTypeChange = (newType: "INCOME" | "EXPENSE") => {
    setType(newType);
    const validCats: readonly string[] = newType === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (validCats.length > 0 && !validCats.includes(category)) {
      setCategory(validCats[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        type,
        amount,
        category,
        description: description || undefined,
        transactionDate,
      };

      const url = isEditing
        ? `/api/transactions/${transactionToEdit!.id}`
        : "/api/transactions";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstErr = Object.values(data.errors)[0] as string;
          setError(firstErr || "Failed to save transaction.");
        } else {
          setError(data.error || "Failed to save transaction.");
        }
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const availableCategories: readonly string[] =
    type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? "Edit transaction" : "Add transaction"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isEditing ? "Update your transaction details." : "Record a new income or expense."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200/60">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented Control for Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              TYPE
            </label>
            <div className="flex rounded-xl bg-slate-100/70 p-1">
              <button
                type="button"
                onClick={() => handleTypeChange("EXPENSE")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  type === "EXPENSE"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("INCOME")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  type === "INCOME"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount Field with Prefix */}
          <div>
            <label
              htmlFor="amount"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              AMOUNT
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-semibold text-slate-400">
                RM
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="block w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Category Field */}
          <div>
            <label
              htmlFor="category"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              CATEGORY
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {availableCategories.map((c: string) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              DESCRIPTION (optional)
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Lunch at the cafe"
              className="block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Date Field */}
          <div>
            <label
              htmlFor="transactionDate"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              DATE
            </label>
            <input
              id="transactionDate"
              type="date"
              required
              max={todayStr}
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#181E29] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
