"use client";

import { formatCurrency } from "@/lib/currency";
import { formatTransactionDate } from "@/lib/date";
import { TransactionData } from "./TransactionFormModal";

interface TransactionListProps {
  transactions: TransactionData[];
  onEdit: (transaction: TransactionData) => void;
  onDelete: (transaction: TransactionData) => void;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900 md:block">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Date
              </th>
              <th scope="col" className="px-6 py-3.5">
                Description
              </th>
              <th scope="col" className="px-6 py-3.5">
                Category
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Amount
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-gray-50/80 transition-colors dark:hover:bg-gray-800/50"
              >
                <td className="whitespace-nowrap px-6 py-4 text-gray-900 dark:text-gray-200 font-medium">
                  {formatTransactionDate(t.transactionDate)}
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                  {t.description || <span className="text-gray-400 font-normal">{t.category}</span>}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {t.category}
                  </span>
                </td>
                <td
                  className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${
                    t.type === "INCOME"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(t.amount, t.type)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onEdit(t)}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    className="font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="space-y-3 md:hidden">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTransactionDate(t.transactionDate)}
                </span>
                <h4 className="font-semibold text-gray-900 dark:text-white mt-0.5">
                  {t.description || t.category}
                </h4>
              </div>
              <span
                className={`text-base font-bold ${
                  t.type === "INCOME"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(t.amount, t.type)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                {t.category}
              </span>
              <div className="space-x-3 text-sm">
                <button
                  onClick={() => onEdit(t)}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(t)}
                  className="font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
