
import { useQuery } from '@tanstack/react-query'
import { fetchReports } from '../api'
import type { Report } from '../api'

export function ReportList() {
  const { data, isLoading, isError, error } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: fetchReports,
  })

  if (isLoading) return <div className="p-6" style={{ color: 'var(--color-text-muted)' }}>Loading reports... ⏳</div>

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Error: {(error as Error).message} ❌
      </div>
    )
  }
  const visibleReports = (data ?? []).filter((report) => report.status != 'rejected')
  return (
    <div className="p-1">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-emerald-300 px-3 py-1 text-sm text-white">
          {visibleReports.length} reports
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {visibleReports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border shadow-sm transition hover:shadow-md overflow-hidden"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt="Report"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '21px' }}>
                {report.description ?? 'No description'}
              </p>
              <p className="font-medium mt-3" style={{ color: 'var(--color-text-body)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Location:</span> {report.location}
              </p>
              <p className="mt-3 text-sm italic" style={{ color: 'var(--color-text-muted)' }}>Size: {report.size ?? 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}