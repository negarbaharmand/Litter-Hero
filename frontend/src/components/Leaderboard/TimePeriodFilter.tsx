import { type TimePeriod } from '../../hooks/useLeaderboard';

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function TimePeriodFilter({ selectedPeriod, onPeriodChange }: TimePeriodFilterProps) {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'allTime', label: 'All-Time' },
    { value: 'monthly', label: 'This Month' },
    { value: 'weekly', label: 'This Week' },
  ];

  return (
    <div className="time-period-filter flex gap-3 mb-6 flex-wrap">
      {periods.map((period) => (
        <button
          key={period.value}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedPeriod === period.value
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}