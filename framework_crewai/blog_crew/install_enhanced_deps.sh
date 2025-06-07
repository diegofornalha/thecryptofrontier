#!/bin/bash
# Script para instalar dependências do pipeline enhanced

echo "🔧 Instalando dependências para run_pipeline_enhanced.py..."

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    echo "Ativando ambiente virtual..."
    source venv/bin/activate
fi

# Instalar dependências faltantes
echo "📦 Instalando pacotes necessários..."

# Opção 1: Instalar apenas as dependências faltantes (mais rápido)
pip install \
    python-json-logger>=2.0.7 \
    google-generativeai>=0.3.0 \
    psutil>=5.9.0 \
    bleach>=6.0.0 \
    beautifulsoup4>=4.12.0 \
    aiohttp>=3.9.0 \
    redis>=5.0.0 \
    python-dateutil>=2.8.2 \
    validators>=0.22.0

# Opção 2: Instalar todas as dependências do enhanced (descomente se preferir)
# pip install -r requirements-enhanced.txt

echo "✅ Dependências instaladas!"

# Verificar instalação
echo ""
echo "🔍 Verificando instalação..."
python -c "
import pythonjsonlogger
import google.generativeai
import psutil
import bleach
import bs4
import aiohttp
import redis
print('✅ Todas as dependências foram instaladas com sucesso!')
" || echo "❌ Erro: Algumas dependências falharam na instalação"

echo ""
echo "📝 Para usar o pipeline enhanced no cron:"
echo "1. Edite daily_pipeline.sh"
echo "2. Mude para: python run_pipeline_enhanced.py --limit 10"