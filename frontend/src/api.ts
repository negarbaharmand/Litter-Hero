
// In production, nginx proxies /api/* to the backend, so an empty base is correct.
// VITE_API_URL can be set to override (e.g. http://localhost:3000 for local dev without the proxy).
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// Type definitions
export type Report = {
  id: number;
  userId: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  size: string | null;
  imageUrl: string | null;
  status: 'pending' | 'verified' | 'disputed' | 'cleaned' | 'rejected' | 'open' | 'cleanup_pending_vote';
  rejectionReason: string | null;
  cleanedByUserId: number | null;
  cleanedAt: string | null;
  createdAt: string;
  pendingSubmissionsCount: number;
  topPendingVoteCount: number;
  reportVerificationVoteCount: number;
};

export type CleanupSubmission = {
  id: number;
  reportId: number;
  userId: number;
  imageUrl: string;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string | null;
  resolvedAt: string | null;
};

export type VoteSummary = {
  totalVotes: number;
  cleanVotes: number;
  notCleanVotes: number;
  myVote: 'clean' | 'not_clean' | null;
};

export type ReportVerificationVoteSummary = {
  totalVotes: number;
  legitVotes: number;
  notTrashVotes: number;
  myVote: 'legit' | 'not_trash' | null;
};

export type CleanupSubmissionWithVotes = CleanupSubmission & {
  voteSummary: VoteSummary;
};

export type ReportDetails = Report & {
  verificationVoteSummary: ReportVerificationVoteSummary;
  winningSubmission: CleanupSubmission | null;
  cleanupSubmissions: CleanupSubmissionWithVotes[];
};

export type VoteOnCleanupResponse = {
  status: 'pending' | 'approved' | 'rejected';
  submission?: CleanupSubmission;
  voteSummary: VoteSummary;
};

export type VoteOnReportVerificationResponse = {
  status: 'pending' | 'verified' | 'rejected';
  voteSummary: ReportVerificationVoteSummary;
};

export type TrashVerificationQueueItem = {
  reportId: number;
  location: string;
  description: string | null;
  imageUrl: string | null;
  ownerUserId: number;
  size: string | null;
  createdAt: string;
  voteSummary: ReportVerificationVoteSummary;
};

export type CleanupVerificationQueueItem = {
  reportId: number;
  reportLocation: string;
  reportOwnerUserId: number;
  submission: CleanupSubmissionWithVotes;
};

export type VoteQueueResponse = {
  trashVerifications: TrashVerificationQueueItem[];
  cleanupVerifications: CleanupVerificationQueueItem[];
};

export type ReportStatusFilter = 'pending' | 'verified' | 'disputed' | 'cleaned' | 'rejected' | 'open' | 'cleanup_pending_vote' | 'needs_votes';

