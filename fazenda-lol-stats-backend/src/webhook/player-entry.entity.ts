import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('player_entries')
export class PlayerEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ nullable: true })
  most_played_role_name: string;

  @Column({ type: 'int', nullable: true })
  most_played_role_frequency: number;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'int' })
  wins: number;

  @Column({ type: 'int' })
  losses: number;

  @Column({ type: 'int' })
  total_games: number;

  @Column({ type: 'float' })
  win_rate_percentage: number;

  @Column({ type: 'int' })
  mmr: number;

  // Adicionaremos campos para gameId e seasonNumber para vincular a um contexto específico de leaderboard
  @Index()
  @Column({ nullable: true })
  leaderboard_channel_id: string; // Convertido de number para string para IDs grandes do Discord

  @Column({ nullable: true })
  season_name: string;

  @Column({ type: 'int', nullable: true })
  season_number: number;

  @CreateDateColumn()
  recorded_at: Date; // Data em que o registro foi salvo
}
