import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CameraCapture } from '../components/CameraCapture'
import { createReport } from '../api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Mixed', 'Plastic', 'Cardboard', 'Metal', 'Glass', 'Organic']
const SIZES = ['Small', 'Medium', 'Large'] as const
type Size = (typeof SIZES)[number]

async function reverseGeocode(lat: number, lon: number): Promise<string> {
	const res = await fetch(
		`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
		{ headers: { 'Accept-Language': 'en' } }
	)
	const data = await res.json()
	const a = data.address ?? {}
	const street =
		a.road && a.house_number
			? `${a.road} ${a.house_number}`
			: a.road ?? null
	const city = a.city ?? a.town ?? a.village ?? a.county ?? null
	const parts = [street, a.postcode, city].filter(Boolean)
	return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

export function AddPicturePage() {
	const navigate = useNavigate()
	const { refreshUser } = useAuth()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [showCamera, setShowCamera] = useState(false)
	const [capturedImage, setCapturedImage] = useState<string | null>(null)
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('Mixed')
	const [showAllCategories, setShowAllCategories] = useState(false)
	const [size, setSize] = useState<Size>('Small')
	const [location, setLocation] = useState('')
	const [isEditingLocation, setIsEditingLocation] = useState(false)
	const [isLocating, setIsLocating] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [showSizeInfo, setShowSizeInfo] = useState(false)

	useEffect(() => {
		detectLocation()
	}, [])

	function detectLocation() {
		if (!navigator.geolocation) {
			setLocation('Geolocation not supported')
			return
		}
		setIsLocating(true)
		navigator.geolocation.getCurrentPosition(
			async ({ coords: { latitude, longitude } }) => {
				try {
					const address = await reverseGeocode(latitude, longitude)
					setLocation(address)
				} catch {
					setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
				}
				setIsLocating(false)
			},
			() => {
				setLocation('Could not detect location')
				setIsLocating(false)
			},
			{ timeout: 10000 }
		)
	}

	function handleCameraCapture(imageDataUrl: string) {
		setCapturedImage(imageDataUrl)
		setShowCamera(false)
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (ev) => setCapturedImage(ev.target?.result as string)
		reader.readAsDataURL(file)
		e.target.value = ''
	}

	async function handleSubmit() {
		setSubmitError(null)

		const userStr = localStorage.getItem('user')
		const user = userStr ? JSON.parse(userStr) : null
		if (!user?.id) {
			setSubmitError('You must be logged in to submit a report.')
			return
		}
		if (!location.trim()) {
			setSubmitError('Please provide a location.')
			return
		}

		const fullDescription = [
			category !== 'Mixed' ? `Category: ${category}` : null,
			description.trim() || null,
		]
			.filter(Boolean)
			.join('\n')

		setIsSubmitting(true)
		try {
		await createReport({
			userId: user.id,
			location: location.trim(),
			description: fullDescription,
			size: size.toLowerCase(),
		})
		refreshUser()
		navigate('/reports')
		} catch {
			setSubmitError('Failed to submit report. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (showCamera) {
		return (
			<CameraCapture
				onCapture={handleCameraCapture}
				onClose={() => setShowCamera(false)}
			/>
		)
	}

	const visibleCategories = showAllCategories
		? CATEGORIES
		: CATEGORIES.slice(0, 3)

	return (
		<div className="min-h-screen pb-36" style={{ backgroundColor: '#EEFCF3' }}>
			<div className="max-w-lg mx-auto px-4 pt-6">

				{/* Page title */}
				<h2
					className="font-semibold text-2xl mb-5"
					style={{ color: '#1D4E2F', margin: '0 0 20px' }}
				>
					Add new report
				</h2>

				{/* ── Photo section ── */}
				<div className="bg-white rounded-2xl p-5 mb-5 flex flex-col items-center justify-center min-h-44">
					{capturedImage ? (
						<div className="w-full relative">
							<img
								src={capturedImage}
								alt="Captured litter"
								className="w-full rounded-xl object-cover max-h-60"
							/>
							<button
								onClick={() => setCapturedImage(null)}
								aria-label="Remove photo"
								className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
							>
								<svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
									<path d="M11 3L3 11M3 3l8 8" />
								</svg>
							</button>
						</div>
					) : (
						<>
							<p className="text-sm text-center mb-4" style={{ color: '#1D4E2F' }}>
								Take photo or upload image
							</p>
							<div className="flex items-center gap-4">
								{/* Camera button — filled green circle, 48×48 */}
								<button
									onClick={() => setShowCamera(true)}
									aria-label="Open camera"
									className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
									style={{ backgroundColor: '#53E086' }}
								>
									<svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
										<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
										<circle cx="12" cy="13" r="4" />
									</svg>
								</button>

								{/* Upload from gallery button — outline style, 32×32 */}
								<button
									onClick={() => fileInputRef.current?.click()}
									aria-label="Upload from gallery"
									className="w-8 h-8 flex items-center justify-center"
									style={{ color: '#53E086' }}
								>
									<svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
										<rect x="3" y="3" width="18" height="18" rx="2" />
										<circle cx="8.5" cy="8.5" r="1.5" />
										<path d="M21 15l-5-5L5 21" />
										<line x1="19" y1="5" x2="19" y2="9" />
										<line x1="17" y1="7" x2="21" y2="7" />
									</svg>
								</button>
							</div>
						</>
					)}
				</div>

				{/* ── Description ── */}
				<div className="mb-5">
					<label
						htmlFor="description"
						className="block text-sm font-semibold mb-2"
						style={{ color: '#1D4E2F' }}
					>
						Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe the litter…"
						rows={5}
						className="w-full bg-white rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2"
						style={{ '--tw-ring-color': '#53E086' } as React.CSSProperties}
					/>
				</div>

				{/* ── Category ── */}
				<div className="mb-5">
					<label
						className="block text-sm font-semibold mb-2"
						style={{ color: '#1D4E2F' }}
					>
						Category
					</label>
					<div className="flex flex-wrap gap-2 items-center">
						{visibleCategories.map((cat) => (
							<button
								key={cat}
								onClick={() => setCategory(cat)}
								className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
								style={
									category === cat
										? { backgroundColor: '#53E086', color: 'white', border: 'none' }
										: { backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb' }
								}
							>
								{cat}
							</button>
						))}

						{/* Show more / less toggle */}
						<button
							onClick={() => setShowAllCategories((v) => !v)}
							aria-label={showAllCategories ? 'Show fewer categories' : 'Show more categories'}
							className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 transition-transform"
							style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
						>
							<svg
								width="14"
								height="14"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{ transform: showAllCategories ? 'rotate(180deg)' : 'none' }}
							>
								<path d="M2 4l5 5 5-5" />
							</svg>
						</button>
					</div>
				</div>

				{/* ── Amount ── */}
				<div className="mb-5">
					<div className="flex items-center gap-1.5 mb-2">
						<label
							className="text-sm font-semibold"
							style={{ color: '#1D4E2F' }}
						>
							Amount
						</label>
						<button
							onClick={() => setShowSizeInfo((v) => !v)}
							aria-label="Size info"
							className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold leading-none shrink-0"
							style={{ borderColor: '#1D4E2F', color: '#1D4E2F' }}
						>
							i
						</button>
					</div>

					{showSizeInfo && (
						<p className="text-xs text-gray-500 mb-2 bg-white rounded-xl px-3 py-2">
							<strong>Small</strong> — a handful of litter &nbsp;·&nbsp;
							<strong>Medium</strong> — fills a bag &nbsp;·&nbsp;
							<strong>Large</strong> — requires multiple bags or a vehicle
						</p>
					)}

					<div className="flex gap-2">
						{SIZES.map((s) => (
							<button
								key={s}
								onClick={() => setSize(s)}
								className="px-5 py-1.5 rounded-full text-sm font-medium transition-colors"
								style={
									size === s
										? { backgroundColor: '#53E086', color: 'white', border: 'none' }
										: { backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb' }
								}
							>
								{s}
							</button>
						))}
					</div>
				</div>

				{/* ── Place ── */}
				<div className="mb-5">
					<label
						className="block text-sm font-semibold mb-2"
						style={{ color: '#1D4E2F' }}
					>
						Place
					</label>

					{isEditingLocation ? (
						<div className="flex gap-2">
							<input
								type="text"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								autoFocus
								className="flex-1 bg-white rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 min-w-0"
								style={{ '--tw-ring-color': '#53E086' } as React.CSSProperties}
							/>
							<button
								onClick={() => setIsEditingLocation(false)}
								className="px-4 py-2 rounded-xl text-white text-sm font-medium shrink-0"
								style={{ backgroundColor: '#53E086' }}
							>
								Done
							</button>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<span className="flex-1 text-sm truncate" style={{ color: '#6b7280' }}>
								{isLocating ? (
									<span className="flex items-center gap-2">
										<span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin inline-block" />
										Detecting location…
									</span>
								) : (
									location || 'No location set'
								)}
							</span>
							<button
								onClick={() => setIsEditingLocation(true)}
								className="px-4 py-1.5 rounded-lg text-sm font-medium shrink-0"
								style={{ border: '1.5px solid #53E086', color: '#53E086', backgroundColor: 'transparent' }}
							>
								Edit
							</button>
						</div>
					)}
				</div>

				{/* Error message */}
				{submitError && (
					<p className="mt-2 text-sm text-red-500 text-center">{submitError}</p>
				)}
			</div>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
				aria-hidden="true"
			/>

			{/* Floating submit button — sits above the bottom navbar */}
			<div className="fixed bottom-3 left-0 right-0 flex justify-center z-40 pointer-events-none">
				<button
					onClick={handleSubmit}
					disabled={isSubmitting}
					aria-label="Submit report"
					className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl pointer-events-auto disabled:opacity-60 active:scale-95 transition-transform"
					style={{ background: 'linear-gradient(135deg, #37C270, #1A5C35)' }}
				>
					{isSubmitting ? (
						<svg
							className="animate-spin"
							width="24"
							height="24"
							fill="none"
							stroke="white"
							strokeWidth="2.5"
							strokeLinecap="round"
							viewBox="0 0 24 24"
						>
							<path d="M21 12a9 9 0 1 1-6.22-8.56" />
						</svg>
					) : (
						<svg
							width="26"
							height="26"
							fill="none"
							stroke="white"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							viewBox="0 0 24 24"
						>
							<path d="M20 6L9 17l-5-5" />
						</svg>
					)}
				</button>
			</div>
		</div>
	)
}
