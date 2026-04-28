import { useQuery } from '@tanstack/react-query';
import { getMockLeaderboardData } from '../components/Leaderboard/mockData';
import { type LeaderboardData } from '../components/Leaderboard/LeaderboardTypes';

export type TimePeriod = 'allTime' | 'monthly' | 'weekly';

export const useLeaderboard = (timePeriod: TimePeriod = 'allTime') => {
  return useQuery<LeaderboardData>({
    queryKey: ['leaderboard', timePeriod], 
    queryFn: async () => {
    

      return getMockLeaderboardData(timePeriod);
    },
    staleTime: 1000 * 60 * 5, // Data är "fräsch" i 5 minuter
  });
};