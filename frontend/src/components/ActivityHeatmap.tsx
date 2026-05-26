import type { ActivityHeatmapData } from '../api'

interface ActivityHeatmapProps {
  activity: ActivityHeatmapData
  currentStreak: number
}

const LEVEL_CLASS: Record<0 | 1 | 2 | 3, string> = {
  0: 'activity-heatmap__cell--0',
  1: 'activity-heatmap__cell--1',
  2: 'activity-heatmap__cell--2',
  3: 'activity-heatmap__cell--3',
}

const ActivityHeatmap = ({ activity, currentStreak }: ActivityHeatmapProps) => {
  const { weeks, grid } = activity

  return (
    <div className="mx-4 mt-6">
      <div className="card activity-heatmap">
        <div className="activity-heatmap__header">
          <h3 className="mb-0!">Activity</h3>
          {currentStreak > 0 && (
            <span className="text-body-sm font-semibold shrink-0" style={{ color: 'var(--color-green-normal)' }}>
              🔥 {currentStreak} day{currentStreak === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <div className="activity-heatmap__grid-wrap">
          <div
            className="activity-heatmap__grid"
            style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
            role="img"
            aria-label="Activity heatmap for the last nine weeks"
          >
            {Array.from({ length: weeks }, (_, col) =>
              Array.from({ length: 7 }, (_, row) => {
                const level = (grid[row]?.[col] ?? 0) as 0 | 1 | 2 | 3
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`activity-heatmap__cell ${LEVEL_CLASS[level]}`}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityHeatmap
