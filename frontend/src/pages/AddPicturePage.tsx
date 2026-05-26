import { useState, useRef, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { CameraCapture } from '../components/CameraCapture'
import { LocationPicker } from '../components/LocationPicker'
import { createReport, uploadReportImage } from '../api'
import { useAuth } from '../hooks/useAuth'
import { AuthGateModal } from '../components/AuthGateModal'
import { useAuthGate } from '../hooks/useAuthGate'
import exifr from 'exifr'
import { reverseGeocode } from '../utils/geocoding'

const CATEGORIES = ['Mixed', 'Plastic', 'Cardboard', 'Metal', 'Glass', 'Organic']
const SIZES = ['Small', 'Medium', 'Large'] as const
type Size = (typeof SIZES)[number]

export function AddPicturePage() {
	const navigate = useNavigate()
	const { refreshUser } = useAuth()
	const { gate, dismiss, requireAuth } = useAuthGate()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const [showCamera, setShowCamera] = useState(false)
	const [capturedImage, setCapturedImage] = useState<string | null>(null)
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('Mixed')
	const [showAllCategories, setShowAllCategories] = useState(false)
	const [size, setSize] = useState<Size>('Small')
	const [location, setLocation] = useState('')
	const [latitude, setLatitude] = useState<number | null>(null)
	const [longitude, setLongitude] = useState<number | null>(null)
	const [isLocating, setIsLocating] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submitSuccess, setSubmitSuccess] = useState(false)
	const [showSizeInfo, setShowSizeInfo] = useState(false)
	const [locationRequired, setLocationRequired] = useState(false)

	useEffect(() => {
		return () => {
			if(popupTimerRef.current){
				clearTimeout(popupTimerRef.current)
			}
		}
	}, [])

	async function processImageLocation(file: File | Blob) {
        setIsLocating(true)
        setLocationRequired(false)
        setSubmitError(null)
	

        try {
            // Step A: Attempt to fetch GPS from EXIF metadata
            const gps = await exifr.gps(file)

            if (gps && gps.latitude && gps.longitude) {
                const address = await reverseGeocode(gps.latitude, gps.longitude)
                setLocation(address)
                setLatitude(gps.latitude)
                setLongitude(gps.longitude)
                setIsLocating(false)
                return
            }
        } catch (err) {
            console.warn("EXIF processing bypassed or failed:", err)
        }

        // Step B: Fallback to Browser Geolocation API
        if (!navigator.geolocation) {
            triggerManualFallback("Geolocation not supported by your browser")
            return
        }

        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                try {
                    const address = await reverseGeocode(latitude, longitude)
                    setLocation(address)
                    setLatitude(latitude)
                    setLongitude(longitude)
                } catch {
                    setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
                    setLatitude(latitude)
                    setLongitude(longitude)
                }
                setIsLocating(false)
            },
            () => {
                triggerManualFallback("Location could not be detected — please enter it manually.")
            },
            { timeout: 10000 }
        )
    }
	function triggerManualFallback(message: string) {
        setLocation(message)
        setLatitude(null)
        setLongitude(null)
        setLocationRequired(true)
        setIsLocating(false)
    }

	function handleCameraCapture(imageDataUrl: string) {
		setCapturedImage(imageDataUrl)
		
		const byteString = atob(imageDataUrl.split(',')[1])
		const mimeType = imageDataUrl.split(',')[0].split(':')[1].split(';')[0]
		const byteArray = new Uint8Array(byteString.length)
		for (let i = 0; i < byteString.length; i++) {
			byteArray[i] = byteString.charCodeAt(i)
		}
		const blob = new Blob([byteArray], { type: mimeType })
		const file = new File([blob], 'camera-capture.jpg', { type: mimeType })

		setImageFile(file)
        setShowCamera(false)

		// Extract geolocation from the captured photo stream
        processImageLocation(blob)
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		setImageFile(file)

		const reader = new FileReader()
		reader.onload = (ev) => setCapturedImage(ev.target?.result as string)
		reader.readAsDataURL(file)
		// Extract geolocation from uploaded gallery file
        processImageLocation(file)
		e.target.value = ''
	}

	function handleSubmit() {
		setSubmitError(null)
		requireAuth('Create an account to submit a report', submitReport)
	}
	
	function showPopUp(message: string){
		setSubmitError(message)

		if(popupTimerRef.current){
			clearTimeout(popupTimerRef.current)
		}
		popupTimerRef.current = setTimeout(() => {
			setSubmitError(null)
			popupTimerRef.current = null 
		}, 5000)
	}
	async function submitReport() {
		if (!capturedImage) {
			setSubmitError('Please add a photo before submitting.')
			return
		}
		// Strict location block verification
		if (
			!location.trim() ||
			locationRequired ||
			location === 'Could not detect location' ||
			location === 'Geolocation not supported'
		) {
			setLocationRequired(true)
			setSubmitError('Please provide a valid location.')
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
			let uploadResult: {imageUrl: string; imageSizeBytes: number  }| undefined
			if (imageFile) {
				uploadResult = await uploadReportImage(imageFile)
			}

			const created =await createReport({
				location: location.trim(),
				description: fullDescription,
				size: size.toLowerCase(),
				imageUrl: uploadResult?.imageUrl,
				imageSizeBytes: uploadResult?.imageSizeBytes,
				latitude: latitude ?? undefined,
				longitude: longitude ?? undefined,
			}); 
			
			if (created.status === 'rejected'){
				showPopUp(
					created.rejectionReason ? 
					`report was rejected: ${created.rejectionReason}` 
					: 'report was rejected by automatic verification'
				)
				return
			}
			refreshUser()
			setSubmitSuccess(true)
		} catch (err){
			showPopUp(err instanceof Error ? err.message : 'Failed to submit report. Please try again. ')
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
		<div className="min-h-screen pb-36" style={{ backgroundColor: 'var(--color-page-bg)' }}>

			{/* Success modal */}
			{submitSuccess && (
				<SubmitSuccessModal onDismiss={() => navigate('/reports')} />
			)}

			<div className="max-w-lg mx-auto px-4 pt-6">

				{/* Page title */}
				<h2
					className="font-semibold text-2xl mb-5"
					style={{ color: 'var(--color-text-primary)', margin: '0 0 20px' }}
				>
					Add new report
				</h2>

				{/* ── Photo section ── */}
				<div
					className="rounded-2xl p-5 mb-5 flex flex-col items-center justify-center min-h-44"
					style={{ backgroundColor: 'var(--color-surface)' }}
				>
					{capturedImage ? (
						<div className="w-full relative">
							<img
								src={capturedImage}
								alt="Captured litter"
								className="w-full rounded-xl object-cover max-h-60"
							/>
							<button
								onClick={() => { setCapturedImage(null); setImageFile(null) }}
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
							<p className="text-sm text-center mb-4" style={{ color: 'var(--color-text-primary)' }}>
								Take photo or upload image
							</p>
							<div className="flex items-center gap-4">
								<button
									onClick={() => setShowCamera(true)}
									aria-label="Open camera"
									className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
									style={{ backgroundColor: 'var(--color-green-normal)' }}
								>
									<svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
										<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
										<circle cx="12" cy="13" r="4" />
									</svg>
								</button>

								<button
									onClick={() => fileInputRef.current?.click()}
									aria-label="Upload from gallery"
									className="w-8 h-8 flex items-center justify-center"
									style={{ color: 'var(--color-green-normal)' }}
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
						style={{ color: 'var(--color-text-primary)' }}
					>
						Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe the litter…"
						rows={5}
						className="w-full rounded-2xl px-4 py-3 text-sm placeholder-gray-300 resize-none focus:outline-none focus:ring-2"
						style={{
							backgroundColor: 'var(--color-surface)',
							color: 'var(--color-text-body)',
							'--tw-ring-color': 'var(--color-green-normal)',
						} as React.CSSProperties}
					/>
				</div>

				{/* ── Category ── */}
				<div className="mb-5">
					<label
						className="block text-sm font-semibold mb-2"
						style={{ color: 'var(--color-text-primary)' }}
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
										? { backgroundColor: 'var(--color-green-normal)', color: 'white', border: 'none' }
										: { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-body)', border: '1px solid var(--color-border)' }
								}
							>
								{cat}
							</button>
						))}

						<button
							onClick={() => setShowAllCategories((v) => !v)}
							aria-label={showAllCategories ? 'Show fewer categories' : 'Show more categories'}
							className="w-8 h-8 rounded-full flex items-center justify-center transition-transform"
							style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
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
							style={{ color: 'var(--color-text-primary)' }}
						>
							Amount
						</label>
						<button
							onClick={() => setShowSizeInfo((v) => !v)}
							aria-label="Size info"
							className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold leading-none shrink-0"
							style={{ borderColor: 'var(--color-text-primary)', color: 'var(--color-text-primary)' }}
						>
							i
						</button>
					</div>

					{showSizeInfo && (
						<p
							className="text-xs mb-2 rounded-xl px-3 py-2"
							style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}
						>
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
										? { backgroundColor: 'var(--color-green-normal)', color: 'white', border: 'none' }
										: { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-body)', border: '1px solid var(--color-border)' }
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
						style={{ color: 'var(--color-text-primary)' }}
					>
						Place
					</label>
					<LocationPicker
						value={{ location, latitude, longitude }}
						onChange={({ location, latitude, longitude }) => {
							setLocation(location)
							setLatitude(latitude)
							setLongitude(longitude)
						}}
						isLocating={isLocating}
						onUseCurrentLocation={() => processImageLocation(new Blob())}
					/>
				</div>

				{/* Error message */}
				{submitError && (
				<div className="fixed top-5 right-5 z-50 max-w-sm w-[calc(100%-2rem)] rounded-xl border border-red-300 bg-red-50 text-red-900 shadow-lg">
					<div className="flex items-start gap-3 p-4">
						<div className="flex-1 text-sm leading-5">
							<strong className="block mb-1">Report rejected</strong>
							<span>{submitError}</span>
						</div>

						<button
							onClick={() => {
								setSubmitError(null)

								if (popupTimerRef.current) {
									clearTimeout(popupTimerRef.current)
									popupTimerRef.current = null
								}
							}}
							aria-label="Close notification"
							className="shrink-0 rounded-md px-2 py-1 text-red-700 hover:bg-red-100"
						>
							x
						</button>
					</div>
				</div>
				)}

				{/* Desktop submit button — mobile uses the floating navbar-notch button below */}
				<div className="mt-6 hidden md:block">
					<button
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="btn-primary w-full"
					>
						{isSubmitting ? 'Submitting…' : 'Submit report'}
					</button>
				</div>
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

			{/* Floating submit button — sits in the bottom navbar's center notch */}
			<div className="fixed inset-x-0 bottom-0 z-40 h-24 flex items-start justify-center pointer-events-none md:hidden">
				<button
					onClick={handleSubmit}
					disabled={isSubmitting}
					aria-label="Submit report"
					className="h-18 w-18 -mt-3.5 -translate-y-px rounded-full flex items-center justify-center bg-(--nav-camera-bg) pointer-events-auto disabled:opacity-60 active:scale-95 transition-transform"
				>
					{isSubmitting ? (
						<svg
							className="animate-spin h-7 w-7 text-white dark:text-[var(--nav-active)]"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							viewBox="0 0 24 24"
						>
							<path d="M21 12a9 9 0 1 1-6.22-8.56" />
						</svg>
					) : (
						<svg
							className="h-7 w-7 text-white dark:text-[var(--nav-active)]"
							fill="none"
							stroke="currentColor"
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

			<AuthGateModal open={gate.open} message={gate.message} onDismiss={dismiss} />
		</div>
	)
}

function SubmitSuccessModal({ onDismiss }: { onDismiss: () => void }) {
	useEffect(() => {
		document.body.style.overflow = 'hidden'
		return () => { document.body.style.overflow = '' }
	}, [])

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onDismiss()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [onDismiss])

	return (
		<div
			className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-6"
			role="dialog"
			aria-modal="true"
			aria-labelledby="submit-success-title"
			onClick={onDismiss}
		>
			<div
				className="w-full max-w-sm rounded-2xl p-6 shadow-xl text-center relative"
				style={{
					backgroundColor: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onDismiss}
					aria-label="Close"
					className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
					style={{
						backgroundColor: 'var(--color-page-bg)',
						color: 'var(--color-text-primary)',
					}}
				>
					<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
						<path d="M11 3L3 11M3 3l8 8" />
					</svg>
				</button>

				<div
					className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
					style={{ backgroundColor: 'var(--color-green-dark)' }}
					aria-hidden="true"
				>
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
						<path d="M20 6L9 17l-5-5" />
					</svg>
				</div>

				<h3
					id="submit-success-title"
					style={{ color: 'var(--color-green-dark)', marginBottom: '0.5rem' }}
				>
					Report submitted!
				</h3>
				<p className="text-body-sm mb-6!" style={{ color: 'var(--color-text-muted)' }}>
					+10 points earned 🎉
				</p>
				<button
					onClick={onDismiss}
					className="btn-primary w-full"
				>
					View reports
				</button>
			</div>
		</div>
	)
}
