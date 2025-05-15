#!/usr/bin/env python3
"""
Definição do Crew para o blog automação usando decoradores modernos
Este arquivo demonstra o uso dos novos decoradores do CrewAI
"""

import os
import logging
from crewai import CrewBase, agent, task, crew
from crewai import Process

# Importações locais
from tools import tools
from config import config

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("blog_crew_modern")

def setup_directories():
    """Cria os diretórios necessários para o fluxo"""
    for dir_name in config['directories'].values():
        os.makedirs(dir_name, exist_ok=True)
        logger.info(f"Diretório '{dir_name}' criado/verificado com sucesso")

@CrewBase
class BlogCrew:
    """Crew para automação de blog com uso de decoradores modernos"""
    
    @agent
    def monitor_agent(self):
        """Agente responsável por monitorar feeds RSS e encontrar artigos relevantes"""
        from agents.monitor_agent import MonitorAgent
        return MonitorAgent.create(tools)
        
    @agent
    def translator_agent(self):
        """Agente responsável por traduzir artigos para português"""
        from agents.translator_agent import TranslatorAgent
        return TranslatorAgent.create(tools)
        
    @agent
    def formatter_agent(self):
        """Agente responsável por formatar artigos para o Sanity CMS"""
        from agents.formatter_agent import FormatterAgent
        return FormatterAgent.create(tools)
        
    @agent
    def publisher_agent(self):
        """Agente responsável por publicar artigos no Sanity CMS"""
        from agents.publisher_agent import PublisherAgent
        return PublisherAgent.create(tools)
    
    @task
    def monitoring_task(self):
        """Tarefa de monitoramento de feeds RSS"""
        from tasks.blog_tasks import create_monitoring_task
        return create_monitoring_task(self.monitor_agent())
        
    @task
    def translation_task(self):
        """Tarefa de tradução de artigos"""
        from tasks.blog_tasks import create_translation_task
        return create_translation_task(self.translator_agent())
        
    @task
    def formatting_task(self):
        """Tarefa de formatação de artigos para o Sanity CMS"""
        from tasks.blog_tasks import create_formatting_task
        return create_formatting_task(self.formatter_agent())
        
    @task
    def publishing_task(self):
        """Tarefa de publicação de artigos no Sanity CMS"""
        from tasks.blog_tasks import create_publishing_task
        return create_publishing_task(self.publisher_agent())
    
    @crew
    def blog_crew(self):
        """Definição da crew para automação de blog"""
        # Criar diretórios de trabalho
        setup_directories()
        
        return {
            "agents": [
                self.monitor_agent(),
                self.translator_agent(),
                self.formatter_agent(),
                self.publisher_agent()
            ],
            "tasks": [
                self.monitoring_task(),
                self.translation_task(),
                self.formatting_task(),
                self.publishing_task()
            ],
            "verbose": config['process']['verbose'],
            "process": Process.sequential if config['process']['type'] == 'sequential' else Process.hierarchical
        }

# Instanciar a crew
blog_crew = BlogCrew().blog_crew()