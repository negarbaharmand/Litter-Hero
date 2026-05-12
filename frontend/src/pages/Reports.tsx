import { useState } from 'react';
import ReportMap from '../components/Map/ReportMap';
import { ReportList } from '../components/ReportList';

export function ReportsPage() {
  const [position, setPosition] = useState<[number, number]>([59.3293, 18.0686]);

  return (
    <div className="min-h-screen pb-36" style={{ backgroundColor: '#EEFCF3' }}>
      <div className="w-full max-w-4xl px-4 pt-6 text-left">
        <h2
          className="font-bold text-12xl mb-4 ml-3"
          style={{ color: '#1D8244', margin: '0 0 20px', marginLeft: '16px' }}
        >
          All reports
        </h2>

      <section className="mb-8">
        <ReportMap position={position} setPosition={setPosition} />
      </section>

          <section className="rounded-2xl ml-0">
          <ReportList />
        </section>
      </div>
    </div>
  );
}