"""
Cliente para interação com o Strapi CMS
Simplificado para uso com o CrewAI sem dependências do Streamlit
"""

import os
import json
import requests
import logging
from datetime import datetime
from pathlib import Path

# Configuração de logging
logger = logging.getLogger("strapi_client")

try:
    from ..config import strapi_CONFIG, get_strapi_api_url
except ImportError:
    # Fallback para valores padrão se não conseguir importar
    logger.warning("Não foi possível importar configurações do Strapi, usando valores padrão")
    strapi_CONFIG = {
        "project_id": os.environ.get("STRAPI_PROJECT_ID", ""),
        "dataset": "production",
        "api_version": "2023-05-03"
    }
    
    def get_strapi_api_url(project_id=None, dataset=None, api_version=None):
        """Constrói URL da API do Strapi"""
        _project_id = project_id or strapi_CONFIG["project_id"]
        _dataset = dataset or strapi_CONFIG["dataset"]
        _api_version = api_version or strapi_CONFIG["api_version"]
        
        return f"https://{_project_id}.api.strapi.io/v{_api_version}/data/mutate/{_dataset}"

class strapiClient:
    """Cliente para interação com o Strapi CMS"""
    
    def __init__(self):
        """Inicializa o cliente Strapi"""
        self.project_id = os.environ.get("STRAPI_PROJECT_ID", strapi_CONFIG.get("project_id"))
        self.dataset = strapi_CONFIG.get("dataset", "production")
        self.api_version = strapi_CONFIG.get("api_version", "2023-05-03")
        self.api_token = os.environ.get("strapi_API_TOKEN")
        
        # Validar configuração
        if not self.project_id:
            logger.warning("ID do projeto Strapi não configurado")
        if not self.api_token:
            logger.warning("Token de API do Strapi não configurado")
    
    def fetch_posts(self):
        """Busca todos os posts do Strapi CMS"""
        try:
            if not self.project_id:
                logger.error("ID do projeto Strapi não configurado")
                return []
            
            # Montar URL da API com GROQ query
            url = f"https://{self.project_id}.api.strapi.io/v{self.api_version}/data/query/{self.dataset}?query=*%5B_type%20%3D%3D%20%22post%22%5D%7B%0A%20%20_id%2C%0A%20%20title%2C%0A%20%20slug%2C%0A%20%20publishedAt%2C%0A%20%20excerpt%2C%0A%20%20%22estimatedReadingTime%22%3A%20round%28length%28pt%3A%3Atext%28content%29%29%20%2F%205%20%2F%20180%29%0A%7D%20%7C%20order%28publishedAt%20desc%29"
            
            # Adicionar token se disponível
            headers = {}
            if self.api_token:
                headers["Authorization"] = f"Bearer {self.api_token}"
            
            # Fazer a requisição
            logger.info("Buscando posts do Strapi CMS...")
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                posts = response.json().get("result", [])
                logger.info(f"Posts encontrados: {len(posts)}")
                return posts
            else:
                logger.error(f"Erro na requisição: {response.status_code}")
                return []
        
        except Exception as e:
            logger.error(f"Erro ao buscar posts: {str(e)}")
            return []
    
    def create_post(self, post_data):
        """Cria um novo post no Strapi CMS"""
        try:
            if not self.project_id or not self.api_token:
                logger.error("Credenciais do Strapi não configuradas")
                return {"success": False, "error": "Credenciais do Strapi não configuradas"}
            
            # URL da API do Strapi
            url = get_strapi_api_url(self.project_id, self.dataset, self.api_version)
            
            # Configuração de autenticação
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_token}"
            }
            
            # Preparar a mutação
            create_doc = {
                "_type": "post",
                "title": post_data.get("title"),
                "slug": {"_type": "slug", "current": post_data.get("slug")},
                "publishedAt": datetime.now().isoformat(),
                "excerpt": post_data.get("excerpt", ""),
                "content": post_data.get("content", []),
            }
            
            # Adicionar campos opcionais se presentes
            if "mainImage" in post_data and post_data["mainImage"]:
                create_doc["mainImage"] = post_data["mainImage"]
                
            if "categories" in post_data and post_data["categories"]:
                create_doc["categories"] = post_data["categories"]
                
            if "tags" in post_data and post_data["tags"]:
                create_doc["tags"] = post_data["tags"]
                
            if "author" in post_data and post_data["author"]:
                create_doc["author"] = post_data["author"]
                
            if "originalSource" in post_data and post_data["originalSource"]:
                create_doc["originalSource"] = post_data["originalSource"]
            else:
                # Adicionar informação de fonte original se disponível
                if "link" in post_data and post_data["link"]:
                    create_doc["originalSource"] = {
                        "url": post_data.get("link"),
                        "title": post_data.get("original_title", post_data.get("title")),
                        "site": post_data.get("source", "Desconhecido")
                    }
            
            mutations = {
                "mutations": [
                    {
                        "create": create_doc
                    }
                ]
            }
            
            logger.info(f"Enviando post '{post_data.get('title')}' para o Strapi")
            
            # Enviar a requisição
            response = requests.post(url, headers=headers, json=mutations)
            
            if response.status_code == 200:
                result = response.json()
                document_id = result.get("results", [{}])[0].get("id")
                logger.info(f"Post publicado com sucesso, ID: {document_id}")
                return {
                    "success": True, 
                    "document_id": document_id,
                    "message": "Artigo publicado com sucesso no Strapi CMS"
                }
            else:
                logger.error(f"Erro ao publicar: {response.status_code} - {response.text}")
                return {
                    "success": False, 
                    "error": f"Erro HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Erro ao publicar no Strapi: {str(e)}")
            return {"success": False, "error": str(e)}