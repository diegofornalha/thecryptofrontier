#!/bin/bash
# Setup para automatizar o pipeline RSS multilíngue
# Baseado no padrão oficial i18n do Strapi via Context7

echo "🔧 Configurando automatização do pipeline RSS..."

# Definir o diretório do projeto
PROJECT_DIR="/home/strapi/thecryptofrontier"

# Criar arquivo de log se não existir
touch $PROJECT_DIR/pipeline_cron.log

# Adicionar job ao cron (executar a cada 2 horas)
echo "📅 Adicionando job ao cron..."

# Criar entrada do cron
CRON_JOB="0 */2 * * * cd $PROJECT_DIR && python3 pipeline_rss_multilingual.py --limit 1 >> $PROJECT_DIR/pipeline_cron.log 2>&1"

# Adicionar ao crontab
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job configurado com sucesso!"
echo "📅 Execução: A cada 2 horas"
echo "📝 Logs: $PROJECT_DIR/pipeline_cron.log"
echo "🎯 Método: Padrão Context7 i18n"
echo ""
echo "Para verificar o cron job:"
echo "  crontab -l"
echo ""
echo "Para ver os logs:"
echo "  tail -f $PROJECT_DIR/pipeline_cron.log" 