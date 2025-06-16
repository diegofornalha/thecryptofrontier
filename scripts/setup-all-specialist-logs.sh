#!/bin/bash

# Script para configurar logs de todos os especialistas
# Baseado na solução implementada para o Guardian

echo "🔧 Configurando logs para todos os especialistas..."
echo "=================================================="

# Diretório base para logs
LOGS_BASE_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/logs"

# Lista de especialistas
SPECIALISTS=(
    "claude-code-specialist"
    "nextjs-specialist" 
    "strapi-specialist"
    "cleanup-specialist"
    "guardian-orchestrator"
    "agent-log"
)

# Criar diretório base se não existir
if [ ! -d "$LOGS_BASE_DIR" ]; then
    echo "📁 Criando diretório de logs: $LOGS_BASE_DIR"
    mkdir -p "$LOGS_BASE_DIR"
fi

# Configurar permissões para cada especialista
for specialist in "${SPECIALISTS[@]}"; do
    LOG_FILE="$LOGS_BASE_DIR/${specialist}.log"
    
    echo "📝 Configurando log para: $specialist"
    
    # Criar arquivo se não existir
    if [ ! -f "$LOG_FILE" ]; then
        touch "$LOG_FILE"
        echo "[$(date)] Log file created for $specialist" > "$LOG_FILE"
    fi
    
    # Definir permissões
    chmod 644 "$LOG_FILE"
done

# Definir ownership para o usuário nodejs (UID 1001)
echo "🔐 Definindo permissões..."
chmod 755 "$LOGS_BASE_DIR"
sudo chown -R 1001:1001 "$LOGS_BASE_DIR"

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📊 Status dos logs:"
ls -la "$LOGS_BASE_DIR"
echo ""
echo "💡 Para monitorar logs:"
echo "   tail -f $LOGS_BASE_DIR/*.log"
echo ""
echo "🔍 Para buscar erros:"
echo "   grep -i error $LOGS_BASE_DIR/*.log"