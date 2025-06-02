import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, map, catchError } from 'rxjs';
import {
  Player,
  PlayerStats,
  Match,
  ChampionStats,
  Leaderboard,
  LeaderboardEntry,
  FarmEvent
} from '../models/player.model';

// Interface para dados do backend
interface BackendPlayerEntry {
  id: number;
  name: string;
  most_played_role_name: string;
  most_played_role_frequency: number;
  position: number;
  wins: number;
  losses: number;
  total_games: number;
  win_rate_percentage: number;
  mmr: number;
  leaderboard_channel_id: string;
  season_name: string;
  season_number: number;
  recorded_at: string;
}

interface BackendStats {
  totalPlayers: number;
  totalSeasons: number;
  topPlayerByWinRate: BackendPlayerEntry | null;
  averageWinRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/webhook/database'; // URL do backend

  private playersSubject = new BehaviorSubject<Player[]>([]);
  private statsSubject = new BehaviorSubject<PlayerStats[]>([]);
  private matchesSubject = new BehaviorSubject<Match[]>(this.getMockMatches());

  constructor() {
    this.loadPlayersFromBackend();
  }

  // Carrega jogadores do backend
  private loadPlayersFromBackend(): void {
    this.http.get<BackendPlayerEntry[]>(`${this.apiUrl}/players`)
      .pipe(
        map(backendPlayers => this.convertBackendToPlayer(backendPlayers)),
        catchError(error => {
          console.error('Erro ao carregar jogadores do backend:', error);
          // Fallback para dados mock em caso de erro
          return of(this.getMockPlayers());
        })
      )
      .subscribe(players => {
        this.playersSubject.next(players);
        // Gerar stats baseadas nos dados reais
        const stats = this.convertBackendToPlayerStats(players);
        this.statsSubject.next(stats);
      });
  }

  // Converte dados do backend para o modelo Player do frontend
  private convertBackendToPlayer(backendPlayers: BackendPlayerEntry[]): Player[] {
    return backendPlayers.map(bp => ({
      id: bp.id.toString(),
      discordUsername: bp.name,
      summonerName: bp.name,
      rank: this.convertMMRToRank(bp.mmr),
      tier: this.convertMMRToTier(bp.mmr),
      leaguePoints: bp.mmr,
      farmRank: bp.position,
      avatar: `/assets/avatars/player-${bp.id % 10 + 1}.jpg`,
      joinDate: new Date(bp.recorded_at),
      lastSeen: new Date(bp.recorded_at),
      isActive: true,
      preferredRoles: [bp.most_played_role_name || 'Unknown'],
      currentRank: this.convertMMRToRank(bp.mmr),
      currentTier: this.convertMMRToTier(bp.mmr)
    }));
  }

  // Converte dados do backend para PlayerStats
  private convertBackendToPlayerStats(players: Player[]): PlayerStats[] {
    return players.map(player => {
      // Precisamos buscar os dados do backend novamente para ter acesso às estatísticas
      return {
        playerId: player.id,
        totalGames: 0, // Será preenchido por uma chamada separada
        wins: 0,
        losses: 0,
        winRate: 0,
        averageKDA: {
          kills: 6.5,
          deaths: 4.2,
          assists: 8.1,
          ratio: 1.55
        },
        averageCS: 145,
        averageGameDuration: 28.5,
        favoriteRole: player.preferredRoles[0] || 'Unknown',
        championStats: [],
        mainChampions: [],
        currentStreak: 0,
        longestWinStreak: 5,
        longestLossStreak: 3,
        mvpCount: 0,
        farmPoints: player.leaguePoints
      };
    });
  }

  // Método separado para converter dados do backend diretamente para PlayerStats
  private convertBackendToPlayerStatsDirectly(backendPlayers: BackendPlayerEntry[]): PlayerStats[] {
    return backendPlayers.map(bp => ({
      playerId: bp.id.toString(),
      totalGames: bp.total_games,
      wins: bp.wins,
      losses: bp.losses,
      winRate: bp.win_rate_percentage,
      averageKDA: {
        kills: 6.5,
        deaths: 4.2,
        assists: 8.1,
        ratio: 1.55
      },
      averageCS: 145,
      averageGameDuration: 28.5,
      favoriteRole: bp.most_played_role_name || 'Unknown',
      championStats: [],
      mainChampions: [],
      currentStreak: 0,
      longestWinStreak: 5,
      longestLossStreak: 3,
      mvpCount: Math.floor(bp.wins * 0.3),
      farmPoints: bp.mmr
    }));
  }