export type CreateReportPayload = {
  location: string;
  description: string;
  size: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  imageSizeBytes?:number;
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

export type LeaderboardUser = User & {
  reportsCreated: number;
  cleanupsApproved: number;
  reportVerificationVotes: number;
  verificationVotes: number;
};

import type { LeaderboardData, LeaderboardEntry } from './components/Leaderboard/LeaderboardTypes';

// 2. Export functions that use that URL
export const fetchReports = async (status?: ReportStatusFilter): Promise<Report[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`${API_BASE_URL}/api/reports${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchReportById = async (reportId: number): Promise<ReportDetails> => {
  const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Report not found');
    throw new Error('Failed to fetch report details');
  }
  return response.json();
};

export type PaginatedUsers = {
  users: User[];
  page: number;
  limit: number;
  total: number;
};

/** Admin only — requires a valid JWT with role `admin`. */
export const fetchUsers = async (
  page = 1,
  limit = 20
): Promise<PaginatedUsers> => {
  const response = await fetch(
    `${API_BASE_URL}/api/users?page=${page}&limit=${limit}`,
    { headers: { ...authHeaders() } }
  );
  const data = (await response.json()) as PaginatedUsers | { error?: string };
  if (!response.ok) {
    throw new Error(
      typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Failed to fetch users'
    );
  }
  return data as PaginatedUsers;
};

export const fetchLeaderboard = async (timePeriod: 'allTime' | 'monthly' | 'weekly'): Promise<LeaderboardData> => {
  const response = await fetch(`${API_BASE_URL}/api/users/leaderboard?limit=100`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message =
      response.status === 401
        ? 'Log in to view the leaderboard'
        : typeof errBody === 'object' &&
            errBody &&
            'error' in errBody &&
            typeof (errBody as { error: unknown }).error === 'string'
          ? (errBody as { error: string }).error
          : 'Failed to fetch leaderboard';
    throw new Error(message);
  }
  
  const users = (await response.json()) as LeaderboardUser[];
  
  // Transform backend response to LeaderboardData format
  const entries: LeaderboardEntry[] = users.map((user: LeaderboardUser, index: number) => ({
    id: user.id,
    username: user.username || `User${user.id}`,
    email: user.email,
    points: user.points,
    rank: index + 1,
    profilePictureUrl: null,
    reportsSubmitted: user.reportsCreated,
    reportsResolved: user.cleanupsApproved,
    verificationVotes: user.verificationVotes,
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

export type ActivityHeatmapData = {
  weeks: number
  /** 7 rows (Sun–Sat) × weeks columns, values 0–3 */
  grid: number[][]
}

const EMPTY_ACTIVITY_GRID: ActivityHeatmapData = {
  weeks: 9,
  grid: Array.from({ length: 7 }, () => Array.from({ length: 9 }, () => 0)),
}

export const emptyActivityHeatmap = (): ActivityHeatmapData => ({
  weeks: EMPTY_ACTIVITY_GRID.weeks,
  grid: EMPTY_ACTIVITY_GRID.grid.map((row) => [...row]),
})

/** Full profile returned by GET /api/users/me */
export type MeUser = AuthUser & {
  username: string | null
  weeklyPoints: number
  badges: string[]
  currentStreak: number
  longestStreak: number
  activity: ActivityHeatmapData
  reportsCreated: number
  cleanupsApproved: number
  reportVerificationVotes: number
  verificationVotes: number
  rank: number
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

export type RegisterResponse = {
  message: string
}

export type MessageResponse = {
  message: string
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
): Promise<RegisterResponse> => {
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

export const verifyEmail = async (email: string, token: string): Promise<MessageResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Email verification failed')
  }
  return data
}

export const resendVerification = async (email: string): Promise<MessageResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Could not resend verification email')
  }
  return data
}

export const googleSignIn = async (idToken: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Google sign-in failed')
  }
  return data
}

export const googleSignInWithAccessToken = async (accessToken: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Google sign-in failed')
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

// ── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads an image file to Garage via the backend and returns the public URL.
 * Requires an authenticated user (JWT token in localStorage).
 */
export const uploadReportImage = async (file: File): Promise<{imageUrl: string; imageSizeBytes: number}> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to upload image');
  }

  return data as { imageUrl: string; imageSizeBytes: number };
};

// ── Reports ──────────────────────────────────────────────────────────────────

export const createReport = async (newReport: CreateReportPayload): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(newReport),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(()=> ({}));
    throw new Error(
      typeof errorData?.error === 'string' ? errorData.error : 'Failed to create report');
  }

  return response.json();
};

export const createCleanupSubmission = async (
  reportId: number,
  payload: { imageUrl: string; note?: string }
): Promise<CleanupSubmission & { voteSummary: VoteSummary }> => {
  const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/cleanup-submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Failed to submit cleanup proof';
    throw new Error(message);
  }

  return data as CleanupSubmission & { voteSummary: VoteSummary };
};

export const voteOnCleanupSubmission = async (
  reportId: number,
  submissionId: number,
  vote: 'clean' | 'not_clean'
): Promise<VoteOnCleanupResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/reports/${reportId}/cleanup-submissions/${submissionId}/votes`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ vote }),
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Failed to submit vote';
    throw new Error(message);
  }

  return data as VoteOnCleanupResponse;
};

export const voteOnReportVerification = async (
  reportId: number,
  vote: 'legit' | 'not_trash'
): Promise<VoteOnReportVerificationResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/reports/${reportId}/verification-votes`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ vote }),
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Failed to submit vote';
    throw new Error(message);
  }

  return data as VoteOnReportVerificationResponse;
};

export const fetchVoteQueue = async (): Promise<VoteQueueResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/reports/vote-queue`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch vote queue');
  return response.json() as Promise<VoteQueueResponse>;
};
