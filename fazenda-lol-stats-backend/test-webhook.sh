#!/bin/bash

# Script de teste para o webhook da Fazenda LoL Stats
# Execute com: bash test-webhook.sh

BASE_URL="http://localhost:3000"
WEBHOOK_SECRET="fazendeirosdoabaete"

echo "🌾 Testando Webhook da Fazenda LoL Stats 🌾"
echo "============================================"

# Função para teste de webhook
test_webhook() {
    echo "📡 Testando webhook com dados da Temporada da Colheita..."
    
    response=$(curl -s -X POST "$BASE_URL/webhook" \
        -H "Content-Type: application/json" \
        -H "webhook-secret: $WEBHOOK_SECRET" \
        -d '{
            "leaderboard": {
                "leaderboard_channel_id": "999888777666555444",
                "player_entries": [
                    {
                        "name": "CeifadorDeSafras",
                        "position": 1,
                        "wins": 22,
                        "losses": 3,
                        "total_games": 25,
                        "win_rate_percentage": 88.0,
                        "mmr": 1450,
                        "most_played_role": {
                            "name": "ADC",
                            "frequency": 20
                        }
                    },
                    {
                        "name": "GuardiaoDasFazendas",
                        "position": 2,
                        "wins": 19,
                        "losses": 6,
                        "total_games": 25,
                        "win_rate_percentage": 76.0,
                        "mmr": 1380,
                        "most_played_role": {
                            "name": "Top",
                            "frequency": 22
                        }
                    },
                    {
                        "name": "PlantadorDeVitorias",
                        "position": 3,
                        "wins": 17,
                        "losses": 8,
                        "total_games": 25,
                        "win_rate_percentage": 68.0,
                        "mmr": 1320,
                        "most_played_role": {
                            "name": "Mid",
                            "frequency": 18
                        }
                    }
                ]
            },
            "season": {
                "name": "Temporada da Grande Colheita",
                "number": 5
            }
        }')
    
    echo "Resposta: $response"
    echo ""
}

# Função para verificar dados salvos
check_database() {
    echo "🗃️ Verificando dados no banco..."
    
    echo "Total de jogadores:"
    curl -s "$BASE_URL/webhook/database/stats" | jq '.totalPlayers'
    
    echo ""
    echo "Jogadores da Temporada 5:"
    curl -s "$BASE_URL/webhook/database/season/5" | jq '.[] | {name: .name, wins: .wins, losses: .losses, mmr: .mmr}'
    
    echo ""
}

# Função para verificar conectividade
check_server() {
    echo "🚀 Verificando se o servidor está rodando..."
    
    if curl -s "$BASE_URL" > /dev/null; then
        echo "✅ Servidor está rodando em $BASE_URL"
    else
        echo "❌ Servidor não está respondendo"
        exit 1
    fi
    echo ""
}

# Executar testes
check_server
test_webhook
check_database

echo "🎉 Testes concluídos!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure a URL do webhook no Discord: /premium webhook_url $BASE_URL/webhook"
echo "2. Configure CORS se necessário para o frontend Angular"
echo "3. Deploy para produção com HTTPS"
