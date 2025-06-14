#!/bin/bash

echo "🔄 Alternando Mem0 para modo LOCAL apenas..."

# Verificar status atual
echo "📊 Status atual:"
docker exec mem0-bridge curl -s http://localhost:3002/stats | jq .

# Criar novo docker-compose para Mem0 local
cat > /home/strapi/thecryptofrontier/claude-flow-diego/docker-compose.mem0-local.yml << 'EOF'
version: '3.8'

services:
  mem0-local:
    container_name: mem0-local
    image: claude-flow-diego-mem0-bridge
    restart: unless-stopped
    environment:
      - MEM0_MODE=local
      - DATA_DIR=/data
      - PORT=3002
      # Sem API keys cloud!
    volumes:
      - mem0-data:/data
    ports:
      - "3002:3002"
    networks:
      - claude-flow-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mem0-data:
    driver: local

networks:
  claude-flow-network:
    external: true
EOF

echo "
✅ Configuração criada!

Para ativar o Mem0 LOCAL apenas:

1. Parar o container atual:
   docker stop mem0-bridge && docker rm mem0-bridge

2. Iniciar versão local:
   cd /home/strapi/thecryptofrontier/claude-flow-diego
   docker compose -f docker-compose.mem0-local.yml up -d

3. Verificar:
   curl http://localhost:3002/health

O Mem0 agora funcionará 100% local sem depender de API cloud!
"