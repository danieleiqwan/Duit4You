"use client";

import { ALL_CATEGORIES } from "@/lib/categories";

export interface FilterState {
  search: string;
  type: string;
  category: string;
  dateFilter: string;
  startDate: string;
  endDate: string;
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onClearFilters?: () => void;
}

export default function TransactionFilters({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search transactions..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {/* Type Dropdown */}
      <select
        value={filters.type}
        onChange={(e) => onFilterChange({ type: e.target.value })}
        aria-label="Filter by type"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        <option value="ALL">All types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      {/* Category Dropdown */}
      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ category: e.target.value })}
        aria-label="Filter by category"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        <option value="ALL">All categories</option>
        {ALL_CATEGORIES.map((cat: string) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Date Filter Dropdown */}
      <select
        value={filters.dateFilter}
        onChange={(e) => onFilterChange({ dateFilter: e.target.value })}
        aria-label="Filter by date"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        <option value="ALL">All time</option>
        <option value="THIS_MONTH">This month</option>
        <option value="LAST_MONTH">Last month</option>
        <option value="CUSTOM">Custom date range</option>
      </select>

      {/* Custom Date Inputs if CUSTOM selected */}
      {filters.dateFilter === "CUSTOM" && (
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
