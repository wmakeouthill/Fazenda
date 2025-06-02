"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const player_entry_entity_1 = require("./webhook/player-entry.entity");
let WebhookService = WebhookService_1 = class WebhookService {
    configService;
    httpService;
    playerEntryRepository;
    logger = new common_1.Logger(WebhookService_1.name);
    expectedWebhookSecret;
    inhouseApiConfig;
    constructor(configService, httpService, playerEntryRepository) {
        this.configService = configService;
        this.httpService = httpService;
        this.playerEntryRepository = playerEntryRepository;
        const secret = this.configService.getOrThrow('WEBHOOK_SECRET');
        this.expectedWebhookSecret = secret;
        this.inhouseApiConfig = {
            baseUrl: this.configService.get('INHOUSE_API_BASE_URL', 'https://api.inhousequeue.xyz'),
            apiKey: this.configService.get('INHOUSE_API_KEY'),
        };
    }
    async processWebhook(payload, receivedSecret) {
        if (this.expectedWebhookSecret !== receivedSecret) {
            this.logger.warn(`Tentativa de webhook com secret inválido. Recebido: ${receivedSecret}`);
            throw new common_1.HttpException('Invalid webhook-secret', common_1.HttpStatus.FORBIDDEN);
        }
        this.logger.log('Webhook recebido e secret validado com sucesso.');
        const leaderboardChannelId = payload.leaderboard?.leaderboard_channel_id?.toString();
        const seasonName = payload.season?.name;
        const seasonNumber = payload.season?.number;
        const playerEntriesData = payload.leaderboard?.player_entries;
        if (!playerEntriesData || !Array.isArray(playerEntriesData)) {
            this.logger.warn('Payload não contém player_entries válidos.');
            throw new common_1.HttpException('Payload inválido: player_entries ausente ou malformado.', common_1.HttpStatus.BAD_REQUEST);
        }
        const entriesToSave = [];
        for (const playerData of playerEntriesData) {
            const newEntry = this.playerEntryRepository.create({
                name: playerData.name,
                most_played_role_name: playerData.most_played_role?.name,
                most_played_role_frequency: playerData.most_played_role?.frequency,
                position: playerData.position,
                wins: playerData.wins,
                losses: playerData.losses,
                total_games: playerData.total_games,
                win_rate_percentage: playerData.win_rate_percentage,
                mmr: playerData.mmr,
                leaderboard_channel_id: leaderboardChannelId,
                season_name: seasonName,
                season_number: seasonNumber,
            });
            entriesToSave.push(newEntry);
        }
        try {
            await this.playerEntryRepository.save(entriesToSave);
            this.logger.log(`${entriesToSave.length} entradas de jogador salvas no banco de dados.`);
            return {
                message: 'Webhook processado e dados salvos com sucesso!',
                count: entriesToSave.length,
            };
        }
        catch (error) {
            this.logger.error('Erro ao salvar entradas no banco de dados:', error);
            if (error instanceof Error) {
                this.logger.error(`Database save error: ${error.message}`);
            }
            throw new common_1.HttpException('Erro ao salvar dados no banco.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.inhouseApiConfig.apiKey) {
            headers['Authorization'] = `Bearer ${this.inhouseApiConfig.apiKey}`;
        }
        return headers;
    }
    async getLeaderboard(serverId, channelId) {
        try {
            this.logger.log(`Buscando leaderboard para servidor: ${serverId}`);
            let url = `${this.inhouseApiConfig.baseUrl}/leaderboard/${serverId}`;
            if (channelId) {
                url += `/${channelId}`;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                headers: this.getHeaders(),
            }));
            this.logger.log(`Leaderboard obtido com sucesso. ${response.data?.leaderboard?.player_entries?.length || 0} jogadores encontrados`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar leaderboard: ${error.message}`);
            if (error.response) {
                this.logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.HttpException(`Erro ao buscar leaderboard: ${error.message}`, error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPlayerStats(serverId, playerName) {
        try {
            this.logger.log(`Buscando estatísticas do jogador: ${playerName} no servidor: ${serverId}`);
            const leaderboard = await this.getLeaderboard(serverId);
            const player = leaderboard.leaderboard.player_entries.find(entry => entry.name.toLowerCase() === playerName.toLowerCase());
            if (!player) {
                this.logger.warn(`Jogador ${playerName} não encontrado no leaderboard`);
                return null;
            }
            this.logger.log(`Estatísticas do jogador ${playerName} obtidas com sucesso`);
            return player;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar estatísticas do jogador: ${error.message}`);
            throw error;
        }
    }
    async getCurrentSeason(serverId) {
        try {
            this.logger.log(`Buscando temporada atual para servidor: ${serverId}`);
            const leaderboard = await this.getLeaderboard(serverId);
            this.logger.log(`Temporada atual obtida: ${leaderboard.season.name} (${leaderboard.season.number})`);
            return leaderboard.season;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar temporada atual: ${error.message}`);
            throw error;
        }
    }
    async getTopPlayers(serverId, limit = 10) {
        try {
            this.logger.log(`Buscando top ${limit} jogadores para servidor: ${serverId}`);
            const leaderboard = await this.getLeaderboard(serverId);
            const topPlayers = leaderboard.leaderboard.player_entries
                .sort((a, b) => a.position - b.position)
                .slice(0, limit);
            this.logger.log(`Top ${limit} jogadores obtidos com sucesso`);
            return topPlayers;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar top jogadores: ${error.message}`);
            throw error;
        }
    }
    async testConnection() {
        try {
            this.logger.log('Testando conexão com a API do InhouseQueue');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.inhouseApiConfig.baseUrl}/health`, {
                headers: this.getHeaders(),
                timeout: 5000,
            }));
            this.logger.log('Conexão com a API testada com sucesso');
            return {
                status: 'success',
                message: 'Conexão com a API funcionando corretamente',
            };
        }
        catch (error) {
            this.logger.error(`Erro ao testar conexão: ${error.message}`);
            return {
                status: 'error',
                message: `Erro de conexão: ${error.message}`,
            };
        }
    }
    async getAllPlayersFromDatabase() {
        try {
            this.logger.log('Buscando todos os jogadores do banco de dados');
            const players = await this.playerEntryRepository.find({
                order: { position: 'ASC' },
            });
            this.logger.log(`${players.length} jogadores encontrados no banco de dados`);
            return players;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar jogadores do banco: ${error.message}`);
            throw new common_1.HttpException('Erro ao buscar jogadores do banco de dados', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPlayerFromDatabase(playerName) {
        try {
            this.logger.log(`Buscando jogador ${playerName} no banco de dados`);
            const player = await this.playerEntryRepository.findOne({
                where: { name: playerName },
            });
            if (player) {
                this.logger.log(`Jogador ${playerName} encontrado no banco de dados`);
            }
            else {
                this.logger.warn(`Jogador ${playerName} não encontrado no banco de dados`);
            }
            return player;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar jogador do banco: ${error.message}`);
            throw new common_1.HttpException('Erro ao buscar jogador do banco de dados', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(player_entry_entity_1.PlayerEntry)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService,
        typeorm_2.Repository])
], WebhookService);
//# sourceMappingURL=webhook.service.backup.js.map