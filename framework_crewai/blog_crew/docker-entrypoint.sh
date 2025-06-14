#!/bin/bash
set -e

echo "🚀 Iniciando CrewAI Blog Pipeline Container..."

# Verificar variáveis de ambiente críticas
if [ -z "$strapi_PROJECT_ID" ] || [ -z "$strapi_API_TOKEN" ]; then
    echo "❌ Erro: Variáveis strapi_PROJECT_ID e strapi_API_TOKEN são obrigatórias!"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ] && [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Erro: Pelo menos uma API key (OPENAI_API_KEY ou GEMINI_API_KEY) é necessária!"
    exit 1
fi

echo "✅ Variáveis de ambiente configuradas"

# Criar diretórios se não existirem
mkdir -p /app/logs
mkdir -p /app/src/pipelines/simple/posts_processados
mkdir -p /app/src/pipelines/simple/posts_imagens

# Se não existir arquivo de artigos processados, criar um vazio
if [ ! -f /app/processed_articles.json ]; then
    echo "[]" > /app/processed_articles.json
    echo "📝 Arquivo processed_articles.json criado"
fi

# Modo de execução baseado no primeiro argumento
MODE=${1:-cron}

case "$MODE" in
    "cron")
        echo "⏰ Modo CRON - Pipeline será executado diariamente às 21:00"
        echo "📅 Timezone: $TZ"
        
        # Iniciar o cron
        service cron start
        
        # Executar uma vez na inicialização (opcional)
        if [ "${RUN_ON_START:-false}" = "true" ]; then
            echo "🔄 Executando pipeline na inicialização..."
            cd /app && python src/pipelines/simple/simple_pipeline.py
        fi
        
        # Manter o container rodando e mostrar logs
        echo "📋 Monitorando logs..."
        tail -f /var/log/cron.log /app/logs/pipeline.log
        ;;
        
    "once")
        echo "🔄 Modo ÚNICO - Executando pipeline uma vez..."
        cd /app && python src/pipelines/simple/simple_pipeline.py
        ;;
        
    "monitor")
        echo "📊 Modo MONITOR - Iniciando serviço de monitoramento..."
        cd /app && python scripts/monitoring/monitor_service.py
        ;;
        
    "shell")
        echo "🐚 Modo SHELL - Entrando em modo interativo..."
        /bin/bash
        ;;
        
    *)
        echo "❓ Modo desconhecido: $MODE"
        echo "Modos disponíveis: cron, once, monitor, shell"
        exit 1
        ;;
esac