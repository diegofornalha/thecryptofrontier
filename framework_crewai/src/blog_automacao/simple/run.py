#!/usr/bin/env python3
"""
Script para executar o fluxo simplificado de automação de blog
"""

import os
import logging
from src.blog_automacao.simple.simple_flow import run_blog_flow

if __name__ == "__main__":
    # Configuração básica de logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logger = logging.getLogger("run_simple_blog")
    
    # Verificar variáveis de ambiente
    required_vars = ["GEMINI_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.warning(f"As seguintes variáveis de ambiente não estão definidas: {', '.join(missing_vars)}")
        logger.warning("O fluxo pode falhar sem estas variáveis.")
    
    # Executar o fluxo
    logger.info("Iniciando fluxo simplificado de automação de blog...")
    try:
        result = run_blog_flow()
        logger.info("Fluxo concluído com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao executar o fluxo: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())