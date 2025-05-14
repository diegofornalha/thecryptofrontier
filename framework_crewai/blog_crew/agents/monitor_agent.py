from crewai import Agent # Importar Agent
from crewai.llm import LLM # Importação específica da classe LLM do CrewAI
import os
from tools import get_tool_by_name, tools

# Vamos tentar com OpenAI como alternativa
# Se você tiver uma chave OpenAI, descomente e use:
# os.environ["OPENAI_API_KEY"] = "sua-chave-openai"

# Carregar configuração centralizada
from config import config as app_config

# Obter a chave da API.
api_key = os.getenv("GOOGLE_API_KEY") 
if not api_key:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("AVISO: GEMINI_API_KEY ou GOOGLE_API_KEY não encontradas no ambiente.")

# Criar o LLM usando a classe nativa do CrewAI com base na configuração
llm_settings = app_config.get('llm', {})
model_name_from_yaml = llm_settings.get('model', 'gemini-pro') 
temperature_from_yaml = llm_settings.get('temperature', 0.7)

prefixed_model_name = f"gemini/{model_name_from_yaml}"

llm_crew_config_dict = {
    'api_key': api_key, 
    'temperature': temperature_from_yaml,
}

llm = LLM(
    model=prefixed_model_name,
    config=llm_crew_config_dict
)

# Alternativamente, você pode usar Anthropic:
# os.environ["ANTHROPIC_API_KEY"] = "sua-chave-anthropic"
# llm = LLM(provider="anthropic", model="claude-3-sonnet-20240229", temperature=0.7)

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