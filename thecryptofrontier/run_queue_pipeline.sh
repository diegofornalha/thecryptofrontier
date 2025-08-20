#!/bin/bash

# Script para executar o pipeline RSS multilíngue em modo fila
# Baseado no padrão oficial i18n do Strapi via Context7

echo "🚀 Iniciando Pipeline RSS Multilíngue - Padrão Context7 i18n"
echo "⏰ $(date)"

# Navegar para o diretório do projeto
cd /home/strapi/thecryptofrontier

# Executar o pipeline
python3 pipeline_rss_multilingual.py --limit 1

echo "✅ Pipeline executado com sucesso!"
echo "⏰ $(date)" 