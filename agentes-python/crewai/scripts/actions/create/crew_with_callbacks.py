#!/usr/bin/env python3
"""
Versão do Crew com callbacks para garantir salvamento de arquivos
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

from crewai import Crew, Process
from crewai.agent import Agent
from crewai.task import Task

# Importar agentes e tarefas
from agents import (
    MonitorAgent,
    TranslatorAgent,
    FormatterAgent,
    ImageGeneratorAgent,
    PublisherAgent
)

from tasks import (
    create_monitoring_task,
    create_translation_task,
    create_formatting_task,
    create_image_generation_task,
    create_publishing_task
)

from tools import tools

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("crew_callbacks")

class FileInterceptor:
    """Intercepta e salva outputs das tarefas"""
    
    def __init__(self):
        self.ensure_directories()
        
    def ensure_directories(self):
        """Garante que os diretórios existem"""
        dirs = [
            "posts_para_traduzir",
            "posts_traduzidos", 
            "posts_formatados",
            "posts_com_imagem",
            "posts_publicados"
        ]
        for d in dirs:
            Path(d).mkdir(exist_ok=True)
            
    def save_monitoring_output(self, articles: List[Dict[str, Any]]) -> List[str]:
        """Salva artigos do monitor RSS"""
        saved_files = []
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        for i, article in enumerate(articles):
            filename = f"para_traduzir_{timestamp}_{i}.json"
            filepath = Path("posts_para_traduzir") / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(article, f, ensure_ascii=False, indent=2)
                
            saved_files.append(filename)
            logger.info(f"✅ Salvo: {filepath}")
            
        return saved_files
        
    def save_translation_output(self, translations: List[Dict[str, Any]]) -> List[str]:
        """Salva artigos traduzidos"""
        saved_files = []
        
        for translation in translations:
            # Extrair nome original se possível
            original_name = translation.get("_original_filename", "")
            if original_name:
                filename = f"traduzido_{original_name}"
            else:
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                filename = f"traduzido_{timestamp}.json"
                
            filepath = Path("posts_traduzidos") / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(translation, f, ensure_ascii=False, indent=2)
                
            saved_files.append(filename)
            logger.info(f"✅ Salvo: {filepath}")
            
        return saved_files
        
    def save_formatting_output(self, formatted: List[Dict[str, Any]]) -> List[str]:
        """Salva artigos formatados"""
        saved_files = []
        
        for article in formatted:
            # Extrair nome original
            original_name = article.get("_original_filename", "")
            if original_name and "traduzido_" in original_name:
                filename = original_name.replace("traduzido_", "formatado_")
            else:
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                filename = f"formatado_{timestamp}.json"
                
            filepath = Path("posts_formatados") / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(article, f, ensure_ascii=False, indent=2)
                
            saved_files.append(filename)
            logger.info(f"✅ Salvo: {filepath}")
            
        return saved_files

def create_crew_with_callbacks():
    """Cria um Crew com callbacks para interceptar outputs"""
    
    interceptor = FileInterceptor()
    
    # Criar agentes
    logger.info("Criando agentes...")
    monitor_agent = MonitorAgent.create(tools)
    translator_agent = TranslatorAgent.create(tools)
    formatter_agent = FormatterAgent.create(tools)
    image_agent = ImageGeneratorAgent.create(tools)
    publisher_agent = PublisherAgent.create(tools)
    
    # Criar tarefas
    logger.info("Definindo tarefas...")
    monitoring_task = create_monitoring_task(monitor_agent)
    translation_task = create_translation_task(translator_agent)
    formatting_task = create_formatting_task(formatter_agent)
    image_task = create_image_generation_task(image_agent)
    publishing_task = create_publishing_task(publisher_agent)
    
    # Adicionar callbacks às tarefas
    original_monitoring_callback = monitoring_task.callback
    original_translation_callback = translation_task.callback
    original_formatting_callback = formatting_task.callback
    
    def monitoring_callback(output):
        """Intercepta output do monitor"""
        logger.info("🔄 Interceptando output do monitor RSS...")
        
        # Processar output
        if isinstance(output, str):
            try:
                # Tentar extrair artigos do output
                import re
                articles = []
                
                # Buscar por padrões JSON no output
                json_pattern = r'\{[^{}]*\}'
                matches = re.findall(json_pattern, output, re.DOTALL)
                
                for match in matches:
                    try:
                        article = json.loads(match)
                        if 'title' in article and 'link' in article:
                            articles.append(article)
                    except:
                        pass
                        
                if articles:
                    saved_files = interceptor.save_monitoring_output(articles)
                    logger.info(f"✅ {len(saved_files)} artigos salvos pelo interceptor")
                    
            except Exception as e:
                logger.error(f"❌ Erro ao interceptar output: {e}")
                
        # Chamar callback original se existir
        if original_monitoring_callback:
            return original_monitoring_callback(output)
        return output
    
    def translation_callback(output):
        """Intercepta output do tradutor"""
        logger.info("🔄 Interceptando output do tradutor...")
        
        # Ler arquivos de posts_para_traduzir e simular tradução
        try:
            source_dir = Path("posts_para_traduzir")
            if source_dir.exists():
                files = list(source_dir.glob("*.json"))
                translations = []
                
                for file in files:
                    with open(file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                    # Adicionar campos de tradução
                    data['original_title'] = data.get('title', '')
                    data['_original_filename'] = file.name
                    translations.append(data)
                    
                if translations:
                    saved_files = interceptor.save_translation_output(translations)
                    logger.info(f"✅ {len(saved_files)} traduções salvas pelo interceptor")
                    
        except Exception as e:
            logger.error(f"❌ Erro ao interceptar traduções: {e}")
            
        if original_translation_callback:
            return original_translation_callback(output)
        return output
    
    def formatting_callback(output):
        """Intercepta output do formatador"""
        logger.info("🔄 Interceptando output do formatador...")
        
        # Ler arquivos de posts_traduzidos e simular formatação
        try:
            source_dir = Path("posts_traduzidos")
            if source_dir.exists():
                files = list(source_dir.glob("*.json"))
                formatted = []
                
                for file in files:
                    with open(file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                    # Adicionar formatação básica
                    data['_type'] = 'post'
                    data['_original_filename'] = file.name
                    
                    # Criar slug se não existir
                    if 'slug' not in data:
                        from tools.formatter_tools import create_slug_simple
                        data['slug'] = {
                            "_type": "slug",
                            "current": create_slug_simple(data.get('title', ''))
                        }
                        
                    formatted.append(data)
                    
                if formatted:
                    saved_files = interceptor.save_formatting_output(formatted)
                    logger.info(f"✅ {len(saved_files)} posts formatados salvos pelo interceptor")
                    
        except Exception as e:
            logger.error(f"❌ Erro ao interceptar formatação: {e}")
            
        if original_formatting_callback:
            return original_formatting_callback(output)
        return output
    
    # Atribuir callbacks
    monitoring_task.callback = monitoring_callback
    translation_task.callback = translation_callback  
    formatting_task.callback = formatting_callback
    
    # Montar a equipe
    logger.info("Montando a equipe de agentes...")
    crew = Crew(
        agents=[monitor_agent, translator_agent, formatter_agent, image_agent, publisher_agent],
        tasks=[monitoring_task, translation_task, formatting_task, image_task, publishing_task],
        process=Process.sequential,
        verbose=True,
        memory=False,
        embedder={
            "provider": "openai",
            "config": {
                "model": "text-embedding-3-small"
            }
        }
    )
    
    return crew

def run_crew_with_callbacks():
    """Executa o crew com callbacks"""
    crew = create_crew_with_callbacks()
    
    logger.info("🚀 Iniciando Crew com callbacks...")
    
    try:
        result = crew.kickoff()
        logger.info("✅ Crew executado com sucesso!")
        
        # Verificar arquivos criados
        dirs_to_check = ["posts_para_traduzir", "posts_traduzidos", "posts_formatados"]
        for dir_name in dirs_to_check:
            dir_path = Path(dir_name)
            if dir_path.exists():
                files = list(dir_path.glob("*.json"))
                logger.info(f"📁 {dir_name}: {len(files)} arquivos")
                
        return result
        
    except Exception as e:
        logger.error(f"❌ Erro ao executar Crew: {e}")
        raise

if __name__ == "__main__":
    run_crew_with_callbacks()