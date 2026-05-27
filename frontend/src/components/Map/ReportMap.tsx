import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerPopup from './MarkerPopup';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Report } from '../../api';
import { SWEDEN_BOUNDS, SWEDEN_MIN_ZOOM } from '../../utils/swedenMap';


const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CurrentLocationIcon = L.divIcon({
  className: 'current-location-marker',
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#ef4444;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const PendingVerificationIcon = L.divIcon({
  className: '',
  html: '<div style="width:28px;height:28px;border-radius:9999px;background:#f59e0b;border:3px solid #ffffff;box-shadow:0 1px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">🗳</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function ReportMap({
  reports,
  center,
  currentLocation,
  theme = 'light',
}: {
  reports?: Report[];
  center: [number, number];
  currentLocation: [number, number] | null;
  theme?: 'light' | 'dark';
}) {
  return (
    <div className="relative h-full w-full overflow-hidden" aria-label="Litter report map" role="application">
      <MapContainer
        center={center}
        zoom={13}
        minZoom={SWEDEN_MIN_ZOOM}
        maxBounds={SWEDEN_BOUNDS}
        maxBoundsViscosity={1}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={
            theme === 'dark'
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
          url={
            theme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        {reports
          ?.filter((report): report is Report & { latitude: number; longitude: number } =>
            report.latitude !== null && report.longitude !== null
          )
          .map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={report.status === 'pending' ? PendingVerificationIcon : DefaultIcon}
            >
              <MarkerPopup
                lat={report.latitude}
                lng={report.longitude}
                title="Trash report"
                description={report.description || 'Ingen beskrivning tillgänglig'}
                size={report.size || 'Okänd storlek'}
                reportId={report.id}
                status={report.status}
              />
            </Marker>
          ))}

        {currentLocation && (
          <Marker position={currentLocation} icon={CurrentLocationIcon}>
            <MarkerPopup
              lat={currentLocation[0]}
              lng={currentLocation[1]}
              title="Your location"
              description="Approximate GPS location"
            />
          </Marker>
        )}
      </MapContainer>
      {currentLocation && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 dark:bg-neutral-800/90 px-3 py-2 text-xs text-slate-700 dark:text-neutral-200 shadow">
          Your location: {currentLocation[0].toFixed(5)}, {currentLocation[1].toFixed(5)}
        </div>
      )}
    </div>
  );
}