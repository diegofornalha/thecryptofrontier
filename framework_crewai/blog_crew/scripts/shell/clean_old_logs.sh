#!/bin/bash
# Script para limpar logs antigos
# Mantém apenas os últimos 30 dias de logs

# Acessar diretório do projeto
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew || exit 1

# Limpar logs mais antigos que 30 dias
echo "Limpando logs antigos (> 30 dias)..."

# Limpar logs de pipeline
find logs/ -name "pipeline_*.log" -type f -mtime +30 -delete 2>/dev/null

# Limpar logs de imagem
find logs/ -name "image_queue_*.log" -type f -mtime +30 -delete 2>/dev/null

# Limpar outros logs antigos
find logs/ -name "*.log" -type f -mtime +30 -delete 2>/dev/null

# Contar logs restantes
PIPELINE_COUNT=$(find logs/ -name "pipeline_*.log" -type f 2>/dev/null | wc -l)
IMAGE_COUNT=$(find logs/ -name "image_queue_*.log" -type f 2>/dev/null | wc -l)
TOTAL_COUNT=$(find logs/ -name "*.log" -type f 2>/dev/null | wc -l)

echo "Limpeza concluída!"
echo "Logs de pipeline restantes: $PIPELINE_COUNT"
echo "Logs de imagem restantes: $IMAGE_COUNT"
echo "Total de logs: $TOTAL_COUNT"