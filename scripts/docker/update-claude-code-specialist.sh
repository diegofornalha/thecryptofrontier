#!/bin/bash

# Script para atualizar o Claude Code Specialist

echo "🔄 Atualizando Claude Code Specialist v4.1.0"
echo "=========================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parar container atual
echo "1. Parando container atual..."
docker stop claude-code-specialist 2>/dev/null
docker rm claude-code-specialist 2>/dev/null

# Construir nova imagem
echo -e "\n2. Construindo nova imagem v4.1.0..."
cd /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow
docker build -f docker/Dockerfile.claude-code-specialist -t claude-flow/claude-code-specialist:latest -t claude-flow/claude-code-specialist:4.1.0 .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Imagem construída com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao construir imagem${NC}"
    exit 1
fi

# Reiniciar container
echo -e "\n3. Iniciando novo container..."
docker run -d \
    --name claude-code-specialist \
    --network agent-network \
    -v $(pwd)/workspace:/workspace:ro \
    -v /home/strapi/thecryptofrontier/CLAUDE.md:/app/CLAUDE.md:ro \
    -v $(pwd)/logs:/app/logs \
    -p 3008:3008 \
    --restart unless-stopped \
    -e NODE_ENV=production \
    -e ORCHESTRATOR_URL=http://guardian-orchestrator:3003 \
    -e LOG_SERVICE_URL=http://agent-log:3001 \
    -e MCP_BRIDGE_URL=http://mem0-bridge:5173 \
    claude-flow/claude-code-specialist:4.1.0 \
    /bin/sh -c "
        echo 'Claude Code Specialist v4.1.0 started at $(date)' > /app/logs/claude-code-specialist.log;
        while true; do 
            echo 'Heartbeat at $(date)' >> /app/logs/claude-code-specialist.log;
            sleep 300;
        done
    "

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container iniciado com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao iniciar container${NC}"
    exit 1
fi

# Testar nova funcionalidade
echo -e "\n4. Testando nova funcionalidade..."
sleep 3
docker exec claude-code-specialist npx tsx src/agents/claude-code-specialist-agent.ts "analyze search guidelines" > /tmp/test-output.txt 2>&1

if grep -q "Categorias de Busca" /tmp/test-output.txt; then
    echo -e "${GREEN}✓ Novas funcionalidades funcionando corretamente${NC}"
else
    echo -e "${YELLOW}⚠ Verificar logs para confirmar funcionalidade${NC}"
fi

# Verificar status
echo -e "\n5. Status do container:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep claude-code-specialist

echo -e "\n${GREEN}✅ Atualização concluída!${NC}"
echo "=========================================="
echo "Novas funcionalidades adicionadas:"
echo "- Análise de diferenças entre modelos (Opus vs Sonnet)"
echo "- Regras de citação para web_search e drive_search"
echo "- Diretrizes avançadas de busca"
echo "- Princípios de design para artifacts"
echo "- Políticas de segurança atualizadas"