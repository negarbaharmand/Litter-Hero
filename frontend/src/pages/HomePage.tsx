import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ReportMap from '../components/Map/ReportMap';
import { fetchReports } from '../api';
import { STATUS_FILTER_OPTIONS, type ReportStatusFilter } from '../utils/reportStatus';

function getInitialTheme(): 'light' | 'dark' {
	const saved = localStorage.getItem('theme');
	const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
	const next: 'light' | 'dark' =
		saved === 'dark' || saved === 'light' ? (saved as 'light' | 'dark') : prefersDark ? 'dark' : 'light';
	document.documentElement.dataset.theme = next;
	return next;
}

export function HomePage() {
	const [mapCenter, setMapCenter] = useState<[number, number]>([59.3293, 18.0686]);
	const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
	const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
	const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('all');
	const [needsVotesOnly, setNeedsVotesOnly] = useState(false);

	const effectiveFilter: ReportStatusFilter = needsVotesOnly ? 'cleanup_pending_vote' : statusFilter;

	const { data: reports = [] } = useQuery({
		queryKey: ['reports', effectiveFilter],
		queryFn: () => fetchReports(effectiveFilter === 'all' ? undefined : effectiveFilter),
	});
	const mapReports = reports.filter(
        (report) => report.latitude !== null && report.longitude !== null
    );

	useEffect(() => {
		if (!navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				const nextPosition: [number, number] = [coords.latitude, coords.longitude];
				setCurrentLocation(nextPosition);
				setMapCenter(nextPosition);
			},
			() => {
				// Keep Stockholm fallback center if geolocation is blocked/unavailable.
			},
			{ timeout: 10000 }
		);
	}, []);

	function toggleTheme() {
		const next = theme === 'dark' ? 'light' : 'dark';
		setTheme(next);
		localStorage.setItem('theme', next);
		document.documentElement.dataset.theme = next;
	}



	return (
		<main className="fixed inset-0 h-dvh w-screen bg-transparent">
			<div className="absolute inset-0">
				<ReportMap 
					reports={mapReports} 
					center={mapCenter}
					currentLocation={currentLocation}
					theme={theme} 
				/>
			</div>
		<div className="fixed left-3 top-4 z-2000 flex max-w-[90vw] flex-col gap-2 md:top-24">
			<div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/90 dark:bg-neutral-800/90 p-2 shadow">
				<Link
					to="/about"
					aria-label="About us"
					title="About us"
					className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-600 transition hover:bg-slate-100 dark:hover:bg-neutral-600"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
						<circle cx="12" cy="8" r="1.25" fill="currentColor" />
						<path
							d="M12 11.5v6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</Link>
				{STATUS_FILTER_OPTIONS.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => { setStatusFilter(option.value); setNeedsVotesOnly(false); }}
						disabled={needsVotesOnly}
						className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-40 ${
							!needsVotesOnly && statusFilter === option.value
								? 'bg-emerald-600 text-white'
								: 'bg-white dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-600'
						}`}
					>
						{option.label}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={() => setNeedsVotesOnly((prev) => !prev)}
				className={`self-start rounded-full px-3 py-1 text-xs font-semibold shadow transition ${
					needsVotesOnly
						? 'bg-amber-500 text-white'
						: 'bg-white/90 dark:bg-neutral-800/90 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-600'
				}`}
			>
				{needsVotesOnly ? '✓ Needs votes' : 'Show needs votes'}
			</button>
		</div>

			<div className="fixed bottom-28 right-3 z-2000 pointer-events-auto lg:bottom-24">
				<button
					type="button"
					onClick={toggleTheme}
					aria-label="Toggle theme"
					aria-pressed={theme === 'dark'}
					className="flex items-center gap-2 rounded-full border px-3 py-2"
					style={{
						backgroundColor: '#252e25',
						borderColor: '#252e25',
						color: 'var(--text-h)',
					}}
				>
					<span className="text-xs font-medium">
						{theme === 'dark' ? 'Dark' : 'Light'}
					</span>

					<span
						className="relative h-4 w-8 rounded-full border"
						style={{
							borderColor: '#252e25',
							backgroundColor: theme === 'dark' ? '#0426cf' : '#5e7563',
						}}
						aria-hidden="true"
					>
						<span
							className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
							style={{
								left: theme === 'dark' ? '18px' : '2px',
								backgroundColor: theme === 'dark' ? 'var(--bg)' : '#232423',
								transition: 'left 150ms ease',
							}}
						/>
					</span>

					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<path
							d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</button>
			</div>
		</main>
    )
}