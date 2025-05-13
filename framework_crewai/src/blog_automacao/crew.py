#!/usr/bin/env python
# src/blog_automacao/crew.py

import os
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process
from crewai.project import CrewBase, agent, crew, task
from .tools.rss_tools import RssFeedTool
from .tools.sanity_tools import SanityPublishTool
from langchain_google_genai import ChatGoogleGenerativeAI
import litellm

@CrewBase
class BlogAutomacaoCrew:
    """Crew para automação completa de blog sobre criptomoedas."""

    def __init__(self):
        """Inicializar a crew com configurações necessárias."""
        # Inicializar llm com None
        self.llm = None
        
        # Configurar API Gemini se a chave estiver disponível
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            # Tentar carregar de agentes_backup_legado/config.py
            try:
                import sys
                sys.path.append("agentes_backup_legado")
                from config import GEMINI_API_KEY, GEMINI_MODEL
                api_key = GEMINI_API_KEY
                os.environ["GEMINI_API_KEY"] = api_key
                print(f"Carregada chave API Gemini do arquivo de configuração legado.")
            except ImportError:
                print("Aviso: Não foi possível importar configurações do Gemini.")
        
        if api_key:
            # Configurar Gemini
            genai.configure(api_key=api_key)
            
            # Configuração especial para CrewAI - necessária chave OpenAI mesmo usando Gemini
            os.environ["OPENAI_API_KEY"] = "sk-123"  # Chave fictícia para evitar erros
            os.environ["LANGCHAIN_TRACING_V2"] = "false"  # Desativar rastreamento
            
            # Configuração correta do LiteLLM e Gemini
            # Definir API key do Google no ambiente
            os.environ["GOOGLE_API_KEY"] = api_key
            
            # Configurando o modelo para os agentes usando LangChain
            try:
                # LangChain API com modelo correto (sem prefixo models/)
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",  # Formato correto sem prefixo "models/"
                    google_api_key=api_key,
                    temperature=0.7,
                    convert_system_message_to_human=True,
                )
                
                # Configurar diretamente o LiteLLM
                litellm.drop_params = True  # Ignorar parâmetros não suportados
                litellm.model = "google/gemini-1.5-flash"  # Usar o prefixo 'google/' para LiteLLM
                
                print("Modelo Gemini configurado com sucesso para os agentes.")
            except Exception as e:
                print(f"Erro ao configurar modelo Gemini: {str(e)}")
                print("Recomendação: Use o modo direto com --direto para monitoramento sem depender do Gemini.")
        else:
            print("ATENÇÃO: Nenhuma chave API encontrada para Gemini. O sistema não funcionará corretamente.")
            print("Recomendação: Use o modo direto com --direto para monitoramento sem depender do Gemini.")
        
        # Criar diretórios necessários
        os.makedirs("posts_traduzidos", exist_ok=True)
        os.makedirs("posts_publicados", exist_ok=True)

    # ----- Definição dos Agentes -----
    
    @agent
    def monitor(self) -> Agent:
        """Agente para monitorar feeds RSS."""
        return Agent(
            config=self.agents_config["monitor"],
            verbose=True,
            tools=[RssFeedTool()],
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def selector(self) -> Agent:
        """Agente para selecionar conteúdo relevante."""
        return Agent(
            config=self.agents_config["selector"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def translator(self) -> Agent:
        """Agente para traduzir conteúdo."""
        return Agent(
            config=self.agents_config["translator"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def localizer(self) -> Agent:
        """Agente para adaptar o conteúdo para o público brasileiro."""
        return Agent(
            config=self.agents_config["localizer"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def editor(self) -> Agent:
        """Agente para editar e revisar o conteúdo."""
        return Agent(
            config=self.agents_config["editor"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def formatter(self) -> Agent:
        """Agente para formatar o conteúdo em Markdown."""
        return Agent(
            config=self.agents_config["formatter"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def seo_analyst(self) -> Agent:
        """Agente para otimizar o conteúdo para SEO."""
        return Agent(
            config=self.agents_config["seo_analyst"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def publisher(self) -> Agent:
        """Agente para publicar o conteúdo no CMS."""
        return Agent(
            config=self.agents_config["publisher"],
            verbose=True,
            tools=[SanityPublishTool()],
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    # ----- Definição das Tarefas -----
    
    @task
    def monitoring_task(self) -> Task:
        """Tarefa para analisar artigos de feeds RSS."""
        return Task(
            config=self.tasks_config["monitoring_task"]
        )
    
    @task
    def selection_task(self) -> Task:
        """Tarefa para selecionar artigos relevantes."""
        return Task(
            config=self.tasks_config["selection_task"]
        )
    
    @task
    def translation_task(self) -> Task:
        """Tarefa para traduzir artigos selecionados."""
        return Task(
            config=self.tasks_config["translation_task"]
        )
    
    @task
    def localization_task(self) -> Task:
        """Tarefa para adaptar o conteúdo para o público brasileiro."""
        return Task(
            config=self.tasks_config["localization_task"]
        )
    
    @task
    def editing_task(self) -> Task:
        """Tarefa para revisar e editar o conteúdo."""
        return Task(
            config=self.tasks_config["editing_task"]
        )
    
    @task
    def seo_optimization_task(self) -> Task:
        """Tarefa para otimizar o conteúdo para SEO."""
        return Task(
            config=self.tasks_config["seo_optimization_task"]
        )
    
    @task
    def publish_task(self) -> Task:
        """Tarefa para publicar o conteúdo no CMS."""
        return Task(
            config=self.tasks_config["publish_task"]
        )
    
    # ----- Configuração da Crew -----
    
    @crew
    def monitoramento_crew(self) -> Crew:
        """Crew específica para monitoramento e seleção de conteúdo."""
        return Crew(
            agents=[self.monitor(), self.selector()],
            tasks=[self.monitoring_task(), self.selection_task()],
            verbose=True,
            process=Process.sequential
        )
    
    @crew
    def traducao_crew(self) -> Crew:
        """Crew específica para tradução e adaptação de conteúdo."""
        return Crew(
            agents=[self.translator(), self.localizer()],
            tasks=[self.translation_task(), self.localization_task()],
            verbose=True,
            process=Process.sequential
        )
    
    @crew
    def publicacao_crew(self) -> Crew:
        """Crew específica para revisão, otimização e publicação."""
        return Crew(
            agents=[self.editor(), self.seo_analyst(), self.publisher()],
            tasks=[self.editing_task(), self.seo_optimization_task(), self.publish_task()],
            verbose=True,
            process=Process.sequential
        )
    
    @crew
    def crew_completa(self) -> Crew:
        """Crew completa com todos os agentes e tarefas."""
        return Crew(
            agents=[
                self.monitor(), self.selector(),
                self.translator(), self.localizer(),
                self.editor(), self.seo_analyst(), self.publisher()
            ],
            tasks=[
                self.monitoring_task(), self.selection_task(),
                self.translation_task(), self.localization_task(),
                self.editing_task(), self.seo_optimization_task(), self.publish_task()
            ],
            verbose=True,
            process=Process.sequential
        ) 