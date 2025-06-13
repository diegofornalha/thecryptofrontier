#!/bin/bash
# Script para corrigir processamento duplicado

echo "🔧 Corrigindo sistema de processamento duplicado..."
echo ""

# 1. Mostrar status atual
echo "📊 STATUS ATUAL:"
echo "================"

# RSS Monitor
RSS_PID=$(ps aux | grep "rss_monitor.py" | grep -v grep | awk '{print $2}')
if [ ! -z "$RSS_PID" ]; then
    echo "✅ RSS Monitor rodando - PID: $RSS_PID"
    echo "   Iniciado: $(ps -p $RSS_PID -o lstart=)"
else
    echo "❌ RSS Monitor não está rodando"
fi

# Cron Job
CRON_JOB=$(crontab -l | grep "daily_pipeline.sh" | grep -v "^#")
if [ ! -z "$CRON_JOB" ]; then
    echo "✅ Cron Job configurado:"
    echo "   $CRON_JOB"
else
    echo "❌ Cron Job não está configurado"
fi

echo ""
echo "🤔 O que você deseja fazer?"
echo "1) Manter apenas RSS Monitor (processamento em tempo real)"
echo "2) Manter apenas Cron Job (processamento agendado)"
echo "3) Manter ambos mas com funções diferentes"
echo "4) Cancelar"
echo ""
read -p "Escolha uma opção (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Configurando RSS Monitor como único mecanismo..."
        
        # Atualizar PID file
        echo "$RSS_PID" > /home/sanity/thecryptofrontier/framework_crewai/blog_crew/rss_monitor.pid
        echo "✅ PID file atualizado"
        
        # Desabilitar cron job
        crontab -l | grep -v "daily_pipeline.sh" | crontab -
        echo "✅ Cron job diário desabilitado"
        
        # Adicionar apenas crons de manutenção
        (crontab -l 2>/dev/null; echo "# Limpeza semanal - Domingos às 3:00 AM") | crontab -
        (crontab -l 2>/dev/null; echo "0 3 * * 0 cd /home/sanity/thecryptofrontier/framework_crewai/blog_crew && python delete_sanity_duplicates.py >> /home/sanity/logs/cleanup.log 2>&1") | crontab -
        echo "✅ Crons de manutenção configurados"
        
        echo ""
        echo "✅ Sistema configurado para usar apenas RSS Monitor!"
        ;;
        
    2)
        echo ""
        echo "🚀 Configurando Cron Job como único mecanismo..."
        
        # Parar RSS Monitor
        if [ ! -z "$RSS_PID" ]; then
            kill $RSS_PID
            echo "✅ RSS Monitor parado"
        fi
        
        # Remover PID file
        rm -f /home/sanity/thecryptofrontier/framework_crewai/blog_crew/rss_monitor.pid
        echo "✅ PID file removido"
        
        # Otimizar cron para múltiplas execuções
        crontab -l | grep -v "daily_pipeline.sh" | crontab -
        (crontab -l 2>/dev/null; echo "# Pipeline 3x ao dia - 8:00, 14:00, 21:00") | crontab -
        (crontab -l 2>/dev/null; echo "0 8,14,21 * * * export TZ='America/Sao_Paulo' && /home/sanity/thecryptofrontier/framework_crewai/blog_crew/daily_pipeline.sh >> /home/sanity/logs/pipeline.log 2>&1") | crontab -
        echo "✅ Cron job configurado para 3x ao dia"
        
        echo ""
        echo "✅ Sistema configurado para usar apenas Cron Job!"
        ;;
        
    3)
        echo ""
        echo "🚀 Configurando funções diferentes para cada mecanismo..."
        
        # Atualizar PID file
        echo "$RSS_PID" > /home/sanity/thecryptofrontier/framework_crewai/blog_crew/rss_monitor.pid
        echo "✅ PID file atualizado"
        
        # Modificar cron para apenas limpeza e sincronização
        crontab -l | grep -v "daily_pipeline.sh" | crontab -
        (crontab -l 2>/dev/null; echo "# Limpeza e sincronização - Domingos às 3:00 AM") | crontab -
        (crontab -l 2>/dev/null; echo "0 3 * * 0 cd /home/sanity/thecryptofrontier/framework_crewai/blog_crew && python delete_sanity_duplicates.py && python sync_sanity_to_algolia.py >> /home/sanity/logs/maintenance.log 2>&1") | crontab -
        echo "✅ Cron job reconfigurado apenas para manutenção"
        
        echo ""
        echo "✅ Sistema configurado:"
        echo "   - RSS Monitor: Processamento de novos artigos"
        echo "   - Cron Job: Apenas manutenção semanal"
        ;;
        
    4)
        echo "❌ Operação cancelada"
        exit 0
        ;;
        
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "📋 Nova configuração:"
echo "===================="
echo "Crontab atual:"
crontab -l | grep -v "^#" | grep -v "^$"
echo ""
echo "RSS Monitor:"
if ps aux | grep "rss_monitor.py" | grep -v grep > /dev/null; then
    echo "✅ Rodando"
else
    echo "❌ Parado"
fi