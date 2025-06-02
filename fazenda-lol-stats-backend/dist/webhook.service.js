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
const player_entry_entity_1 = require("./webhook/player-entry.entity");
let WebhookService = WebhookService_1 = class WebhookService {
    configService;
    playerEntryRepository;
    logger = new common_1.Logger(WebhookService_1.name);
    expectedWebhookSecret;
    constructor(configService, playerEntryRepository) {
        this.configService = configService;
        this.playerEntryRepository = playerEntryRepository;
        const secret = this.configService.getOrThrow('WEBHOOK_SECRET');
        this.expectedWebhookSecret = secret;
    }
    async processWebhook(payload, receivedSecret) {
        if (this.expectedWebhookSecret !== receivedSecret) {
            this.logger.warn(`Tentativa de webhook com secret inválido. Recebido: ${receivedSecret}`);
            throw new common_1.HttpException('Invalid webhook-secret', common_1.HttpStatus.FORBIDDEN);
        }
        this.logger.log('Webhook recebido e secret validado com sucesso.');
        if (!this.validateWebhookPayload(payload)) {
            this.logger.warn('Payload inválido recebido no webhook.');
            throw new common_1.HttpException('Payload inválido: player_entries ausente ou malformado.', common_1.HttpStatus.BAD_REQUEST);
        }
        const leaderboardChannelId = payload.leaderboard?.leaderboard_channel_id?.toString();
        const seasonName = payload.season?.name;
        const seasonNumber = payload.season?.number;
        const playerEntriesData = payload.leaderboard?.player_entries || [];
        this.logger.log(`Processando ${playerEntriesData.length} entradas de jogadores para a temporada: ${seasonName} (${seasonNumber})`);
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
            this.logger.log(`${entriesToSave.length} entradas de jogador salvas no banco de dados com sucesso.`);
            return {
                message: 'Webhook processado e dados salvos com sucesso!',
                count: entriesToSave.length,
                season: seasonName,
                seasonNumber: seasonNumber,
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
    validateWebhookPayload(payload) {
        if (!payload.leaderboard?.player_entries) {
            return false;
        }
        if (!Array.isArray(payload.leaderboard.player_entries)) {
            return false;
        }
        return payload.leaderboard.player_entries.length > 0;
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
    async getPlayersBySeason(seasonNumber) {
        try {
            this.logger.log(`Buscando jogadores da temporada ${seasonNumber}`);
            const players = await this.playerEntryRepository.find({
                where: { season_number: seasonNumber },
                order: { position: 'ASC' },
            });
            this.logger.log(`${players.length} jogadores encontrados na temporada ${seasonNumber}`);
            return players;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar jogadores da temporada: ${error.message}`);
            throw new common_1.HttpException('Erro ao buscar jogadores da temporada', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDatabaseStats() {
        try {
            this.logger.log('Calculando estatísticas resumidas do banco de dados');
            const [players, totalPlayers] = await this.playerEntryRepository.findAndCount();
            const seasons = new Set(players.map((p) => p.season_number));
            const totalSeasons = seasons.size;
            let topPlayerByWinRate = null;
            let totalWinRate = 0;
            if (players.length > 0) {
                topPlayerByWinRate = players.reduce((prev, current) => prev.win_rate_percentage > current.win_rate_percentage
                    ? prev
                    : current);
                totalWinRate = players.reduce((sum, player) => sum + player.win_rate_percentage, 0);
            }
            const averageWinRate = players.length > 0 ? totalWinRate / players.length : 0;
            this.logger.log(`Estatísticas calculadas: ${totalPlayers} jogadores, ${totalSeasons} temporadas`);
            return {
                totalPlayers,
                totalSeasons,
                topPlayerByWinRate,
                averageWinRate: Math.round(averageWinRate * 100) / 100,
            };
        }
        catch (error) {
            this.logger.error(`Erro ao calcular estatísticas: ${error.message}`);
            throw new common_1.HttpException('Erro ao calcular estatísticas do banco de dados', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async clearOldData(daysOld = 30) {
        try {
            this.logger.log(`Removendo dados mais antigos que ${daysOld} dias`);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const result = await this.playerEntryRepository
                .createQueryBuilder()
                .delete()
                .where('recorded_at < :cutoffDate', { cutoffDate })
                .execute();
            this.logger.log(`${result.affected || 0} registros removidos`);
            return { deletedCount: result.affected || 0 };
        }
        catch (error) {
            this.logger.error(`Erro ao limpar dados antigos: ${error.message}`);
            throw new common_1.HttpException('Erro ao limpar dados antigos', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(player_entry_entity_1.PlayerEntry)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map