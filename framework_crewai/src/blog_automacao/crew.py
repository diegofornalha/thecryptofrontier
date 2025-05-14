import os
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process
from crewai.project import CrewBase, agent, crew, task, tool
from crewai.llm import LLM
from .tools.rss_tools import RssFeedTool
from .tools.sanity_tools import SanityPublishTool
from .tools.file_tools import FileSaveTool
import litellm
import json
import importlib.util
from dotenv import load_dotenv
from datetime import datetime

# Ferramentas
from .tools.rss_tools import RssFeedTool
from .tools.sanity_tools import SanityPublishTool
load_dotenv()


gemini_api_key_from_env = os.getenv("GEMINI_API_KEY")
if gemini_api_key_from_env and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = gemini_api_key_from_env
    print("GOOGLE_API_KEY definida a partir de GEMINI_API_KEY.")

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    print("ERRO CRÍTICO: A variável de ambiente GEMINI_API_KEY não está definida.")
LITELLM_GEMINI_MODEL_NAME = "gemini/gemini-1.5-flash"

class BaseCrewComponents:
    def __init__(self):
        self.llm = LLM(
            model="gemini/gemini-1.5-flash", 
            config={'api_key': gemini_api_key, 'temperature': 0.7}
        )
        
        self.rss_feed_tool = RssFeedTool()
        self.sanity_publish_tool = SanityPublishTool()
        self.file_save_tool = FileSaveTool()

@CrewBase
class BlogAutomacaoCrew(BaseCrewComponents):
    """Crew para automação completa de blog sobre criptomoedas."""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self):
        """Inicializar a crew com configurações necessárias."""
        super().__init__() # Inicializa LLM e ferramentas da classe base
        
        os.environ["LANGCHAIN_TRACING_V2"] = "false"  
        print("LLM foi configurado explicitamente em BaseCrewComponents.")
        
        # Criar diretórios necessários (movido para main.py onde faz mais sentido para o fluxo)
        # os.makedirs("posts_traduzidos", exist_ok=True)
        # os.makedirs("posts_publicados", exist_ok=True)

    # ----- Definição dos Agentes -----    
    @agent
    def monitor(self) -> Agent:
        """Agente para monitorar feeds RSS."""
        return Agent(
            config=self.agents_config["monitor"],
            tools=[self.rss_feed_tool], 
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def selector(self) -> Agent:
        """Agente para selecionar conteúdo relevante."""
        return Agent(
            config=self.agents_config["selector"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def translator(self) -> Agent:
        """Agente para traduzir conteúdo."""
        return Agent(
            config=self.agents_config["translator"],
            tools=[self.file_save_tool],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def localizer(self) -> Agent:
        """Agente para adaptar o conteúdo para o público brasileiro."""
        return Agent(
            config=self.agents_config["localizer"],
            tools=[self.file_save_tool],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def editor(self) -> Agent:
        """Agente para editar e revisar o conteúdo."""
        return Agent(
            config=self.agents_config["editor"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def formatter(self) -> Agent:
        """Agente para formatar o conteúdo em Markdown."""
        return Agent(
            config=self.agents_config["formatter"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def seo_analyst(self) -> Agent:
        """Agente para otimizar o conteúdo para SEO."""
        return Agent(
            config=self.agents_config["seo_analyst"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def publisher(self) -> Agent:
        """Agente para publicar o conteúdo no CMS."""
        return Agent(
            config=self.agents_config["publisher"],
            tools=[self.sanity_publish_tool], 
            verbose=True,
            llm=self.llm
        )
    
    # ----- Definição das Tarefas -----    
    @task
    def monitoring_task(self) -> Task:
        """Tarefa para analisar artigos de feeds RSS."""
        return Task(
            config=self.tasks_config["monitoring_task"],
            agent=self.monitor() # Associar agente
        )
    
    @task
    def selection_task(self) -> Task:
        """Tarefa para selecionar artigos relevantes."""
        return Task(
            config=self.tasks_config["selection_task"],
            agent=self.selector(), # Associar agente
            context=[self.monitoring_task()] # Definir dependência
        )
    
    @task
    def translation_task(self) -> Task:
        """Tarefa para traduzir artigos selecionados."""
        return Task(
            config=self.tasks_config["translation_task"],
            agent=self.translator() # Associar agente
        )
    
    @task
    def localization_task(self) -> Task:
        """Tarefa para adaptar o conteúdo para o público brasileiro."""
        return Task(
            config=self.tasks_config["localization_task"],
            agent=self.localizer(), # Associar agente
            context=[self.translation_task()] # Definir dependência
        )
    
    @task
    def editing_task(self) -> Task:
        """Tarefa para revisar e editar o conteúdo."""
        return Task(
            config=self.tasks_config["editing_task"],
            agent=self.editor(), # Associar agente
            # O contexto (output da localization_task) é passado pelo main.py via input da crew
            # ou se a localization_task salvar em arquivo e esta ler.
            # Para fluxo em memória, precisaria de `context=[self.localization_task()]` se fizesse parte da MESMA crew
        )
    
    @task
    def seo_optimization_task(self) -> Task:
        """Tarefa para otimizar o conteúdo para SEO."""
        return Task(
            config=self.tasks_config["seo_optimization_task"],
            agent=self.seo_analyst(), # Associar agente
            context=[self.editing_task()] # Definir dependência
        )
    
    @task
    def publish_task(self) -> Task:
        """Tarefa para publicar o conteúdo no CMS."""
        return Task(
            config=self.tasks_config["publish_task"],
            agent=self.publisher(), # Associar agente
            context=[self.translation_task()] # Dependência atualizada para translation_task
        )
    
    # ----- Configuração da Crew -----    
    @crew
    def monitoramento_crew(self) -> Crew:
        """Crew para monitoramento de artigos via feeds RSS, filtrando apenas aqueles presentes no banco de dados."""
        return Crew(
            agents=[self.monitor()],
            tasks=[self.monitoring_task()],
            process=Process.sequential,
            verbose=True
        )
    
    @crew
    def traducao_crew(self) -> Crew:
        """Crew para tradução de conteúdo."""
        # Simplificado para ter apenas o tradutor, sem editor e localizer
        return Crew(
            agents=[self.translator()], 
            tasks=[self.translation_task()], 
            verbose=True,
        )
    
    @crew
    def publicacao_crew(self) -> Crew:
        """Crew para publicação no Sanity CMS, organizando o arquivo conforme o schema do projeto."""
        return Crew(
            agents=[self.publisher()],
            tasks=[self.publish_task()],
            verbose=True
        )
    
    @crew
    def crew_completa(self) -> Crew:
        """Crew completa com todos os agentes e tarefas em sequência lógica."""
        # Esta crew assume que os dados são passados via sistema de arquivos entre as etapas,
        # conforme orquestrado pelo main.py. Portanto, as dependências de contexto aqui
        # são mais para a ordem lógica dentro de uma etapa, se aplicável.
        return Crew(
            agents=[
                self.monitor(), self.selector(),
                self.translator(), 
                self.formatter(), self.publisher()
            ],
            tasks=[
                self.monitoring_task(), self.selection_task(),
                self.translation_task(), 
                self.publish_task()
            ],
            verbose=True,
            process=Process.sequential,
            llm=self.llm
        )

# Execução para teste
if __name__ == "__main__":
    print("## Bem-vindo à Crew de Automação de Blog! ##")
    print('-----------------------------------------------')
    print("\nO bloco if __name__ == '__main__' em crew.py é para testes diretos deste arquivo.")
    print("Para executar o fluxo principal, use o script main.py.")
    print("########################") 