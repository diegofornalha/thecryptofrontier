#!/bin/bash
# Script de automação RSS para The Crypto Frontier
# Executa a cada 30 minutos via cron

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_FILE="$SCRIPT_DIR/rss_automation.log"
LOCK_FILE="/tmp/rss_automation.lock"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Verifica se já está rodando
if [ -f "$LOCK_FILE" ]; then
    log "Script já está em execução. Saindo..."
    exit 0
fi

# Cria lock file
touch "$LOCK_FILE"

# Garante que o lock seja removido ao sair
trap "rm -f $LOCK_FILE" EXIT

log "=== Iniciando importação RSS ==="

# Muda para o diretório correto
cd "$SCRIPT_DIR"

# Executa o agente RSS
# Importa até 5 novos artigos por vez
python3 rss_blog_agent.py import 5 >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "Importação concluída com sucesso"
else
    log "Erro durante a importação"
fi

log "=== Fim da execução ==="
echo "" >> "$LOG_FILE"

# Para adicionar ao cron, execute:
# crontab -e
# Adicione a linha:
# */30 * * * * /home/strapi/thecryptofrontier/claude-agents/rss_automation.sh