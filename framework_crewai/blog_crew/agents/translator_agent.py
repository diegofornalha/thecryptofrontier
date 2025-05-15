import os
import logging
from crewai import Agent # Importar Agent
from crewai.llm import LLM # Importação específica da classe LLM do CrewAI

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('translator_agent')

# Carregar configuração centralizada
from config import config as app_config

# Criar o LLM usando a classe nativa do CrewAI com base na configuração
llm_settings = app_config.get('llm', {})
openai_model = llm_settings.get('model', 'gpt-4.1-nano')
temperature_from_yaml = llm_settings.get('temperature', 0.7)

# Obter a chave API da OpenAI - simplificado para usar apenas a chave OpenAI
openai_api_key = os.getenv("OPENAI_API_KEY")

# Configurar apenas OpenAI - sem tentar usar Gemini
if openai_api_key:
    try:
        # Configurar diretamente o OpenAI sem tentar Gemini
        # Removido o parâmetro 'provider' que estava causando o erro
        llm = LLM(
            model=openai_model,
            temperature=temperature_from_yaml,
            api_key=openai_api_key
        )
        logger.info("LLM da OpenAI configurado com sucesso (sem tentativa de Gemini)")
    except Exception as e:
        logger.error(f"Erro ao configurar LLM da OpenAI: {e}")
        llm = None
else:
    logger.error("Chave API da OpenAI não encontrada, não será possível criar o agente tradutor")
    llm = None

class TranslatorAgent:
    """Agente tradutor responsável por traduzir artigos para português brasileiro"""
    
    @staticmethod
    def create(tools):
        """Cria o agente tradutor com as ferramentas necessárias"""
        # Filtrar ferramentas relevantes para este agente
        translator_tools = [tool for tool in tools if tool.name in ["read_from_file", "save_to_file"]]
        
        # Definir o backstory do tradutor para reutilização
        translator_backstory = """Você é um tradutor especializado em criptomoedas e tecnologia blockchain.
        Você conhece a terminologia técnica e sabe adaptá-la para o público brasileiro.
        Sua tradução é fluida e natural, preservando o significado original do texto.
        Você sabe adaptar expressões idiomáticas e referências culturais para que o 
        conteúdo tenha mais relevância para o público brasileiro."""
        
        # Versão simplificada - usar apenas OpenAI diretamente
        if not llm:
            raise Exception("OpenAI não está configurado corretamente, impossível criar agente tradutor")
            
        try:
            logger.info("Criando agente tradutor usando OpenAI diretamente...")
            return Agent(
                role="Tradutor de Conteúdo",
                goal="Traduzir artigos de criptomoedas do inglês para português brasileiro com precisão e naturalidade",
                backstory=translator_backstory,
                verbose=True,
                tools=translator_tools,
                llm=llm
            )
        except Exception as e:
            logger.error(f"Falha ao criar agente tradutor: {e}")
            raise Exception("Não foi possível criar o agente tradutor")