  // Converte MMR para rank
  private convertMMRToRank(mmr: number): string {
    if (mmr >= 2400) return 'MASTER';
    if (mmr >= 2000) return 'DIAMOND';
    if (mmr >= 1600) return 'PLATINUM';
    if (mmr >= 1200) return 'GOLD';
    if (mmr >= 800) return 'SILVER';
    return 'BRONZE';
  }

  // Converte MMR para tier
  private convertMMRToTier(mmr: number): string {
    const tierInRank = Math.floor((mmr % 400) / 100) + 1;
    return ['IV', 'III', 'II', 'I'][tierInRank - 1] || 'IV';
  }

  // Métodos públicos que agora usam dados reais + mock
  getPlayers(): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  getPlayerStats(): Observable<PlayerStats[]> {
    // Buscar stats diretamente do backend
    return this.http.get<BackendPlayerEntry[]>(`${this.apiUrl}/players`)
      .pipe(
        map(backendPlayers => this.convertBackendToPlayerStatsDirectly(backendPlayers)),
        catchError(error => {
          console.error('Erro ao carregar stats:', error);
          return of(this.getMockPlayerStats());
        })
      );
  }

  getMatches(): Observable<Match[]> {
    return this.matchesSubject.asObservable();
  }

  getPlayerById(id: string): Observable<Player | undefined> {
    const players = this.playersSubject.value;
    return of(players.find(p => p.id === id));
  }

  getPlayerStatsById(playerId: string): Observable<PlayerStats | undefined> {
    return this.getPlayerStats().pipe(
      map(stats => stats.find(s => s.playerId === playerId))
    );
  }

  // Buscar jogador específico no backend
  getPlayerByName(playerName: string): Observable<Player | null> {
    return this.http.get<BackendPlayerEntry>(`${this.apiUrl}/player/${playerName}`)
      .pipe(
        map(backendPlayer => {
          if (!backendPlayer) return null;
          return this.convertBackendToPlayer([backendPlayer])[0];
        }),
        catchError(error => {
          console.error('Erro ao buscar jogador:', error);
          return of(null);
        })
      );
  }

  // Buscar jogadores por temporada
  getPlayersBySeason(seasonNumber: number): Observable<Player[]> {
    return this.http.get<BackendPlayerEntry[]>(`${this.apiUrl}/season/${seasonNumber}`)
      .pipe(
        map(backendPlayers => this.convertBackendToPlayer(backendPlayers)),
        catchError(error => {
          console.error('Erro ao buscar jogadores da temporada:', error);
          return of([]);
        })
      );
  }

  // Buscar estatísticas gerais do backend
  getBackendStats(): Observable<BackendStats> {
    return this.http.get<BackendStats>(`${this.apiUrl}/stats`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar estatísticas:', error);
          return of({
            totalPlayers: 0,
            totalSeasons: 0,
            topPlayerByWinRate: null,
            averageWinRate: 0
          });
        })
      );
  }

  getLeaderboards(): Observable<Leaderboard[]> {
    return of(this.getMockLeaderboards());
  }

  getEvents(): Observable<FarmEvent[]> {
    return of(this.getMockFarmEvents());
  }

  // Métodos mock para fallback
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
        championStats: [],
        mainChampions: [],
        currentStreak: 3,
        longestWinStreak: 8,
        longestLossStreak: 4,
        mvpCount: 23,
        farmPoints: 2850
      }
    ];
  }

  private getMockMatches(): Match[] {
    return [];
  }

  private getMockLeaderboards(): Leaderboard[] {
    return [];
  }

  private getMockFarmEvents(): FarmEvent[] {
    return [];
  }
}
