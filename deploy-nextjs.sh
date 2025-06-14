#!/bin/bash

echo "🚀 Iniciando deploy do Next.js..."

# Parar e remover container antigo
echo "🔄 Parando container antigo..."
docker stop nextjs-blog-preview 2>/dev/null || true
docker rm nextjs-blog-preview 2>/dev/null || true

# Build e iniciar novo container
echo "🔨 Construindo nova imagem..."
docker compose -f docker-compose.nextjs.yml up -d --build

# Aguardar container iniciar
echo "⏳ Aguardando container iniciar..."
sleep 10

# Verificar status
if docker ps | grep -q nextjs-blog-preview; then
    echo "✅ Next.js rodando com sucesso!"
    echo "📍 Local: http://localhost:3001"
    echo "🌐 Público: https://ale-blog-preview.agentesintegrados.com"
    
    # Mostrar logs
    echo -e "\n📋 Últimas linhas do log:"
    docker logs nextjs-blog-preview --tail 20
else
    echo "❌ Erro ao iniciar container!"
    docker logs nextjs-blog-preview
    exit 1
fi