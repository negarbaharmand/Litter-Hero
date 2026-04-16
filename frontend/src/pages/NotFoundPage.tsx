import { Link } from 'react-router-dom'

export function NotFoundPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
				<h1 className="text-3xl font-semibold tracking-tight">404</h1>
				<p className="mt-2 text-slate-600">Page not found.</p>
				<Link
					to="/"
					className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Go back home
				</Link>
			</div>
		</main>
	)
}
