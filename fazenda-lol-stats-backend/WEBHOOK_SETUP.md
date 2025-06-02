# Configuração do Webhook - Fazenda LoL Stats

## Visão Geral

O backend da Fazenda LoL Stats foi projetado para **receber** dados do bot InhouseQueue via webhook, não para fazer requisições GET para uma API externa. O bot do Discord envia automaticamente os dados do leaderboard para nosso endpoint quando há atualizações.

## Como Funciona

1. **Bot do Discord (InhouseQueue)** → envia dados → **Nosso Backend**
2. **Nosso Backend** → salva no banco SQLite → **Frontend Angular consulta**

## Configuração no Discord

### 1. Configurar a URL do Webhook

Use o comando do Discord para configurar a URL do webhook:

```
/premium webhook_url https://sua-url.com/webhook
```

**Exemplos:**
- Desenvolvimento local: `http://localhost:3000/webhook`
- Produção: `https://fazenda-lol-stats.herokuapp.com/webhook`
- ngrok (para teste): `https://abc123.ngrok.io/webhook`

### 2. Configurar o Secret (Opcional mas Recomendado)

O secret é configurado no arquivo `.env` do backend:

```bash
WEBHOOK_SECRET=seu_secret_super_secreto_aqui_12345
```

## Endpoints Disponíveis

### Webhook (Principal)
- **POST** `/webhook` - Recebe dados do bot Discord
  - Header: `webhook-secret: seu_secret`
  - Body: JSON com dados do leaderboard

### Consultas do Banco de Dados
- **GET** `/webhook/database/players` - Todos os jogadores
- **GET** `/webhook/database/player/:playerName` - Jogador específico
- **GET** `/webhook/database/season/:seasonNumber` - Jogadores por temporada
- **GET** `/webhook/database/stats` - Estatísticas resumidas
- **POST** `/webhook/database/cleanup?days=30` - Limpar dados antigos

## Exemplo de Payload Recebido

```json
{
  "leaderboard": {
    "leaderboard_channel_id": "123456789012345678",
    "player_entries": [
      {
        "name": "NomeDoJogador",
        "position": 1,
        "wins": 15,
        "losses": 5,
        "total_games": 20,
        "win_rate_percentage": 75.0,
        "mmr": 1250,
        "most_played_role": {
          "name": "ADC",
          "frequency": 12
        }
      }
    ]
  },
  "season": {
    "name": "Season 3",
    "number": 3
  }
}
```

## Testando o Webhook

### 1. Com curl:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "webhook-secret: seu_secret" \
  -d '{
    "leaderboard": {
      "leaderboard_channel_id": "123456789",
      "player_entries": [
        {
          "name": "TestPlayer",
          "position": 1,
          "wins": 10,
          "losses": 5,
          "total_games": 15,
          "win_rate_percentage": 66.67,
          "mmr": 1200
        }
      ]
    },
    "season": {
      "name": "Test Season",
      "number": 1
    }
  }'
```

### 2. Verificando dados salvos:

```bash
curl http://localhost:3000/webhook/database/players
```

## Configuração para Produção

### 1. Usar HTTPS

O Discord **requer HTTPS** para webhooks em produção. Opções:

- **Heroku**: Fornece HTTPS automaticamente
- **Vercel/Netlify**: Para aplicações serverless
- **VPS com Nginx + Let's Encrypt**
- **Railway/Render**: Alternativas ao Heroku

### 2. ngrok para Testes Locais

Para testar com o Discord real:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Usar a URL do ngrok no Discord
# Exemplo: https://abc123.ngrok.io/webhook
```

### 3. Logs e Monitoramento

O backend registra todos os webhooks recebidos:

```bash
# Ver logs em tempo real
npm run start:dev

# Ou em produção
npm run start:prod
```

## Comandos do Bot Discord

Para gerenciar o webhook no Discord:

```bash
# Configurar URL
/premium webhook_url https://sua-url.com/webhook

# Remover webhook
/premium webhook_url delete:true

# Verificar configuração atual
/premium webhook_url
```

## Estrutura dos Dados Salvos

Cada entrada de jogador é salva com:

- `name`: Nome do jogador
- `position`: Posição no ranking
- `wins/losses/total_games`: Estatísticas de partidas
- `win_rate_percentage`: Taxa de vitória
- `mmr`: Rating do jogador
- `most_played_role_name/frequency`: Role mais jogada
- `leaderboard_channel_id`: ID do canal do Discord
- `season_name/season_number`: Informações da temporada
- `recorded_at`: Timestamp da gravação

## Próximos Passos

1. ✅ Backend configurado para receber webhooks
2. 🔄 Configurar URL no bot Discord
3. 🔄 Conectar frontend Angular ao backend
4. 🔄 Implementar CORS se necessário
5. 🔄 Deploy para produção com HTTPS
