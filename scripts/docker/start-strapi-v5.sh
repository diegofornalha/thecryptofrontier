#!/bin/bash

# Script para iniciar Strapi v5 em container Docker
# Usa porta 1339 para evitar conflitos

echo "🚀 Iniciando Strapi v5..."

# Verificar se o container já existe
if [ "$(docker ps -aq -f name=strapi-v5)" ]; then
    echo "📦 Container strapi-v5 já existe. Removendo..."
    docker rm -f strapi-v5
fi

# Verificar se a imagem existe
if [ -z "$(docker images -q strapi:v5)" ]; then
    echo "🔨 Construindo imagem strapi:v5..."
    cd /home/strapi/thecryptofrontier/strapi-v5-fresh
    docker build -t strapi:v5 .
fi

# Iniciar container
echo "🎯 Iniciando container na porta 1339..."
docker run -d --name strapi-v5 \
  -p 1339:1337 \
  --network strapi \
  --env-file /home/strapi/thecryptofrontier/strapi-v5-fresh/.env \
  -v /home/strapi/thecryptofrontier/strapi-v5-fresh/config:/opt/app/config \
  -v /home/strapi/thecryptofrontier/strapi-v5-fresh/src:/opt/app/src \
  -v /home/strapi/thecryptofrontier/strapi-v5-fresh/public/uploads:/opt/app/public/uploads \
  strapi:v5

# Aguardar inicialização
echo "⏳ Aguardando Strapi inicializar..."
sleep 5

# Verificar status
if [ "$(docker ps -q -f name=strapi-v5)" ]; then
    echo "✅ Strapi v5 iniciado com sucesso!"
    echo ""
    echo "📋 Acesse em:"
    echo "   Admin Panel: http://localhost:1339/admin"
    echo "   API Base:    http://localhost:1339"
    echo ""
    echo "🔍 Para ver os logs: docker logs -f strapi-v5"
else
    echo "❌ Erro ao iniciar Strapi v5"
    echo "Verifique os logs: docker logs strapi-v5"
fi