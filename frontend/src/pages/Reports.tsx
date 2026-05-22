import { ReportList } from '../components/ReportList';

export function ReportsPage() {
  return (
    <div className="min-h-screen pb-36" style={{ backgroundColor: 'var(--color-page-bg)' }}>
      <div className="w-full max-w-4xl px-4 pt-6 text-left">
        <h2
          className="font-bold text-12xl mb-4 ml-3"
          style={{ color: 'var(--color-text-primary)', margin: '0 0 20px', marginLeft: '16px' }}
        >
          All reports
        </h2>

          <section className="rounded-2xl ml-0">
          <ReportList />
        </section>
      </div>
    </div>
  );
}