#!/bin/bash
set -e

echo "================================"
echo "Blog Crew Docker Container"
echo "================================"
echo "Ambiente: ${NODE_ENV:-production}"
echo "Sanity Project: ${SANITY_PROJECT_ID}"
echo "Redis Host: ${REDIS_HOST:-localhost}"
echo "================================"

# Verificar variáveis essenciais
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  AVISO: OPENAI_API_KEY não configurada"
fi

if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  AVISO: GOOGLE_API_KEY não configurada"
fi

if [ -z "$SANITY_API_TOKEN" ]; then
    echo "⚠️  AVISO: SANITY_API_TOKEN não configurada"
fi

# Criar diretórios se não existirem
mkdir -p posts_para_traduzir posts_traduzidos posts_formatados posts_com_imagem posts_publicados posts_imagens logs

# Aguardar Redis estar pronto
if [ "$REDIS_HOST" != "" ]; then
    echo "Aguardando Redis..."
    while ! nc -z ${REDIS_HOST} ${REDIS_PORT:-6379}; do
        sleep 1
    done
    echo "✅ Redis conectado!"
fi

# Executar comando
echo "Executando: $@"
exec "$@"