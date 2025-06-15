#!/bin/bash

# Script de Backup Automatizado via Cron para Strapi
# Autor: Guardian
# Data: 2025-06-15
# Descrição: Wrapper para executar backup automaticamente via cron com logs

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/../backups/logs"
LOG_FILE="${LOG_DIR}/backup_cron_$(date +%Y%m%d).log"

# Criar diretório de logs se não existir
mkdir -p "$LOG_DIR"

# Função para log com timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Cabeçalho do log
{
    echo "================================================================"
    echo "BACKUP AUTOMATIZADO DO STRAPI - $(date)"
    echo "================================================================"
    echo ""
} >> "$LOG_FILE"

# Executar backup
log_with_timestamp "Iniciando backup automatizado..."

# Executar script de backup principal
"${SCRIPT_DIR}/strapi-backup.sh" >> "$LOG_FILE" 2>&1

# Verificar resultado
if [ $? -eq 0 ]; then
    log_with_timestamp "Backup concluído com sucesso!"
    
    # Enviar notificação de sucesso (opcional - descomente se tiver mail configurado)
    # echo "Backup do Strapi realizado com sucesso em $(date)" | mail -s "Strapi Backup - Sucesso" admin@example.com
else
    log_with_timestamp "ERRO: Falha no backup!"
    
    # Enviar notificação de erro (opcional - descomente se tiver mail configurado)
    # echo "Falha no backup do Strapi em $(date). Verifique os logs em: $LOG_FILE" | mail -s "Strapi Backup - FALHA" admin@example.com
fi

# Limpar logs antigos (manter últimos 30 dias)
log_with_timestamp "Limpando logs antigos..."
find "$LOG_DIR" -name "backup_cron_*.log" -mtime +30 -delete

log_with_timestamp "Processo de backup finalizado."
echo "" >> "$LOG_FILE"

# Instruções para adicionar ao crontab:
# 
# Para executar diariamente às 2:00 AM:
# 0 2 * * * /home/strapi/thecryptofrontier/scripts/strapi-backup-cron.sh
#
# Para executar a cada 6 horas:
# 0 */6 * * * /home/strapi/thecryptofrontier/scripts/strapi-backup-cron.sh
#
# Para executar toda segunda, quarta e sexta às 3:00 AM:
# 0 3 * * 1,3,5 /home/strapi/thecryptofrontier/scripts/strapi-backup-cron.sh
#
# Adicione ao crontab com: crontab -e