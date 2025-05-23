#!/bin/bash

# Script para gerenciar o container Docker do The Crypto Frontier
# Uso: ./docker-start.sh [build|start|stop|restart|logs|status]

set -e

CONTAINER_NAME="thecryptofrontier-app"
COMPOSE_FILE="docker-compose.yml"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo -e "${BLUE}Script de gerenciamento Docker - The Crypto Frontier${NC}"
    echo ""
    echo "Uso: ./docker-start.sh [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build     - Construir a imagem Docker"
    echo "  start     - Iniciar o container"
    echo "  stop      - Parar o container"
    echo "  restart   - Reiniciar o container"
    echo "  logs      - Mostrar logs do container"
    echo "  status    - Mostrar status do container"
    echo "  clean     - Limpar containers e imagens não utilizadas"
    echo ""
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker não está rodando ou não tem permissão${NC}"
        exit 1
    fi
}

# Função para construir a imagem
build_image() {
    echo -e "${BLUE}🔨 Construindo imagem Docker...${NC}"
    docker-compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}✅ Imagem construída com sucesso!${NC}"
}

# Função para iniciar o container
start_container() {
    echo -e "${BLUE}🚀 Iniciando container...${NC}"
    
    # Parar outros processos Next.js na porta 3200
    echo -e "${YELLOW}🔄 Parando processos existentes na porta 3200...${NC}"
    pkill -f "next.*3200" 2>/dev/null || true
    
    # Iniciar com docker-compose
    docker-compose -f $COMPOSE_FILE up -d
    
    echo -e "${GREEN}✅ Container iniciado!${NC}"
    echo -e "${BLUE}🌐 Acesse: http://localhost:3200${NC}"
    echo -e "${BLUE}🌍 Ou: https://thecryptofrontier.agentesintegrados.com${NC}"
}

# Função para parar o container
stop_container() {
    echo -e "${YELLOW}⏹️  Parando container...${NC}"
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Container parado!${NC}"
}

# Função para reiniciar o container
restart_container() {
    echo -e "${BLUE}🔄 Reiniciando container...${NC}"
    docker-compose -f $COMPOSE_FILE restart
    echo -e "${GREEN}✅ Container reiniciado!${NC}"
}

# Função para mostrar logs
show_logs() {
    echo -e "${BLUE}📋 Logs do container:${NC}"
    docker-compose -f $COMPOSE_FILE logs -f --tail=50
}

# Função para mostrar status
show_status() {
    echo -e "${BLUE}📊 Status dos containers:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo -e "${BLUE}💾 Uso de recursos:${NC}"
    docker stats --no-stream $CONTAINER_NAME 2>/dev/null || echo "Container não está rodando"
}

# Função para limpeza
clean_docker() {
    echo -e "${YELLOW}🧹 Limpando containers e imagens não utilizadas...${NC}"
    docker system prune -f
    echo -e "${GREEN}✅ Limpeza concluída!${NC}"
}

# Verificar se Docker está disponível
check_docker

# Processar comando
case "${1:-help}" in
    build)
        build_image
        ;;
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_docker
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando inválido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac 