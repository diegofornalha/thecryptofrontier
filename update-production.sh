#!/bin/bash
# Script para atualizar o site em produção
# https://thecryptofrontier.agentesintegrados.com/

echo "🚀 Iniciando atualização do The Crypto Frontier..."
echo "================================================"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Fazer pull das últimas alterações
log_info "Atualizando código do repositório..."
git pull origin main || {
    log_error "Falha ao fazer pull do repositório"
    exit 1
}

# 2. Build da nova imagem
log_info "Construindo nova imagem Docker..."
docker-compose build --no-cache thecryptofrontier || {
    log_error "Falha ao construir imagem"
    exit 1
}

# 3. Parar container antigo
log_info "Parando container atual..."
docker-compose stop thecryptofrontier

# 4. Remover container antigo
log_info "Removendo container antigo..."
docker-compose rm -f thecryptofrontier

# 5. Iniciar novo container
log_info "Iniciando novo container..."
docker-compose up -d thecryptofrontier || {
    log_error "Falha ao iniciar novo container"
    exit 1
}

# 6. Aguardar container ficar saudável
log_info "Aguardando container ficar saudável..."
for i in {1..30}; do
    if docker-compose ps | grep -q "healthy"; then
        log_info "Container está saudável!"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# 7. Limpar imagens antigas
log_info "Limpando imagens Docker antigas..."
docker image prune -f

# 8. Verificar status
log_info "Status dos containers:"
docker-compose ps

# 9. Verificar logs
log_info "Últimas linhas do log:"
docker-compose logs --tail=20 thecryptofrontier

echo ""
echo "================================================"
log_info "✅ Atualização concluída!"
echo ""
echo "🌐 Site: https://thecryptofrontier.agentesintegrados.com/"
echo "📊 Para ver logs em tempo real: docker-compose logs -f thecryptofrontier"
echo ""