#!/bin/bash

# Script para reiniciar completamente o ambiente com frontend NextJS
echo "==== Reiniciando ambiente completo com Docker ===="

# Verificar se estamos no diretório correto
cd "$(dirname "$0")" || { echo "Erro: Não foi possível acessar o diretório do script"; exit 1; }

# Definir variáveis de ambiente
export GEMINI_API_KEY=$(cat ../secrets/GEMINI_API_KEY 2>/dev/null || echo "")
export SANITY_PROJECT_ID="brby2yrg"
export SANITY_API_TOKEN=$(cat ../secrets/frontier_api_key.txt 2>/dev/null || echo "")

# Verificar variáveis críticas
if [ -z "$GEMINI_API_KEY" ] || [ -z "$SANITY_API_TOKEN" ]; then
  echo "❌ Erro: Variáveis de ambiente críticas não estão configuradas"
  [ -z "$GEMINI_API_KEY" ] && echo "   - GEMINI_API_KEY não encontrada"
  [ -z "$SANITY_API_TOKEN" ] && echo "   - SANITY_API_TOKEN não encontrada"
  exit 1
fi

# Parar qualquer instância anterior do Docker
echo "🔄 Parando containers existentes..."
docker-compose down

# Iniciar todos os serviços com Docker
echo "🚀 Iniciando todos os serviços Docker (NextJS, Streamlit, Redis, Caddy)..."
docker-compose up -d

# Aguardar a inicialização dos serviços
echo "⏳ Aguardando inicialização dos serviços (10s)..."
sleep 10

# Verificar status final
echo "==== Status do ambiente ===="
echo "✅ Serviços inicializados:"
echo "   - Streamlit (direto): http://localhost:8501"
echo "   - NextJS (direto): http://localhost:3000"
echo "   - Via Proxy:"
echo "     - Página inicial: http://localhost:8080"
echo "     - Streamlit: http://localhost:8080/streamlit"
echo "     - NextJS: http://localhost:8080/frontend"
echo "   - Via Porta Alternativa:"
echo "     - http://localhost:3200 (mesmos caminhos)"
echo "   - Via Domínio (requer DNS):"
echo "     - http://thecryptofrontier.agentesintegrados.com"

echo ""
echo "📝 Logs:"
echo "   - Todos os containers: docker-compose logs -f"
echo "   - NextJS: docker logs -f nextjs-frontend"
echo "   - Streamlit: docker logs -f streamlit-crewai-ui"
echo "   - Caddy: docker logs -f caddy-crewai-proxy"

echo ""
echo "🛑 Para interromper todos os serviços:"
echo "   - ./stop_all.sh"
echo "   - ou: docker-compose down"