import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReport, type CreateReportPayload } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ReportForm({ lat, lng }: { lat: number; lng: number }) {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const mutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      refreshUser();
      alert("Reported successfully!");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleSubmit = () => {
    const payload: CreateReportPayload = {
      location: `${lat},${lng}`,
      description: "Sample trash report",
      size: "medium"
    };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Click the button below to send a test report to the database.
      </p>
      <button 
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className={`w-full py-3 px-4 rounded-md font-bold text-white transition-colors ${
          mutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {mutation.isPending ? 'Processing...' : 'Submit Report'}
      </button>
    </div>
  );
}