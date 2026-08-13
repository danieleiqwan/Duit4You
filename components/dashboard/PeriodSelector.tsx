"use client";

export type PeriodOption = "THIS_MONTH" | "LAST_MONTH" | "LAST_3_MONTHS" | "THIS_YEAR" | "ALL_TIME";

interface PeriodSelectorProps {
  selectedPeriod: PeriodOption;
  onChange: (period: PeriodOption) => void;
}

export const PERIOD_LABELS: Record<PeriodOption, string> = {
  THIS_MONTH: "This Month",
  LAST_MONTH: "Last Month",
  LAST_3_MONTHS: "Last 3 Months",
  THIS_YEAR: "This Year",
  ALL_TIME: "All Time",
};

export default function PeriodSelector({ selectedPeriod, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="dashboardPeriod" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Period:
      </label>
      <select
        id="dashboardPeriod"
        value={selectedPeriod}
        onChange={(e) => onChange(e.target.value as PeriodOption)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="THIS_MONTH">This Month</option>
        <option value="LAST_MONTH">Last Month</option>
        <option value="LAST_3_MONTHS">Last 3 Months</option>
        <option value="THIS_YEAR">This Year</option>
        <option value="ALL_TIME">All Time</option>
      </select>
    </div>
  );
}
