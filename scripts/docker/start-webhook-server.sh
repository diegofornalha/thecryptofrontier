#!/bin/bash

# Script para iniciar o servidor de webhook em Docker
# Uso: ./start-webhook-server.sh

set -e

echo "🚀 Iniciando servidor de webhook CrewAI em Docker"
echo "================================================"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Diretório do projeto
PROJECT_DIR="/home/strapi/thecryptofrontier/framework_crewai/blog_crew"

# Navegar para o diretório
cd "$PROJECT_DIR"

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cat > .env << EOF
# Webhook Configuration
WEBHOOK_SECRET=crew-ai-webhook-secret-2025

# Strapi Configuration
STRAPI_URL=http://localhost:1338
STRAPI_API_TOKEN=${STRAPI_API_TOKEN}
EOF
fi

# Parar container existente se houver
echo -e "\n${YELLOW}Parando container existente...${NC}"
docker compose -f docker-compose.webhook.yml down 2>/dev/null || true

# Construir imagem
echo -e "\n${YELLOW}Construindo imagem Docker...${NC}"
docker compose -f docker-compose.webhook.yml build

# Iniciar container
echo -e "\n${YELLOW}Iniciando container...${NC}"
docker compose -f docker-compose.webhook.yml up -d

# Aguardar container inicializar
echo -e "\n${YELLOW}Aguardando servidor inicializar...${NC}"
sleep 5

# Verificar se está rodando
if docker ps | grep -q crewai-webhook-server; then
    echo -e "\n${GREEN}✅ Servidor de webhook iniciado com sucesso!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "📍 URL do Webhook: https://webhook-crewai.agentesintegrados.com/webhook/strapi"
    echo "🔐 Authorization: Bearer crew-ai-webhook-secret-2025"
    echo ""
    echo "📊 Endpoints disponíveis:"
    echo "   - Health: https://webhook-crewai.agentesintegrados.com/health"
    echo "   - Eventos: https://webhook-crewai.agentesintegrados.com/webhook/events"
    echo ""
    echo "📝 Logs: docker logs -f crewai-webhook-server"
else
    echo -e "\n${RED}❌ Erro ao iniciar servidor${NC}"
    echo "Verifique os logs: docker logs crewai-webhook-server"
    exit 1
fi