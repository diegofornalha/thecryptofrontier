#!/bin/bash
# Script para limpar logs antigos do monitor RSS

# Diretório do projeto
PROJECT_DIR="/home/sanity/thecryptofrontier/framework_crewai/blog_crew"
LOG_DIR="$PROJECT_DIR"
DAYS_TO_KEEP=7  # Manter logs dos últimos 7 dias

echo "=== Limpeza de Logs Antigos ==="
echo "Diretório: $LOG_DIR"
echo "Mantendo logs dos últimos $DAYS_TO_KEEP dias"

# Encontrar e remover logs antigos
find "$LOG_DIR" -name "rss_monitor_*.log" -type f -mtime +$DAYS_TO_KEEP -exec rm -v {} \;

# Comprimir logs com mais de 1 dia
find "$LOG_DIR" -name "rss_monitor_*.log" -type f -mtime +1 ! -name "*.gz" -exec gzip -v {} \;

echo "Limpeza concluída!"

# Mostrar espaço liberado
echo -e "\nEspaço em disco:"
df -h "$LOG_DIR" | grep -E "Filesystem|$LOG_DIR"