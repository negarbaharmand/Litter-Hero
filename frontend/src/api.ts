
// 1. Grab the URL once at the top of the file
const API_BASE_URL = import.meta.env.VITE_API_URL;

// 2. Export functions that use that URL
export const fetchReports = async () => {
  const response = await fetch(`${API_BASE_URL}/api/reports`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users`);
  return response.json();
};
export const fetchLeaderboard = async (_timePeriod: 'allTime' | 'monthly' | 'weekly') => {

  throw new Error('Backend endpoint not yet implemented');
};