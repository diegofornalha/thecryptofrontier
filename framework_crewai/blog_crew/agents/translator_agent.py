import os
from crewai import Agent # Importar Agent
from crewai.llm import LLM # Importação específica da classe LLM do CrewAI

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

class TranslatorAgent:
    """Agente tradutor responsável por traduzir artigos para português brasileiro"""
    
    @staticmethod
    def create(tools):
        """Cria o agente tradutor com as ferramentas necessárias"""
        # Filtrar ferramentas relevantes para este agente
        translator_tools = [tool for tool in tools if tool.name in ["read_from_file", "save_to_file"]]
        
        return Agent(
            role="Tradutor de Conteúdo",
            goal="Traduzir artigos de criptomoedas do inglês para português brasileiro com precisão e naturalidade",
            backstory="""Você é um tradutor especializado em criptomoedas e tecnologia blockchain.
            Você conhece a terminologia técnica e sabe adaptá-la para o público brasileiro.
            Sua tradução é fluida e natural, preservando o significado original do texto.
            Você sabe adaptar expressões idiomáticas e referências culturais para que o 
            conteúdo tenha mais relevância para o público brasileiro.""",
            verbose=True,
            tools=translator_tools,
            llm=llm
        )