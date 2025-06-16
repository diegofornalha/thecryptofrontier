#!/bin/bash

echo "📝 Habilitando logs persistentes para especialistas"
echo "================================================"

# Criar diretório de logs local
mkdir -p /home/strapi/thecryptofrontier/claude-flow-diego/logs
chmod 755 /home/strapi/thecryptofrontier/claude-flow-diego/logs

# Parar containers
docker stop claude-code-specialist nextjs-specialist strapi-specialist cleanup-specialist 2>/dev/null
docker rm claude-code-specialist nextjs-specialist strapi-specialist cleanup-specialist 2>/dev/null

# Reiniciar com volume de logs
docker run -d \
    --name claude-code-specialist \
    --network agent-network \
    -v /home/strapi/thecryptofrontier/workspace:/workspace:ro \
    -v /home/strapi/thecryptofrontier/CLAUDE.md:/app/CLAUDE.md:ro \
    -v /home/strapi/thecryptofrontier/claude-flow-diego/logs:/app/logs:rw \
    -p 3008:3008 \
    --restart unless-stopped \
    -e NODE_ENV=production \
    claude-flow/claude-code-specialist:latest

echo "✅ Logs habilitados em: /home/strapi/thecryptofrontier/claude-flow-diego/logs"
echo ""
echo "Para ver logs:"
echo "- Logs do Docker: docker logs claude-code-specialist"
echo "- Logs do app: tail -f /home/strapi/thecryptofrontier/claude-flow-diego/logs/*.log"