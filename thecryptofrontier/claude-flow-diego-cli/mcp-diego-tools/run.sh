#!/usr/bin/env bash

# MCP Diego Tools Runner Script
set -e

# Diretório base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o build existe
if [ ! -d "build" ]; then
    echo "🔨 Compilando o projeto..."
    npm run build
fi

# Configurar variáveis de ambiente opcionais
export NODE_ENV="${NODE_ENV:-production}"
export LOG_LEVEL="${LOG_LEVEL:-INFO}"

# Configurar Mem0 (se disponível)
if [ -n "$MEM0_API_KEY" ]; then
    echo "✅ Mem0 API Key detectada"
fi

# Informar sobre GitHub (opcional)
if [ -z "$GITHUB_TOKEN" ]; then
    echo "ℹ️  GitHub Token não configurado - ferramentas GitHub não estarão disponíveis"
fi

echo "🚀 Iniciando MCP Diego Tools Server..."
echo "📍 Diretório: $SCRIPT_DIR"
echo "🔧 Node: $(node --version)"
echo "📦 NPM: $(npm --version)"

# Executar o servidor
# Use o servidor principal com todas as ferramentas
exec node build/index.js