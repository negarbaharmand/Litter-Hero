import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from '../api';
import { type LeaderboardData } from '../components/Leaderboard/LeaderboardTypes';

export type TimePeriod = 'allTime' | 'monthly' | 'weekly';

export const useLeaderboard = (timePeriod: TimePeriod = 'allTime') => {
  return useQuery<LeaderboardData>({
    queryKey: ['leaderboard', timePeriod], 
    queryFn: async () => {
      return fetchLeaderboard(timePeriod);
    },
    staleTime: 1000 * 60 * 5, // Data är "fräsch" i 5 minuter
  });
};