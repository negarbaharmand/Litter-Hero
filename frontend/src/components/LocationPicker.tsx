import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  reverseGeocode,
  searchPlaces,
  type PlaceSuggestion,
} from "../utils/geocoding";
import {
  SWEDEN_BOUNDS,
  SWEDEN_DEFAULT_CENTER,
  SWEDEN_MIN_ZOOM,
  clampToSweden,
} from "../utils/swedenMap";

function useTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}

const PickMarkerIcon = L.divIcon({
  className: "location-picker-marker",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#53E086;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export type LocationValue = {
  location: string;
  latitude: number | null;
  longitude: number | null;
};

type LocationPickerProps = {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  isLocating?: boolean;
  onUseCurrentLocation?: () => void;
};

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 15));
  }, [center, map]);
  return null;
}

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  value,
  onChange,
  isLocating = false,
  onUseCurrentLocation,
}: LocationPickerProps) {
  const theme = useTheme();
  const listboxId = useId();
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isResolvingMapPoint, setIsResolvingMapPoint] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canSearch = showSuggestions && value.location.trim().length >= 2;

  useEffect(() => {
    if (!canSearch) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchPlaces(value.location, controller.signal);
        setSuggestions(results);
      } catch {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setSearchError("Could not load suggestions. Try again.");
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value.location, canSearch]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const mapCenter: [number, number] =
    value.latitude !== null && value.longitude !== null
      ? [value.latitude, value.longitude]
      : SWEDEN_DEFAULT_CENTER;

  const hasMapPin = value.latitude !== null && value.longitude !== null;

  const applyCoordinates = useCallback(
    async (lat: number, lng: number, label?: string) => {
      const [clampedLat, clampedLng] = clampToSweden(lat, lng);
      setIsResolvingMapPoint(true);
      try {
        const address = label ?? (await reverseGeocode(clampedLat, clampedLng));
        onChange({
          location: address,
          latitude: clampedLat,
          longitude: clampedLng,
        });
      } catch {
        const fallback = `${clampedLat.toFixed(5)}, ${clampedLng.toFixed(5)}`;
        onChange({
          location: fallback,
          latitude: clampedLat,
          longitude: clampedLng,
        });
      } finally {
        setIsResolvingMapPoint(false);
        setShowSuggestions(false);
      }
    },
    [onChange],
  );

  function selectSuggestion(suggestion: PlaceSuggestion) {
    void applyCoordinates(suggestion.lat, suggestion.lon, suggestion.label);
  }

  function handleInputChange(next: string) {
    setShowSuggestions(true);
    onChange({
      location: next,
      latitude: null,
      longitude: null,
    });
  }

  function handleMapPick(lat: number, lng: number) {
    void applyCoordinates(lat, lng);
  }

  function handleMarkerDrag(lat: number, lng: number) {
    void applyCoordinates(lat, lng);
  }

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={value.location}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for a street or place in Sweden…"
          role="combobox"
          aria-expanded={canSearch && suggestions.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 min-w-0"
          style={
            {
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-body)",
              border: "1px solid var(--color-border)",
              "--tw-ring-color": "#53E086",
            } as React.CSSProperties
          }
        />

        {canSearch && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl shadow-lg"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            {isSearching && (
              <li
                className="px-4 py-2.5 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Searching…
              </li>
            )}
            {!isSearching && searchError && (
              <li className="px-4 py-2.5 text-sm text-red-500">
                {searchError}
              </li>
            )}
            {!isSearching && !searchError && suggestions.length === 0 && (
              <li
                className="px-4 py-2.5 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                No places found. Try another search or tap the map.
              </li>
            )}
            {suggestions.map((suggestion) => (
              <li key={suggestion.id} role="option">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-page-bg)]"
                >
                  <span
                    className="block font-medium truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {suggestion.label}
                  </span>
                  {suggestion.displayName !== suggestion.label && (
                    <span
                      className="block text-xs truncate mt-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
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
            style={{
              border: "1.5px solid var(--color-green-normal)",
              color: "var(--color-text-primary)",
              backgroundColor: "transparent",
            }}
          >
            {isLocating ? "Detecting…" : "Use my location"}
          </button>
        )}
        {(isResolvingMapPoint || isLocating) && (
          <span
            className="text-xs self-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            Updating place…
          </span>
        )}
      </div>

      <div
        className="rounded-2xl overflow-hidden relative isolate z-0"
        style={{
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={hasMapPin ? 16 : 6}
          minZoom={SWEDEN_MIN_ZOOM}
          maxBounds={SWEDEN_BOUNDS}
          maxBoundsViscosity={1}
          className="h-44 w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution={
              theme === "dark"
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
            url={
              theme === "dark"
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
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
                  const { lat, lng } = e.target.getLatLng();
                  handleMarkerDrag(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
        <p
          className="px-3 py-2 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Tap the map or drag the pin to set an exact spot. Search above for
          named places.
        </p>
      </div>
    </div>
  );
}
