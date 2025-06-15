#!/bin/bash

# Script de gerenciamento do Cleanup Specialist Docker
# Uso: ./cleanup-specialist.sh [comando] [opções]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_ROOT="/home/strapi/thecryptofrontier"
COMPOSE_FILE="docker-compose.cleanup.yml"

# Função de ajuda
show_help() {
    echo "Uso: $0 [comando] [opções]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  analyze     - Executar análise de limpeza (read-only)"
    echo "  execute     - Executar limpeza real (requer confirmação)"
    echo "  aggressive  - Executar limpeza agressiva (CUIDADO!)"
    echo "  report      - Ver últimos relatórios"
    echo "  logs        - Ver logs do container"
    echo "  build       - Construir imagem Docker"
    echo "  schedule    - Iniciar scheduler de limpeza"
    echo "  stop        - Parar scheduler"
    echo ""
    echo "Opções:"
    echo "  --no-confirm    - Pular confirmação (use com cuidado)"
    echo "  --include-tests - Incluir arquivos de teste na análise"
    echo "  --verbose       - Modo verboso"
    echo ""
    echo "Exemplos:"
    echo "  $0 analyze"
    echo "  $0 execute --no-confirm"
    echo "  $0 report"
}

# Função para confirmar ação
confirm_action() {
    if [[ "$*" == *"--no-confirm"* ]]; then
        return 0
    fi
    
    echo -e "${YELLOW}⚠️  ATENÇÃO: Esta ação irá modificar arquivos!${NC}"
    read -p "Tem certeza que deseja continuar? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Operação cancelada.${NC}"
        exit 1
    fi
}

# Navegar para o diretório do projeto
cd "$PROJECT_ROOT"

# Processar comando
case "$1" in
    "analyze")
        echo -e "${GREEN}🔍 Executando análise de limpeza...${NC}"
        docker compose -f "$COMPOSE_FILE" \
            --profile cleanup \
            run --rm \
            -e DRY_RUN=true \
            -e LOG_LEVEL=${LOG_LEVEL:-info} \
            cleanup-specialist
        ;;
        
    "execute")
        confirm_action "$@"
        echo -e "${GREEN}🧹 Executando limpeza...${NC}"
        docker compose -f "$COMPOSE_FILE" \
            --profile cleanup \
            run --rm \
            -e DRY_RUN=false \
            -e MOUNT_MODE=rw \
            -e LOG_LEVEL=${LOG_LEVEL:-info} \
            cleanup-specialist npm run cleanup:execute
        ;;
        
    "aggressive")
        echo -e "${RED}⚠️  MODO AGRESSIVO - Esta ação removerá MUITOS arquivos!${NC}"
        confirm_action "$@"
        echo -e "${GREEN}💪 Executando limpeza agressiva...${NC}"
        docker compose -f "$COMPOSE_FILE" \
            --profile cleanup \
            run --rm \
            -e DRY_RUN=false \
            -e AGGRESSIVE=true \
            -e MOUNT_MODE=rw \
            -e LOG_LEVEL=${LOG_LEVEL:-debug} \
            cleanup-specialist npm run cleanup:aggressive
        ;;
        
    "report")
        echo -e "${GREEN}📊 Visualizando relatórios...${NC}"
        docker run --rm \
            -v cleanup-specialist-reports:/reports:ro \
            alpine:latest \
            sh -c "cd /reports && ls -la && echo && cat \$(ls -t | head -1) 2>/dev/null || echo 'Nenhum relatório encontrado.'"
        ;;
        
    "logs")
        echo -e "${GREEN}📋 Visualizando logs...${NC}"
        docker run --rm \
            -v cleanup-specialist-logs:/logs:ro \
            alpine:latest \
            sh -c "cd /logs && tail -f -n 100 cleanup.log 2>/dev/null || echo 'Nenhum log encontrado.'"
        ;;
        
    "build")
        echo -e "${GREEN}🔨 Construindo imagem Docker...${NC}"
        docker compose -f "$COMPOSE_FILE" build cleanup-specialist
        echo -e "${GREEN}✅ Imagem construída com sucesso!${NC}"
        ;;
        
    "schedule")
        echo -e "${GREEN}⏰ Iniciando scheduler de limpeza...${NC}"
        docker compose -f "$COMPOSE_FILE" \
            --profile cleanup-scheduled \
            up -d cleanup-scheduler
        echo -e "${GREEN}✅ Scheduler iniciado! Limpeza diária às 2AM.${NC}"
        ;;
        
    "stop")
        echo -e "${YELLOW}⏹️  Parando scheduler...${NC}"
        docker compose -f "$COMPOSE_FILE" \
            --profile cleanup-scheduled \
            down
        echo -e "${GREEN}✅ Scheduler parado!${NC}"
        ;;
        
    "help"|"--help"|"-h"|"")
        show_help
        ;;
        
    *)
        echo -e "${RED}Comando desconhecido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

# Verificar se há atualizações pendentes
if [[ "$1" == "analyze" || "$1" == "execute" ]]; then
    echo ""
    echo -e "${YELLOW}💡 Dica: Use '$0 report' para ver o relatório detalhado${NC}"
fi