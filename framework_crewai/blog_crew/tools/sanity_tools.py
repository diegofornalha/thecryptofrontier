"""
Ferramentas para integração com o Sanity CMS
"""

import os
import logging
from datetime import datetime
from langchain_core.tools import tool
import sys
import importlib.util
from pathlib import Path
import json
import requests

logger = logging.getLogger("sanity_tools")

# Adicionar diretório de schemas ao path
schemas_dir = Path(__file__).parent.parent / "schemas"
if schemas_dir.exists() and str(schemas_dir) not in sys.path:
    sys.path.append(str(schemas_dir))

# Importar configurações do Sanity
try:
    from ..config import SANITY_CONFIG, get_sanity_api_url
except ImportError:
    # Fallback para valores padrão se não conseguir importar
    logger.warning("Não foi possível importar configurações do Sanity, usando valores padrão")
    SANITY_CONFIG = {
        "project_id": os.environ.get("SANITY_PROJECT_ID", ""),
        "dataset": "production",
        "api_version": "2023-05-03"
    }
    
    def get_sanity_api_url(project_id=None, dataset=None, api_version=None):
        _project_id = project_id or SANITY_CONFIG["project_id"]
        _dataset = dataset or SANITY_CONFIG["dataset"]
        _api_version = api_version or SANITY_CONFIG["api_version"]
        
        return f"https://{_project_id}.api.sanity.io/v{_api_version}/data/mutate/{_dataset}"

def load_schema(schema_name):
    """Carrega um schema do Sanity dinamicamente"""
    try:
        # Primeiro tenta importar como módulo
        try:
            module = importlib.import_module(schema_name + "_schema")
            return module.schema
        except (ImportError, AttributeError):
            # Se falhar, tenta carregar diretamente do arquivo
            schema_path = schemas_dir / f"{schema_name}_schema.py"
            if not schema_path.exists():
                logger.warning(f"Schema não encontrado: {schema_name}")
                return None
            
            spec = importlib.util.spec_from_file_location(
                f"{schema_name}_schema", 
                schema_path
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module.schema
    except Exception as e:
        logger.error(f"Erro ao carregar schema {schema_name}: {str(e)}")
        return None

@tool
def publish_to_sanity(post_data):
    """Publica um post no Sanity CMS."""
    try:
        # Configurações do Sanity
        project_id = os.environ.get("SANITY_PROJECT_ID", SANITY_CONFIG.get("project_id"))
        dataset = SANITY_CONFIG.get("dataset", "production")
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not project_id or not api_token:
            return {"success": False, "error": "Credenciais do Sanity não configuradas"}
        
        # URL da API do Sanity
        url = get_sanity_api_url(project_id, dataset)
        
        # Configuração de autenticação
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_token}"
        }
        
        # Carregar o schema de post para validação
        post_schema = load_schema("post")
        if not post_schema:
            logger.warning("Schema de post não encontrado. Continuando sem validação.")
        
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
        
        logger.info(f"Enviando post '{post_data.get('title')}' para o Sanity")
        
        # Enviar a requisição
        response = requests.post(url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            result = response.json()
            document_id = result.get("results", [{}])[0].get("id")
            logger.info(f"Post publicado com sucesso, ID: {document_id}")
            return {
                "success": True, 
                "document_id": document_id,
                "message": "Artigo publicado com sucesso no Sanity CMS"
            }
        else:
            logger.error(f"Erro ao publicar: {response.status_code} - {response.text}")
            return {
                "success": False, 
                "error": f"Erro HTTP {response.status_code}: {response.text}"
            }
            
    except Exception as e:
        logger.error(f"Erro ao publicar no Sanity: {str(e)}")
        return {"success": False, "error": str(e)}