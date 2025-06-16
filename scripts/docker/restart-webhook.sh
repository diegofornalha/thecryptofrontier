#!/bin/bash

# Script para reconstruir e reiniciar o webhook server

echo "=== Reconstruindo e reiniciando Webhook Server ==="

# Navegar para o diretório do blog_crew
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew

# Parar o container atual
echo "1. Parando container atual..."
docker-compose -f docker-compose.webhook.yml down

# Reconstruir a imagem
echo "2. Reconstruindo imagem..."
docker-compose -f docker-compose.webhook.yml build

# Iniciar o container
echo "3. Iniciando container..."
docker-compose -f docker-compose.webhook.yml up -d

# Aguardar um pouco
echo "4. Aguardando inicialização..."
sleep 5

# Verificar status
echo "5. Verificando status..."
docker ps --filter "name=crewai-webhook-server" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Testar health
echo ""
echo "6. Testando health check..."
curl -s http://localhost:8002/health | python3 -m json.tool

echo ""
echo "=== Webhook Server reiniciado com sucesso ==="