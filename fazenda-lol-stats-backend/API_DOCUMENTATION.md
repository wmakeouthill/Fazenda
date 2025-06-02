# Documentação da API - Fazenda LoL Stats Backend

## Endpoints disponíveis

### Webhook (POST)
- **URL**: `POST /webhook`
- **Headers**: 
  - `webhook-secret`: seu_webhook_secret_aqui
- **Descrição**: Recebe webhooks do InhouseQueue para salvar dados no banco

### Teste de Conexão
- **URL**: `GET /webhook/test-connection`
- **Descrição**: Testa a conectividade com a API do InhouseQueue

### Leaderboard
- **URL**: `GET /webhook/leaderboard/:serverId`
- **Parâmetros**:
  - `serverId`: ID do servidor Discord
  - `channelId` (query, opcional): ID do canal do leaderboard
- **Exemplo**: `GET /webhook/leaderboard/123456789012345678?channelId=987654321098765432`
- **Descrição**: Busca o leaderboard atual do servidor

### Estatísticas de Jogador
- **URL**: `GET /webhook/player/:serverId/:playerName`
- **Parâmetros**:
  - `serverId`: ID do servidor Discord
  - `playerName`: Nome do jogador
- **Exemplo**: `GET /webhook/player/123456789012345678/NomeDoJogador`
- **Descrição**: Busca estatísticas específicas de um jogador

### Temporada Atual
- **URL**: `GET /webhook/season/:serverId`
- **Parâmetros**:
  - `serverId`: ID do servidor Discord
- **Exemplo**: `GET /webhook/season/123456789012345678`
- **Descrição**: Busca informações da temporada atual

### Top Jogadores
- **URL**: `GET /webhook/top-players/:serverId`
- **Parâmetros**:
  - `serverId`: ID do servidor Discord
  - `limit` (query, opcional): Número de jogadores (padrão: 10)
- **Exemplo**: `GET /webhook/top-players/123456789012345678?limit=5`
- **Descrição**: Busca os top N jogadores do leaderboard

### Dados do Banco de Dados

#### Todos os Jogadores
- **URL**: `GET /webhook/database/players`
- **Descrição**: Busca todos os jogadores salvos no banco de dados local

#### Jogador Específico
- **URL**: `GET /webhook/database/player/:playerName`
- **Parâmetros**:
  - `playerName`: Nome do jogador
- **Exemplo**: `GET /webhook/database/player/NomeDoJogador`
- **Descrição**: Busca um jogador específico no banco de dados local

#### Jogadores por Temporada
- **URL**: `GET /webhook/database/season/:seasonNumber`
- **Parâmetros**:
  - `seasonNumber`: Número da temporada
- **Exemplo**: `GET /webhook/database/season/2`
- **Descrição**: Busca todos os jogadores de uma temporada específica

#### Estatísticas Resumidas
- **URL**: `GET /webhook/database/stats`
- **Descrição**: Retorna estatísticas resumidas do banco de dados
- **Resposta**:
  ```json
  {
    "totalPlayers": 4,
    "totalSeasons": 2,
    "topPlayerByWinRate": { /* dados do jogador com maior winrate */ },
    "averageWinRate": 72.22
  }
  ```

#### Limpeza de Dados Antigos
- **URL**: `POST /webhook/database/cleanup`
- **Parâmetros**:
  - `days` (query, opcional): Dias para considerar dados antigos (padrão: 30)
- **Exemplo**: `POST /webhook/database/cleanup?days=60`
- **Descrição**: Remove dados mais antigos que X dias

## Como testar

1. **Inicie o servidor**:
   ```bash
   cd fazenda-lol-stats-backend
   npm run start:dev
   ```

2. **Teste a conexão com a API**:
   ```bash
   curl http://localhost:3000/webhook/test-connection
   ```

3. **Teste buscar leaderboard** (substitua pelo ID real do seu servidor):
   ```bash
   curl http://localhost:3000/webhook/leaderboard/SEU_SERVER_ID_AQUI
   ```

4. **Teste buscar jogadores do banco**:
   ```bash
   curl http://localhost:3000/webhook/database/players
   ```

5. **Teste webhook com dados de exemplo**:
   ```bash
   curl -X POST http://localhost:3000/webhook \
     -H "Content-Type: application/json" \
     -H "webhook-secret: fazendeirosdoabaete" \
     -d '{
       "leaderboard": {
         "leaderboard_channel_id": "123456789012345678",
         "player_entries": [
           {
             "name": "JogadorTeste",
             "position": 1,
             "wins": 10,
             "losses": 2,
             "total_games": 12,
             "win_rate_percentage": 83.33,
             "mmr": 1500,
             "most_played_role": {
               "name": "ADC",
               "frequency": 8
             }
           }
         ]
       },
       "season": {
         "name": "Season Test",
         "number": 1
       }
     }'
   ```

6. **Teste estatísticas resumidas**:
   ```bash
   curl http://localhost:3000/webhook/database/stats
   ```

## Configuração

### Variáveis de Ambiente (.env)
- `WEBHOOK_SECRET`: Secret para validar webhooks
- `INHOUSE_API_BASE_URL`: URL base da API do InhouseQueue (padrão: https://api.inhousequeue.xyz)
- `INHOUSE_API_KEY`: Chave da API (se necessário)
- `DISCORD_SERVER_ID`: ID do seu servidor Discord para testes

### Estrutura de Dados

#### LeaderboardEntry
```typescript
interface LeaderboardEntry {
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
```

#### LeaderboardResponse
```typescript
interface LeaderboardResponse {
  leaderboard: {
    leaderboard_channel_id: string;
    player_entries: LeaderboardEntry[];
  };
  season: {
    name: string;
    number: number;
  };
}
```

#### PlayerEntry (Banco de Dados)
```typescript
interface PlayerEntry {
  id: number;
  name: string;
  most_played_role_name?: string;
  most_played_role_frequency?: number;
  position: number;
  wins: number;
  losses: number;
  total_games: number;
  win_rate_percentage: number;
  mmr: number;
  leaderboard_channel_id: string;
  season_name: string;
  season_number: number;
  recorded_at: Date;
}
```

## Funcionalidades Implementadas

### ✅ Webhooks
- Recebimento e validação de webhooks do InhouseQueue
- Salvamento automático de dados no banco SQLite
- Logs detalhados de todas as operações

### ✅ Consultas da API
- Teste de conectividade com a API do InhouseQueue
- Busca de leaderboard por servidor
- Busca de estatísticas de jogador específico
- Busca de informações de temporada
- Busca de top jogadores

### ✅ Banco de Dados Local
- Armazenamento de dados históricos
- Consultas por jogador, temporada ou geral
- Estatísticas resumidas calculadas
- Limpeza de dados antigos
- Backup automático via SQLite

### ✅ Logs e Monitoramento
- Logs estruturados com timestamps
- Tracking de todas as operações
- Logs de erro detalhados
- Monitoramento de performance

## Logs

O serviço fornece logs detalhados para todas as operações:
- Requisições de webhook recebidas
- Chamadas à API do InhouseQueue
- Operações no banco de dados
- Erros e exceções

Os logs podem ser visualizados no console quando o servidor está rodando.

## Próximos Passos

Para conectar com o frontend Angular:
1. Configure CORS no backend se necessário
2. Implemente autenticação se necessário
3. Crie endpoints específicos para as necessidades do frontend
4. Adicione paginação para grandes volumes de dados
5. Implemente cache para melhor performance
