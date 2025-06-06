#!/usr/bin/env python3
"""
Script principal para execução do CrewAI de automação de blog
Segue a estrutura padrão recomendada na documentação oficial:
https://docs.crewai.com/
"""

import os
import logging

# Importações locais
from crew import get_crew

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("blog_crew")

def run_crew():
    """Executa o fluxo completo de automação do blog"""
    
    # Verificar variáveis de ambiente necessárias
    required_vars = ["OPENAI_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.warning(f"As seguintes variáveis de ambiente não estão definidas: {', '.join(missing_vars)}")
        logger.warning("O fluxo pode falhar sem estas variáveis.")
    
    # Verificar conexão com o Sanity
    try:
        from config.sanity_config import verify_sanity_connection
        sanity_ok, sanity_message = verify_sanity_connection()
        if sanity_ok:
            logger.info(f"Conexão com Sanity: {sanity_message}")
        else:
            logger.warning(f"Problema na conexão com Sanity: {sanity_message}")
            logger.warning("Os artigos serão processados, mas a publicação no Sanity pode falhar.")
    except Exception as e:
        logger.error(f"Erro ao verificar conexão com Sanity: {str(e)}")
   
    # Obter o Crew
    crew = get_crew()
    
    # Executar o fluxo
    logger.info("Iniciando o fluxo de automação...")
    result = crew.kickoff()
    
    # Exibir resultado final
    logger.info(f"Fluxo concluído com sucesso!")
    logger.info(f"Resultado: {result}")
    
    return result

if __name__ == "__main__":
    logger.info("Iniciando Blog Crew - Automação de blog com CrewAI...")
    run_crew()