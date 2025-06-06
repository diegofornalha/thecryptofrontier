#!/bin/bash
# Script para testar o pipeline do cron

echo "🧪 Testando pipeline do cron..."
echo "Data/Hora: $(date)"
echo ""

# Mudar para o diretório correto
cd /home/sanity/thecryptofrontier/framework_crewai/blog_crew || exit 1

# Verificar ambiente virtual
if [ -d "venv" ]; then
    echo "✅ Ambiente virtual encontrado"
    source venv/bin/activate
else
    echo "❌ Ambiente virtual não encontrado!"
    exit 1
fi

# Verificar variáveis de ambiente
echo "📋 Verificando variáveis de ambiente:"
vars_ok=true

for var in OPENAI_API_KEY GOOGLE_API_KEY SANITY_API_TOKEN SANITY_PROJECT_ID; do
    if [ -z "${!var}" ]; then
        echo "❌ $var não está definida"
        vars_ok=false
    else
        echo "✅ $var está definida"
    fi
done

if [ "$vars_ok" = false ]; then
    echo ""
    echo "⚠️  Algumas variáveis não estão definidas. Carregando do .env..."
    
    # Tentar carregar do .env
    if [ -f "/home/sanity/thecryptofrontier/.env" ]; then
        export $(grep -v '^#' /home/sanity/thecryptofrontier/.env | xargs)
        echo "✅ Variáveis carregadas do .env"
    fi
fi

# Testar import do pipeline
echo ""
echo "🔧 Testando imports..."
python -c "import run_pipeline" 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Imports OK"
else
    echo "❌ Erro nos imports"
    exit 1
fi

# Executar pipeline com 1 artigo apenas
echo ""
echo "🚀 Executando pipeline com 1 artigo..."
python run_pipeline.py --max-articles 1

echo ""
echo "✅ Teste concluído!"