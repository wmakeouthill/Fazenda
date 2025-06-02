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
  isActive: boolean;
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
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  summonerName: string;
  avatar?: string;
  value: number;
  displayValue: string;
  change: number; // +/- from last update
}

export interface FarmEvent {
  id: string;
  type: 'tournament' | 'scrim' | 'fun' | 'ranked';
  title: string;
  description: string;
  date: Date;
  participants: string[];
  maxParticipants?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  prize?: string;
  rules?: string[];
}
