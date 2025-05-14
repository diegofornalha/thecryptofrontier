#!/bin/bash

echo "Limpando cache do Streamlit..."

# Mata processos Streamlit em execução
pkill -f streamlit

# Remove arquivos de cache do Streamlit
rm -rf ~/.streamlit/cache/* 2>/dev/null || true
rm -rf .streamlit/cache/* 2>/dev/null || true

# Limpa cache de navegador temporário
rm -rf /tmp/streamlit/* 2>/dev/null || true

# Atualiza a variável de ambiente para ignorar cache
export STREAMLIT_SERVER_ENABLE_STATIC_SERVING=false

# Adiciona permissão de execução
chmod +x limpar_cache.sh

echo "Cache limpo! Reiniciando Streamlit..."

# Reinicia o Streamlit com opções anti-cache
streamlit run app.py --server.runOnSave=true --browser.serverAddress=0.0.0.0 --server.enableCORS=false 