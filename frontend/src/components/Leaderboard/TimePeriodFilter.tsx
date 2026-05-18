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
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="text-body-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        Filter by period:
      </span>
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={selectedPeriod === period.value ? 'btn-primary' : 'btn-secondary'}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}