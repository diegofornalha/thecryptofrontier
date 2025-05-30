#!/bin/bash

# The Crypto Frontier - Script de Produção
# Porta: 3200 (configurada no Caddy)

echo "🚀 Iniciando The Crypto Frontier na porta 3200..."

# Para processo existente se houver
pkill -f "next.*3200"

# Aguarda um momento
sleep 2

# Constrói o projeto para produção
echo "📦 Construindo projeto..."
npm run build

# Inicia o servidor de produção
echo "✅ Iniciando servidor..."
npm run start -- -p 3200

echo "🌐 Disponível em:"
echo "  - Local: http://localhost:3200"
echo "  - Público: https://thecryptofrontier.agentesintegrados.com"