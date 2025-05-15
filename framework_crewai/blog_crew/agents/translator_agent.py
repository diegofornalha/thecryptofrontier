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

# Verificar se as chaves de API estão disponíveis
gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Verificações iniciais para configurar a estratégia de fallback
gemini_llm = None
openai_llm = None

# Configurar LLM do OpenAI primeiro, pois será nosso fallback garantido
if openai_api_key:
    try:
        openai_llm = LLM(
            provider="openai",  # Explicitamente especificar OpenAI como provedor
            model=openai_model,
            temperature=temperature_from_yaml,
            api_key=openai_api_key
        )
        logger.info("LLM da OpenAI configurado com sucesso")
    except Exception as e:
        logger.error(f"Erro ao configurar LLM da OpenAI: {e}")
        openai_llm = None
else:
    logger.warning("Chave API da OpenAI não encontrada, não será possível usar o modelo OpenAI")

# Só tentamos configurar o Gemini se conseguimos configurar o OpenAI como fallback
if gemini_api_key and openai_llm:
    try:
        # Configurar para usar Gemini se a chave estiver disponível
        gemini_llm = LLM(
            provider="gemini",  # Especificar o provedor como Gemini
            model="gemini-pro",  # Usar o modelo Gemini Pro para tradução
            temperature=temperature_from_yaml,
            api_key=gemini_api_key
        )
        logger.info("LLM do Gemini configurado com sucesso")
    except Exception as e:
        logger.error(f"Erro ao configurar LLM do Gemini: {e}")
        logger.info("Usando OpenAI como alternativa")
else:
    if not gemini_api_key:
        logger.warning("Chave API do Gemini não encontrada, usando OpenAI diretamente")
    elif not openai_llm:
        logger.warning("OpenAI não configurado para fallback, não podemos usar Gemini sem fallback garantido")

# Usar OpenAI como padrão se Gemini não estiver disponível ou configurado
llm = openai_llm

class TranslatorAgent:
    """Agente tradutor responsável por traduzir artigos para português brasileiro"""
    
    @staticmethod
    def create(tools):
        """Cria o agente tradutor com as ferramentas necessárias"""
        # Filtrar ferramentas relevantes para este agente
        translator_tools = [tool for tool in tools if tool.name in ["read_from_file", "save_to_file"]]
        
        # Tentar com Gemini primeiro, com fallback para OpenAI em caso de falha
        def create_agent_with_fallback():
            # Se temos configurado o Gemini, vamos tentar primeiro com ele
            if gemini_llm:
                try:
                    logger.info("Tentando criar agente tradutor com Gemini...")
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
                        llm=gemini_llm
                    )
                except Exception as e:
                    logger.error(f"Falha ao usar Gemini para tradução: {e}")
                    logger.info("Tentando fallback para OpenAI...")
                    
                    # Tentar fallback para OpenAI
                    if openai_llm:
                        try:
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
                                llm=openai_llm
                            )
                        except Exception as e2:
                            logger.error(f"Também falhou ao usar OpenAI como fallback: {e2}")
                            raise Exception("Falha ao criar agente tradutor com Gemini e OpenAI")
                    else:
                        raise Exception("Gemini falhou e OpenAI não está configurado para fallback")
            # Se não temos Gemini, usar direto OpenAI
            elif openai_llm:
                logger.info("Gemini não configurado, usando OpenAI diretamente...")
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
                    llm=openai_llm
                )
            else:
                raise Exception("Nenhum provedor LLM (Gemini ou OpenAI) está configurado corretamente")
        
        # Criar o agente com a lógica de fallback implementada
        return create_agent_with_fallback()