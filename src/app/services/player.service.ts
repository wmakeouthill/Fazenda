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
  getEvents(): Observable<FarmEvent[]> {
    return of(this.getMockFarmEvents());
  }

  private getMockPlayers(): Player[] {
    return [      {
        id: '1',
        discordUsername: 'FarmBoy#1234',
        summonerName: 'TractorMaster',
        rank: 'GOLD',
        tier: 'II',
        leaguePoints: 1847,
        farmRank: 1,
        avatar: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/4411.jpg',
        joinDate: new Date('2023-03-15'),
        lastSeen: new Date('2025-06-01'),
        isActive: true,
        preferredRoles: ['mid', 'adc'],
        currentRank: 'GOLD',
        currentTier: 'II'
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
        lastSeen: new Date('2025-05-30'),
        isActive: true,
        preferredRoles: ['jungle', 'support'],
        currentRank: 'SILVER',
        currentTier: 'I'
      },      {
        id: '3',
        discordUsername: 'WheatKing#9101',
        summonerName: 'GrainGod',
        rank: 'PLATINUM',
        tier: 'IV',
        leaguePoints: 1432,
        farmRank: 3,
        avatar: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/4413.jpg',
        joinDate: new Date('2023-02-10'),
        lastSeen: new Date('2025-06-02'),
        isActive: true,
        preferredRoles: ['top', 'mid'],
        currentRank: 'PLATINUM',
        currentTier: 'IV'
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
        lastSeen: new Date('2025-05-28'),
        isActive: true,
        preferredRoles: ['adc', 'mid'],
        currentRank: 'GOLD',
        currentTier: 'III'
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
        lastSeen: new Date('2025-05-25'),
        isActive: true,
        preferredRoles: ['support', 'jungle'],
        currentRank: 'SILVER',
        currentTier: 'II'
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
        averageGameDuration: 1847,        favoriteRole: 'ADC',
        championStats: this.getMockChampionStats('1'),
        mainChampions: this.getMockChampionStats('1').slice(0, 3),
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
        averageGameDuration: 1923,        favoriteRole: 'Support',
        championStats: this.getMockChampionStats('2'),
        mainChampions: this.getMockChampionStats('2').slice(0, 3),
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
        averageGameDuration: 1756,        favoriteRole: 'Mid',
        championStats: this.getMockChampionStats('3'),
        mainChampions: this.getMockChampionStats('3').slice(0, 3),
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
        averageGameDuration: 2034,        favoriteRole: 'Jungle',
        championStats: this.getMockChampionStats('4'),
        mainChampions: this.getMockChampionStats('4').slice(0, 3),
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
        averageGameDuration: 1892,        favoriteRole: 'Top',
        championStats: this.getMockChampionStats('5'),
        mainChampions: this.getMockChampionStats('5').slice(0, 3),
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

    return [      {
        type: 'farmPoints',
        title: 'Farm Points Ranking',
        lastUpdated: new Date(),
        players: stats
          .sort((a, b) => b.farmPoints - a.farmPoints)
          .map((stat, index) => {
            const player = players.find(p => p.id === stat.playerId)!;            return {
              rank: index + 1,
              playerId: stat.playerId,
              summonerName: player.summonerName,
              discordUsername: player.discordUsername,
              avatar: player.avatar,
              value: stat.farmPoints,
              displayValue: stat.farmPoints.toString(),
              change: Math.floor(Math.random() * 100) - 50
            };
          })
      },      {
        type: 'winRate',
        title: 'Win Rate Leaders',
        lastUpdated: new Date(),
        players: stats
          .filter(s => s.totalGames >= 20)
          .sort((a, b) => b.winRate - a.winRate)
          .map((stat, index) => {
            const player = players.find(p => p.id === stat.playerId)!;            return {
              rank: index + 1,
              playerId: stat.playerId,
              summonerName: player.summonerName,
              discordUsername: player.discordUsername,
              avatar: player.avatar,
              value: stat.winRate,
              displayValue: `${stat.winRate.toFixed(1)}%`,
              change: Math.floor(Math.random() * 10) - 5
            };
          })
      },      {
        type: 'kda',
        title: 'KDA Champions',
        lastUpdated: new Date(),
        players: stats
          .sort((a, b) => b.averageKDA.ratio - a.averageKDA.ratio)
          .map((stat, index) => {
            const player = players.find(p => p.id === stat.playerId)!;            return {
              rank: index + 1,
              playerId: stat.playerId,
              summonerName: player.summonerName,
              discordUsername: player.discordUsername,
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
        name: 'Copa da Fazenda - Inverno 2025',
        description: 'Torneio eliminatório com premiação em RP e skins! Venha mostrar suas habilidades na Summoner\'s Rift.',
        type: 'tournament',
        startDate: '2025-06-15T19:00:00',
        endDate: '2025-06-15T23:00:00',
        organizer: 'FarmBoy#1234',
        location: 'Discord - Canal de Voz Fazenda',
        maxParticipants: 16,
        participants: [
          { playerId: '1', summonerName: 'TractorMaster', joinDate: '2025-06-01T10:00:00', status: 'confirmed' },
          { playerId: '2', summonerName: 'HarvestMoon', joinDate: '2025-06-01T11:30:00', status: 'confirmed' },
          { playerId: '3', summonerName: 'GrainGod', joinDate: '2025-06-01T14:20:00', status: 'confirmed' },
          { playerId: '4', summonerName: 'SpudSlayer', joinDate: '2025-06-02T09:15:00', status: 'pending' }
        ],
        requirements: [
          'Mínimo Rank Silver',
          'Discord obrigatório',
          'Não ter recebido punições recentes'
        ],
        reward: {
          farmPoints: 500,
          item: '3000 RP + Skin Hextech',
          description: 'Premiação especial para os 3 primeiros colocados'
        },
        status: 'upcoming',
        rules: [
          'Formato eliminatório simples',
          'Máximo 2 jogadores por tier',
          'Pick/ban draft mode',
          'Proibido duo queue durante o evento'
        ],
        tags: ['torneio', 'premiação', 'competitivo']
      },
      {
        id: '2',
        name: 'Workshop: Como Farmar Melhor',
        description: 'Aprenda técnicas avançadas de farm e controle de wave com nossos veteranos!',
        type: 'workshop',
        startDate: '2025-06-08T18:00:00',
        endDate: '2025-06-08T20:00:00',
        organizer: 'WheatKing#9101',
        location: 'Discord - Sala de Estudos',
        maxParticipants: 20,
        participants: [
          { playerId: '5', summonerName: 'NightHarvest', joinDate: '2025-05-28T16:45:00', status: 'confirmed' },
          { playerId: '6', summonerName: 'SeedMaster', joinDate: '2025-05-29T12:30:00', status: 'confirmed' }
        ],
        requirements: [
          'Interesse em melhorar mechanics',
          'Ter Discord',
          'Trazer replays para análise'
        ],
        reward: {
          farmPoints: 100,
          title: 'Estudioso da Fazenda',
          description: 'Título especial para participantes ativos'
        },
        status: 'upcoming',
        rules: [
          'Participação ativa nas discussões',
          'Respeito aos colegas',
          'Câmera ligada se possível'
        ],
        tags: ['educacional', 'workshop', 'farm']
      },
      {
        id: '3',
        name: 'All Random All Mid Night',
        description: 'Noite de ARAM com a galera da fazenda! Diversão garantida com picks aleatórios.',
        type: 'community',
        startDate: '2025-06-05T21:00:00',
        endDate: '2025-06-06T01:00:00',
        organizer: 'CornField#5678',
        location: 'League of Legends - ARAM',
        maxParticipants: 30,
        participants: [
          { playerId: '1', summonerName: 'TractorMaster', joinDate: '2025-05-30T19:20:00', status: 'confirmed' },
          { playerId: '2', summonerName: 'HarvestMoon', joinDate: '2025-05-30T20:15:00', status: 'confirmed' },
          { playerId: '3', summonerName: 'GrainGod', joinDate: '2025-05-31T08:45:00', status: 'confirmed' },
          { playerId: '4', summonerName: 'SpudSlayer', joinDate: '2025-05-31T16:30:00', status: 'confirmed' },
          { playerId: '5', summonerName: 'NightHarvest', joinDate: '2025-06-01T11:00:00', status: 'confirmed' }
        ],
        requirements: [
          'Bom humor',
          'Paciência com RNG',
          'Discord para comunicação'
        ],
        reward: {
          farmPoints: 50,
          description: 'Farm Points para todos os participantes'
        },
        status: 'ongoing',
        rules: [
          'Modo ARAM apenas',
          'Sem flame ou toxicidade',
          'Diversão em primeiro lugar'
        ],
        tags: ['aram', 'diversão', 'casual']
      },
      {
        id: '4',
        name: 'Colheita de Outono - Evento Sazonal',
        description: 'Evento especial de temporada com missões exclusivas e recompensas temáticas!',
        type: 'seasonal',
        startDate: '2025-06-20T00:00:00',
        endDate: '2025-06-27T23:59:59',
        organizer: 'Sistema da Fazenda',
        maxParticipants: 100,
        participants: [],
        requirements: [
          'Ser membro ativo da fazenda',
          'Completar pelo menos 5 partidas durante o evento'
        ],
        reward: {
          farmPoints: 300,
          item: 'Skin Temática de Outono',
          title: 'Colhedor de Outono',
          description: 'Recompensas especiais baseadas na participação'
        },
        status: 'upcoming',
        rules: [
          'Missões diárias disponíveis',
          'Pontuação baseada em performance',
          'Colaboração entre membros incentivada'
        ],
        tags: ['sazonal', 'missões', 'outono', 'colaborativo']
      },
      {
        id: '5',
        name: 'Desafio: 1v1 na Fazenda',
        description: 'Torneio de 1v1 na Howling Abyss. Prove quem é o verdadeiro rei da farm!',
        type: 'challenge',
        startDate: '2025-06-12T20:00:00',
        endDate: '2025-06-12T22:30:00',
        organizer: 'PotatoPatch#1122',
        location: 'Howling Abyss',
        maxParticipants: 8,
        participants: [
          { playerId: '1', summonerName: 'TractorMaster', joinDate: '2025-06-02T15:30:00', status: 'confirmed' },
          { playerId: '3', summonerName: 'GrainGod', joinDate: '2025-06-02T16:45:00', status: 'confirmed' }
        ],
        requirements: [
          'Mínimo 100 partidas ranqueadas na season',
          'Sem restrictions recentes',
          'Discord obrigatório'
        ],
        reward: {
          farmPoints: 200,
          title: 'Duelista da Fazenda',
          description: 'Título exclusivo para o campeão'
        },
        status: 'upcoming',
        rules: [
          'Primeira kill, primeira torre ou 100 CS = vitória',
          'Picks simultâneos',
          'Proibido: Teemo, Heimerdinger, Malzahar'
        ],
        tags: ['1v1', 'desafio', 'competitivo', 'individual']
      },
      {
        id: '6',
        name: 'Inhouse Ranked #47',
        description: 'Partida ranqueada da fila inhouse. Venha subir no ranking da fazenda!',
        type: 'tournament',
        startDate: '2025-06-01T20:30:00',
        endDate: '2025-06-01T21:45:00',
        organizer: 'Sistema Automático',
        location: 'Summoner\'s Rift',
        maxParticipants: 10,
        participants: [
          { playerId: '1', summonerName: 'TractorMaster', joinDate: '2025-06-01T20:25:00', status: 'confirmed' },
          { playerId: '3', summonerName: 'GrainGod', joinDate: '2025-06-01T20:26:00', status: 'confirmed' },
          { playerId: '4', summonerName: 'SpudSlayer', joinDate: '2025-06-01T20:27:00', status: 'confirmed' },
          { playerId: '5', summonerName: 'NightHarvest', joinDate: '2025-06-01T20:28:00', status: 'confirmed' }
        ],
        requirements: [
          'Estar na fila inhouse',
          'Rank mínimo Bronze',
          'Discord ativo'
        ],
        reward: {
          farmPoints: 75,
          description: 'Farm Points baseados na performance'
        },
        status: 'completed',
        rules: [
          'Draft pick padrão',
          'Reporting obrigatório',
          'Fair play sempre'
        ],        tags: ['inhouse', 'ranqueada', 'competitivo']
      }
    ];
  }
}
