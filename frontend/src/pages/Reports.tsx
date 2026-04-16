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
}