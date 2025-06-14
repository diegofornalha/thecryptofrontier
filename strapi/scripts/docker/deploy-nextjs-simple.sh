#!/bin/bash

echo "🚀 Deploy simplificado do Next.js..."

# Build local primeiro para identificar problemas
cd /home/strapi/thecryptofrontier/src
echo "🔨 Testando build local..."
NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build local bem-sucedido!"
    
    # Voltar para o diretório raiz
    cd /home/strapi/thecryptofrontier
    
    # Parar container antigo
    docker stop nextjs-blog-preview 2>/dev/null || true
    docker rm nextjs-blog-preview 2>/dev/null || true
    
    # Build e rodar container
    echo "🐳 Construindo imagem Docker..."
    docker compose -f docker-compose.nextjs.yml up -d --build
    
    # Verificar status
    sleep 5
    if docker ps | grep -q nextjs-blog-preview; then
        echo "✅ Container rodando!"
        docker logs nextjs-blog-preview --tail 20
    else
        echo "❌ Container falhou!"
        docker logs nextjs-blog-preview
    fi
else
    echo "❌ Build local falhou!"
fi