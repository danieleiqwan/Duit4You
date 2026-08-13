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
  onClearFilters: () => void;
}

export default function TransactionFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "ALL" ||
    filters.category !== "ALL" ||
    filters.dateFilter !== "ALL" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label htmlFor="filterSearch" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Search Description
          </label>
          <input
            id="filterSearch"
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="filterType" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Type
          </label>
          <select
            id="filterType"
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="filterCategory" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Category
          </label>
          <select
            id="filterCategory"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label htmlFor="filterDate" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Date Range
          </label>
          <select
            id="filterDate"
            value={filters.dateFilter}
            onChange={(e) => onFilterChange({ dateFilter: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {filters.dateFilter === "CUSTOM" && (
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-3 sm:grid-cols-2 dark:border-gray-800">
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              From Date
            </label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              To Date
            </label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
