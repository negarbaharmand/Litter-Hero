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
}: {
  reports?: any[];
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}) {

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return position === null ? null : (
      <Marker position={position}>
        {/* Optional: Add a popup to the "New" pin too */}
        <MarkerPopup lat={position[0]} lng={position[1]} title="Din valda plats" description="Här hittade jag skräp!" />
      </Marker>
    );
  }

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 3. Map through existing reports from the database */}
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
      <div className="mt-2 text-sm text-red-500 bg-gray-100 p-2 rounded">
        Choosen coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}
      </div>
    </div>
  );
}