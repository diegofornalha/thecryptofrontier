#!/bin/bash

echo "🚀 Building Blog Crew Docker Image..."

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  .env não encontrado. Copiando do diretório pai..."
    if [ -f ../../.env ]; then
        cp ../../.env .
        echo "✅ .env copiado com sucesso!"
    else
        echo "❌ Erro: .env não encontrado em ../../.env"
        echo "📝 Criando .env de exemplo..."
        cp .env.example .env
        echo "⚠️  Por favor, edite o arquivo .env com suas chaves de API"
        exit 1
    fi
fi

# Build com timeout e progress
echo "🔨 Iniciando build Docker..."
docker compose build --progress=plain

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "Próximos passos:"
    echo "1. Iniciar containers: make up"
    echo "2. Executar pipeline: make pipeline-1"
    echo "3. Ver logs: make logs"
else
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi