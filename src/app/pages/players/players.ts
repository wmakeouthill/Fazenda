import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { Player, PlayerStats } from '../../models/player.model';

@Component({
  selector: 'app-players',
  imports: [CommonModule],
  templateUrl: './players.html',
  styleUrl: './players.css'
})
export class Players implements OnInit {
  players: (Player & { stats?: PlayerStats })[] = [];
  filteredPlayers: (Player & { stats?: PlayerStats })[] = [];
  searchTerm = '';
  sortBy = 'farmPoints';
  sortOrder = 'desc';
  selectedRole = 'all';

  totalPlayers = 0;
  activePlayers = 0;
  averageWinRate = 0;
  totalFarmPoints = 0;

  roles = [
    { value: 'all', label: 'Todas as Posições', icon: '🌾' },
    { value: 'top', label: 'Top Lane', icon: '⚔️' },
    { value: 'jungle', label: 'Jungle', icon: '🌿' },
    { value: 'mid', label: 'Mid Lane', icon: '✨' },
    { value: 'adc', label: 'ADC', icon: '🏹' },
    { value: 'support', label: 'Support', icon: '🛡️' }
  ];

  sortOptions = [
    { value: 'farmPoints', label: 'Farm Points' },
    { value: 'winRate', label: 'Taxa de Vitória' },
    { value: 'totalGames', label: 'Partidas Jogadas' },
    { value: 'summonerName', label: 'Nome' }
  ];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.loadPlayers();
  }

  private loadPlayers() {
    this.playerService.getPlayers().subscribe(players => {
      this.playerService.getPlayerStats().subscribe(stats => {
        this.players = players.map(player => {
          const playerStats = stats.find(s => s.playerId === player.id);
          return {
            ...player,
            stats: playerStats
          };
        });

        this.calculateOverallStats();
        this.applyFilters();
      });
    });
  }

  private calculateOverallStats() {
    this.totalPlayers = this.players.length;
    this.activePlayers = this.players.filter(p => p.isActive).length;

    const activePlayersWithStats = this.players.filter(p => p.isActive && p.stats);
    this.averageWinRate = activePlayersWithStats.length > 0
      ? Math.round(activePlayersWithStats.reduce((sum, p) => sum + (p.stats?.winRate || 0), 0) / activePlayersWithStats.length)
      : 0;

    this.totalFarmPoints = activePlayersWithStats.reduce((sum, p) => sum + (p.stats?.farmPoints || 0), 0);
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.applyFilters();
  }

  onRoleFilter(role: string) {
    this.selectedRole = role;
    this.applyFilters();
  }

  onSort(sortBy: string) {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.players];

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(player =>
        player.summonerName.toLowerCase().includes(this.searchTerm) ||
        player.discordUsername.toLowerCase().includes(this.searchTerm)
      );
    }

    // Filter by role
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(player =>
        player.preferredRoles.includes(this.selectedRole)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (this.sortBy) {
        case 'farmPoints':
          valueA = a.stats?.farmPoints || 0;
          valueB = b.stats?.farmPoints || 0;
          break;
        case 'winRate':
          valueA = a.stats?.winRate || 0;
          valueB = b.stats?.winRate || 0;
          break;
        case 'totalGames':
          valueA = a.stats?.totalGames || 0;
          valueB = b.stats?.totalGames || 0;
          break;
        case 'summonerName':
          valueA = a.summonerName.toLowerCase();
          valueB = b.summonerName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (this.sortOrder === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });

    this.filteredPlayers = filtered;
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'top': '⚔️',
      'jungle': '🌿',
      'mid': '✨',
      'adc': '🏹',
      'support': '🛡️'
    };
    return roleIcons[role] || '🌾';
  }

  getRankColor(rank: string): string {
    const rankColors: { [key: string]: string } = {
      'IRON': '#8B4513',
      'BRONZE': '#CD7F32',
      'SILVER': '#C0C0C0',
      'GOLD': '#FFD700',
      'PLATINUM': '#00CED1',
      'DIAMOND': '#B9F2FF',
      'MASTER': '#E19FFF',
      'GRANDMASTER': '#FF6B6B',
      'CHALLENGER': '#F0E68C'
    };
    return rankColors[rank] || '#666';
  }
  getPlayerStatusClass(player: Player & { stats?: PlayerStats }): string {
    if (!player.isActive) return 'inactive';
    if (player.stats && player.stats.farmPoints > 1000) return 'veteran';
    if (player.stats && player.stats.totalGames > 50) return 'active';
    return 'rookie';
  }

  formatLastSeen(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  }
}
