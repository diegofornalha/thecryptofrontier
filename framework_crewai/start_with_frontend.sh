#!/bin/bash

# Script para iniciar o ambiente completo com frontend NextJS
echo "Iniciando ambiente com frontend NextJS via Docker..."

# Definir variáveis de ambiente a partir de arquivos secretos
export GEMINI_API_KEY=$(cat ../secrets/GEMINI_API_KEY 2>/dev/null || echo "")
export SANITY_PROJECT_ID=$(grep NEXT_PUBLIC_SANITY_PROJECT_ID ../next.config.js | cut -d"'" -f2 2>/dev/null || echo "")
export SANITY_API_TOKEN=$(cat ../secrets/frontier_api_key.txt 2>/dev/null || echo "")

# Verificar se variáveis obrigatórias estão definidas
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Erro: GEMINI_API_KEY não está definido. Verifique o arquivo ../secrets/GEMINI_API_KEY"
  exit 1
fi

if [ -z "$SANITY_PROJECT_ID" ]; then
  echo "Erro: SANITY_PROJECT_ID não foi encontrado no next.config.js"
  exit 1
fi

if [ -z "$SANITY_API_TOKEN" ]; then
  echo "Erro: SANITY_API_TOKEN não está definido. Verifique o arquivo ../secrets/frontier_api_key.txt"
  exit 1
fi

echo "Iniciando containers com Docker Compose..."
docker-compose down
docker-compose up -d

echo "Aguardando inicialização dos serviços..."
sleep 5

echo "Ambiente iniciado com sucesso!"
echo ""
echo "Frontend NextJS disponível em: http://localhost:3000"
echo "Frontend via Caddy: http://localhost:8080/frontend"
echo "Streamlit disponível em: http://localhost:8501"
echo "Streamlit via Caddy: http://localhost:8080/streamlit"
echo ""
echo "Para acompanhar os logs: docker-compose logs -f"
echo "Para parar o ambiente: docker-compose down"