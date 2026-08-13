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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-3.5">DATE</th>
              <th scope="col" className="px-5 py-3.5">DESCRIPTION</th>
              <th scope="col" className="px-5 py-3.5">CATEGORY</th>
              <th scope="col" className="px-5 py-3.5">TYPE</th>
              <th scope="col" className="px-5 py-3.5 text-right">AMOUNT</th>
              <th scope="col" className="px-5 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="transition-colors hover:bg-slate-50/60"
              >
                {/* DATE */}
                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-500">
                  {formatTransactionDate(transaction.transactionDate)}
                </td>

                {/* DESCRIPTION */}
                <td className="px-5 py-4 font-bold text-slate-900">
                  {transaction.description || transaction.category}
                </td>

                {/* CATEGORY */}
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                  {transaction.category}
                </td>

                {/* TYPE */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-slate-100/80 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    <span className="text-slate-500">
                      {transaction.type === "INCOME" ? "↖" : "↙"}
                    </span>
                    <span>{transaction.type === "INCOME" ? "Income" : "Expense"}</span>
                  </span>
                </td>

                {/* AMOUNT */}
                <td
                  className={`whitespace-nowrap px-5 py-4 text-right font-bold ${
                    transaction.type === "INCOME"
                      ? "text-emerald-600"
                      : "text-slate-900"
                  }`}
                >
                  {formatCurrency(transaction.amount, transaction.type)}
                </td>

                {/* ACTIONS */}
                <td className="whitespace-nowrap px-5 py-4 text-right space-x-3">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(transaction)}
                    className="font-semibold text-rose-700 hover:text-rose-900 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
