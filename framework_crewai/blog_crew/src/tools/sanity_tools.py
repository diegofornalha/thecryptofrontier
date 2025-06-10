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

# Função para criar um slug a partir de um título
def criar_slug(titulo):
    """Cria um slug a partir de um título"""
    # Normalizar para remover acentos
    slug = titulo.lower()
    # Remover caracteres especiais
    slug = unicodedata.normalize('NFKD', slug)
    slug = ''.join([c for c in slug if not unicodedata.combining(c)])
    # Substituir espaços por traços
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    return slug.strip('-')

# Função para gerar uma chave aleatória para o Sanity
def gerar_chave():
    """Gera uma chave aleatória para o Sanity"""
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))

# Função para remover links HTML de um texto
def remover_links_html(texto):
    """Remove todos os links HTML (<a> tags) de um texto"""
    # Padrão para capturar tags <a> completas com seu conteúdo
    return re.sub(r'<a\s+[^>]*>(.*?)</a>', r'\1', texto)

# Função para remover todas as tags HTML de um texto
def remover_todas_tags_html(texto):
    """Remove todas as tags HTML de um texto"""
    # Primeiro remove links HTML (para preservar o texto dentro deles)
    texto = remover_links_html(texto)
    # Depois remove todas as outras tags HTML
    return re.sub(r'<[^>]*>', '', texto)

# Função para converter texto em formato Portable Text do Sanity
def texto_para_portable_text(texto):
    """Converte texto em formato Portable Text do Sanity"""
    # Remover todas as tags HTML do texto
    texto = remover_todas_tags_html(texto)
    
    # Dividir o texto em parágrafos
    paragrafos = [p.strip() for p in texto.split("\n\n") if p.strip()]
    
    # Criar blocos no formato do Sanity
    blocos = []
    for paragrafo in paragrafos:
        bloco = {
            "_type": "block",
            "_key": gerar_chave(),
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": gerar_chave(),
                    "text": paragrafo,
                    "marks": []
                }
            ]
        }
        blocos.append(bloco)
    
    return blocos

