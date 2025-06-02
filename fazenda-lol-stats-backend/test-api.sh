#!/bin/bash

# Script para testar os endpoints da API do InhouseQueue

BASE_URL="http://localhost:3000/webhook"
WEBHOOK_SECRET="fazendeirosdoabaete"

echo "=== Testando API do Fazenda LoL Stats Backend ==="

echo -e "\n1. Testando conexão com a API..."
curl -s "$BASE_URL/test-connection" | jq 2>/dev/null || curl -s "$BASE_URL/test-connection"

echo -e "\n\n2. Testando busca de jogadores no banco de dados..."
curl -s "$BASE_URL/database/players" | jq 2>/dev/null || curl -s "$BASE_URL/database/players"

echo -e "\n\n3. Enviando webhook de teste..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-secret: $WEBHOOK_SECRET" \
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
        },
        {
          "name": "OutroJogador",
          "position": 2,
          "wins": 8,
          "losses": 4,
          "total_games": 12,
          "win_rate_percentage": 66.67,
          "mmr": 1400,
          "most_played_role": {
            "name": "Support",
            "frequency": 9
          }
        }
      ]
    },
    "season": {
      "name": "Season 1",
      "number": 1
    }
  }' | jq 2>/dev/null || curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-secret: $WEBHOOK_SECRET" \
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
        },
        {
          "name": "OutroJogador",
          "position": 2,
          "wins": 8,
          "losses": 4,
          "total_games": 12,
          "win_rate_percentage": 66.67,
          "mmr": 1400,
          "most_played_role": {
            "name": "Support",
            "frequency": 9
          }
        }
      ]
    },
    "season": {
      "name": "Season 1",
      "number": 1
    }
  }'

echo -e "\n\n4. Verificando jogadores salvos no banco após webhook..."
curl -s "$BASE_URL/database/players" | jq 2>/dev/null || curl -s "$BASE_URL/database/players"

echo -e "\n\n5. Testando busca de jogador específico..."
curl -s "$BASE_URL/database/player/JogadorTeste" | jq 2>/dev/null || curl -s "$BASE_URL/database/player/JogadorTeste"

echo -e "\n\n=== Testes concluídos ==="
