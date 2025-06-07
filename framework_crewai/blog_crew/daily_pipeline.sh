#!/bin/bash
# Script para executar o pipeline de blog diariamente
# Este script define as variáveis de ambiente necessárias e executa o pipeline
# Configurado para o fuso horário de São Paulo/Brasil

# Configurar fuso horário para Brasil/São Paulo
export TZ="America/Sao_Paulo"

# Acessar diretório do projeto
cd /home/sanity/thecryptofrontier/framework_crewai/blog_crew || exit 1

# Ativar ambiente virtual, se existir
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Definir variáveis de ambiente
export ALGOLIA_ADMIN_API_KEY="d0cb55ec8f07832bc5f57da0bd25c535"
export ALGOLIA_APP_ID="42TZWHW8UP"
export ALGOLIA_INDEX_NAME="development_mcpx_content"

# Iniciar log
echo "=== Pipeline de blog iniciado em $(date) ===" >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log

# Executar pipeline com sistema de fila
# ATUALIZADO: Usando simple_pipeline.py - pipeline simplificado e confiável
# Configura limite de artigos via variável de ambiente
export ARTICLE_LIMIT=10
python simple_pipeline.py >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log 2>&1

# Processar fila de imagens em background (opcional)
# Se quiser processar todas as imagens após o pipeline principal
# Descomente a linha abaixo:
# nohup python process_image_queue.py >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/image_queue.log 2>&1 &

# Log de conclusão
echo "=== Pipeline de blog concluído em $(date) ===" >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log

# Limpar duplicatas semanalmente (domingo)
if [ "$(date +%u)" = "7" ]; then
    echo "=== Iniciando limpeza de duplicatas em $(date) ===" >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log
    
    # Limpar duplicatas do Sanity
    python delete_sanity_duplicates.py >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log 2>&1
    
    # Limpar duplicatas do Algolia
    python delete_algolia_duplicates.py >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log 2>&1
    
    # Sincronizar tudo
    python direct_sync_sanity_to_algolia.py >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log 2>&1
    
    echo "=== Limpeza de duplicatas concluída em $(date) ===" >> /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log
fi

# Desativar ambiente virtual, se estiver ativo
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
fi