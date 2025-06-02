import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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

// Interfaces para chamadas da API
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

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly expectedWebhookSecret: string;
  private readonly inhouseApiConfig: {
    baseUrl: string;
    apiKey?: string;
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(PlayerEntry)
    private readonly playerEntryRepository: Repository<PlayerEntry>,
  ) {
    const secret: string =
      this.configService.getOrThrow<string>('WEBHOOK_SECRET');
    this.expectedWebhookSecret = secret;    // Configuração da API do InhouseQueue
    this.inhouseApiConfig = {
      baseUrl: this.configService.get<string>(
        'INHOUSE_API_BASE_URL',
        'https://api.inhousequeue.xyz',
      ),
      apiKey: this.configService.get<string>('INHOUSE_API_KEY'),
    };
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

    const leaderboardChannelId =
      payload.leaderboard?.leaderboard_channel_id?.toString();
    const seasonName = payload.season?.name;
    const seasonNumber = payload.season?.number;
    const playerEntriesData = payload.leaderboard?.player_entries;

    if (!playerEntriesData || !Array.isArray(playerEntriesData)) {
      this.logger.warn('Payload não contém player_entries válidos.');
      throw new HttpException(
        'Payload inválido: player_entries ausente ou malformado.',
        HttpStatus.BAD_REQUEST,
      );
    }

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
        `${entriesToSave.length} entradas de jogador salvas no banco de dados.`,
      );
      return {
        message: 'Webhook processado e dados salvos com sucesso!',
        count: entriesToSave.length,
      };
    } catch (error) {
      this.logger.error('Erro ao salvar entradas no banco de dados:', error);
      if (error instanceof Error) {
        this.logger.error(`Database save error: ${error.message}`);
      }
      throw new HttpException(
        'Erro ao salvar dados no banco.',
        HttpStatus.INTERNAL_SERVER_ERROR,      );
    }
  }

  // Métodos para fazer chamadas à API do InhouseQueue
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.inhouseApiConfig.apiKey) {
      headers['Authorization'] = `Bearer ${this.inhouseApiConfig.apiKey}`;
    }

    return headers;
  }

  /**
   * Busca o leaderboard de um servidor específico
   * @param serverId ID do servidor Discord
   * @param channelId ID do canal do leaderboard (opcional)
   */
  async getLeaderboard(serverId: string, channelId?: string): Promise<LeaderboardResponse> {
    try {
      this.logger.log(`Buscando leaderboard para servidor: ${serverId}`);

      let url = `${this.inhouseApiConfig.baseUrl}/leaderboard/${serverId}`;
      if (channelId) {
        url += `/${channelId}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
        })
      );

      this.logger.log(`Leaderboard obtido com sucesso. ${response.data?.leaderboard?.player_entries?.length || 0} jogadores encontrados`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar leaderboard: ${error.message}`);
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      }
      throw new HttpException(
        `Erro ao buscar leaderboard: ${error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca estatísticas de um jogador específico
   * @param serverId ID do servidor Discord
   * @param playerName Nome do jogador
   */
  async getPlayerStats(serverId: string, playerName: string): Promise<LeaderboardEntry | null> {
    try {
      this.logger.log(`Buscando estatísticas do jogador: ${playerName} no servidor: ${serverId}`);

      const leaderboard = await this.getLeaderboard(serverId);
      const player = leaderboard.leaderboard.player_entries.find(
        entry => entry.name.toLowerCase() === playerName.toLowerCase()
      );

      if (!player) {
        this.logger.warn(`Jogador ${playerName} não encontrado no leaderboard`);
        return null;
      }

      this.logger.log(`Estatísticas do jogador ${playerName} obtidas com sucesso`);
      return player;
    } catch (error) {
      this.logger.error(`Erro ao buscar estatísticas do jogador: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca informações da temporada atual
   * @param serverId ID do servidor Discord
   */
  async getCurrentSeason(serverId: string): Promise<{ name: string; number: number }> {
    try {
      this.logger.log(`Buscando temporada atual para servidor: ${serverId}`);

      const leaderboard = await this.getLeaderboard(serverId);

      this.logger.log(`Temporada atual obtida: ${leaderboard.season.name} (${leaderboard.season.number})`);
      return leaderboard.season;
    } catch (error) {
      this.logger.error(`Erro ao buscar temporada atual: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca top N jogadores do leaderboard
   * @param serverId ID do servidor Discord
   * @param limit Número de jogadores a retornar (padrão: 10)
   */
  async getTopPlayers(serverId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      this.logger.log(`Buscando top ${limit} jogadores para servidor: ${serverId}`);

      const leaderboard = await this.getLeaderboard(serverId);
      const topPlayers = leaderboard.leaderboard.player_entries
        .sort((a, b) => a.position - b.position)
        .slice(0, limit);

      this.logger.log(`Top ${limit} jogadores obtidos com sucesso`);
      return topPlayers;
    } catch (error) {
      this.logger.error(`Erro ao buscar top jogadores: ${error.message}`);
      throw error;
    }
  }

  /**
   * Testa a conectividade com a API
   */
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      this.logger.log('Testando conexão com a API do InhouseQueue');

      // Tenta fazer uma requisição simples para testar a conectividade
      const response = await firstValueFrom(
        this.httpService.get(`${this.inhouseApiConfig.baseUrl}/health`, {
          headers: this.getHeaders(),
          timeout: 5000,
        })
      );

      this.logger.log('Conexão com a API testada com sucesso');
      return {
        status: 'success',
        message: 'Conexão com a API funcionando corretamente',
      };
    } catch (error) {
      this.logger.error(`Erro ao testar conexão: ${error.message}`);
      return {
        status: 'error',
        message: `Erro de conexão: ${error.message}`,
      };
    }
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
      this.logger.log(`${players.length} jogadores encontrados no banco de dados`);
      return players;
    } catch (error) {
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
        this.logger.warn(`Jogador ${playerName} não encontrado no banco de dados`);
      }

      return player;
    } catch (error) {
      this.logger.error(`Erro ao buscar jogador do banco: ${error.message}`);
      throw new HttpException(
        'Erro ao buscar jogador do banco de dados',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
