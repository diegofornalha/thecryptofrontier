#!/bin/bash

# Deploy otimizado dos agentes Claude-Flow
# Criado por Guardian + Docker Specialist

set -e

echo "🚀 Iniciando deploy otimizado dos agentes Claude-Flow..."

# Diretório base
BASE_DIR="/home/strapi/thecryptofrontier/claude-flow-diego"
cd "$BASE_DIR"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função para verificar serviço
check_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=0
    
    echo -n "⏳ Aguardando $service na porta $port..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e " ${RED}✗${NC}"
    return 1
}

# 1. Verificar rede Docker
echo "🔧 Verificando rede Docker..."
if ! docker network ls | grep -q "agent-network"; then
    echo "📡 Criando rede agent-network..."
    docker network create agent-network
else
    echo "✅ Rede agent-network já existe"
fi

# 2. Build das imagens
echo -e "\n${YELLOW}🏗️  Building imagens otimizadas...${NC}"
docker compose -f docker-compose.agents-optimized.yml build --parallel

# 3. Parar serviços antigos se existirem
echo -e "\n${YELLOW}🛑 Parando serviços antigos...${NC}"
docker compose -f docker-compose.agents-optimized.yml down

# 4. Limpar volumes antigos (opcional)
if [ "$1" == "--clean" ]; then
    echo -e "\n${YELLOW}🧹 Limpando volumes antigos...${NC}"
    docker volume rm claude-flow-orchestrator-logs claude-flow-agent-logs claude-flow-chroma-data 2>/dev/null || true
fi

# 5. Iniciar serviços core
echo -e "\n${YELLOW}🚀 Iniciando serviços core...${NC}"
docker compose -f docker-compose.agents-optimized.yml up -d agent-log mem0-chroma mem0-bridge

# 6. Aguardar serviços core
echo -e "\n${YELLOW}⏳ Aguardando serviços core...${NC}"
check_service "Agent Log" 3001
check_service "Mem0 Bridge" 3002
check_service "ChromaDB" 8000

# 7. Iniciar Guardian Orchestrator
echo -e "\n${YELLOW}🛡️  Iniciando Guardian Orchestrator...${NC}"
docker compose -f docker-compose.agents-optimized.yml up -d guardian-orchestrator

# 8. Aguardar Guardian
check_service "Guardian Orchestrator" 3000

# 9. Mostrar status
echo -e "\n${YELLOW}📊 Status dos serviços:${NC}"
docker compose -f docker-compose.agents-optimized.yml ps

# 10. Mostrar logs iniciais
echo -e "\n${YELLOW}📜 Logs iniciais:${NC}"
docker compose -f docker-compose.agents-optimized.yml logs --tail=20

# 11. Instruções finais
echo -e "\n${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "\n📋 Comandos úteis:"
echo "  • Ver logs: docker compose -f docker-compose.agents-optimized.yml logs -f"
echo "  • Status: docker compose -f docker-compose.agents-optimized.yml ps"
echo "  • Parar: docker compose -f docker-compose.agents-optimized.yml down"
echo "  • Iniciar especialistas: docker compose -f docker-compose.agents-optimized.yml --profile specialists up -d"
echo "  • Dashboard de logs: http://localhost:5341 (com --profile monitoring)"
echo ""
echo "🔗 Endpoints disponíveis:"
echo "  • Guardian Orchestrator: http://localhost:3000"
echo "  • Agent Log API: http://localhost:3001"
echo "  • Mem0 Bridge: http://localhost:3002"
echo "  • ChromaDB: http://localhost:8000"