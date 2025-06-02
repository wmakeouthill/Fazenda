export interface Player {
  id: string;
  discordUsername: string;
  summonerName: string;
  rank: string;
  tier: string;
  leaguePoints: number;
  farmRank: number;
  avatar?: string;
  joinDate: Date;
  lastSeen: Date;
  isActive: boolean;
  preferredRoles: string[];
  currentRank?: string;
  currentTier?: string;
}

export interface ChampionStats {
  championId: number;
  championName: string;
  championIcon: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKDA: {
    kills: number;
    deaths: number;
    assists: number;
    ratio: number;
  };
  averageCS: number;
  averageGoldPerMinute: number;
  averageDamagePerMinute: number;
}

export interface PlayerStats {
  playerId: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKDA: {
    kills: number;
    deaths: number;
    assists: number;
    ratio: number;
  };
  averageCS: number;
  averageGameDuration: number;
  favoriteRole: string;
  championStats: ChampionStats[];
  mainChampions: ChampionStats[];
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  mvpCount: number;
  farmPoints: number; // Points system for the farm community
}

export interface Match {
  id: string;
  gameId: string;
  gameMode: string;
  gameType: string;
  gameCreation: Date;
  gameDuration: number;
  participants: MatchParticipant[];
  teams: MatchTeam[];
  winner: 'blue' | 'red';
  version: string;
}

export interface MatchParticipant {
  playerId: string;
  summonerName: string;
  championId: number;
  championName: string;
  role: string;
  teamId: 'blue' | 'red';
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  damage: number;
  vision: number;
  items: number[];
  spells: number[];
  runes: any;
  isWinner: boolean;
  mvp: boolean;
}

export interface MatchTeam {
  teamId: 'blue' | 'red';
  isWinner: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalGold: number;
  totalDamage: number;
  towers: number;
  dragons: number;
  barons: number;
  heralds: number;
}

export interface Leaderboard {
  type: 'winRate' | 'kda' | 'farmPoints' | 'mvp' | 'streak';
  title: string;
  players: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  summonerName: string;
  discordUsername: string;
  avatar?: string;
  value: number;
  displayValue: string;
  change: number; // +/- from last update
}

export interface FarmEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  organizer: string;
  location?: string;
  maxParticipants: number;
  participants?: EventParticipant[];
  requirements?: string[];
  reward: EventReward;
  status: EventStatus;
  rules?: string[];
  tags?: string[];
}

export type EventType = 'tournament' | 'workshop' | 'harvest' | 'community' | 'seasonal' | 'challenge';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface EventParticipant {
  playerId: string;
  summonerName: string;
  joinDate: string;
  status: 'confirmed' | 'pending' | 'declined';
}

export interface EventReward {
  farmPoints?: number;
  title?: string;
  item?: string;
  description?: string;
}
