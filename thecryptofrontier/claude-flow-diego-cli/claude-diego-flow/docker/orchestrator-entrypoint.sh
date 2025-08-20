#!/bin/sh
set -e

echo "🚀 Claude Flow Diego Orchestrator Starting..."
echo "📍 Working directory: $(pwd)"
echo "👤 Running as: $(whoami)"

# Garantir que estamos no diretório correto
cd /app

# Criar diretórios necessários
mkdir -p /workspace/memory /workspace/coordination

# Executar o orchestrator
echo "🌟 Starting orchestrator on port 3003..."
exec tsx src/orchestrator-start.ts --port 3003