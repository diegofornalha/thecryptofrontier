from crewai import Agent # Importar Agent
from crewai.llm import LLM # Importação específica da classe LLM do CrewAI
import os
from tools import get_tool_by_name, tools

# Vamos tentar com OpenAI como alternativa
# Se você tiver uma chave OpenAI, descomente e use:
# os.environ["OPENAI_API_KEY"] = "sua-chave-openai"

# Carregar configuração centralizada
from config import config as app_config

# Obter a chave da API OpenAI apenas
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("AVISO: OPENAI_API_KEY não encontrada no ambiente.")

# Criar o LLM usando a classe nativa do CrewAI com base na configuração
llm_settings = app_config.get('llm', {})
model_name_from_yaml = llm_settings.get('model', 'gpt-4.1-nano') 
temperature_from_yaml = llm_settings.get('temperature', 0.7)

# Configura para usar OpenAI
llm = LLM(
    model=model_name_from_yaml,
    temperature=temperature_from_yaml
)

class MonitorAgent:
    """Agente monitor responsável por capturar artigos de feeds RSS"""
    
    @staticmethod
    def create(tools_list):
        """Cria o agente monitor com as ferramentas necessárias"""
        return Agent(
            role="Monitor de Feeds RSS",
            goal="Encontrar artigos relevantes sobre criptomoedas em feeds RSS",
            backstory="""Você é um especialista em monitoramento de notícias e feeds RSS.
            Sua função é verificar feeds de notícias de criptomoedas e identificar artigos
            relevantes e interessantes para serem traduzidos para o público brasileiro.
            Você tem um olhar aguçado para selecionar conteúdo que terá maior impacto.""",
            verbose=True,
            tools=[
                get_tool_by_name("read_rss_feeds"),
                get_tool_by_name("save_to_file")
            ],
            llm=llm
        )