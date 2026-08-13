"use client";

export type PeriodOption = "THIS_MONTH" | "LAST_MONTH" | "LAST_3_MONTHS" | "THIS_YEAR" | "ALL_TIME";

interface PeriodSelectorProps {
  selectedPeriod: PeriodOption;
  onChange: (period: PeriodOption) => void;
}

export const PERIOD_LABELS: Record<PeriodOption, string> = {
  THIS_MONTH: "This month",
  LAST_MONTH: "Last month",
  LAST_3_MONTHS: "Last 3 months",
  THIS_YEAR: "This year",
  ALL_TIME: "All time",
};

export default function PeriodSelector({ selectedPeriod, onChange }: PeriodSelectorProps) {
  return (
    <select
      id="dashboardPeriod"
      aria-label="Select period"
      value={selectedPeriod}
      onChange={(e) => onChange(e.target.value as PeriodOption)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
    >
      <option value="THIS_MONTH">This month</option>
      <option value="LAST_MONTH">Last month</option>
      <option value="LAST_3_MONTHS">Last 3 months</option>
      <option value="THIS_YEAR">This year</option>
      <option value="ALL_TIME">All time</option>
    </select>
  );
}
