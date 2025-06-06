import os
import json
from crewai import Agent
from crewai.llm import LLM

# Carregar configuração centralizada
from config import config as app_config

# Importar modelos Pydantic para estruturação dos dados
try:
    from models import Post, dict_to_post, post_to_sanity_format
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False
    print("AVISO: Modelos Pydantic não encontrados!")



# Criar o LLM usando a classe nativa do CrewAI com base na configuração
llm_settings = app_config.get('llm', {})
model_name_from_yaml = llm_settings.get('model', 'gpt-4.1-nano') 
temperature_from_yaml = llm_settings.get('temperature', 0.7)

# Configura o LLM
llm = LLM(
    model=model_name_from_yaml,
    temperature=temperature_from_yaml
)

class PublisherAgent:
    """Agente publicador responsável por enviar o conteúdo para o Sanity CMS"""
    
    @staticmethod
    def create(tools):
        """Cria o agente publicador com as ferramentas necessárias"""
        # Filtrar ferramentas relevantes para este agente
        publisher_tools = [tool for tool in tools if tool.name in [
            "read_from_file", 
            "save_to_file",
            "publish_to_sanity",
            "publish_to_sanity_enhanced"
        ]]
        
        return Agent(
            role="Publicador de Conteúdo",
            goal="Publicar os artigos formatados no Sanity CMS",
            backstory="""Você é um especialista em publicação de conteúdo em CMS. 
            Seu trabalho é enviar os artigos formatados para o Sanity CMS,
            garantindo que todos os campos obrigatórios estejam presentes e 
            que o conteúdo seja publicado corretamente.
            
            IMPORTANTE: Use preferencialmente 'publish_to_sanity_enhanced' que:
            - Detecta automaticamente categorias e tags baseadas no conteúdo
            - Cria categorias e tags automaticamente se não existirem
            - Adiciona autor padrão "Crypto Frontier"
            - Garante publicação completa com todos os metadados
            
            Você verifica cada artigo antes de publicá-lo, certificando-se de que
            ele está no formato esperado pelo Sanity CMS. Você sabe como lidar com
            erros de API e resolver problemas de publicação.
            
            O formato esperado para publicação é:
            {
                "_type": "post",
                "title": "Título do artigo",
                "slug": {"_type": "slug", "current": "slug-do-artigo"},
                "publishedAt": "Data ISO formatada",
                "content": [...blocos de conteúdo...],
                "mainImage": {...referência da imagem se disponível...}
            }
            
            A ferramenta 'publish_to_sanity_enhanced' adiciona automaticamente:
            - Categorias relevantes (Bitcoin, Ethereum, DeFi, etc)
            - Tags baseadas em criptomoedas mencionadas
            - Autor padrão do blog""",
            verbose=True,
            tools=publisher_tools,
            llm=llm
        )
    
    @staticmethod
    def validate_post(post_data):
        """
        Valida os dados do post usando o modelo Pydantic
        
        Args:
            post_data: Dicionário com os dados do post
            
        Returns:
            Objeto Post validado ou None se houver erro
        """
        if not PYDANTIC_AVAILABLE:
            return post_data
            
        try:
            # Converter para modelo Pydantic
            post_model = dict_to_post(post_data)
            
            # Converter de volta para o formato que o Sanity espera
            validated_post = post_to_sanity_format(post_model)
            
            return validated_post
        except Exception as e:
            print(f"Erro ao validar post: {str(e)}")
            return None