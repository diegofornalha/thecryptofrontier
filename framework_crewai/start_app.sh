#!/bin/bash
# Script para iniciar o aplicativo Streamlit

echo "Iniciando aplicativo Streamlit..."
source venv/bin/activate

# Verificar se o Redis está rodando
echo "Verificando conexão com Redis..."
python test_redis_connection.py

# Iniciar o Streamlit
echo "Iniciando app_modular.py..."
streamlit run app_modular.py

# O comando abaixo é para ser usado quando estiver rodando em produção
# nohup streamlit run app_modular.py > streamlit.log 2>&1 &