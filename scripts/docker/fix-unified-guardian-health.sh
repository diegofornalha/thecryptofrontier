#!/bin/bash

echo "🔧 Corrigindo health check do unified-guardian"
echo "==========================================="

# Parar container
docker stop unified-guardian

# Remover container
docker rm unified-guardian

# Recriar com health check correto
docker run -d \
    --name unified-guardian \
    --network agent-network \
    -p 3003:3003 \
    --restart unless-stopped \
    --health-cmd "wget -q -O- http://localhost:3003/health || exit 1" \
    --health-interval 30s \
    --health-timeout 3s \
    --health-retries 3 \
    claude-flow/unified-guardian:latest

echo "✅ unified-guardian recriado com health check correto!"
echo ""
echo "Aguardando 10 segundos para verificar..."
sleep 10

docker ps --format "table {{.Names}}\t{{.Status}}" | grep unified-guardian