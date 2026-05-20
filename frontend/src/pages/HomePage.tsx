import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReportMap from '../components/Map/ReportMap';
import { fetchReports } from '../api';

export function HomePage() {
	const [position, setPosition] = useState<[number, number]>([59.3293, 18.0686]);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');
	const { data: reports = [] } = useQuery({
		queryKey: ['reports'],
		queryFn: fetchReports,
	});
	const mapReports = reports.filter(
        (report) => report.latitude !== null && report.longitude !== null
    );

	useEffect(() => {
		const saved = localStorage.getItem('theme');
		const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
		const next: 'light' | 'dark' =
			saved === 'dark' || saved === 'light' ? (saved as 'light' | 'dark') : prefersDark ? 'dark' : 'light';

		setTheme(next);
		document.documentElement.dataset.theme = next;
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
					position={position} 
					setPosition={setPosition} 
					theme={theme} 
				/>
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