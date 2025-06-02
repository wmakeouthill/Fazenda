import { WebhookService, WebhookPayload } from './webhook.service';
export declare class WebhookController {
    private readonly webhookService;
    private readonly logger;
    constructor(webhookService: WebhookService);
    receiveWebhook(payload: WebhookPayload, secret?: string): Promise<any>;
    getAllPlayersFromDatabase(): Promise<import("./webhook/player-entry.entity").PlayerEntry[]>;
    getPlayerFromDatabase(playerName: string): Promise<import("./webhook/player-entry.entity").PlayerEntry | null>;
    getPlayersBySeason(seasonNumber: string): Promise<import("./webhook/player-entry.entity").PlayerEntry[]>;
    getDatabaseStats(): Promise<{
        totalPlayers: number;
        totalSeasons: number;
        topPlayerByWinRate: import("./webhook/player-entry.entity").PlayerEntry | null;
        averageWinRate: number;
    }>;
    clearOldData(days?: string): Promise<{
        deletedCount: number;
    }>;
}
