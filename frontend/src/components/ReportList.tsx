
import { useQuery } from '@tanstack/react-query'
import { fetchReports } from '../api'
<<<<<<< HEAD
import type { Report } from '../api'
=======

type Report = {
  id: number;
  location: string;
  description: string | null;
  size: string | null;
};
>>>>>>> origin/main

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
<<<<<<< HEAD
    <div className="p-1">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-emerald-300 px-3 py-1 text-sm text-white">
=======
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Reports from the Database</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
>>>>>>> origin/main
          {data?.length ?? 0} reports
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {data?.map((report) => (
<<<<<<< HEAD
          <div key={report.id} className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt="Report"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <p className="font-semibold" style={{ color: '#224A32', fontSize: '21px' }}>
                {report.description ?? 'No description'}
              </p>
              <p className="font-medium text-slate-900 mt-3">
                <span className="text-slate-500">Location:</span> {report.location}
              </p>
              <p className="mt-3 text-sm italic text-slate-500">Size: {report.size ?? 'Unknown'}</p>
            </div>
=======
          <div key={report.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:shadow-md">
            <p className="font-medium text-slate-900">
              <span className="text-slate-500">Location:</span> {report.location}
            </p>
            <p className="mt-2 text-slate-700">
              <span className="font-medium text-slate-500">Description:</span> {report.description ?? 'No description'}
            </p>
            <p className="mt-3 text-sm italic text-slate-500">Size: {report.size ?? 'Unknown'}</p>
>>>>>>> origin/main
          </div>
        ))}
      </div>
    </div>
  )
}