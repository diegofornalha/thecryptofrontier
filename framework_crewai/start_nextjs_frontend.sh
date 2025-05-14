#!/bin/bash

# Script para iniciar o frontend NextJS com suporte a proxy
echo "Iniciando NextJS frontend com suporte a proxy..."

# Definir variáveis de ambiente
export NEXT_PUBLIC_PROXY_ENABLED=true
export NEXT_PUBLIC_ASSETS_PREFIX=/frontend
export NEXT_PUBLIC_SANITY_PROJECT_ID="brby2yrg"
export NEXT_PUBLIC_SANITY_DATASET=production
export NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03

# Matar qualquer processo Next.js anterior
echo "Verificando e interrompendo instâncias anteriores do Next.js..."
pkill -f "node.*next" || true

# Criar ou atualizar arquivo .env.local para configurações do proxy
cat > /home/sanity/thecryptofrontier/.env.local << EOF
NEXT_PUBLIC_PROXY_ENABLED=true
NEXT_PUBLIC_ASSETS_PREFIX=/frontend
PROXY_BASE_PATH=/frontend
NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
EOF

# Mover para o diretório do projeto NextJS
cd /home/sanity/thecryptofrontier/

# Iniciar o Next.js em modo de desenvolvimento permitindo acesso de qualquer IP
echo "Iniciando servidor Next.js..."
nohup yarn run dev > /home/sanity/thecryptofrontier/framework_crewai/nextjs.log 2>&1 &

# Aguardar inicialização
echo "Aguardando inicialização do Next.js (10s)..."
sleep 10

# Verificar se o processo está rodando
if pgrep -f "node.*next" > /dev/null; then
  echo "✅ NextJS está rodando na porta 3001"
  echo "   - Local direto: http://localhost:3001"
  echo "   - Via proxy Caddy: http://localhost:8080"
else
  echo "❌ Falha ao iniciar o NextJS. Verifique os logs em nextjs.log"
  exit 1
fi

# Instruções para parar o servidor
echo ""
echo "Para parar o servidor NextJS: pkill -f 'node.*next'"
echo "Para ver os logs: tail -f nextjs.log"