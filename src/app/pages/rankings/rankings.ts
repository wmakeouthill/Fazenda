import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { Leaderboard, LeaderboardEntry } from '../../models/player.model';

@Component({
  selector: 'app-rankings',
  imports: [CommonModule],
  templateUrl: './rankings.html',
  styleUrl: './rankings.css'
})
export class Rankings implements OnInit {
  leaderboards: Leaderboard[] = [];
  selectedLeaderboard: Leaderboard | null = null;
  seasonStats = {
    totalGames: 0,
    activePlayers: 0,
    avgGameDuration: 0,
    topPerformer: ''
  };

  leaderboardTypes = [
    { type: 'farmPoints', name: 'Farm Points', icon: '🌾', description: 'Pontuação geral da fazenda' },
    { type: 'winRate', name: 'Taxa de Vitória', icon: '🏆', description: 'Percentual de vitórias' },
    { type: 'kda', name: 'KDA Médio', icon: '⚔️', description: 'Kill/Death/Assist ratio' },
    { type: 'totalGames', name: 'Partidas Jogadas', icon: '🎮', description: 'Número total de jogos' },
    { type: 'pentakills', name: 'Pentakills', icon: '💥', description: 'Pentakills conquistados' },
    { type: 'goldEarned', name: 'Ouro Farmado', icon: '💰', description: 'Ouro total acumulado' }
  ];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.loadLeaderboards();
    this.loadSeasonStats();
  }

  private loadLeaderboards() {
    this.playerService.getLeaderboards().subscribe(leaderboards => {
      this.leaderboards = leaderboards;
      if (leaderboards.length > 0) {
        this.selectedLeaderboard = leaderboards.find(l => l.type === 'farmPoints') || leaderboards[0];
      }
    });
  }

  private loadSeasonStats() {
    this.playerService.getPlayerStats().subscribe(stats => {
      this.seasonStats.totalGames = stats.reduce((sum, s) => sum + s.totalGames, 0);
      this.seasonStats.activePlayers = stats.filter(s => s.totalGames > 0).length;
      this.seasonStats.avgGameDuration = Math.round(
        stats.reduce((sum, s) => sum + (s.averageGameDuration || 0), 0) / stats.length
      );

      const topPlayer = stats.reduce((top, current) =>
        (current.farmPoints > top.farmPoints) ? current : top
      );

      this.playerService.getPlayers().subscribe(players => {
        const player = players.find(p => p.id === topPlayer.playerId);
        this.seasonStats.topPerformer = player?.summonerName || 'N/A';
      });
    });
  }

  selectLeaderboard(type: string) {
    this.selectedLeaderboard = this.leaderboards.find(l => l.type === type) || null;
  }

  getLeaderboardInfo(type: string) {
    return this.leaderboardTypes.find(lt => lt.type === type);
  }

  getRankIcon(position: number): string {
    if (position === 1) return '👑';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    if (position <= 10) return '🏅';
    return '📊';
  }

  getRankClass(position: number): string {
    if (position === 1) return 'rank-first';
    if (position === 2) return 'rank-second';
    if (position === 3) return 'rank-third';
    if (position <= 10) return 'rank-top-ten';
    return 'rank-default';
  }

  getChangeIcon(change: number): string {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➖';
  }

  getAverageValue(): string {
    if (!this.selectedLeaderboard || this.selectedLeaderboard.players.length === 0) {
      return '0';
    }
    const total = this.selectedLeaderboard.players.reduce((sum, p) => sum + p.value, 0);
    const average = total / this.selectedLeaderboard.players.length;
    return this.formatValue(average, this.selectedLeaderboard.type);
  }

  getTopPerformerValue(): string {
    if (!this.selectedLeaderboard || this.selectedLeaderboard.players.length === 0) {
      return '0';
    }
    const topValue = this.selectedLeaderboard.players[0]?.value || 0;
    return this.formatValue(topValue, this.selectedLeaderboard.type);
  }

  formatValue(value: number, type: string): string {
    switch (type) {
      case 'winRate':
        return `${value}%`;
      case 'kda':
        return value.toFixed(2);
      case 'goldEarned':
        return this.formatGold(value);
      default:
        return value.toString();
    }
  }

  private formatGold(gold: number): string {
    if (gold >= 1000000) {
      return `${(gold / 1000000).toFixed(1)}M`;
    }
    if (gold >= 1000) {
      return `${(gold / 1000).toFixed(1)}K`;
    }
    return gold.toString();
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  }

  getPerformanceClass(entry: LeaderboardEntry, type: string): string {
    if (type === 'winRate') {
      if (entry.value >= 70) return 'performance-excellent';
      if (entry.value >= 60) return 'performance-good';
      if (entry.value >= 50) return 'performance-average';
      return 'performance-poor';
    }

    if (type === 'kda') {
      if (entry.value >= 3) return 'performance-excellent';
      if (entry.value >= 2) return 'performance-good';
      if (entry.value >= 1.5) return 'performance-average';
      return 'performance-poor';
    }

    return 'performance-default';
  }

  getTrendIndicator(entry: LeaderboardEntry): string {
    const change = entry.change;
    if (change > 5) return 'trending-up-strong';
    if (change > 0) return 'trending-up';
    if (change < -5) return 'trending-down-strong';
    if (change < 0) return 'trending-down';
    return 'trending-stable';
  }
}
