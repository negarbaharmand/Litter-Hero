const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const NOMINATIM_HEADERS: HeadersInit = {
	'Accept-Language': 'en',
	'User-Agent': 'Grupp2-LitterApp/1.0',
}

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
		address.city ?? address.town ?? address.village ?? address.county ?? null
	const parts = [street, address.postcode, city].filter(Boolean)
	return parts.join(', ')
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
	const res = await fetch(
		`${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`,
		{ headers: NOMINATIM_HEADERS }
	)
	if (!res.ok) throw new Error('Reverse geocode failed')
	const data = await res.json()
	const formatted = formatAddressFromParts(data.address ?? {})
	if (formatted) return formatted
	return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

export async function searchPlaces(
	query: string,
	signal?: AbortSignal
): Promise<PlaceSuggestion[]> {
	const trimmed = query.trim()
	if (trimmed.length < 2) return []

	const params = new URLSearchParams({
		q: trimmed,
		format: 'json',
		addressdetails: '1',
		limit: '6',
	})
	const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
		headers: NOMINATIM_HEADERS,
		signal,
	})
	if (!res.ok) throw new Error('Place search failed')

	const data = (await res.json()) as Array<{
		place_id: number
		lat: string
		lon: string
		display_name: string
		name?: string
		address?: Record<string, string>
	}>

	return data.map((item) => {
		const label = formatAddressFromParts(item.address ?? {}) || item.name || item.display_name
		return {
			id: String(item.place_id),
			label,
			displayName: item.display_name,
			lat: Number(item.lat),
			lon: Number(item.lon),
		}
	})
}
