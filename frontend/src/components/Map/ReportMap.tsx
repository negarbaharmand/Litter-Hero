import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerPopup from './MarkerPopup';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function ReportMap({
  reports,
  position,
  setPosition,
  theme = 'light',
}: {
  reports?: any[];
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  theme?: 'light' | 'dark';
}) {

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return position === null ? null : (
      <Marker position={position}>
        <MarkerPopup lat={position[0]} lng={position[1]} title="Din valda plats" description="Här hittade jag skräp!" />
      </Marker>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer 
        center={position} 
        zoom={13} 
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

        {reports?.map((report) => (
          <Marker key={report.id} position={[report.lat, report.lng]}>
            <MarkerPopup 
              lat={report.lat} 
              lng={report.lng} 
              description={report.description}
              size={report.size}
            />
          </Marker>
        ))}

        <LocationMarker />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow">
        Chosen coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}
      </div>
    </div>
  );
}