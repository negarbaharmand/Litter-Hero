import { useQuery } from '@tanstack/react-query'
import { fetchReports, type Report } from '../api'

export function ReportList() {
  const { data, isLoading, isError, error } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: fetchReports,
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
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Reports from the Database</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-green-500">
          {data?.length ?? 0} reports
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {data?.map((report) => (
          <div key={report.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:shadow-md">
            <p className="font-medium text-slate-900">
              <span className="text-slate-500">Location:</span> {report.location}
            </p>
            <p className="mt-2 text-slate-700">
              <span className="font-medium text-slate-500">Description:</span> {report.description ?? 'No description'}
            </p>
            <p className="mt-3 text-sm italic text-slate-500">Size: {report.size ?? 'Unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
