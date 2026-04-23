import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useState } from "react";

type TrashReport = {
  id: number;
  position: [number, number];
  category: string;
  amount: string;
  points: number;
  image: string;
};

function MapPage() {
  const [selectedTrash, setSelectedTrash] = useState<TrashReport | null>(null);

  const trashReports: TrashReport[] = [
    {
      id: 1,
      position: [57.7089, 11.9746],
      category: "Plast",
      amount: "Medium",
      points: 50,
      image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807",
    },
    {
      id: 2,
      position: [57.715, 11.98],
      category: "Glas",
      amount: "Small",
      points: 30,
      image: "https://images.unsplash.com/photo-1618477461853-4b1f0f0f0f0f",
    },
  ];

  return (
    <main className="relative h-[calc(100svh-74px)] w-full overflow-hidden md:mt-[74px]">
      {/* map area: 74px offset — nere (mobil) / uppe (desktop), samma höjd som NavBar */}
      <div className="absolute inset-0 z-[1]">
        <MapContainer
          center={[57.7089, 11.9746]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {trashReports.map((item) => (
            <Marker
              key={item.id}
              position={item.position}
              eventHandlers={{
                click: () => {
                  setSelectedTrash(item);
                },
              }}
            />
          ))}
        </MapContainer>

        {selectedTrash && (
          <div className="absolute inset-0 z-[20] grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-4 text-center shadow-xl">
              <div className="flex justify-end">
                <button
                  className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700"
                  type="button"
                  onClick={() => setSelectedTrash(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedTrash.image}
                alt="Trash report"
                className="mt-2 h-44 w-full rounded-xl object-cover"
              />

              <h2 className="mt-3 text-lg font-semibold text-slate-900">
                {selectedTrash.category}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Mängd: {selectedTrash.amount} · Poäng: {selectedTrash.points}
              </p>

              <button
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                type="button"
              >
                Rapportera som upplockat
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export function HomePage() {
  return <MapPage />;
}