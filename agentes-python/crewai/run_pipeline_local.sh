#!/bin/bash
# Script para executar o pipeline localmente sem Docker
# Use este script se não tiver as API keys configuradas

echo "🚀 Executando pipeline CrewAI Blog localmente..."

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    echo "📦 Ativando ambiente virtual..."
    source venv/bin/activate
fi

# Verificar se as dependências estão instaladas
if ! python -c "import crewai" 2>/dev/null; then
    echo "⚠️  Instalando dependências..."
    pip install -r requirements-base.txt
fi

# Executar o pipeline
echo "🔄 Iniciando pipeline simplificado..."
python src/pipelines/simple/simple_pipeline.py

echo "✅ Pipeline concluído!"