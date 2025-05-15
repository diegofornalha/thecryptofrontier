"""
Ferramentas para integração com o Sanity CMS
"""

import os
import logging
from datetime import datetime
from crewai.tools import tool
import sys
import importlib.util
from pathlib import Path
import json
import requests
import random
import string
import re
import unicodedata
import asyncio
import shutil

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
def publish_to_sanity(post_data=None, file_path=None, **kwargs):
    """Publica um post no Sanity CMS. Recebe um dicionário com dados do post (title, slug, content, etc.) 
    e opcionalmente o caminho do arquivo original para movê-lo após a publicação."""
    try:
        # Configurar log mais detalhado para debug
        logger.setLevel(logging.DEBUG)
        logging.getLogger().setLevel(logging.DEBUG)
        
        logger.debug(f"publish_to_sanity: Iniciando publicação")
        logger.info(f"publish_to_sanity: Recebido post_data={type(post_data)}, file_path={file_path}, kwargs={list(kwargs.keys()) if kwargs else 'nenhum'}")
        
        # Se o caminho do arquivo não foi fornecido, procurar em kwargs
        if file_path is None and 'file_path' in kwargs:
            file_path = kwargs['file_path']
            logger.debug(f"publish_to_sanity: Encontrado file_path em kwargs: {file_path}")
            
        # Processamento avançado para lidar com a forma como o LLM envia os dados
        # 1. Se o argumento for uma string, tentar extrair um JSON dela
        parsed_from_string = False
        if isinstance(post_data, str):
            try:
                # Verifica se parece um JSON
                if (post_data.strip().startswith('{') and post_data.strip().endswith('}')) or \
                   (post_data.strip().startswith('[') and post_data.strip().endswith(']')):
                    parsed_json = json.loads(post_data)
                    logger.info(f"String convertida para JSON: {type(parsed_json)}")
                    
                    # a) Se o resultado for um dicionário, pode ser o próprio post_data ou conter o post_data
                    if isinstance(parsed_json, dict):
                        # Procurar o post_data em campos comuns que o Gemini pode usar
                        for field in ["post_data", "post", "data", "article", "content"]:
                            if field in parsed_json and isinstance(parsed_json[field], dict):
                                post_data = parsed_json[field]
                                parsed_from_string = True
                                logger.info(f"Dados extraídos do campo '{field}' no JSON")
                                break
                        
                        # Se não encontrou em campos específicos mas o JSON parece um post válido
                        if not parsed_from_string and "title" in parsed_json:
                            post_data = parsed_json
                            parsed_from_string = True
                            logger.info("JSON usado diretamente como post_data")
                            
                        # Se o LLM envolver em {"posts": [...]}, extrair o primeiro post
                        elif not parsed_from_string and "posts" in parsed_json and isinstance(parsed_json["posts"], list) and len(parsed_json["posts"]) > 0:
                            post_data = parsed_json["posts"][0]
                            parsed_from_string = True
                            logger.info("Primeiro item extraído da lista 'posts'")
                    
                    # b) Se o resultado for uma lista, pegar o primeiro item se for um dict
                    elif isinstance(parsed_json, list) and len(parsed_json) > 0 and isinstance(parsed_json[0], dict):
                        post_data = parsed_json[0]
                        parsed_from_string = True
                        logger.info("Primeiro item da lista JSON usado como post_data")
            except json.JSONDecodeError:
                logger.warning(f"Não foi possível parser como JSON: {post_data[:50]}...")
        
        # 2. Se ainda não extraímos dados e post_data for None, tentar extrair de kwargs
        if not parsed_from_string and post_data is None:
            # Procurar em campos comuns nos kwargs
            for field in ["post_data", "post", "data", "article", "content"]:
                if field in kwargs and isinstance(kwargs[field], dict):
                    post_data = kwargs[field]
                    logger.info(f"Dados extraídos do kwarg '{field}'")
                    break
                    
            # Se não encontrou em campos específicos, procurar em listas
            if post_data is None and "posts" in kwargs and isinstance(kwargs["posts"], list) and len(kwargs["posts"]) > 0:
                post_data = kwargs["posts"][0]
                logger.info("Dados extraídos do primeiro item da lista 'posts' em kwargs")
            
            # Se ainda não encontrou mas os kwargs parecem um post, usar todos os kwargs como post_data
            elif post_data is None and kwargs and any(k in kwargs for k in ["title", "slug", "content"]):
                post_data = kwargs
                logger.info("Todos os kwargs usados como post_data")
        
        # 3. Se ainda não temos dados, retornar erro
        if post_data is None:
            logger.error("Nenhum dado de post válido fornecido")
            return {"success": False, "error": "O argumento post_data é obrigatório e não foi encontrado"}
        
        # 4. Garantir que post_data seja um dicionário
        if not isinstance(post_data, dict):
            logger.error(f"post_data deve ser um dicionário, recebido: {type(post_data)}")
            return {"success": False, "error": "O argumento post_data deve ser um dicionário válido"}
        
        # Tentar importar dinâmicamente os modelos Pydantic
        try:
            # Tentar importar os modelos e conversores
            from models import Post, dict_to_post, post_to_sanity_format
            
            # Se importou com sucesso, usar a validação do Pydantic
            try:
                logger.info("Validando dados usando modelo Pydantic Post")
                post_model = dict_to_post(post_data)
                sanity_post = post_to_sanity_format(post_model)
                
                # Atualizar post_data com o formato validado
                post_data = sanity_post
                logger.info("Dados validados e convertidos usando Pydantic")
            except Exception as pydantic_error:
                logger.warning(f"Erro na validação Pydantic: {str(pydantic_error)}")
                # Continuar com a abordagem tradicional
        except ImportError:
            logger.warning("Modelos Pydantic não encontrados, usando abordagem tradicional")
            
        # Configurações do Sanity
        project_id = os.environ.get("SANITY_PROJECT_ID", SANITY_CONFIG.get("project_id"))
        dataset = SANITY_CONFIG.get("dataset", "production")
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        logger.debug(f"publish_to_sanity: Sanity project_id={project_id}, dataset={dataset}")
        logger.debug(f"publish_to_sanity: API token disponível: {bool(api_token)}")
        
        if not project_id or not api_token:
            logger.error("Credenciais do Sanity não configuradas corretamente")
            return {"success": False, "error": "Credenciais do Sanity não configuradas"}
        
        # URL da API do Sanity
        url = get_sanity_api_url(project_id, dataset)
        logger.debug(f"publish_to_sanity: URL da API do Sanity: {url}")
        
        # Configuração de autenticação
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_token}"
        }
        logger.debug(f"publish_to_sanity: Headers configurados com token de autorização")
        
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
        }
        
        # Se post_data já contém "_type" (formatado pelo Pydantic), usar diretamente
        if "_type" in post_data and post_data["_type"] == "post":
            create_doc = post_data
        else:
            # Processar conteúdo - pode estar em diferentes formatos
            content = post_data.get("content")
            # Se content for um dicionário com campo "blocks", extrair os blocos
            if isinstance(content, dict) and "blocks" in content:
                create_doc["content"] = content["blocks"]
            # Se content for um dicionário com campo "success" (resultado de format_content_for_sanity)
            elif isinstance(content, dict) and "success" in content and "blocks" in content:
                create_doc["content"] = content["blocks"]
            else:
                create_doc["content"] = content or []
            
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
                    
            # Procurar slug como objeto retornado pelo tool create_slug
            if "slug" in post_data and isinstance(post_data["slug"], dict) and "slug" in post_data["slug"]:
                create_doc["slug"] = {"_type": "slug", "current": post_data["slug"]["slug"]}
            elif "slug" in post_data and isinstance(post_data["slug"], dict) and "success" in post_data["slug"]:
                create_doc["slug"] = {"_type": "slug", "current": post_data["slug"].get("slug", "")}
            elif "slug" in post_data and isinstance(post_data["slug"], dict) and "current" in post_data["slug"]:
                # Já está no formato correto
                create_doc["slug"] = post_data["slug"]
            elif "slug" in post_data and isinstance(post_data["slug"], str):
                # Converter string para objeto slug
                create_doc["slug"] = {"_type": "slug", "current": post_data["slug"]}
                
            # Verificar format, caso alguém passe o objeto de resposta no campo "formatado"
            if "formatado" in post_data and isinstance(post_data["formatado"], dict) and "blocks" in post_data["formatado"]:
                create_doc["content"] = post_data["formatado"]["blocks"]
        
        mutations = {
            "mutations": [
                {
                    "create": create_doc
                }
            ]
        }
        
        logger.info(f"Enviando post '{post_data.get('title')}' para o Sanity")
        logger.debug(f"publish_to_sanity: Dados da mutação: {json.dumps(mutations, indent=2)}")
        
        try:
            # Enviar a requisição
            logger.debug(f"publish_to_sanity: Fazendo requisição POST para: {url}")
            response = requests.post(url, headers=headers, json=mutations, timeout=30)
            
            logger.debug(f"publish_to_sanity: Resposta recebida - Status: {response.status_code}")
            logger.debug(f"publish_to_sanity: Resposta: {response.text[:500]}")  # Limitado para evitar logs muito grandes
            
            if response.status_code == 200:
                result = response.json()
                logger.debug(f"publish_to_sanity: Resposta JSON completa: {json.dumps(result, indent=2)}")
                
                # Verificar se temos resultados na resposta
                if not result.get("results") or len(result.get("results", [])) == 0:
                    logger.error("Resposta sem resultados, possível falha ao criar documento")
                    return {
                        "success": False,
                        "error": "Resposta do Sanity sem resultados, possível falha na criação do documento"
                    }
                
                document_id = result.get("results", [{}])[0].get("id")
                if not document_id:
                    logger.error("ID do documento não encontrado na resposta")
                    return {
                        "success": False,
                        "error": "ID do documento não encontrado na resposta do Sanity"
                    }
                
                logger.info(f"Post publicado com sucesso no Sanity, ID: {document_id}")
                
                # Se temos um caminho de arquivo e ele existe, vamos movê-lo para a pasta de publicados
                if file_path and os.path.exists(file_path):
                    try:
                        # Obter diretório base e nome do arquivo
                        dir_path = os.path.dirname(file_path)
                        file_name = os.path.basename(file_path)
                        # É um arquivo formatado, então o nome deve começar com "formatado_"
                        if file_name.startswith("formatado_"):
                            # Substituir "formatado_" por "publicado_"
                            new_file_name = file_name.replace("formatado_", "publicado_")
                            # Obter o caminho para a pasta de publicados
                            published_dir = os.path.join(os.path.dirname(dir_path), "posts_publicados")
                            # Garantir que a pasta de publicados existe
                            os.makedirs(published_dir, exist_ok=True)
                            # Caminho completo do novo arquivo
                            new_file_path = os.path.join(published_dir, new_file_name)
                            
                            # Copiar o arquivo para a pasta de publicados
                            import shutil
                            shutil.copy2(file_path, new_file_path)
                            logger.info(f"Arquivo movido para: {new_file_path}")
                            
                            return {
                                "success": True, 
                                "document_id": document_id,
                                "message": "Artigo publicado com sucesso no Sanity CMS",
                                "published_file": new_file_path
                            }
                    except Exception as move_error:
                        logger.error(f"Erro ao mover arquivo: {str(move_error)}")
                        # Continuamos mesmo se falhar ao mover o arquivo
                
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
        except requests.RequestException as req_error:
            logger.error(f"Erro na requisição para o Sanity: {str(req_error)}")
            return {
                "success": False,
                "error": f"Erro na requisição: {str(req_error)}"
            }
            
    except Exception as e:
        logger.error(f"Erro ao publicar no Sanity: {str(e)}")
        return {"success": False, "error": str(e)}