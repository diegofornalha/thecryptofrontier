#!/bin/bash

echo "🔧 Corrigindo Claude Code Specialist"
echo "===================================="

# Parar container atual
docker stop claude-code-specialist
docker rm claude-code-specialist

# Reconstruir com nova versão
cd /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow
docker build -f docker/Dockerfile.claude-code-specialist -t claude-flow/claude-code-specialist:latest .

# Criar diretório de logs com permissões corretas
mkdir -p logs
chmod 777 logs

# Reiniciar sem comando de log problemático
docker run -d \
    --name claude-code-specialist \
    --network agent-network \
    -v /home/strapi/thecryptofrontier/workspace:/workspace:ro \
    -v /home/strapi/thecryptofrontier/CLAUDE.md:/app/CLAUDE.md:ro \
    -p 3008:3008 \
    --restart unless-stopped \
    -e NODE_ENV=production \
    claude-flow/claude-code-specialist:latest

echo "✅ Container reiniciado corretamente!"