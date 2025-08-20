#!/bin/bash

# Script para iniciar o servidor de webhook

echo "🚀 Iniciando servidor de webhook CrewAI..."

# Navegar para o diretório
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Instalar dependências se necessário
pip install fastapi uvicorn python-dotenv

# Adicionar token ao .env se não existir
if ! grep -q "WEBHOOK_SECRET" .env; then
    echo "" >> .env
    echo "# Webhook Configuration" >> .env
    echo "WEBHOOK_SECRET=crew-ai-webhook-secret-2025" >> .env
fi

# Iniciar servidor
python3 webhook_server.py