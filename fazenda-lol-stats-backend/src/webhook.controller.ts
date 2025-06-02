import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import { WebhookService, WebhookPayload } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  // Endpoint principal para receber webhooks do Discord/InhouseQueue
  @Post()
  async receiveWebhook(
    @Body() payload: WebhookPayload,
    @Headers('webhook-secret') secret?: string,
  ): Promise<any> {
    this.logger.log('Recebida requisição de webhook');

    if (!secret) {
      this.logger.warn('Header webhook-secret ausente');
      throw new HttpException(
        'Missing webhook-secret header',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.webhookService.processWebhook(payload, secret);
  }

  // Endpoints para consultar dados salvos no banco de dados local
  @Get('database/players')
  async getAllPlayersFromDatabase() {
    this.logger.log('Buscando todos os jogadores do banco de dados');
    return await this.webhookService.getAllPlayersFromDatabase();
  }

  @Get('database/player/:playerName')
  async getPlayerFromDatabase(@Param('playerName') playerName: string) {
    this.logger.log(`Buscando jogador ${playerName} no banco de dados`);
    return await this.webhookService.getPlayerFromDatabase(playerName);
  }

  @Get('database/season/:seasonNumber')
  async getPlayersBySeason(@Param('seasonNumber') seasonNumber: string) {
    const seasonNum = parseInt(seasonNumber, 10);
    this.logger.log(`Buscando jogadores da temporada ${seasonNum}`);
    return await this.webhookService.getPlayersBySeason(seasonNum);
  }

  @Get('database/stats')
  async getDatabaseStats() {
    this.logger.log('Buscando estatísticas resumidas do banco de dados');
    return await this.webhookService.getDatabaseStats();
  }

  @Post('database/cleanup')
  async clearOldData(@Query('days') days?: string) {
    const daysOld = days ? parseInt(days, 10) : 30;
    this.logger.log(`Limpando dados mais antigos que ${daysOld} dias`);
    return await this.webhookService.clearOldData(daysOld);
  }
}
