import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { reverseGeocode, searchPlaces, type PlaceSuggestion } from '../utils/geocoding'

const DEFAULT_CENTER: [number, number] = [59.3293, 18.0686]

const PickMarkerIcon = L.divIcon({
	className: 'location-picker-marker',
	html: '<div style="width:18px;height:18px;border-radius:9999px;background:#53E086;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
	iconSize: [18, 18],
	iconAnchor: [9, 9],
})

export type LocationValue = {
	location: string
	latitude: number | null
	longitude: number | null
}

type LocationPickerProps = {
	value: LocationValue
	onChange: (value: LocationValue) => void
	isLocating?: boolean
	onUseCurrentLocation?: () => void
}

function MapRecenter({ center }: { center: [number, number] }) {
	const map = useMap()
	useEffect(() => {
		map.setView(center, Math.max(map.getZoom(), 15))
	}, [center, map])
	return null
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
	useMapEvents({
		click(e) {
			onPick(e.latlng.lat, e.latlng.lng)
		},
	})
	return null
}

export function LocationPicker({
	value,
	onChange,
	isLocating = false,
	onUseCurrentLocation,
}: LocationPickerProps) {
	const listboxId = useId()
	const [query, setQuery] = useState(value.location)
	const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [isResolvingMapPoint, setIsResolvingMapPoint] = useState(false)
	const [searchError, setSearchError] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setQuery(value.location)
	}, [value.location])

	useEffect(() => {
		if (!showSuggestions || query.trim().length < 2) {
			setSuggestions([])
			return
		}

		const controller = new AbortController()
		const timer = window.setTimeout(async () => {
			setIsSearching(true)
			setSearchError(null)
			try {
				const results = await searchPlaces(query, controller.signal)
				setSuggestions(results)
			} catch {
				if (controller.signal.aborted) return
				setSuggestions([])
				setSearchError('Could not load suggestions. Try again.')
			} finally {
				if (!controller.signal.aborted) setIsSearching(false)
			}
		}, 450)

		return () => {
			window.clearTimeout(timer)
			controller.abort()
		}
	}, [query, showSuggestions])

	useEffect(() => {
		function handlePointerDown(event: MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setShowSuggestions(false)
			}
		}
		document.addEventListener('mousedown', handlePointerDown)
		return () => document.removeEventListener('mousedown', handlePointerDown)
	}, [])

	const mapCenter: [number, number] =
		value.latitude !== null && value.longitude !== null
			? [value.latitude, value.longitude]
			: DEFAULT_CENTER

	const hasMapPin = value.latitude !== null && value.longitude !== null

	const applyCoordinates = useCallback(
		async (lat: number, lng: number, label?: string) => {
			setIsResolvingMapPoint(true)
			try {
				const address = label ?? (await reverseGeocode(lat, lng))
				onChange({ location: address, latitude: lat, longitude: lng })
				setQuery(address)
			} catch {
				const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
				onChange({ location: fallback, latitude: lat, longitude: lng })
				setQuery(fallback)
			} finally {
				setIsResolvingMapPoint(false)
				setShowSuggestions(false)
			}
		},
		[onChange]
	)

	function selectSuggestion(suggestion: PlaceSuggestion) {
		void applyCoordinates(suggestion.lat, suggestion.lon, suggestion.label)
	}

	function handleInputChange(next: string) {
		setQuery(next)
		setShowSuggestions(true)
		onChange({
			location: next,
			latitude: null,
			longitude: null,
		})
	}

	function handleMapPick(lat: number, lng: number) {
		void applyCoordinates(lat, lng)
	}

	function handleMarkerDrag(lat: number, lng: number) {
		void applyCoordinates(lat, lng)
	}

	return (
		<div ref={containerRef} className="space-y-3">
			<div className="relative">
				<input
					type="text"
					value={query}
					onChange={(e) => handleInputChange(e.target.value)}
					onFocus={() => setShowSuggestions(true)}
					placeholder="Search for a street, park, or place…"
					role="combobox"
					aria-expanded={showSuggestions && suggestions.length > 0}
					aria-controls={listboxId}
					aria-autocomplete="list"
					className="w-full bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 min-w-0"
					style={{ '--tw-ring-color': '#53E086' } as React.CSSProperties}
				/>

				{showSuggestions && query.trim().length >= 2 && (
					<ul
						id={listboxId}
						role="listbox"
						className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
					>
						{isSearching && (
							<li className="px-4 py-2.5 text-sm text-gray-400">Searching…</li>
						)}
						{!isSearching && searchError && (
							<li className="px-4 py-2.5 text-sm text-red-500">{searchError}</li>
						)}
						{!isSearching &&
							!searchError &&
							suggestions.length === 0 && (
								<li className="px-4 py-2.5 text-sm text-gray-400">
									No places found. Try another search or tap the map.
								</li>
							)}
						{suggestions.map((suggestion) => (
							<li key={suggestion.id} role="option">
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => selectSuggestion(suggestion)}
									className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#EEFCF3] transition-colors"
								>
									<span className="block font-medium text-gray-800 truncate">
										{suggestion.label}
									</span>
									{suggestion.displayName !== suggestion.label && (
										<span className="block text-xs text-gray-400 truncate mt-0.5">
											{suggestion.displayName}
										</span>
									)}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="flex flex-wrap gap-2">
				{onUseCurrentLocation && (
					<button
						type="button"
						onClick={onUseCurrentLocation}
						disabled={isLocating}
						className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60"
						style={{ border: '1.5px solid #53E086', color: '#53E086', backgroundColor: 'transparent' }}
					>
						{isLocating ? 'Detecting…' : 'Use my location'}
					</button>
				)}
				{(isResolvingMapPoint || isLocating) && (
					<span className="text-xs text-gray-500 self-center">Updating place…</span>
				)}
			</div>

			<div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
				<MapContainer
					center={mapCenter}
					zoom={hasMapPin ? 16 : 12}
					className="h-44 w-full"
					scrollWheelZoom={false}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<MapRecenter center={mapCenter} />
					<MapClickHandler onPick={handleMapPick} />
					{hasMapPin && (
						<Marker
							position={mapCenter}
							icon={PickMarkerIcon}
							draggable
							eventHandlers={{
								dragend: (e) => {
									const { lat, lng } = e.target.getLatLng()
									handleMarkerDrag(lat, lng)
								},
							}}
						/>
					)}
				</MapContainer>
				<p className="px-3 py-2 text-xs text-gray-500">
					Tap the map or drag the pin to set an exact spot. Search above for named places.
				</p>
			</div>
		</div>
	)
}
