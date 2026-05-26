import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchVoteQueue } from '../api';
import { ReportList } from '../components/ReportList';
import { VoteQueue } from '../components/VoteQueue';

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'vote-queue' ? 'vote-queue' : 'reports';

  const { data: voteQueue } = useQuery({
    queryKey: ['vote-queue'],
    queryFn: fetchVoteQueue,
  });

  const voteCount =
    (voteQueue?.trashVerifications.length ?? 0) +
    (voteQueue?.cleanupVerifications.length ?? 0);

  function switchTab(tab: 'reports' | 'vote-queue') {
    if (tab === 'reports') {
      const next = new URLSearchParams(searchParams);
      next.delete('tab');
      setSearchParams(next, { replace: true });
    } else {
      const next = new URLSearchParams(searchParams);
      next.set('tab', 'vote-queue');
      setSearchParams(next, { replace: true });
    }
  }

  return (
    <div className="min-h-screen pb-36" style={{ backgroundColor: 'var(--color-page-bg)' }}>
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 text-left">
        <h2
          className="font-bold text-12xl mb-4 ml-3"
          style={{ color: 'var(--color-text-primary)', margin: '0 0 16px', marginLeft: '16px' }}
        >
          Reports
        </h2>

        {/* Tab switcher */}
        <div
          className="flex gap-1 mb-5 rounded-xl p-1"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => switchTab('reports')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === 'reports' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'reports' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: activeTab === 'reports' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            All reports
          </button>
          <button
            onClick={() => switchTab('vote-queue')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: activeTab === 'vote-queue' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'vote-queue' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: activeTab === 'vote-queue' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Vote queue
            {voteCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white bg-amber-500">
                {voteCount}
              </span>
            )}
          </button>
        </div>

        <section className="rounded-2xl ml-0">
          {activeTab === 'reports' ? <ReportList /> : <VoteQueue />}
        </section>
      </div>
    </div>
  );
}
