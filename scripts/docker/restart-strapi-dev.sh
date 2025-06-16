#!/bin/bash

# Script para reiniciar o Strapi em modo desenvolvimento
# Permite criar content-types via interface

echo "🔄 Reiniciando Strapi em modo desenvolvimento..."

# Para o container atual
echo "⏹️  Parando container Strapi..."
docker stop strapi-v5

# Reinicia em modo desenvolvimento
echo "🚀 Iniciando em modo desenvolvimento..."
docker run -d \
  --name strapi-v5-dev \
  --rm \
  -e NODE_ENV=development \
  -e DATABASE_CLIENT=postgres \
  -e DATABASE_HOST=strapi-v5-postgres \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=strapi \
  -e DATABASE_USERNAME=strapi \
  -e DATABASE_PASSWORD=strapi \
  -e JWT_SECRET=your-jwt-secret \
  -e ADMIN_JWT_SECRET=your-admin-jwt-secret \
  -e APP_KEYS=your-app-keys \
  -p 1339:1337 \
  --network $(docker inspect strapi-v5 --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' | head -1) \
  strapi:v5 \
  npm run develop

echo "✅ Strapi rodando em modo desenvolvimento!"
echo "📝 Acesse https://ale-blog.agentesintegrados.com/admin"
echo "   Agora você pode criar content-types!"
echo ""
echo "⚠️  Para voltar ao modo produção:"
echo "   docker stop strapi-v5-dev"
echo "   docker start strapi-v5"