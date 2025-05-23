#!/bin/bash

# Script de monitoramento para o container thecryptofrontier
# Este script verifica o status do container e o reinicia se necessário

CONTAINER_NAME="thecryptofrontier-app"
LOG_FILE="/var/log/thecryptofrontier-monitor.log"

# Função para logar mensagens
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Função para verificar o status do container
check_container() {
    # Verifica se o container está rodando
    if ! docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        log_message "Container $CONTAINER_NAME não está rodando. Tentando iniciar..."
        cd /home/sanity/thecryptofrontier && docker-compose up -d
        sleep 30
        return 1
    fi
    
    # Verifica o health status
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null)
    
    if [ "$HEALTH_STATUS" = "unhealthy" ]; then
        log_message "Container $CONTAINER_NAME está unhealthy. Reiniciando..."
        docker restart "$CONTAINER_NAME"
        sleep 30
        return 1
    fi
    
    # Verifica se o serviço está respondendo
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3200 | grep -q "200"; then
        log_message "Serviço não está respondendo na porta 3200. Reiniciando container..."
        docker restart "$CONTAINER_NAME"
        sleep 30
        return 1
    fi
    
    return 0
}

# Loop principal
while true; do
    if check_container; then
        # Container está saudável
        log_message "Container $CONTAINER_NAME está rodando corretamente"
    else
        # Container foi reiniciado
        log_message "Ação corretiva foi tomada para o container $CONTAINER_NAME"
    fi
    
    # Aguarda 60 segundos antes da próxima verificação
    sleep 60
done