#!/bin/bash

# Script para atualizar o Guardian para versão Unificada

echo "🛡️ Atualizando Guardian para versão Unificada..."

# Parar container atual
echo "📦 Parando Guardian atual..."
docker stop organization-guardian 2>/dev/null
docker rm organization-guardian 2>/dev/null

# Build da nova imagem
echo "🔨 Construindo nova imagem do Guardian Unificado..."
docker build -f /home/strapi/thecryptofrontier/claude-flow-diego/Dockerfile.guardian-unified \
  -t guardian-unified:latest \
  /home/strapi/thecryptofrontier/claude-flow-diego

# Criar rede se não existir
docker network create claude-network 2>/dev/null

# Iniciar novo container
echo "🚀 Iniciando Guardian Unificado..."
docker run -d \
  --name unified-guardian \
  --network claude-network \
  -p 3003:3003 \
  -v /home/strapi/thecryptofrontier:/workspace:ro \
  -v guardian-data:/app/data \
  -v guardian-logs:/app/logs \
  -e NODE_ENV=production \
  -e PROJECT_PATH=/workspace \
  -e MEMORY_ENABLED=true \
  -e MCP_ENABLED=true \
  -e AUTO_FIX=false \
  --restart unless-stopped \
  guardian-unified:latest

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 10

# Verificar saúde
echo "🏥 Verificando saúde do Guardian..."
if curl -s http://localhost:3003/health | grep -q "ok"; then
  echo "✅ Guardian Unificado iniciado com sucesso!"
  
  # Mostrar status
  echo ""
  echo "📊 Status do Guardian:"
  curl -s http://localhost:3003/status | jq .
  
  echo ""
  echo "🎯 Guardian Unificado está pronto!"
  echo "   - Health: http://localhost:3003/health"
  echo "   - Status: http://localhost:3003/status"
  echo "   - Analyze: POST http://localhost:3003/analyze"
  echo "   - History: http://localhost:3003/history"
else
  echo "❌ Erro ao iniciar Guardian Unificado"
  echo "📋 Logs:"
  docker logs unified-guardian --tail 50
  exit 1
fi