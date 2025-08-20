import os
import logging
from crewai import Agent # Importar Agent
from crewai.llm import LLM # Importação específica da classe LLM do CrewAI
from tools import get_tool_by_name

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('translator_agent')

# Carregar configuração centralizada
from config import config as app_config

# Definir configurações padrão para LLM
llm_settings = app_config.get('llm', {})
model_name = llm_settings.get('model', 'gpt-4.1-nano')  # Use o modelo padrão da configuração
temperature = llm_settings.get('temperature', 0.7)

# Tentar configurar o LLM
try:
    # Tentar usar OpenAI se a chave estiver disponível
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        logger.info("Usando OpenAI como LLM para o agente tradutor")
        llm = LLM(
            model=model_name,
            temperature=temperature
        )
    else:
        # Fallback para o modelo padrão sem especificar a API
        logger.info("Chave OpenAI não encontrada, usando modelo padrão do sistema")
        llm = LLM(
            model=model_name,
            temperature=temperature
        )
except Exception as e:
    logger.warning(f"Erro ao configurar LLM específico: {e}")
    logger.info("Usando configuração padrão do LLM")
    # Usar configuração mínima/padrão
    llm = LLM(temperature=temperature)

class TranslatorAgent:
    """Agente tradutor responsável por traduzir artigos para português brasileiro"""
    
    @staticmethod
    def create(tools_list):
        """Cria o agente tradutor com as ferramentas necessárias"""
        # Definir o backstory do tradutor para reutilização
        translator_backstory = """Você é um tradutor especializado em criptomoedas e tecnologia blockchain.
        Você conhece a terminologia técnica e sabe adaptá-la para o público brasileiro.
        Sua tradução é fluida e natural, preservando o significado original do texto.
        Você sabe adaptar expressões idiomáticas e referências culturais para que o 
        conteúdo tenha mais relevância para o público brasileiro."""
        
        try:
            logger.info("Criando agente tradutor...")
            return Agent(
                role="Tradutor de Conteúdo",
                goal="Traduzir artigos de criptomoedas do inglês para português brasileiro com precisão e naturalidade",
                backstory=translator_backstory,
                verbose=True,
                tools=[
                    get_tool_by_name("read_from_file"),
                    get_tool_by_name("save_to_file")
                ],
                llm=llm
            )
        except Exception as e:
            logger.error(f"Falha ao criar agente tradutor: {e}")
            # Em vez de falhar completamente, retornar um agente com capacidades mínimas
            return Agent(
                role="Tradutor de Conteúdo (modo limitado)",
                goal="Traduzir artigos simples",
                backstory="Tradutor em modo limitado",
                verbose=True,
                llm=LLM(temperature=0.7)  # Usar configuração mínima
            )