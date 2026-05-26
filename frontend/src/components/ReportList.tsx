
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchReports } from '../api'
import type { Report } from '../api'
import { getStatusPresentation, STATUS_FILTER_OPTIONS, type ReportStatusFilter } from '../utils/reportStatus'

import { VOTE_THRESHOLD } from '../constants'

function isValidFilter(value: string | null): value is ReportStatusFilter {
  return STATUS_FILTER_OPTIONS.some((opt) => opt.value === value)
}

export function ReportList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawFilter = searchParams.get('filter')
  const statusFilter: ReportStatusFilter = isValidFilter(rawFilter) ? rawFilter : 'all'

  function setStatusFilter(next: ReportStatusFilter) {
    setSearchParams(next === 'all' ? {} : { filter: next }, { replace: true })
  }
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [previewImageAlt, setPreviewImageAlt] = useState<string>('Report image')
  const { data, isLoading, isError, error } = useQuery<Report[]>({
    queryKey: ['reports', statusFilter],
    queryFn: () => fetchReports(statusFilter === 'all' ? undefined : statusFilter),
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
        <span
          className="rounded-full px-3 py-1 text-sm text-white"
          style={{ backgroundColor: 'var(--color-green-normal)' }}
        >
          {visibleReports.length} reports
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            className="rounded-full px-3 py-1 text-xs font-semibold transition"
            style={
              statusFilter === option.value
                ? { backgroundColor: 'var(--color-green-dark)', color: '#ffffff' }
                : { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-body)', border: '1px solid var(--color-border)' }
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {visibleReports.map((report) => (
          <Link
            key={report.id}
            to={`/reports/${report.id}`}
            className="block rounded-xl border shadow-sm transition hover:shadow-md overflow-hidden"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {report.imageUrl && (
              <div className="w-full bg-slate-100 dark:bg-neutral-800 p-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setPreviewImageUrl(report.imageUrl)
                    setPreviewImageAlt(report.description?.trim() || 'Report image')
                  }}
                  className="mx-auto block w-full max-w-[320px] overflow-hidden rounded-xl"
                  aria-label="Open report image preview"
                >
                  <img
                    src={report.imageUrl}
                    alt={report.description?.trim() || 'Report image'}
                    className="aspect-square w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                  />
                </button>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    getStatusPresentation(report.status).className
                  }`}
                >
                  {getStatusPresentation(report.status).label}
                </span>
                {report.status === 'cleanup_pending_vote' && report.pendingSubmissionsCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <span>{report.topPendingVoteCount}/{VOTE_THRESHOLD} cleanup votes</span>
                  </span>
                )}
                {report.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <span>{report.reportVerificationVoteCount}/{VOTE_THRESHOLD} verify votes</span>
                  </span>
                )}
              </div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '21px' }}>
                {report.description ?? 'No description'}
              </p>
              <p className="font-medium mt-3" style={{ color: 'var(--color-text-body)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Location:</span> {report.location}
              </p>
              <p className="mt-3 text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                Size: {report.size ?? 'Unknown'}
              </p>
              <p className="mt-3 text-sm font-medium" style={{ color: 'var(--color-green-dark)' }}>Open details</p>
            </div>
          </Link>
        ))}
      </div>

      {previewImageUrl && (
        <div
          className="fixed inset-0 z-[3500] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setPreviewImageUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white"
              aria-label="Close image preview"
            >
              Close
            </button>
            <img src={previewImageUrl} alt={previewImageAlt} className="max-h-[85vh] w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}