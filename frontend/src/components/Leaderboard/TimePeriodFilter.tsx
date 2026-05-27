import { type TimePeriod } from "../../hooks/useLeaderboard";

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function TimePeriodFilter({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodFilterProps) {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: "allTime", label: "All-Time" },
    { value: "monthly", label: "This Month" },
    { value: "weekly", label: "This Week" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
      <span
        className="text-xs font-medium"
        style={{ color: "var(--color-text-muted)" }}
      >
        Filter by period:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            type="button"
            onClick={() => onPeriodChange(period.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
              selectedPeriod === period.value
                ? "bg-(--color-green-darker) text-white"
                : "bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-600"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
