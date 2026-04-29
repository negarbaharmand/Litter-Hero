// 1. Grab the URL once at the top of the file
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Type definitions
export type Report = {
  id: number;
  userId: number;
  location: string;
  description: string | null;
  size: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type CreateReportPayload = {
  userId: number;
  location: string;
  description: string;
  size: string;
  imageUrl?: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  points: number;
};

// 2. Export functions that use that URL
export const fetchReports = async (): Promise<Report[]> => {
  const response = await fetch(`${API_BASE_URL}/api/reports`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/api/users`);
  return response.json();
};

export const fetchLeaderboard = async (_timePeriod: 'allTime' | 'monthly' | 'weekly'): Promise<any> => {
  throw new Error('Backend endpoint not yet implemented');
};

export const createReport = async (newReport: CreateReportPayload): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newReport),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create report');
  }
  return response.json();
};