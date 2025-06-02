import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { Match, Player } from '../../models/player.model';

@Component({
  selector: 'app-matches',
  imports: [CommonModule],
  templateUrl: './matches.html',
  styleUrl: './matches.css'
})
export class Matches implements OnInit {
  matches: Match[] = [];
  filteredMatches: Match[] = [];
  players: Player[] = [];

  // Filters
  selectedGameMode = 'all';
  selectedTimeFilter = 'all';
  selectedResult = 'all';
  searchPlayer = '';

  // Stats
  totalMatches = 0;
  averageDuration = 0;
  totalWins = 0;
  totalLosses = 0;
  longestMatch = 0;
  shortestMatch = 0;

  gameModes = [
    { value: 'all', label: 'Todos os Modos', icon: '🎮' },
    { value: 'Ranked Solo/Duo', label: 'Ranked Solo/Duo', icon: '👑' },
    { value: 'Ranked Flex', label: 'Ranked Flex', icon: '👥' },
    { value: 'Normal Draft', label: 'Normal Draft', icon: '📋' },
    { value: 'ARAM', label: 'ARAM', icon: '⚡' },
    { value: 'Clash', label: 'Clash', icon: '🏆' }
  ];

  timeFilters = [
    { value: 'all', label: 'Todos os Períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'season', label: 'Esta Temporada' }
  ];

  resultFilters = [
    { value: 'all', label: 'Todos os Resultados' },
    { value: 'victory', label: 'Vitórias' },
    { value: 'defeat', label: 'Derrotas' }
  ];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.loadMatches();
    this.loadPlayers();
  }

  private loadMatches() {
    // Mock data - replace with actual service call
    this.matches = [
      {
        id: '1',
        gameId: 'game1',
        gameMode: 'Ranked Solo/Duo',
        gameType: 'MATCHED_GAME',
        gameCreation: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
        gameCreation: new Date(Date.now() - 5 * 60 * 60 * 1000),
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
        gameCreation: new Date(Date.now() - 8 * 60 * 60 * 1000),
        gameDuration: 1234,
        participants: [],
        teams: [],
        winner: 'blue',
        version: '13.24.1'
      },
      {
        id: '4',
        gameId: 'game4',
        gameMode: 'Ranked Flex',
        gameType: 'MATCHED_GAME',
        gameCreation: new Date(Date.now() - 12 * 60 * 60 * 1000),
        gameDuration: 2845,
        participants: [],
        teams: [],
        winner: 'red',
        version: '13.24.1'
      },
      {
        id: '5',
        gameId: 'game5',
        gameMode: 'Clash',
        gameType: 'MATCHED_GAME',
        gameCreation: new Date(Date.now() - 24 * 60 * 60 * 1000),
        gameDuration: 3021,
        participants: [],
        teams: [],
        winner: 'blue',
        version: '13.24.1'
      }
    ];

    this.calculateStats();
    this.applyFilters();
  }

  private loadPlayers() {
    this.playerService.getPlayers().subscribe(players => {
      this.players = players;
    });
  }

  private calculateStats() {
    this.totalMatches = this.matches.length;
    this.averageDuration = Math.round(
      this.matches.reduce((sum, match) => sum + match.gameDuration, 0) / this.matches.length
    );
    this.totalWins = this.matches.filter(m => m.winner === 'blue').length;
    this.totalLosses = this.matches.filter(m => m.winner === 'red').length;
    this.longestMatch = Math.max(...this.matches.map(m => m.gameDuration));
    this.shortestMatch = Math.min(...this.matches.map(m => m.gameDuration));
  }

  onGameModeFilter(mode: string) {
    this.selectedGameMode = mode;
    this.applyFilters();
  }

  onTimeFilter(time: string) {
    this.selectedTimeFilter = time;
    this.applyFilters();
  }

  onResultFilter(result: string) {
    this.selectedResult = result;
    this.applyFilters();
  }

  onPlayerSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchPlayer = target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.matches];

    // Filter by game mode
    if (this.selectedGameMode !== 'all') {
      filtered = filtered.filter(match => match.gameMode === this.selectedGameMode);
    }

    // Filter by time
    if (this.selectedTimeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.gameCreation);
        switch (this.selectedTimeFilter) {
          case 'today':
            return matchDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return matchDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return matchDate >= monthAgo;
          case 'season':
            const seasonStart = new Date(now.getFullYear(), 0, 1);
            return matchDate >= seasonStart;
          default:
            return true;
        }
      });
    }

    // Filter by result
    if (this.selectedResult !== 'all') {
      const winnerFilter = this.selectedResult === 'victory' ? 'blue' : 'red';
      filtered = filtered.filter(match => match.winner === winnerFilter);
    }

    // Filter by player search (would need participant data)
    if (this.searchPlayer) {
      // This would filter by participants if we had that data
      // For now, just keeping all matches
    }

    this.filteredMatches = filtered.sort((a, b) =>
      new Date(b.gameCreation).getTime() - new Date(a.gameCreation).getTime()
    );
  }

  getGameModeIcon(gameMode: string): string {
    const mode = this.gameModes.find(m => m.value === gameMode || m.label === gameMode);
    return mode?.icon || '🎮';
  }

  getResultClass(winner: string): string {
    return winner === 'blue' ? 'victory' : 'defeat';
  }

  getResultLabel(winner: string): string {
    return winner === 'blue' ? 'Vitória' : 'Derrota';
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  getDurationClass(duration: number): string {
    if (duration < 1200) return 'short'; // < 20 min
    if (duration < 2400) return 'medium'; // 20-40 min
    return 'long'; // > 40 min
  }

  getWinRate(): number {
    if (this.filteredMatches.length === 0) return 0;
    const wins = this.filteredMatches.filter(m => m.winner === 'blue').length;
    return Math.round((wins / this.filteredMatches.length) * 100);
  }

  getAverageDurationFiltered(): number {
    if (this.filteredMatches.length === 0) return 0;
    return Math.round(
      this.filteredMatches.reduce((sum, match) => sum + match.gameDuration, 0) / this.filteredMatches.length
    );
  }
}
