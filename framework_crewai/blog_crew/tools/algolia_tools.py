import os
import json
from typing import Dict, List, Any, Optional
from crewai.tools import BaseTool, tool

class AlgoliaToolError(Exception):
    """Exceção personalizada para erros da ferramenta Algolia"""
    pass

@tool
def index_to_algolia(content: str) -> str:
    """
    Indexa conteúdo no Algolia.
    
    Args:
        content: String JSON contendo o conteúdo a ser indexado no Algolia.
               Deve incluir pelo menos os campos: 'objectID', 'title'
               além de quaisquer outros campos relevantes para pesquisa.
               
               Exemplo de JSON válido:
               {
                 "objectID": "post_123",
                 "title": "Como usar o Algolia com CrewAI",
                 "slug": "como-usar-algolia-com-crewai",
                 "excerpt": "Aprenda a indexar conteúdo..."
               }
    
    Returns:
        Uma mensagem confirmando o status da indexação.
    
    Raises:
        AlgoliaToolError: Se ocorrer um erro durante a indexação.
    """
    try:
        # Importação local para não exigir dependência global
        from algoliasearch.search_client import SearchClient
        
        # Verificar se as credenciais existem
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            raise AlgoliaToolError(
                "Credenciais do Algolia não configuradas. Configure ALGOLIA_APP_ID, "
                "ALGOLIA_API_KEY e ALGOLIA_INDEX_NAME como variáveis de ambiente."
            )
        
        # Carregar o conteúdo como JSON
        try:
            if isinstance(content, str):
                data = json.loads(content)
            else:
                data = content
        except json.JSONDecodeError:
            raise AlgoliaToolError("O conteúdo fornecido não é um JSON válido.")
        
        # Verificar campos obrigatórios
        if not all(field in data for field in ['objectID', 'title']):
            raise AlgoliaToolError(
                "O conteúdo deve conter pelo menos os campos 'objectID' e 'title'."
            )
        
        # Conectar ao Algolia e indexar
        client = SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        # Indexar o documento via batch para maior confiabilidade
        payload = {
            "requests": [
                {
                    "action": "updateObject",
                    "body": data
                }
            ]
        }
        
        # Usar batch API diretamente (mais confiável)
        result = index.batch(payload)
        
        return f"Conteúdo indexado com sucesso no Algolia. ObjectID: {data['objectID']}"
    
    except AlgoliaToolError as e:
        return f"Erro ao indexar no Algolia: {str(e)}"
    except ImportError:
        return "Erro: Biblioteca algoliasearch não está instalada. Instale com 'pip install algoliasearch'."
    except Exception as e:
        return f"Erro inesperado durante a indexação no Algolia: {str(e)}"

@tool
def search_algolia(query: str, filters: Optional[str] = None) -> str:
    """
    Pesquisa conteúdo no Algolia.
    
    Args:
        query: Termos de pesquisa.
        filters: Filtros opcionais no formato do Algolia.
    
    Returns:
        Resultados da pesquisa em formato JSON.
    """
    try:
        # Importação local para não exigir dependência global
        from algoliasearch.search_client import SearchClient
        
        # Verificar se as credenciais existem
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            raise AlgoliaToolError(
                "Credenciais do Algolia não configuradas. Configure ALGOLIA_APP_ID, "
                "ALGOLIA_API_KEY e ALGOLIA_INDEX_NAME como variáveis de ambiente."
            )
        
        # Conectar ao Algolia
        client = SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        # Configurar a pesquisa
        search_params = {}
        if filters:
            search_params['filters'] = filters
        
        # Realizar a pesquisa
        results = index.search(query, search_params)
        
        # Formatar os resultados
        return json.dumps(results, ensure_ascii=False, indent=2)
    
    except AlgoliaToolError as e:
        return f"Erro ao pesquisar no Algolia: {str(e)}"
    except ImportError:
        return "Erro: Biblioteca algoliasearch não está instalada. Instale com 'pip install algoliasearch'."
    except Exception as e:
        return f"Erro inesperado durante a pesquisa no Algolia: {str(e)}"

@tool
def delete_from_algolia(object_id: str) -> str:
    """
    Remove um objeto do índice Algolia.
    
    Args:
        object_id: ID do objeto a ser removido.
    
    Returns:
        Mensagem confirmando a remoção.
    """
    try:
        # Importação local para não exigir dependência global
        from algoliasearch.search_client import SearchClient
        
        # Verificar se as credenciais existem
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            raise AlgoliaToolError(
                "Credenciais do Algolia não configuradas. Configure ALGOLIA_APP_ID, "
                "ALGOLIA_API_KEY e ALGOLIA_INDEX_NAME como variáveis de ambiente."
            )
        
        # Conectar ao Algolia
        client = SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        # Remover o objeto
        result = index.delete_object(object_id)
        
        return f"Objeto com ID '{object_id}' removido com sucesso do índice Algolia."
    
    except AlgoliaToolError as e:
        return f"Erro ao remover objeto do Algolia: {str(e)}"
    except ImportError:
        return "Erro: Biblioteca algoliasearch não está instalada. Instale com 'pip install algoliasearch'."
    except Exception as e:
        return f"Erro inesperado ao remover objeto do Algolia: {str(e)}" 