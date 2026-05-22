import { type LeaderboardEntry, type LeaderboardData } from './LeaderboardTypes';

// Mock data för att testa Leaderboard komponeneten 
const allTimeData: LeaderboardEntry[] = [
  {
    id: 1,
    username: 'alex123',
    profilePictureUrl: 'https://example.com/alex.jpg',
    email: 'alex@example.com',
    points: 450,
    rank: 1,
    reportsSubmitted: 12,
    reportsResolved: 8,
    verificationVotes: 15,
    createdAt: '2025-01-15',
  },
  {
    id: 2,
    username: 'jordan123',
    profilePictureUrl: 'https://example.com/jordan.jpg',
    email: 'jordan@example.com',
    points: 380,
    rank: 2,
    reportsSubmitted: 10,
    reportsResolved: 7,
    verificationVotes: 10,
    createdAt: '2025-02-01',
  },
  {
    id: 3,
    username: 'sam123',
    profilePictureUrl: 'https://example.com/sam.jpg',
    email: 'sam@example.com',
    points: 320,
    rank: 3,
    reportsSubmitted: 9,
    reportsResolved: 5,
    verificationVotes: 7,
    createdAt: '2025-01-20',
  },
  {
    id: 4,
    username: 'casey123',
    profilePictureUrl: 'https://example.com/casey.jpg',
    email: 'casey@example.com',
    points: 280,
    rank: 4,
    reportsSubmitted: 8,
    reportsResolved: 4,
    verificationVotes: 6,
    createdAt: '2025-03-05',
  },
  {
    id: 5,
    username: 'morgan123',
    profilePictureUrl: 'https://example.com/morgan.jpg',
    email: 'morgan@example.com',
    points: 210,
    rank: 5,
    reportsSubmitted: 6,
    reportsResolved: 3,
    verificationVotes: 4,
    createdAt: '2025-03-10',
  },
];

// Mock data för monthly leaderboard 
const monthlyData: LeaderboardEntry[] = [
  {
    id: 2,
    username: 'jordan123',
    profilePictureUrl: 'https://example.com/jordan.jpg',
    email: 'jordan@example.com',
    points: 120,
    rank: 1,
    reportsSubmitted: 4,
    reportsResolved: 3,
    verificationVotes: 5,
    createdAt: '2025-02-01',
  },
  {
    id: 1,
    username: 'alex123',
    profilePictureUrl: 'https://example.com/alex.jpg',
    email: 'alex@example.com',
    points: 85,
    rank: 2,
    reportsSubmitted: 3,
    reportsResolved: 2,
    verificationVotes: 4,
    createdAt: '2025-01-15',
  },
  {
    id: 5,
    username: 'morgan123',
    profilePictureUrl: 'https://example.com/morgan.jpg',
    email: 'morgan@example.com',
    points: 70,
    rank: 3,
    reportsSubmitted: 2,
    reportsResolved: 1,
    verificationVotes: 3,
    createdAt: '2025-03-10',
  },
];

// Mock data för weekly leaderboard
const weeklyData: LeaderboardEntry[] = [
  {
    id: 3,
    username: 'sam123',
    profilePictureUrl: 'https://example.com/sam.jpg',
    email: 'sam@example.com',
    points: 45,
    rank: 1,
    reportsSubmitted: 2,
    reportsResolved: 1,
    verificationVotes: 2,
    createdAt: '2025-01-20',
  },
  {
    id: 4,
    username: 'casey123',
    profilePictureUrl: 'https://example.com/casey.jpg',
    email: 'casey@example.com',
    points: 35,
    rank: 2,
    reportsSubmitted: 1,
    reportsResolved: 1,
    verificationVotes: 1,
    createdAt: '2025-03-05',
  },
];

// Function för att hämta mock data baserat på vald tidsperiod
export const getMockLeaderboardData = (timePeriod: 'allTime' | 'monthly' | 'weekly'): LeaderboardData => {
  const dataMap = {
    allTime: allTimeData,
    monthly: monthlyData,
    weekly: weeklyData,
  };

  return {
    timePeriod,
    entries: dataMap[timePeriod],
    lastUpdated: new Date().toISOString(),
  };
};