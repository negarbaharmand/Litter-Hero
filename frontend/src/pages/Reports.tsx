<<<<<<< HEAD
import { ReportList } from '../components/ReportList';

export function ReportsPage() {
  return (
    <div className="min-h-screen pb-36" style={{ backgroundColor: '#EEFCF3' }}>
      <div className="w-full max-w-4xl px-4 pt-6 text-left">
        <h2
          className="font-bold text-12xl mb-4 ml-3"
          style={{ color: '#1D8244', margin: '0 0 20px', marginLeft: '16px' }}
        >
          All reports
        </h2>

          <section className="rounded-2xl ml-0">
          <ReportList />
        </section>
      </div>
    </div>
  );
=======
import { ReportList } from '../components/ReportList'

export function ReportsPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 pb-24 text-slate-900 md:pb-10">
            <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <h1 className="text-xl font-semibold">Recent Reports</h1>
                </div>
                <ReportList />
            </section>
        </main>
    )
>>>>>>> origin/main
}