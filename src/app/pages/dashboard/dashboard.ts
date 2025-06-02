import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Player, PlayerStats, Match, FarmEvent, LeaderboardEntry } from '../../models/player.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totalPlayers = 0;
  totalMatches = 0;
  activeEvents = 0;

  topPlayers: (Player & { farmPoints: number; winRate: number })[] = [];
  recentMatches: Match[] = [];
  upcomingEvents: FarmEvent[] = [];
  farmLeaderboard: LeaderboardEntry[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load players and stats
    this.playerService.getPlayers().subscribe(players => {
      this.totalPlayers = players.filter(p => p.isActive).length;
    });

    this.playerService.getPlayerStats().subscribe(stats => {
      this.totalMatches = stats.reduce((total, stat) => total + stat.totalGames, 0);
    });

    // Load events
    this.playerService.getFarmEvents().subscribe(events => {
      this.activeEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length;
      this.upcomingEvents = events
        .filter(e => e.status === 'upcoming')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
    });

    // Load top players
    this.loadTopPlayers();

    // Load farm leaderboard preview
    this.playerService.getLeaderboards().subscribe(leaderboards => {
      const farmLeaderboard = leaderboards.find(l => l.type === 'farmPoints');
      if (farmLeaderboard) {
        this.farmLeaderboard = farmLeaderboard.players.slice(0, 5);
      }
    });

    // Mock recent matches for now
    this.recentMatches = [
      {
        id: '1',
        gameId: 'game1',
        gameMode: 'Ranked 5v5',
        gameType: 'MATCHED_GAME',
        gameCreation: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        gameDuration: 1847,
        participants: [],
        teams: [],
        winner: 'blue',
        version: '13.24.1'
      },
      {
        id: '2',
        gameId: 'game2',
        gameMode: 'Normal Draft',
        gameType: 'MATCHED_GAME',
        gameCreation: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        gameDuration: 2156,
        participants: [],
        teams: [],
        winner: 'red',
        version: '13.24.1'
      },
      {
        id: '3',
        gameId: 'game3',
        gameMode: 'ARAM',
        gameType: 'MATCHED_GAME',
        gameCreation: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        gameDuration: 1234,
        participants: [],
        teams: [],
        winner: 'blue',
        version: '13.24.1'
      }
    ];
  }

  private loadTopPlayers() {
    this.playerService.getPlayers().subscribe(players => {
      this.playerService.getPlayerStats().subscribe(stats => {
        this.topPlayers = players
          .filter(p => p.isActive)
          .map(player => {
            const playerStat = stats.find(s => s.playerId === player.id);
            return {
              ...player,
              farmPoints: playerStat?.farmPoints || 0,
              winRate: playerStat?.winRate || 0
            };
          })
          .sort((a, b) => b.farmPoints - a.farmPoints)
          .slice(0, 5);
      });
    });
  }

  getBadgeEmoji(index: number): string {
    const badges = ['🥇', '🥈', '🥉'];
    return badges[index] || '';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      return 'Agora';
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatEventDate(date: Date): { day: string; month: string } {
    const day = date.getDate().toString();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    return { day, month };
  }

  getEventTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'tournament': 'Torneio',
      'scrim': 'Treino',
      'fun': 'Diversão',
      'ranked': 'Ranqueada'
    };
    return types[type] || type;
  }

  getEventStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'upcoming': 'Em breve',
      'ongoing': 'Em andamento',
      'completed': 'Finalizado',
      'cancelled': 'Cancelado'
    };
    return statuses[status] || status;
  }
}
