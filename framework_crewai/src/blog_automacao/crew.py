import os
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process
from crewai.project import CrewBase, agent, crew, task, tool
from crewai.llm import LLM
from .tools.rss_tools import RssFeedTool
from .tools.sanity_tools import SanityPublishTool, SanityFormatTool
from .tools.file_tools import FileSaveTool
from .tools.duplicate_detector_tool import DuplicateDetectorTool
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
        self.sanity_format_tool = SanityFormatTool()
        self.file_save_tool = FileSaveTool()
        self.duplicate_detector_tool = DuplicateDetectorTool()

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
    def translator(self) -> Agent:
        """Agente para traduzir conteúdo."""
        return Agent(
            config=self.agents_config["translator"],
            tools=[self.file_save_tool],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def json_formatter(self) -> Agent:
        """Agente para formatar o conteúdo JSON para o Sanity."""
        return Agent(
            config=self.agents_config["json_formatter"],
            tools=[self.file_save_tool, self.sanity_format_tool],
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
    
    @agent
    def duplicate_detector(self) -> Agent:
        """Agente para detectar e remover artigos duplicados."""
        return Agent(
            config=self.agents_config["duplicate_detector"],
            tools=[self.duplicate_detector_tool],
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
    def translation_task(self) -> Task:
        """Tarefa para traduzir artigos."""
        return Task(
            config=self.tasks_config["translation_task"],
            agent=self.translator() # Associar agente
        )
    
    @task
    def publish_task(self) -> Task:
        """Tarefa para publicar o conteúdo no CMS."""
        return Task(
            config=self.tasks_config["publish_task"],
            agent=self.publisher(), # Associar agente
            context=[self.json_formatting_task()] # Dependência atualizada para json_formatting_task
        )
    
    @task
    def duplicate_detection_task(self) -> Task:
        """Tarefa para detectar e remover artigos duplicados."""
        return Task(
            config=self.tasks_config["duplicate_detection_task"],
            agent=self.duplicate_detector(), # Associar agente
            # Esta tarefa não depende diretamente de outras, pode ser executada a qualquer momento
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
    def formatacao_json_crew(self) -> Crew:
        """Crew para formatar o conteúdo JSON para o Sanity."""
        return Crew(
            agents=[self.json_formatter()],
            tasks=[self.json_formatting_task()],
            verbose=True
        )
    
    @crew
    def publicacao_crew(self) -> Crew:
        """Crew para publicação no Sanity CMS, utilizando o JSON já formatado."""
        return Crew(
            agents=[self.publisher()],
            tasks=[self.publish_task()],
            verbose=True
        )
    
    @crew
    def verificacao_duplicatas_crew(self) -> Crew:
        """Crew para detecção e remoção de artigos duplicados no Sanity CMS."""
        return Crew(
            agents=[self.duplicate_detector()],
            tasks=[self.duplicate_detection_task()],
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
                self.json_formatter(), # Novo agente
                self.publisher(),
                self.duplicate_detector() 
            ],
            tasks=[
                self.monitoring_task(), self.selection_task(),
                self.translation_task(), 
                self.json_formatting_task(), # Nova tarefa
                self.publish_task(),
                self.duplicate_detection_task() 
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