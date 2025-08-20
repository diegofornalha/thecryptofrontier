#!/bin/bash

# Script de Health Check para o Sistema Mem0
# Verifica a saúde dos serviços e executa ações corretivas se necessário

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório de logs
LOG_DIR="/home/strapi/thecryptofrontier/logs/mem0"
mkdir -p "$LOG_DIR"

# Arquivo de log
LOG_FILE="$LOG_DIR/health-check-$(date +%Y%m%d).log"

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Função para verificar container
check_container() {
    local container_name=$1
    local container_status=$(docker ps --filter "name=$container_name" --format "{{.Status}}" 2>/dev/null || echo "")
    
    if [ -z "$container_status" ]; then
        return 1
    else
        return 0
    fi
}

# Função para verificar endpoint HTTP
check_http_endpoint() {
    local url=$1
    local timeout=${2:-5}
    
    if curl -sf -m "$timeout" "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Função principal de health check
perform_health_check() {
    log "========== Iniciando Health Check Mem0 =========="
    
    local all_healthy=true
    local services_to_check=(
        "mem0-bridge|http://localhost:3002/health"
        "mem0-chroma|http://localhost:8005/api/v1/heartbeat"
    )
    
    for service_info in "${services_to_check[@]}"; do
        IFS='|' read -r container_name endpoint <<< "$service_info"
        
        echo -n "Verificando $container_name... "
        
        # Verificar se container está rodando
        if check_container "$container_name"; then
            echo -ne "${GREEN}Container OK${NC} | "
            
            # Verificar endpoint se fornecido
            if [ -n "$endpoint" ]; then
                if check_http_endpoint "$endpoint"; then
                    echo -e "${GREEN}Endpoint OK${NC}"
                    log "✅ $container_name: Container e endpoint funcionando"
                else
                    echo -e "${YELLOW}Endpoint não responde${NC}"
                    log "⚠️ $container_name: Container rodando mas endpoint não responde"
                    all_healthy=false
                fi
            else
                echo -e "${GREEN}OK${NC}"
                log "✅ $container_name: Container funcionando"
            fi
        else
            echo -e "${RED}Container parado${NC}"
            log "❌ $container_name: Container não está rodando"
            all_healthy=false
            
            # Tentar reiniciar o serviço
            if [ "$AUTO_RESTART" = "true" ]; then
                log "🔄 Tentando reiniciar $container_name..."
                if docker-compose -f infrastructure-docker/docker-yml/docker-compose.yml up -d "$container_name" 2>&1 | tee -a "$LOG_FILE"; then
                    log "✅ $container_name reiniciado com sucesso"
                else
                    log "❌ Falha ao reiniciar $container_name"
                fi
            fi
        fi
    done
    
    # Verificar uso de recursos
    echo -e "\n📊 Uso de Recursos:"
    for container in mem0-bridge mem0-chroma; do
        if check_container "$container"; then
            stats=$(docker stats "$container" --no-stream --format "{{.Container}}: CPU {{.CPUPerc}} | Mem {{.MemUsage}}" 2>/dev/null || echo "N/A")
            echo "  $stats"
            log "📊 $stats"
        fi
    done
    
    # Verificar espaço em disco
    echo -e "\n💾 Espaço em Disco:"
    df -h /var/lib/docker | tail -n 1 | awk '{print "  Usado: "$3" de "$2" ("$5")"}'
    
    # Resumo final
    echo -e "\n========== Resumo =========="
    if [ "$all_healthy" = true ]; then
        echo -e "${GREEN}✅ Todos os serviços Mem0 estão saudáveis${NC}"
        log "✅ Health check concluído: Todos os serviços saudáveis"
        return 0
    else
        echo -e "${RED}❌ Alguns serviços apresentam problemas${NC}"
        log "❌ Health check concluído: Problemas detectados"
        return 1
    fi
}

# Função para modo daemon
run_daemon() {
    local interval=${1:-300} # 5 minutos por padrão
    
    log "🔄 Iniciando health check em modo daemon (intervalo: ${interval}s)"
    
    while true; do
        perform_health_check
        echo -e "\n⏰ Próxima verificação em ${interval} segundos..."
        sleep "$interval"
    done
}

# Processar argumentos
case "${1:-check}" in
    check)
        perform_health_check
        ;;
    daemon)
        interval="${2:-300}"
        run_daemon "$interval"
        ;;
    auto-restart)
        export AUTO_RESTART=true
        perform_health_check
        ;;
    *)
        echo "Uso: $0 [comando] [opções]"
        echo "Comandos:"
        echo "  check         - Verificação única (padrão)"
        echo "  daemon [seg]  - Modo contínuo (padrão: 300s)"
        echo "  auto-restart  - Verificar e reiniciar serviços parados"
        exit 1
        ;;
esac