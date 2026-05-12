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
    <div className="time-period-filter mb-6 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-[#1d4e2f]">Filter by period:</span>
      {periods.map((period) => (
        <button
          key={period.value}
          className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
            selectedPeriod === period.value
              ? 'bg-[#25653c] hover:bg-[#25653c] active:bg-[#25653c]'
              : 'bg-[#3ea865] hover:bg-[#328650] active:bg-[#25653c]'
          }`}
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}