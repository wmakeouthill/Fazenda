import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  Player,
  PlayerStats,
  Match,
  ChampionStats,
  Leaderboard,
  LeaderboardEntry,
  FarmEvent
} from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private playersSubject = new BehaviorSubject<Player[]>(this.getMockPlayers());
  private statsSubject = new BehaviorSubject<PlayerStats[]>(this.getMockPlayerStats());
  private matchesSubject = new BehaviorSubject<Match[]>(this.getMockMatches());

  constructor() {}

  getPlayers(): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  getPlayerStats(): Observable<PlayerStats[]> {
    return this.statsSubject.asObservable();
  }

  getMatches(): Observable<Match[]> {
    return this.matchesSubject.asObservable();
  }

  getPlayerById(id: string): Observable<Player | undefined> {
    const players = this.playersSubject.value;
    return of(players.find(p => p.id === id));
  }

  getPlayerStatsById(playerId: string): Observable<PlayerStats | undefined> {
    const stats = this.statsSubject.value;
    return of(stats.find(s => s.playerId === playerId));
  }

  getLeaderboards(): Observable<Leaderboard[]> {
    return of(this.getMockLeaderboards());
  }

  getFarmEvents(): Observable<FarmEvent[]> {
    return of(this.getMockFarmEvents());
  }

  private getMockPlayers(): Player[] {
    return [
      {
        id: '1',
        discordUsername: 'FarmBoy#1234',
        summonerName: 'TractorMaster',
        rank: 'GOLD',
        tier: 'II',
        leaguePoints: 1847,
        farmRank: 1,
        avatar: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/4411.jpg',
        joinDate: new Date('2023-03-15'),
        isActive: true
      },
      {
        id: '2',
        discordUsername: 'CornField#5678',
        summonerName: 'HarvestMoon',
        rank: 'SILVER',
        tier: 'I',
        leaguePoints: 1654,
        farmRank: 2,
        avatar: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/4412.jpg',
        joinDate: new Date('2023-04-20'),
        isActive: true
      },
      {
        id: '3',
        discordUsername: 'WheatKing#9101',
        summonerName: 'GrainGod',
        rank: 'PLATINUM',
        tier: 'IV',
        leaguePoints: 1432,
        farmRank: 3,
        avatar: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/4413.jpg',
        joinDate: new Date('2023-02-10'),
        isActive: true
      },
      {
        id: '4',
        discordUsername: 'PotatoPatch#1122',
        summonerName: 'SpudSlayer',
        rank: 'GOLD',
        tier: 'III',
        leaguePoints: 1398,
        farmRank: 4,
        avatar: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/4414.jpg',
        joinDate: new Date('2023-05-05'),
        isActive: true
      },
      {
        id: '5',
        discordUsername: 'BarnOwl#3344',
        summonerName: 'NightHarvest',
        rank: 'SILVER',
        tier: 'II',
        leaguePoints: 1276,
        farmRank: 5,
        avatar: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/4415.jpg',
        joinDate: new Date('2023-06-12'),
        isActive: true
      }
    ];
  }

  private getMockPlayerStats(): PlayerStats[] {
    return [
      {
        playerId: '1',
        totalGames: 147,
        wins: 89,
        losses: 58,
        winRate: 60.5,
        averageKDA: { kills: 7.2, deaths: 4.1, assists: 8.9, ratio: 3.9 },
        averageCS: 167.3,
        averageGameDuration: 1847,
        favoriteRole: 'ADC',
        championStats: this.getMockChampionStats('1'),
        currentStreak: 3,
        longestWinStreak: 8,
        longestLossStreak: 4,
        mvpCount: 23,
        farmPoints: 2850
      },
      {
        playerId: '2',
        totalGames: 132,
        wins: 76,
        losses: 56,
        winRate: 57.6,
        averageKDA: { kills: 5.8, deaths: 3.9, assists: 11.2, ratio: 4.3 },
        averageCS: 145.7,
        averageGameDuration: 1923,
        favoriteRole: 'Support',
        championStats: this.getMockChampionStats('2'),
        currentStreak: -2,
        longestWinStreak: 6,
        longestLossStreak: 5,
        mvpCount: 18,
        farmPoints: 2640
      },
      {
        playerId: '3',
        totalGames: 98,
        wins: 62,
        losses: 36,
        winRate: 63.3,
        averageKDA: { kills: 8.1, deaths: 3.2, assists: 6.7, ratio: 4.6 },
        averageCS: 201.4,
        averageGameDuration: 1756,
        favoriteRole: 'Mid',
        championStats: this.getMockChampionStats('3'),
        currentStreak: 5,
        longestWinStreak: 9,
        longestLossStreak: 3,
        mvpCount: 31,
        farmPoints: 2940
      },
      {
        playerId: '4',
        totalGames: 156,
        wins: 84,
        losses: 72,
        winRate: 53.8,
        averageKDA: { kills: 6.4, deaths: 5.2, assists: 7.8, ratio: 2.7 },
        averageCS: 134.2,
        averageGameDuration: 2034,
        favoriteRole: 'Jungle',
        championStats: this.getMockChampionStats('4'),
        currentStreak: 1,
        longestWinStreak: 7,
        longestLossStreak: 6,
        mvpCount: 15,
        farmPoints: 2380
      },
      {
        playerId: '5',
        totalGames: 89,
        wins: 45,
        losses: 44,
        winRate: 50.6,
        averageKDA: { kills: 4.9, deaths: 4.8, assists: 9.1, ratio: 2.9 },
        averageCS: 158.9,
        averageGameDuration: 1892,
        favoriteRole: 'Top',
        championStats: this.getMockChampionStats('5'),
        currentStreak: -1,
        longestWinStreak: 4,
        longestLossStreak: 7,
        mvpCount: 12,
        farmPoints: 2110
      }
    ];
  }

  private getMockChampionStats(playerId: string): ChampionStats[] {
    const championsByPlayer: { [key: string]: ChampionStats[] } = {
      '1': [
        {
          championId: 22,
          championName: 'Ashe',
          championIcon: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ashe.png',
          gamesPlayed: 35,
          wins: 23,
          losses: 12,
          winRate: 65.7,
          averageKDA: { kills: 8.2, deaths: 3.8, assists: 9.1, ratio: 4.5 },
          averageCS: 178.3,
          averageGoldPerMinute: 456.7,
          averageDamagePerMinute: 612.3
        },
        {
          championId: 51,
          championName: 'Caitlyn',
          championIcon: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Caitlyn.png',
          gamesPlayed: 28,
          wins: 19,
          losses: 9,
          winRate: 67.9,
          averageKDA: { kills: 7.8, deaths: 4.2, assists: 8.3, ratio: 3.8 },
          averageCS: 172.1,
          averageGoldPerMinute: 478.2,
          averageDamagePerMinute: 634.7
        }
      ],
      '2': [
        {
          championId: 40,
          championName: 'Janna',
          championIcon: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Janna.png',
          gamesPlayed: 42,
          wins: 28,
          losses: 14,
          winRate: 66.7,
          averageKDA: { kills: 2.1, deaths: 2.8, assists: 14.2, ratio: 5.8 },
          averageCS: 32.4,
          averageGoldPerMinute: 287.3,
          averageDamagePerMinute: 156.8
        }
      ],
      '3': [
        {
          championId: 157,
          championName: 'Yasuo',
          championIcon: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png',
          gamesPlayed: 31,
          wins: 22,
          losses: 9,
          winRate: 71.0,
          averageKDA: { kills: 9.3, deaths: 3.1, assists: 6.2, ratio: 5.0 },
          averageCS: 198.7,
          averageGoldPerMinute: 523.4,
          averageDamagePerMinute: 687.9
        }
      ],
      '4': [
        {
          championId: 64,
          championName: 'Lee Sin',
          championIcon: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/LeeSin.png',
          gamesPlayed: 38,
          wins: 21,
          losses: 17,
          winRate: 55.3,
          averageKDA: { kills: 7.2, deaths: 5.8, assists: 8.1, ratio: 2.6 },
          averageCS: 142.6,
          averageGoldPerMinute: 398.7,
          averageDamagePerMinute: 423.2
        }
      ],
      '5': [
        {
          championId: 58,
          championName: 'Renekton',
          championIcon: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Renekton.png',
          gamesPlayed: 25,
          wins: 14,
          losses: 11,
          winRate: 56.0,
          averageKDA: { kills: 5.8, deaths: 4.2, assists: 7.3, ratio: 3.1 },
          averageCS: 164.2,
          averageGoldPerMinute: 412.8,
          averageDamagePerMinute: 534.6
        }
      ]
    };

    return championsByPlayer[playerId] || [];
  }

  private getMockMatches(): Match[] {
    // This would be a more complex mock in a real implementation
    return [];
  }

  private getMockLeaderboards(): Leaderboard[] {
    const players = this.getMockPlayers();
    const stats = this.getMockPlayerStats();

    return [
      {
        type: 'farmPoints',
        title: 'Farm Points Ranking',
        players: stats
          .sort((a, b) => b.farmPoints - a.farmPoints)
          .map((stat, index) => {
            const player = players.find(p => p.id === stat.playerId)!;
            return {
              rank: index + 1,
              playerId: stat.playerId,
              summonerName: player.summonerName,
              avatar: player.avatar,
              value: stat.farmPoints,
              displayValue: stat.farmPoints.toString(),
              change: Math.floor(Math.random() * 100) - 50
            };
          })
      },
      {
        type: 'winRate',
        title: 'Win Rate Leaders',
        players: stats
          .filter(s => s.totalGames >= 20)
          .sort((a, b) => b.winRate - a.winRate)
          .map((stat, index) => {
            const player = players.find(p => p.id === stat.playerId)!;
            return {
              rank: index + 1,
              playerId: stat.playerId,
              summonerName: player.summonerName,
              avatar: player.avatar,
              value: stat.winRate,
              displayValue: `${stat.winRate.toFixed(1)}%`,
              change: Math.floor(Math.random() * 10) - 5
            };
          })
      },
      {
        type: 'kda',
        title: 'KDA Champions',
        players: stats
          .sort((a, b) => b.averageKDA.ratio - a.averageKDA.ratio)
          .map((stat, index) => {
            const player = players.find(p => p.id === stat.playerId)!;
            return {
              rank: index + 1,
              playerId: stat.playerId,
              summonerName: player.summonerName,
              avatar: player.avatar,
              value: stat.averageKDA.ratio,
              displayValue: stat.averageKDA.ratio.toFixed(1),
              change: Math.floor(Math.random() * 2) - 1
            };
          })
      }
    ];
  }

  private getMockFarmEvents(): FarmEvent[] {
    return [
      {
        id: '1',
        type: 'tournament',
        title: 'Copa da Fazenda - Inverno 2025',
        description: 'Torneio eliminatório com premiação em RP e skins!',
        date: new Date('2025-06-15T19:00:00'),
        participants: ['1', '2', '3', '4'],
        maxParticipants: 10,
        status: 'upcoming',
        prize: '3000 RP + Skin Hextech',
        rules: [
          'Máximo 2 jogadores por tier',
          'Formato eliminatório simples',
          'Pick/ban draft mode'
        ]
      },
      {
        id: '2',
        type: 'fun',
        title: 'All Random All Mid Night',
        description: 'Noite de ARAM com a galera da fazenda!',
        date: new Date('2025-06-05T21:00:00'),
        participants: ['1', '2', '3', '4', '5'],
        status: 'upcoming'
      },
      {
        id: '3',
        type: 'ranked',
        title: 'Inhouse Ranked #47',
        description: 'Partida ranqueada da fila inhouse',
        date: new Date('2025-06-01T20:30:00'),
        participants: ['1', '3', '4', '5'],
        status: 'completed'
      }
    ];
  }
}
