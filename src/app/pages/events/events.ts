import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';
import { FarmEvent, EventType } from '../../models/player.model';

@Component({
  selector: 'app-events',
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {
  events: FarmEvent[] = [];
  filteredEvents: FarmEvent[] = [];
  upcomingEvents: FarmEvent[] = [];
  ongoingEvents: FarmEvent[] = [];
  pastEvents: FarmEvent[] = [];

  selectedEventType = 'all';
  selectedStatus = 'all';
  searchTerm = '';

  // Stats
  totalEvents = 0;
  activeEvents = 0;
  totalParticipants = 0;
  upcomingCount = 0;

  eventTypes = [
    { type: 'all', name: 'Todos os Eventos', icon: '🎪', color: '#8B4513' },
    { type: 'tournament', name: 'Torneios', icon: '🏆', color: '#FFD700' },
    { type: 'workshop', name: 'Workshops', icon: '🔧', color: '#228B22' },
    { type: 'harvest', name: 'Colheitas', icon: '🌾', color: '#DAA520' },
    { type: 'community', name: 'Eventos Comunitários', icon: '👥', color: '#CD853F' },
    { type: 'seasonal', name: 'Eventos Sazonais', icon: '🍂', color: '#8FBC8F' },
    { type: 'challenge', name: 'Desafios', icon: '⚡', color: '#FF6347' }
  ];

  statusFilters = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'upcoming', label: 'Próximos' },
    { value: 'ongoing', label: 'Em Andamento' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.loadEvents();
  }

  private loadEvents() {
    this.playerService.getEvents().subscribe(events => {
      this.events = events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      this.categorizeEvents();
      this.calculateStats();
      this.applyFilters();
    });
  }

  private categorizeEvents() {
    const now = new Date();

    this.upcomingEvents = this.events.filter(event =>
      new Date(event.startDate) > now && event.status === 'upcoming'
    );

    this.ongoingEvents = this.events.filter(event =>
      event.status === 'ongoing' ||
      (new Date(event.startDate) <= now && new Date(event.endDate) >= now)
    );

    this.pastEvents = this.events.filter(event =>
      new Date(event.endDate) < now || event.status === 'completed'
    );
  }

  private calculateStats() {
    this.totalEvents = this.events.length;
    this.activeEvents = this.ongoingEvents.length;
    this.upcomingCount = this.upcomingEvents.length;
    this.totalParticipants = this.events.reduce((sum, event) =>
      sum + (event.participants?.length || 0), 0
    );
  }

  onEventTypeFilter(type: string) {
    this.selectedEventType = type;
    this.applyFilters();
  }

  onStatusFilter(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.events];

    // Filter by event type
    if (this.selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.type === this.selectedEventType);
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        switch (this.selectedStatus) {
          case 'upcoming':
            return new Date(event.startDate) > now && event.status === 'upcoming';
          case 'ongoing':
            return event.status === 'ongoing' ||
                   (new Date(event.startDate) <= now && new Date(event.endDate) >= now);
          case 'completed':
            return new Date(event.endDate) < now || event.status === 'completed';
          case 'cancelled':
            return event.status === 'cancelled';
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(this.searchTerm) ||
        event.description.toLowerCase().includes(this.searchTerm) ||
        event.organizer.toLowerCase().includes(this.searchTerm)
      );
    }

    this.filteredEvents = filtered;
  }

  getEventTypeInfo(type: string) {
    return this.eventTypes.find(et => et.type === type) || this.eventTypes[0];
  }

  getEventStatus(event: FarmEvent): string {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (event.status === 'cancelled') return 'cancelled';
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'completed';
  }

  getEventStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'upcoming': 'status-upcoming',
      'ongoing': 'status-ongoing',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-upcoming';
  }

  formatEventDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString('pt-BR')} • ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
  }

  getDaysUntilEvent(date: string): number {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getRewardText(reward: any): string {
    if (typeof reward === 'string') return reward;
    if (reward.farmPoints) return `${reward.farmPoints} Farm Points`;
    if (reward.title) return `Título: ${reward.title}`;
    if (reward.item) return `Item: ${reward.item}`;
    return 'Recompensa especial';
  }

  joinEvent(event: FarmEvent) {
    // Implementar lógica para participar do evento
    console.log('Participando do evento:', event.name);
  }

  leaveEvent(event: FarmEvent) {
    // Implementar lógica para sair do evento
    console.log('Saindo do evento:', event.name);
  }

  isUserParticipating(event: FarmEvent): boolean {
    // Implementar lógica para verificar se o usuário está participando
    // Por enquanto, retorna false
    return false;
  }

  canJoinEvent(event: FarmEvent): boolean {
    const status = this.getEventStatus(event);
    return status === 'upcoming' &&
           (event.participants?.length || 0) < event.maxParticipants &&
           !this.isUserParticipating(event);
  }
}
