import type { LatLngBoundsExpression } from 'leaflet'

/** Approximate bounding box for Sweden (mainland + Gotland, incl. small margin). */
export const SWEDEN_BOUNDS: LatLngBoundsExpression = [
	[55.0, 10.5],
	[69.6, 24.4],
]

export const SWEDEN_DEFAULT_CENTER: [number, number] = [59.3293, 18.0686]

export const SWEDEN_MIN_ZOOM = 5

const SWEDEN_LAT_MIN = 55.0
const SWEDEN_LAT_MAX = 69.6
const SWEDEN_LNG_MIN = 10.5
const SWEDEN_LNG_MAX = 24.4

export function isInSweden(lat: number, lng: number): boolean {
	return (
		lat >= SWEDEN_LAT_MIN &&
		lat <= SWEDEN_LAT_MAX &&
		lng >= SWEDEN_LNG_MIN &&
		lng <= SWEDEN_LNG_MAX
	)
}

export function clampToSweden(lat: number, lng: number): [number, number] {
	return [
		Math.min(Math.max(lat, SWEDEN_LAT_MIN), SWEDEN_LAT_MAX),
		Math.min(Math.max(lng, SWEDEN_LNG_MIN), SWEDEN_LNG_MAX),
	]
}
