import { PageShell } from '../components/PageShell'

export function AboutPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-6 mt-2">
        <header className="text-center">
          <h1 className="mb-3">About Litter Hero</h1>
          <p
            className="text-base"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Cleaner streets, one report at a time.
          </p>
        </header>

        <section className="card">
          <h2 className="mb-3">Our mission</h2>
          <p style={{ color: 'var(--color-text-body)' }}>
            Litter Hero exists to turn everyday frustration with litter into action. We give
            people in any neighbourhood a simple way to flag the trash they see — and a clear
            path from spotting a problem to seeing it resolved. The goal isn&apos;t to shame
            anyone; it&apos;s to make picking up after our shared spaces feel rewarding,
            visible, and collective.
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3">The impact</h2>
          <p
            className="mb-3"
            style={{ color: 'var(--color-text-body)' }}
          >
            Every report you submit becomes part of a growing public map of where litter
            actually accumulates. That data helps neighbours coordinate cleanups, gives local
            organisations a way to prioritise their efforts, and turns small individual
            actions into a record of change anyone can see.
          </p>
          <p style={{ color: 'var(--color-text-body)' }}>
            One photo at a time, the map gets cleaner.
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3">How it came to be</h2>
          <p style={{ color: 'var(--color-text-body)' }}>
            Litter Hero started as a project by a small team who got tired of walking past
            the same piles of trash every day and feeling like there was nothing to do about
            it. The first version was a shared notebook of photos. The second was a group
            chat. This is the third — an app built so that flagging a problem takes seconds,
            and so that the work of cleaning up belongs to everyone, not just whoever happens
            to be nearby.
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3">What&apos;s next</h2>
          <p
            className="mb-3"
            style={{ color: 'var(--color-text-body)' }}
          >
            Reporting and cleaning up earns you points. Right now those points unlock badges
            and a place on the leaderboard — but that&apos;s only the start.
          </p>
          <p style={{ color: 'var(--color-text-body)' }}>
            We&apos;re working toward turning those points into something tangible: gift
            cards and discounts at local stores and brands that care about the same things
            you do. The cleanup you already do for your neighbourhood should reward you back.
          </p>
        </section>

        <p
          className="text-center text-sm mt-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Thanks for being here.
        </p>
      </div>
    </PageShell>
  )
}
