#!/usr/bin/env python3
"""
Definição do Crew para o blog automação
Este arquivo é usado pelo CLI da CrewAI
"""

import os
import logging
from crewai import Crew, Process

# Importações locais
from agents import MonitorAgent, TranslatorAgent, FormatterAgent, PublisherAgent, ImageGeneratorAgent
from tools import tools
from tasks import (
    create_monitoring_task,
    create_translation_task, 
    create_formatting_task,
    create_image_generation_task,
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
    logger.info("Diretórios configurados")

def get_crew():
    """Cria e retorna o crew"""
    # Criar diretórios de trabalho
    setup_directories()
    
    # Criar agentes
    logger.info("Criando agentes...")
    monitor = MonitorAgent.create(tools)
    translator = TranslatorAgent.create(tools)
    formatter = FormatterAgent.create(tools)
    image_generator = ImageGeneratorAgent.create(tools)
    publisher = PublisherAgent.create(tools)
    
    # Criar tarefas
    logger.info("Definindo tarefas...")
    tasks = [
        create_monitoring_task(monitor),
        create_translation_task(translator),
        create_formatting_task(formatter),
        create_image_generation_task(image_generator),
        create_publishing_task(publisher)
    ]
    
    # Criar a crew
    logger.info("Montando a equipe de agentes...")
    return Crew(
        agents=[monitor, translator, formatter, image_generator, publisher],
        tasks=tasks,
        verbose=config['process']['verbose'],
        process=Process.sequential if config['process']['type'] == 'sequential' else Process.hierarchical
    )

# Crew para ser usado pelo CLI
crew = get_crew()

# Exportar a função para que ela possa ser importada
__all__ = ['get_crew', 'crew']