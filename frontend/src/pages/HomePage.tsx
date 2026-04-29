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

  // Full-bleed map: break out of #root max width. Use dvh for stable mobile/desktop height (Leaflet needs real px height)
  return (
    <main className="relative left-1/2 h-[calc(100dvh-74px)] min-h-[calc(100dvh-74px)] w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-slate-950">
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
  // Keep home route full height in the flex layout (håll kartan synlig)
  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <MapPage />
    </div>
  );
}