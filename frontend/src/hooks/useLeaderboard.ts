import { useQuery } from '@tanstack/react-query';
<<<<<<< HEAD
import { fetchLeaderboard } from '../api';
=======
import { getMockLeaderboardData } from '../components/Leaderboard/mockData';
>>>>>>> origin/main
import { type LeaderboardData } from '../components/Leaderboard/LeaderboardTypes';

export type TimePeriod = 'allTime' | 'monthly' | 'weekly';

export const useLeaderboard = (timePeriod: TimePeriod = 'allTime') => {
  return useQuery<LeaderboardData>({
    queryKey: ['leaderboard', timePeriod], 
    queryFn: async () => {
<<<<<<< HEAD
      return fetchLeaderboard(timePeriod);
=======
    

      return getMockLeaderboardData(timePeriod);
>>>>>>> origin/main
    },
    staleTime: 1000 * 60 * 5, // Data är "fräsch" i 5 minuter
  });
};