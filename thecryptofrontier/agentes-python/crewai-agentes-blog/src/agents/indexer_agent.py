import os
import json
from crewai import Agent
from crewai.llm import LLM

# Carregar configuração centralizada
from config import config as app_config

# Importar modelos Pydantic para estruturação dos dados
try:
    from models import Post, dict_to_post, post_to_strapi_format
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

class IndexerAgent:
    """Agente indexador responsável por enviar o conteúdo para o Algolia"""
    
    @staticmethod
    def create(tools):
        """Cria o agente indexador com as ferramentas necessárias"""
        # Filtrar ferramentas relevantes para este agente
        indexer_tools = [tool for tool in tools if tool.name in [
            "read_from_file", 
            "save_to_file",
            "index_to_algolia",
            "search_algolia",
            "delete_from_algolia"
        ]]
        
        return Agent(
            role="Indexador de Conteúdo para Algolia",
            goal="Indexar os artigos publicados no Algolia para facilitar a busca",
            backstory="""Você é um especialista em indexação de conteúdo para mecanismos de busca. 
            Seu trabalho é pegar os artigos publicados e indexá-los no Algolia,
            garantindo que todos os campos necessários estejam presentes e 
            que o conteúdo seja indexado corretamente.
            
            Você verifica cada artigo antes de indexá-lo, certificando-se de que
            ele possui um ID único (objectID) e outros campos obrigatórios.
            Você sabe como lidar com erros de API e resolver problemas de indexação.
            
            Você mantém um registro detalhado de todas as indexações realizadas e
            dos erros encontrados, para que seja possível acompanhar o status de
            cada artigo.
            
            Os artigos devem ser convertidos para o formato esperado pelo Algolia:
            {
                "objectID": "ID único do artigo (geralmente o slug)",
                "title": "Título do artigo",
                "content": "Conteúdo textual do artigo",
                "date": "Data de publicação",
                "tags": ["tag1", "tag2"]
            }
            
            Você sabe extrair as informações relevantes do formato Strapi para o formato Algolia.""",
            verbose=True,
            tools=indexer_tools,
            llm=llm
        )
    
    @staticmethod
    def strapi_to_algolia_format(strapi_post):
        """
        Converte um post no formato Strapi para o formato Algolia
        
        Args:
            strapi_post: Dicionário com os dados do post no formato Strapi
            
        Returns:
            Dicionário com os dados no formato para indexação no Algolia
        """
        try:
            # Verifica se o post tem os campos necessários
            if not all(key in strapi_post for key in ['_id', 'title']):
                raise ValueError("Post Strapi não contém campos obrigatórios (_id, title)")
            
            # Extrai o conteúdo textual dos blocos (simplificado)
            content = ""
            if 'content' in strapi_post and isinstance(strapi_post['content'], list):
                for block in strapi_post['content']:
                    if 'children' in block and isinstance(block['children'], list):
                        for child in block['children']:
                            if 'text' in child:
                                content += child['text'] + " "

            # Extrai as tags, se existirem
            tags = []
            if 'categories' in strapi_post and isinstance(strapi_post['categories'], list):
                for category in strapi_post['categories']:
                    if 'title' in category:
                        tags.append(category['title'])
            
            # Determinar o objectID a ser usado
            # Usar o _suggested_object_id se disponível, caso contrário usar o slug ou _id
            if '_suggested_object_id' in strapi_post:
                object_id = strapi_post['_suggested_object_id']
            elif 'slug' in strapi_post and isinstance(strapi_post['slug'], dict) and 'current' in strapi_post['slug']:
                object_id = strapi_post['slug']['current']
            else:
                object_id = strapi_post['_id']
            
            # Cria o objeto Algolia
            algolia_post = {
                "objectID": object_id,
                "title": strapi_post['title'],
                "content": content.strip(),
                "date": strapi_post.get('publishedAt', ''),
                "tags": tags,
                "strapiId": strapi_post['_id']
            }
            
            return algolia_post
            
        except Exception as e:
            print(f"Erro ao converter post para formato Algolia: {str(e)}")
            return None 