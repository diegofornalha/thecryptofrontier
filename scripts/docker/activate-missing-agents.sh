#!/bin/bash

echo "🚀 Ativando agentes que ainda não estão rodando"
echo "=============================================="

# Docker Specialist
echo "1. Ativando Docker Specialist..."
cd /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow

# Construir imagem
docker build -f docker/Dockerfile.docker-specialist -t claude-flow/docker-specialist:latest .

# Executar
docker run -d \
    --name docker-specialist \
    --network agent-network \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    -v /home/strapi/thecryptofrontier:/workspace:ro \
    -p 3009:3009 \
    --restart unless-stopped \
    claude-flow/docker-specialist:latest

echo "✅ Docker Specialist ativado na porta 3009"

# Para MCP Direct Agent e Guardian Bridge, precisamos criar Dockerfiles primeiro
echo ""
echo "⚠️ Os seguintes agentes precisam de Dockerfiles:"
echo "   - mcp-direct-agent"
echo "   - guardian-bridge-agent"
echo ""
echo "📊 Status após ativação:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(specialist|agent|guardian)"