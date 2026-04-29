import { useState } from 'react';
import ReportForm from '../components/Map/ReportForm';
import ReportMap from '../components/Map/ReportMap';
import { ReportList } from '../components/ReportList';

export const ReportsPage = () => {
  const [position, setPosition] = useState<[number, number]>([59.3293, 18.0686]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Report Trash</h1>

      <section className="mb-8">
        <ReportMap position={position} setPosition={setPosition} />
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Submit Report</h2>
        <ReportForm lat={position[0]} lng={position[1]} />
      </section>

      <section className="mt-10 bg-white rounded-lg shadow-md">
        <ReportList />
      </section>
    </div>
  );
}