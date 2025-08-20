#!/bin/bash
# Script para deploy do Dashboard com Docker

echo "🚀 Deploy do Claude Flow Dashboard"
echo "=================================="

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se mem0-bridge está rodando
if docker ps | grep -q mem0-bridge; then
    echo -e "${GREEN}✅ mem0-bridge está rodando${NC}"
else
    echo -e "${RED}❌ mem0-bridge não está rodando!${NC}"
    echo "O dashboard precisa do mem0-bridge para funcionar."
    echo "Inicie o mem0-bridge primeiro."
    exit 1
fi

# Parar container antigo se existir
if docker ps -a | grep -q claude-flow-dashboard; then
    echo "🛑 Parando dashboard antigo..."
    docker stop claude-flow-dashboard
    docker rm claude-flow-dashboard
fi

# Build da imagem
echo "🔨 Construindo imagem Docker..."
docker build -t claude-flow-dashboard:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao construir imagem${NC}"
    exit 1
fi

# Verificar se a rede existe
if ! docker network ls | grep -q claude-flow-diego_default; then
    echo "📡 Criando rede Docker..."
    docker network create claude-flow-diego_default
fi

# Iniciar container
echo "🐳 Iniciando dashboard..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dashboard iniciado com sucesso!${NC}"
    echo ""
    echo "📊 Acesse o dashboard em:"
    echo "   - http://localhost:5001 (Dashboard principal)"
    echo "   - http://localhost:5001/memories (Gestão de Memórias)"
    echo "   - http://localhost:5001/services (Serviços)"
    echo "   - http://localhost:5001/tasks (Timeline de Tarefas)"
    echo ""
    echo "🔍 Comandos úteis:"
    echo "   - Ver logs: docker logs -f claude-flow-dashboard"
    echo "   - Parar: docker-compose down"
    echo "   - Status: docker ps | grep dashboard"
else
    echo -e "${RED}❌ Erro ao iniciar dashboard${NC}"
    exit 1
fi