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
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const webhook_service_1 = require("./webhook.service");
let WebhookController = WebhookController_1 = class WebhookController {
    webhookService;
    logger = new common_1.Logger(WebhookController_1.name);
    constructor(webhookService) {
        this.webhookService = webhookService;
    }
    async receiveWebhook(payload, secret) {
        this.logger.log('Recebida requisição de webhook');
        if (!secret) {
            this.logger.warn('Header webhook-secret ausente');
            throw new common_1.HttpException('Missing webhook-secret header', common_1.HttpStatus.BAD_REQUEST);
        }
        return await this.webhookService.processWebhook(payload, secret);
    }
    async getAllPlayersFromDatabase() {
        this.logger.log('Buscando todos os jogadores do banco de dados');
        return await this.webhookService.getAllPlayersFromDatabase();
    }
    async getPlayerFromDatabase(playerName) {
        this.logger.log(`Buscando jogador ${playerName} no banco de dados`);
        return await this.webhookService.getPlayerFromDatabase(playerName);
    }
    async getPlayersBySeason(seasonNumber) {
        const seasonNum = parseInt(seasonNumber, 10);
        this.logger.log(`Buscando jogadores da temporada ${seasonNum}`);
        return await this.webhookService.getPlayersBySeason(seasonNum);
    }
    async getDatabaseStats() {
        this.logger.log('Buscando estatísticas resumidas do banco de dados');
        return await this.webhookService.getDatabaseStats();
    }
    async clearOldData(days) {
        const daysOld = days ? parseInt(days, 10) : 30;
        this.logger.log(`Limpando dados mais antigos que ${daysOld} dias`);
        return await this.webhookService.clearOldData(daysOld);
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('webhook-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "receiveWebhook", null);
__decorate([
    (0, common_1.Get)('database/players'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getAllPlayersFromDatabase", null);
__decorate([
    (0, common_1.Get)('database/player/:playerName'),
    __param(0, (0, common_1.Param)('playerName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getPlayerFromDatabase", null);
__decorate([
    (0, common_1.Get)('database/season/:seasonNumber'),
    __param(0, (0, common_1.Param)('seasonNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getPlayersBySeason", null);
__decorate([
    (0, common_1.Get)('database/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getDatabaseStats", null);
__decorate([
    (0, common_1.Post)('database/cleanup'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "clearOldData", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, common_1.Controller)('webhook'),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map