import { useState } from 'react';
import ReportMap from '../components/Map/ReportMap';

export function HomePage() {
	const [position, setPosition] = useState<[number, number]>([59.3293, 18.0686]);

	return (
		<main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">

            {/* HERO SECTION */}
            <section className="mx-auto max-w-4xl px-6 py-10 text-center">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">LitterHero</h1>
                <p className="mt-3 text-slate-600">Report and track litter in your area.</p>
            </section>

            {/* MAP SECTION */}
            <section className="mx-auto mb-10 max-w-4xl px-6">
                <ReportMap position={position} setPosition={setPosition} />
            </section>
        </main>
    )
}