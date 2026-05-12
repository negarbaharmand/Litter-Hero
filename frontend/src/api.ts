
// 1. Grab the URL once at the top of the file
const API_BASE_URL = "";

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
  username: string | null;
  name: string;
  email: string;
  points: number;
  role: string;
  createdAt: string;
};

import type { LeaderboardData, LeaderboardEntry } from './components/Leaderboard/LeaderboardTypes';
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

export const fetchLeaderboard = async (timePeriod: 'allTime' | 'monthly' | 'weekly'): Promise<LeaderboardData> => {
  const response = await fetch(`${API_BASE_URL}/api/users/leaderboard`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  
  const users = await response.json();
  
  // Transform backend response to LeaderboardData format
  const entries: LeaderboardEntry[] = users.map((user: User, index: number) => ({
    id: user.id,
    username: user.username || `User${user.id}`,
    email: user.email,
    points: user.points,
    rank: index + 1,
    profilePictureUrl: null,
    reportsSubmitted: 0, //placeholder, in case we want to add this to the backend later 
    reportsResolved: 0, //same as above
    createdAt: user.createdAt,
  }));
  
  return {
    timePeriod,
    entries,
    lastUpdated: new Date().toISOString(),
  };
};

// ── Auth ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: number
  email: string
  name: string | null
  role: string | null
  points: number | null
  createdAt: string
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Login failed')
  }
  return data
}

export const registerUser = async (
  email: string,
  password: string,
  username?: string,
  name?: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username, name }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Registration failed')
  }
  return data
}

export const logoutUser = async (): Promise<void> => {
  const token = localStorage.getItem('token')
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// ── Reports ──────────────────────────────────────────────────────────────────

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
