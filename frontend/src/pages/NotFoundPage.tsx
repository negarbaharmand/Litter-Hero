import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFoundPage() {
	useDocumentTitle('404 — Page Not Found')
	return (
		<main
			id="main-content"
			tabIndex={-1}
			className="flex min-h-screen items-center justify-center px-6 pb-24 lg:pt-[74px] lg:pb-10"
			style={{ backgroundColor: 'var(--color-page-bg)', color: 'var(--color-text-body)' }}
		>
			<div
				className="w-full max-w-md rounded-2xl border p-8 text-center shadow-sm"
				style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
			>
				<h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>404</h1>
				<p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>Page not found.</p>
				<Link
					to="/"
					className="mt-6 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white"
					style={{ backgroundColor: 'var(--color-green-dark)' }}
				>
					Go back home
				</Link>
			</div>
		</main>
	)
}
