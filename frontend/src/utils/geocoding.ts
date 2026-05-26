import { isInSweden } from './swedenMap'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const NOMINATIM_HEADERS: HeadersInit = {
	'Accept-Language': 'sv,en',
	'User-Agent': 'Grupp2-LitterApp/1.0',
}

/** Nominatim viewbox: min lon, max lat, max lon, min lat */
const SWEDEN_VIEWBOX = '10.5,69.6,24.4,55.0'

export type PlaceSuggestion = {
	id: string
	label: string
	displayName: string
	lat: number
	lon: number
}

export function formatAddressFromParts(address: Record<string, string>): string {
	const street =
		address.road && address.house_number
			? `${address.road} ${address.house_number}`
			: address.road ?? null
	const city =
		address.city ??
		address.town ??
		address.village ??
		address.municipality ??
		address.suburb ??
		address.county ??
		null
	const parts = [street, address.postcode, city].filter(Boolean)
	return parts.join(', ')
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
	const params = new URLSearchParams({
		lat: String(lat),
		lon: String(lon),
		format: 'json',
		addressdetails: '1',
		zoom: '18',
	})
	const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
		headers: NOMINATIM_HEADERS,
	})
	if (!res.ok) throw new Error('Reverse geocode failed')
	const data = await res.json()
	const formatted = formatAddressFromParts(data.address ?? {})
	if (formatted) return formatted
	return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

type NominatimResult = {
	place_id: number
	lat: string
	lon: string
	display_name: string
	name?: string
	address?: Record<string, string>
}

function parseStreetAddressQuery(query: string): { street: string; city?: string } | null {
	const commaParts = query.split(',').map((part) => part.trim()).filter(Boolean)
	if (commaParts.length >= 2 && /\d/.test(commaParts[0])) {
		return { street: commaParts[0], city: commaParts.slice(1).join(', ') }
	}

	const inlineMatch = query.match(/^(.+\d+\S*)\s+([A-Za-zÅÄÖåäö][A-Za-zÅÄÖåäö\s-]+)$/)
	if (inlineMatch) {
		return { street: inlineMatch[1].trim(), city: inlineMatch[2].trim() }
	}

	return null
}

function toPlaceSuggestions(
	items: NominatimResult[],
	streetHint?: string
): PlaceSuggestion[] {
	return items
		.filter((item) => isInSweden(Number(item.lat), Number(item.lon)))
		.map((item) => {
			const formatted = formatAddressFromParts(item.address ?? {})
			let label =
				formatted ||
				item.name ||
				item.display_name.split(',')[0]?.trim() ||
				item.display_name

			if (
				streetHint &&
				!/\d/.test(label) &&
				item.address?.road &&
				streetHint.toLowerCase().includes(item.address.road.toLowerCase())
			) {
				label = streetHint
			}

			return {
				id: String(item.place_id),
				label,
				displayName: item.display_name,
				lat: Number(item.lat),
				lon: Number(item.lon),
			}
		})
}

async function fetchNominatimSearch(
	params: URLSearchParams,
	signal?: AbortSignal
): Promise<NominatimResult[]> {
	const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
		headers: NOMINATIM_HEADERS,
		signal,
	})
	if (!res.ok) throw new Error('Place search failed')
	return res.json()
}

export async function searchPlaces(
	query: string,
	signal?: AbortSignal
): Promise<PlaceSuggestion[]> {
	const trimmed = query.trim()
	if (trimmed.length < 2) return []

	const parsed = parseStreetAddressQuery(trimmed)
	const searchQuery = /sweden|sverige/i.test(trimmed) ? trimmed : `${trimmed}, Sweden`

	const freeFormParams = new URLSearchParams({
		q: searchQuery,
		format: 'json',
		addressdetails: '1',
		countrycodes: 'se',
		viewbox: SWEDEN_VIEWBOX,
		bounded: '0',
		limit: '10',
	})

	const requests: Promise<NominatimResult[]>[] = [
		fetchNominatimSearch(freeFormParams, signal),
	]

	if (parsed) {
		const structuredParams = new URLSearchParams({
			street: parsed.street,
			country: 'Sweden',
			format: 'json',
			addressdetails: '1',
			countrycodes: 'se',
			limit: '10',
		})
		if (parsed.city) structuredParams.set('city', parsed.city)
		requests.push(fetchNominatimSearch(structuredParams, signal))
	}

	const resultSets = await Promise.all(requests)
	const seen = new Set<number>()
	const merged: NominatimResult[] = []

	for (const items of resultSets) {
		for (const item of items) {
			if (seen.has(item.place_id)) continue
			seen.add(item.place_id)
			merged.push(item)
		}
	}

	return toPlaceSuggestions(merged, parsed?.street).slice(0, 10)
}
