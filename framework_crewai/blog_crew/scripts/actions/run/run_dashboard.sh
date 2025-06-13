#!/bin/bash
# Script para executar o dashboard Streamlit

echo "🚀 Iniciando Blog Crew Dashboard..."

# Verificar se streamlit está instalado
if ! command -v streamlit &> /dev/null; then
    echo "❌ Streamlit não está instalado!"
    echo "📦 Instalando streamlit..."
    pip install streamlit pandas
fi

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    echo "Ativando ambiente virtual..."
    source venv/bin/activate
fi

# Executar dashboard
echo "✅ Dashboard disponível em: http://localhost:8501"
echo "Pressione Ctrl+C para parar"
echo ""

streamlit run dashboard_streamlit.py --server.port 8501 --server.address localhost