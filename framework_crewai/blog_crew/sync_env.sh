#!/bin/bash
# Script para sincronizar .env com o diretório pai

echo "🔄 Sincronizando arquivo .env..."

# Verificar se existe .env no diretório pai
PARENT_ENV="../../.env"
LOCAL_ENV=".env"

if [ -f "$PARENT_ENV" ]; then
    echo "✅ Encontrado .env no diretório pai"
    
    # Fazer backup do .env local se existir
    if [ -f "$LOCAL_ENV" ]; then
        cp "$LOCAL_ENV" "${LOCAL_ENV}.backup"
        echo "📦 Backup criado: ${LOCAL_ENV}.backup"
    fi
    
    # Copiar do diretório pai
    cp "$PARENT_ENV" "$LOCAL_ENV"
    echo "✅ .env sincronizado com sucesso!"
    
    # Mostrar variáveis configuradas
    echo ""
    echo "📋 Variáveis configuradas:"
    grep -E "^[A-Z_]+=" "$LOCAL_ENV" | cut -d'=' -f1 | while read var; do
        echo "  ✓ $var"
    done
else
    echo "❌ Arquivo .env não encontrado no diretório pai"
    
    # Verificar se existe localmente
    if [ -f "$LOCAL_ENV" ]; then
        echo "✅ Usando .env local existente"
    else
        echo "❌ Nenhum arquivo .env encontrado!"
        echo ""
        echo "📝 Crie um arquivo .env com as seguintes variáveis:"
        echo "  OPENAI_API_KEY=sk-..."
        echo "  GOOGLE_API_KEY=..."
        echo "  SANITY_PROJECT_ID=..."
        echo "  SANITY_API_TOKEN=..."
        echo "  SANITY_DATASET=production"
        echo "  ALGOLIA_APP_ID=..."
        echo "  ALGOLIA_API_KEY=..."
        echo "  ALGOLIA_INDEX_NAME=..."
    fi
fi