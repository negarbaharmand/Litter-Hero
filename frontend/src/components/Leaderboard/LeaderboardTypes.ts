//structuren för varje "entry" i leaderboarden
export type LeaderboardEntry = {
  id: number;
  profilePictureUrl: string | null;
  username: string;
  email: string;
  points: number;
  rank: number;
  reportsSubmitted: number;
  reportsResolved: number;
  createdAt: string;
};

//filter för att välja tidsperioden på leaderboarden
export type TimePeriod = 'allTime' | 'monthly' | 'weekly';

//strukturen för datan som kommer från API
export type LeaderboardData = {
  timePeriod: TimePeriod;
  entries: LeaderboardEntry[];
  lastUpdated: string;
};