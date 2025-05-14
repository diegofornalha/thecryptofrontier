#!/usr/bin/env python3
"""
Script principal para execução do CrewAI de automação de blog
Segue a estrutura padrão recomendada na documentação oficial:
https://docs.crewai.com/
"""

import os
import logging
from crewai import Crew, Process

# Importações locais
from agents import MonitorAgent, TranslatorAgent, FormatterAgent, PublisherAgent
from tools import tools
from tasks import (
    create_monitoring_task,
    create_translation_task, 
    create_formatting_task,
    create_publishing_task
)
from config import config

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("blog_crew")

def setup_directories():
    """Cria os diretórios necessários para o fluxo"""
    for dir_name in config['directories'].values():
        os.makedirs(dir_name, exist_ok=True)
        logger.info(f"Diretório '{dir_name}' criado/verificado com sucesso")

def run_crew():
    """Executa o fluxo completo de automação do blog"""
    
    # Verificar variáveis de ambiente necessárias
    required_vars = ["GEMINI_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.warning(f"As seguintes variáveis de ambiente não estão definidas: {', '.join(missing_vars)}")
        logger.warning("O fluxo pode falhar sem estas variáveis.")
    
    # Criar diretórios de trabalho
    setup_directories()
    
    # Criar agentes
    logger.info("Criando agentes...")
    monitor = MonitorAgent.create(tools)
    translator = TranslatorAgent.create(tools)
    formatter = FormatterAgent.create(tools)
    publisher = PublisherAgent.create(tools)
    
    # Criar tarefas
    logger.info("Definindo tarefas...")
    tasks = [
        create_monitoring_task(monitor),
        create_translation_task(translator),
        create_formatting_task(formatter),
        create_publishing_task(publisher)
    ]
    
    # Criar a crew
    logger.info("Montando a equipe de agentes...")
    crew = Crew(
        agents=[monitor, translator, formatter, publisher],
        tasks=tasks,
        verbose=config['process']['verbose'],
        process=Process.sequential if config['process']['type'] == 'sequential' else Process.hierarchical
    )
    
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