# Função para converter HTML em formato Portable Text do Sanity
def html_para_portable_text(html):
    """Converte HTML em formato Portable Text do Sanity"""
    # Primeiro remover todas as tags HTML
    html = remover_todas_tags_html(html)
    
    # Abordagem simplificada: remover tags HTML e converter para blocos de texto
    limpo = re.sub(r'<p>', '', html)
    limpo = re.sub(r'</p>', '\n\n', limpo)
    limpo = re.sub(r'<[^>]*>', '', limpo)
    
    # Dividir em parágrafos e filtrar vazios
    paragrafos = [p.strip() for p in re.split(r'\n\n+', limpo) if p.strip()]
    
    # Criar blocos no formato do Sanity
    return texto_para_portable_text('\n\n'.join(paragrafos))

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
def verificar_e_criar_categoria(categoria, projeto_id=None, dataset=None, api_version=None):
    """Verifica se categoria existe e cria se necessário"""
    # Normalizar categoria para criar slug
    categoria_slug = criar_slug(categoria)
    categoria_id = f"category-{categoria_slug}"
    
    # Configurações do Sanity
    project_id = projeto_id or SANITY_CONFIG["project_id"]
    dataset = dataset or SANITY_CONFIG["dataset"]
    api_version = api_version or SANITY_CONFIG["api_version"]
    api_token = os.environ.get("SANITY_API_TOKEN")
    
    if not project_id or not api_token:
        logger.error("Credenciais do Sanity não configuradas corretamente")
        return {"success": False, "error": "Credenciais do Sanity não configuradas"}
    
    # Configuração de autenticação
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_token}"
    }
    
    # Verificar se categoria existe
    query_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query=*[_type=='category'&&_id=='{categoria_id}'][0]"
    
    try:
        response = requests.get(query_url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("result"):
                logger.info(f"Categoria '{categoria}' já existe")
                return {"success": True, "id": categoria_id, "message": f"Categoria '{categoria}' já existe"}
        
        # Criar categoria
        logger.info(f"Criando categoria '{categoria}'...")
        mutation_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
        
        documento = {
            "_type": "category",
            "_id": categoria_id,
            "title": categoria,
            "slug": {
                "_type": "slug",
                "current": categoria_slug
            }
        }
        
        mutations = {
            "mutations": [
                {
                    "createIfNotExists": documento
                }
            ]
        }
        
        response = requests.post(mutation_url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            logger.info(f"Categoria '{categoria}' criada com sucesso")
            return {"success": True, "id": categoria_id, "message": f"Categoria '{categoria}' criada com sucesso"}
        else:
            logger.error(f"Erro ao criar categoria: {response.status_code}")
            logger.error(response.text)
            return {"success": False, "error": f"Erro ao criar categoria: {response.status_code} - {response.text}"}
    
    except Exception as e:
        logger.error(f"Erro ao verificar/criar categoria: {str(e)}")
        return {"success": False, "error": str(e), "id": categoria_id}

@tool
def verificar_e_criar_tag(tag, projeto_id=None, dataset=None, api_version=None):
    """Verifica se tag existe e cria se necessário"""
    # Normalizar tag para criar slug
    tag_slug = criar_slug(tag)
    tag_id = f"tag-{tag_slug}"
    
    # Configurações do Sanity
    project_id = projeto_id or SANITY_CONFIG["project_id"]
    dataset = dataset or SANITY_CONFIG["dataset"]
    api_version = api_version or SANITY_CONFIG["api_version"]
    api_token = os.environ.get("SANITY_API_TOKEN")
    
    if not project_id or not api_token:
        logger.error("Credenciais do Sanity não configuradas corretamente")
        return {"success": False, "error": "Credenciais do Sanity não configuradas"}
    
    # Configuração de autenticação
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_token}"
    }
    
    # Verificar se tag existe
    query_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query=*[_type=='tag'&&_id=='{tag_id}'][0]"
    
    try:
        response = requests.get(query_url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("result"):
                logger.info(f"Tag '{tag}' já existe")
                return {"success": True, "id": tag_id, "message": f"Tag '{tag}' já existe"}
        
        # Criar tag
        logger.info(f"Criando tag '{tag}'...")
        mutation_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
        
        documento = {
            "_type": "tag",
            "_id": tag_id,
            "name": tag,
            "slug": {
                "_type": "slug",
                "current": tag_slug
            }
        }
        
        mutations = {
            "mutations": [
                {
                    "createIfNotExists": documento
                }
            ]
        }
        
        response = requests.post(mutation_url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            logger.info(f"Tag '{tag}' criada com sucesso")
            return {"success": True, "id": tag_id, "message": f"Tag '{tag}' criada com sucesso"}
        else:
            logger.error(f"Erro ao criar tag: {response.status_code}")
            logger.error(response.text)
            return {"success": False, "error": f"Erro ao criar tag: {response.status_code} - {response.text}"}
    
    except Exception as e:
        logger.error(f"Erro ao verificar/criar tag: {str(e)}")
        return {"success": False, "error": str(e), "id": tag_id}

@tool
def publish_manual(file_path=None):
    """Publica manualmente um post a partir de um arquivo JSON"""
    if not file_path:
        return {"success": False, "error": "Caminho do arquivo não fornecido"}
    
    # Verificar se o arquivo existe
    if not os.path.exists(file_path):
        return {"success": False, "error": f"Arquivo não encontrado: {file_path}"}
    
    # Ler o arquivo JSON
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            post_data = json.load(f)
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Erro ao decodificar o JSON: {str(e)}"}
    
    # Publicar o post usando a ferramenta publish_to_sanity
    logger.info(f"Publicando o post do arquivo: {file_path}")
    return publish_to_sanity(post_data=post_data, file_path=file_path)

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
        
        # Validar e garantir chaves _key antes de enviar ao Sanity
        try:
            from .sanity_key_validator import validate_post_data
            logger.info("Validando chaves _key obrigatórias...")
            post_data = validate_post_data(post_data)
            logger.info("Chaves _key validadas com sucesso")
        except ImportError:
            logger.warning("Validador de chaves não encontrado, continuando sem validação")
        
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
        
        # Limitar o resumo a 299 caracteres e remover todas as tags HTML
        resumo = post_data.get("excerpt", "")
        
        # Remover todas as tags HTML (incluindo <strong>, <em>, etc.)
        resumo = remover_todas_tags_html(resumo)
        
        # Limitar tamanho a 299 caracteres
        if len(resumo) > 299:
            resumo = resumo[:296] + '...'
            
        # Preparar a mutação
        create_doc = {
            "_type": "post",
            "title": post_data.get("title"),
            "slug": {"_type": "slug", "current": post_data.get("slug")},
            "publishedAt": datetime.now().isoformat(),
            "excerpt": resumo,
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