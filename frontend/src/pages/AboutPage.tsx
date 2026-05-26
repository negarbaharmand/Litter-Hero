import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'

export function AboutPage() {
  const navigate = useNavigate()

  const onBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-base font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-body)' }}
        >
          ← Back
        </button>
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
            We built Litter Hero because we genuinely care about the environment and want to see it thrive for future generations. The idea is simple: Think of it as Pokemon Go but for litter - when you spot a mess, you report it. That small act goes into a shared map, other people can see it, clean it up, and slowly things actually get better. No shaming, no preaching. Just people looking out for the environment while doing something good.
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3">The impact</h2>
          <p
            className="mb-3"
            style={{ color: 'var(--color-text-body)' }}
          >
            Every report you submit builds a real picture of where litter
            accumulates. That helps people organise cleanups, gives local groups
            a way to prioritise their efforts, and means your minute of
            effort actually counts for something. One photo at a time,
            things genuinely get better.
          </p>
          <p style={{ color: 'var(--color-text-body)' }}>
            One photo at a time, the map gets cleaner.
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3">How it came to be</h2>
          <p style={{ color: 'var(--color-text-body)' }}>
            We at Litter Hero genuinely care about the environment and wanted to help people who care about the environment make their efforts more rewarding than just the work itself. 
            
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3">What's next</h2>
          <p
            className="mb-3"
            style={{ color: 'var(--color-text-body)' }}
          >
            Reporting and cleaning up earns you points. Right now those points lands you a
            spot on the leaderboard. But that's only the start.
          </p>
          <p style={{ color: 'var(--color-text-body)' }}>
            We're working toward turning those points into something tangible - gift
            cards and discounts at local stores and brands that care about the same things
            you do. Doing good for the environment can be more rewarding than just the work itself.
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
