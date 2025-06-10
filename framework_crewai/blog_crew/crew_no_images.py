#!/usr/bin/env python3
"""
Crew sem geração de imagens - apenas RSS, tradução, formatação e publicação
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
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("blog_crew")

def setup_directories():
    """Cria os diretórios necessários para o fluxo"""
    directories = [
        "posts_para_traduzir",
        "posts_traduzidos",
        "posts_formatados",
        "posts_publicados"
    ]
    for dir_name in directories:
        os.makedirs(dir_name, exist_ok=True)
        logger.info(f"Diretório '{dir_name}' criado/verificado")

def get_crew():
    """Cria e retorna o crew SEM geração de imagens"""
    # Criar diretórios de trabalho
    setup_directories()
    
    # Criar agentes (sem ImageGenerator)
    logger.info("Criando agentes...")
    monitor = MonitorAgent.create(tools)
    translator = TranslatorAgent.create(tools)
    formatter = FormatterAgent.create(tools)
    publisher = PublisherAgent.create(tools)
    
    # Criar tarefas (sem image_generation)
    logger.info("Definindo tarefas...")
    monitoring_task = create_monitoring_task(monitor)
    translation_task = create_translation_task(translator)
    formatting_task = create_formatting_task(formatter)
    publishing_task = create_publishing_task(publisher)
    
    # Montar o crew
    logger.info("Montando a equipe de agentes...")
    crew = Crew(
        agents=[monitor, translator, formatter, publisher],
        tasks=[monitoring_task, translation_task, formatting_task, publishing_task],
        process=Process.sequential,
        verbose=True,
        output_log_file="crew_output.log"
    )
    
    return crew

if __name__ == "__main__":
    logger.info("Iniciando Blog Crew (sem imagens)...")
    crew = get_crew()
    result = crew.kickoff(inputs={"limit": 3})
    logger.info(f"Resultado: {result}")