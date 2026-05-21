
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchReports } from '../api'
import type { Report } from '../api'
import { getStatusPresentation, STATUS_FILTER_OPTIONS, type ReportStatusFilter } from '../utils/reportStatus'

export function ReportList() {
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('all')
  const { data, isLoading, isError, error } = useQuery<Report[]>({
    queryKey: ['reports', statusFilter],
    queryFn: () => fetchReports(statusFilter === 'all' ? undefined : statusFilter),
  })

  if (isLoading) return <div className="p-6 text-slate-600">Loading reports... ⏳</div>

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Error: {(error as Error).message} ❌
      </div>
    )
  }

  return (
    <div className="p-1">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-emerald-300 px-3 py-1 text-sm text-white">
          {data?.length ?? 0} reports
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              statusFilter === option.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {data?.map((report) => (
          <Link
            key={report.id}
            to={`/reports/${report.id}`}
            className="block rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden"
          >
            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt="Report"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  getStatusPresentation(report.status).className
                }`}
              >
                {getStatusPresentation(report.status).label}
              </span>
              <p className="font-semibold" style={{ color: '#224A32', fontSize: '21px' }}>
                {report.description ?? 'No description'}
              </p>
              <p className="font-medium text-slate-900 mt-3">
                <span className="text-slate-500">Location:</span> {report.location}
              </p>
              <p className="mt-3 text-sm italic text-slate-500">Size: {report.size ?? 'Unknown'}</p>
              <p className="mt-3 text-sm font-medium text-emerald-700">Open details</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}