import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
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

// Interfaces para chamadas da API (removidas - API só envia dados via webhook)
// As interfaces abaixo são mantidas para compatibilidade com o payload recebido

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly expectedWebhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PlayerEntry)
    private readonly playerEntryRepository: Repository<PlayerEntry>,
  ) {
    const secret: string =
      this.configService.getOrThrow<string>('WEBHOOK_SECRET');
    this.expectedWebhookSecret = secret;
  }
  async processWebhook(
    payload: WebhookPayload,
    receivedSecret: string,
  ): Promise<any> {
    if (this.expectedWebhookSecret !== receivedSecret) {
      this.logger.warn(
        `Tentativa de webhook com secret inválido. Recebido: ${receivedSecret}`,
      );
      throw new HttpException('Invalid webhook-secret', HttpStatus.FORBIDDEN);
    }

    this.logger.log('Webhook recebido e secret validado com sucesso.');

    // Valida o payload antes de processar
    if (!this.validateWebhookPayload(payload)) {
      this.logger.warn('Payload inválido recebido no webhook.');
      throw new HttpException(
        'Payload inválido: player_entries ausente ou malformado.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const leaderboardChannelId =
      payload.leaderboard?.leaderboard_channel_id?.toString();
    const seasonName = payload.season?.name;
    const seasonNumber = payload.season?.number;
    const playerEntriesData = payload.leaderboard?.player_entries || [];

    this.logger.log(
      `Processando ${playerEntriesData.length} entradas de jogadores para a temporada: ${seasonName} (${seasonNumber})`,
    );

    const entriesToSave: PlayerEntry[] = [];
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
      this.logger.log(
        `${entriesToSave.length} entradas de jogador salvas no banco de dados com sucesso.`,
      );
      return {
        message: 'Webhook processado e dados salvos com sucesso!',
        count: entriesToSave.length,
        season: seasonName,
        seasonNumber: seasonNumber,
      };
    } catch (error) {
      this.logger.error('Erro ao salvar entradas no banco de dados:', error);
      if (error instanceof Error) {
        this.logger.error(`Database save error: ${error.message}`);
      }
      throw new HttpException(
        'Erro ao salvar dados no banco.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Método utilitário para validação de webhook
  private validateWebhookPayload(payload: WebhookPayload): boolean {
    if (!payload.leaderboard?.player_entries) {
      return false;
    }

    if (!Array.isArray(payload.leaderboard.player_entries)) {
      return false;
    }

    return payload.leaderboard.player_entries.length > 0;
  }

  /**
   * Busca todos os jogadores salvos no banco de dados
   */
  async getAllPlayersFromDatabase(): Promise<PlayerEntry[]> {
    try {
      this.logger.log('Buscando todos os jogadores do banco de dados');
      const players = await this.playerEntryRepository.find({
        order: { position: 'ASC' },
      });
      this.logger.log(
        `${players.length} jogadores encontrados no banco de dados`,
      );
      return players;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar jogadores do banco: ${error.message}`);
      throw new HttpException(
        'Erro ao buscar jogadores do banco de dados',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca jogador específico no banco de dados
   */
  async getPlayerFromDatabase(playerName: string): Promise<PlayerEntry | null> {
    try {
      this.logger.log(`Buscando jogador ${playerName} no banco de dados`);
      const player = await this.playerEntryRepository.findOne({
        where: { name: playerName },
      });

      if (player) {
        this.logger.log(`Jogador ${playerName} encontrado no banco de dados`);
      } else {
        this.logger.warn(
          `Jogador ${playerName} não encontrado no banco de dados`,
        );
      }

      return player;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar jogador do banco: ${error.message}`);
      throw new HttpException(
        'Erro ao buscar jogador do banco de dados',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca jogadores por temporada específica
   */
  async getPlayersBySeason(seasonNumber: number): Promise<PlayerEntry[]> {
    try {
      this.logger.log(`Buscando jogadores da temporada ${seasonNumber}`);
      const players = await this.playerEntryRepository.find({
        where: { season_number: seasonNumber },
        order: { position: 'ASC' },
      });
      this.logger.log(
        `${players.length} jogadores encontrados na temporada ${seasonNumber}`,
      );
      return players;
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar jogadores da temporada: ${error.message}`,
      );
      throw new HttpException(
        'Erro ao buscar jogadores da temporada',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca estatísticas resumidas do banco de dados
   */
  async getDatabaseStats(): Promise<{
    totalPlayers: number;
    totalSeasons: number;
    topPlayerByWinRate: PlayerEntry | null;
    averageWinRate: number;
  }> {
    try {
      this.logger.log('Calculando estatísticas resumidas do banco de dados');

      const [players, totalPlayers] =
        await this.playerEntryRepository.findAndCount();

      const seasons = new Set(players.map((p) => p.season_number));
      const totalSeasons = seasons.size;

      let topPlayerByWinRate: PlayerEntry | null = null;
      let totalWinRate = 0;

      if (players.length > 0) {
        topPlayerByWinRate = players.reduce((prev, current) =>
          prev.win_rate_percentage > current.win_rate_percentage
            ? prev
            : current,
        );

        totalWinRate = players.reduce(
          (sum, player) => sum + player.win_rate_percentage,
          0,
        );
      }

      const averageWinRate =
        players.length > 0 ? totalWinRate / players.length : 0;

      this.logger.log(
        `Estatísticas calculadas: ${totalPlayers} jogadores, ${totalSeasons} temporadas`,
      );

      return {
        totalPlayers,
        totalSeasons,
        topPlayerByWinRate,
        averageWinRate: Math.round(averageWinRate * 100) / 100,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao calcular estatísticas: ${error.message}`);
      throw new HttpException(
        'Erro ao calcular estatísticas do banco de dados',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Limpa dados antigos do banco (opcional, para manutenção)
   */
  async clearOldData(daysOld: number = 30): Promise<{ deletedCount: number }> {
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
    } catch (error: any) {
      this.logger.error(`Erro ao limpar dados antigos: ${error.message}`);
      throw new HttpException(
        'Erro ao limpar dados antigos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
