import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PlayerEntry } from './webhook/player-entry.entity';
export interface PlayerEntryPayload {
    name?: string;
    most_played_role?: {
        name?: string;
        frequency?: number;
    };
    position?: number;
    wins?: number;
    losses?: number;
    total_games?: number;
    win_rate_percentage?: number;
    mmr?: number;
}
export interface WebhookPayload {
    leaderboard?: {
        leaderboard_channel_id?: {
            toString: () => string;
        };
        player_entries?: PlayerEntryPayload[];
    };
    season?: {
        name?: string;
        number?: number;
    };
}
export declare class WebhookService {
    private readonly configService;
    private readonly playerEntryRepository;
    private readonly logger;
    private readonly expectedWebhookSecret;
    constructor(configService: ConfigService, playerEntryRepository: Repository<PlayerEntry>);
    processWebhook(payload: WebhookPayload, receivedSecret: string): Promise<any>;
    private validateWebhookPayload;
    getAllPlayersFromDatabase(): Promise<PlayerEntry[]>;
    getPlayerFromDatabase(playerName: string): Promise<PlayerEntry | null>;
    getPlayersBySeason(seasonNumber: number): Promise<PlayerEntry[]>;
    getDatabaseStats(): Promise<{
        totalPlayers: number;
        totalSeasons: number;
        topPlayerByWinRate: PlayerEntry | null;
        averageWinRate: number;
    }>;
    clearOldData(daysOld?: number): Promise<{
        deletedCount: number;
    }>;
}
