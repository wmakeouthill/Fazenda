import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
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
export interface LeaderboardEntry {
    name: string;
    position: number;
    wins: number;
    losses: number;
    total_games: number;
    win_rate_percentage: number;
    mmr: number;
    most_played_role?: {
        name: string;
        frequency: number;
    };
}
export interface LeaderboardResponse {
    leaderboard: {
        leaderboard_channel_id: string;
        player_entries: LeaderboardEntry[];
    };
    season: {
        name: string;
        number: number;
    };
}
export declare class WebhookService {
    private readonly configService;
    private readonly httpService;
    private readonly playerEntryRepository;
    private readonly logger;
    private readonly expectedWebhookSecret;
    private readonly inhouseApiConfig;
    constructor(configService: ConfigService, httpService: HttpService, playerEntryRepository: Repository<PlayerEntry>);
    processWebhook(payload: WebhookPayload, receivedSecret: string): Promise<any>;
    private getHeaders;
    getLeaderboard(serverId: string, channelId?: string): Promise<LeaderboardResponse>;
    getPlayerStats(serverId: string, playerName: string): Promise<LeaderboardEntry | null>;
    getCurrentSeason(serverId: string): Promise<{
        name: string;
        number: number;
    }>;
    getTopPlayers(serverId: string, limit?: number): Promise<LeaderboardEntry[]>;
    testConnection(): Promise<{
        status: string;
        message: string;
    }>;
    getAllPlayersFromDatabase(): Promise<PlayerEntry[]>;
    getPlayerFromDatabase(playerName: string): Promise<PlayerEntry | null>;
}
