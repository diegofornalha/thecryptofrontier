#!/bin/bash

# Script para executar especialistas em modo daemon

echo "🚀 Iniciando Especialistas em Modo Daemon"
echo "========================================"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Garantir que a rede existe
echo "1. Verificando rede agent-network..."
docker network create agent-network 2>/dev/null || true

# Lista de especialistas e portas
declare -A specialists=(
    ["claude-code-specialist"]="3008"
    ["nextjs-specialist"]="3006"
    ["strapi-specialist"]="3007"
    ["cleanup-specialist"]="3005"
)

# Limpar containers anteriores
echo -e "\n2. Limpando containers anteriores..."
for specialist in "${!specialists[@]}"; do
    docker rm -f $specialist 2>/dev/null || true
done

# Iniciar cada especialista
echo -e "\n3. Iniciando especialistas..."
for specialist in "${!specialists[@]}"; do
    port="${specialists[$specialist]}"
    echo -e "\n${YELLOW}Iniciando $specialist na porta $port...${NC}"
    
    # Criar diretório de logs se não existir
    mkdir -p $(pwd)/claude-flow-diego/claude-diego-flow/logs
    
    # Executar em modo daemon com loop infinito
    docker run -d \
        --name $specialist \
        --network agent-network \
        -v $(pwd)/workspace:/workspace:ro \
        -v $(pwd)/CLAUDE.md:/app/CLAUDE.md:ro \
        -v $(pwd)/claude-flow-diego/claude-diego-flow/logs:/app/logs \
        -p ${port}:${port} \
        --restart unless-stopped \
        -e NODE_ENV=production \
        -e ORCHESTRATOR_URL=http://guardian-orchestrator:3003 \
        -e LOG_SERVICE_URL=http://agent-log:3001 \
        -e MCP_BRIDGE_URL=http://mem0-bridge:5173 \
        claude-flow/$specialist:latest \
        /bin/sh -c "
            echo 'Specialist $specialist started at $(date)' > /app/logs/${specialist}.log;
            while true; do 
                echo 'Heartbeat at $(date)' >> /app/logs/${specialist}.log;
                sleep 300;
            done
        "
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $specialist iniciado com sucesso${NC}"
    else
        echo -e "${RED}✗ Erro ao iniciar $specialist${NC}"
    fi
done

# Verificar status
echo -e "\n4. Verificando status dos containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep specialist

echo -e "\n${GREEN}✅ Especialistas iniciados!${NC}"
echo "========================================"

# Comandos úteis
echo -e "\nComandos úteis:"
echo "- Ver logs: docker logs <specialist-name>"
echo "- Parar todos: docker stop \$(docker ps -q --filter name=specialist)"
echo "- Remover todos: docker rm -f \$(docker ps -aq --filter name=specialist)"
echo "- Ver status: docker ps | grep specialist"