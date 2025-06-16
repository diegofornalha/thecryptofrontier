#!/bin/bash

echo "🚀 Iniciando Frontend em Modo Desenvolvimento"

# Criar container de desenvolvimento
docker run -d \
  --name thecryptofrontier-frontend \
  -p 3300:3000 \
  -v $(pwd)/src:/app:rw \
  -v $(pwd)/.env.local:/app/.env.local:ro \
  -w /app \
  --network crypto-network \
  node:20-alpine \
  sh -c "npm install --legacy-peer-deps && npm run dev"

echo "⏳ Aguardando inicialização..."
sleep 10

# Verificar logs
echo "📋 Logs do container:"
docker logs thecryptofrontier-frontend --tail 20

echo "✅ Frontend iniciado em http://localhost:3300"