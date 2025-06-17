"""
Ferramentas aprimoradas para integração com o Strapi CMS
Inclui suporte completo para tags, categorias e autor
"""

import os
import logging
import json
import requests
from datetime import datetime
from crewai.tools import tool
from pathlib import Path
import uuid

logger = logging.getLogger("strapi_tools_enhanced")

# Importar configurações do Strapi
try:
    from ..config import strapi_CONFIG, get_strapi_api_url
except ImportError:
    # Fallback para valores padrão se não conseguir importar
    strapi_CONFIG = {
        "project_id": os.environ.get("STRAPI_PROJECT_ID", ""),
        "dataset": "production",
        "api_version": "2023-05-03"
    }
    
    def get_strapi_api_url(project_id=None, dataset=None, api_version=None):
        _project_id = project_id or strapi_CONFIG["project_id"]
        _dataset = dataset or strapi_CONFIG["dataset"]
        _api_version = api_version or strapi_CONFIG["api_version"]
        
        return f"https://{_project_id}.api.strapi.io/v{_api_version}/data/mutate/{_dataset}"

def criar_slug(titulo):
    """Cria um slug a partir de um título"""
    import unicodedata
    import re
    
    slug = titulo.lower()
    slug = unicodedata.normalize('NFKD', slug)
    slug = ''.join([c for c in slug if not unicodedata.combining(c)])
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    return slug.strip('-')

def ensure_author_exists():
    """Garante que o autor padrão existe no Strapi"""
    try:
        project_id = strapi_CONFIG["project_id"]
        dataset = strapi_CONFIG["dataset"]
        api_version = strapi_CONFIG["api_version"]
        api_token = os.environ.get("strapi_API_TOKEN")
        
        if not all([project_id, api_token]):
            return None
            
        # ID do autor padrão
        author_id = "author-crypto-frontier"
        
        # Verificar se autor existe
        query_url = f"https://{project_id}.api.strapi.io/v{api_version}/data/query/{dataset}"
        headers = {"Authorization": f"Bearer {api_token}"}
        params = {"query": f'*[_type == "author" && _id == "{author_id}"][0]'}
        
        response = requests.get(query_url, headers=headers, params=params)
        
        if response.status_code == 200:
            result = response.json().get("result")
            if result:
                logger.info("Autor padrão já existe")
                return author_id
        
        # Criar autor padrão
        logger.info("Criando autor padrão...")
        mutation_url = get_strapi_api_url(project_id, dataset)
        
        author_doc = {
            "_type": "author",
            "_id": author_id,
            "name": "Crypto Frontier",
            "slug": {
                "_type": "slug",
                "current": "crypto-frontier"
            },
            "bio": "Notícias e análises sobre criptomoedas e blockchain",
            "image": None  # Pode ser adicionada uma imagem depois
        }
        
        mutations = {
            "mutations": [{
                "createIfNotExists": author_doc
            }]
        }
        
        response = requests.post(mutation_url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            logger.info("Autor padrão criado com sucesso")
            return author_id
        else:
            logger.error(f"Erro ao criar autor: {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Erro ao garantir autor: {str(e)}")
        return None

def ensure_categories_exist(categories):
    """Garante que as categorias existem no Strapi"""
    project_id = strapi_CONFIG["project_id"]
    dataset = strapi_CONFIG["dataset"]
    api_version = strapi_CONFIG["api_version"]
    api_token = os.environ.get("strapi_API_TOKEN")
    
    if not all([project_id, api_token]):
        return []
        
    headers = {"Authorization": f"Bearer {api_token}"}
    mutation_url = get_strapi_api_url(project_id, dataset)
    
    category_refs = []
    
    for category in categories:
        try:
            category_slug = criar_slug(category)
            category_id = f"category-{category_slug}"
            
            # Verificar se existe
            query_url = f"https://{project_id}.api.strapi.io/v{api_version}/data/query/{dataset}"
            params = {"query": f'*[_type == "category" && _id == "{category_id}"][0]'}
            
            response = requests.get(query_url, headers=headers, params=params)
            
            if response.status_code == 200:
                result = response.json().get("result")
                if result:
                    category_refs.append({
                        "_type": "reference",
                        "_ref": category_id,
                        "_key": str(uuid.uuid4())[:8]
                    })
                    continue
            
            # Criar categoria
            category_doc = {
                "_type": "category",
                "_id": category_id,
                "title": category,
                "slug": {
                    "_type": "slug",
                    "current": category_slug
                }
            }
            
            mutations = {
                "mutations": [{
                    "createIfNotExists": category_doc
                }]
            }
            
            response = requests.post(mutation_url, headers=headers, json=mutations)
            
            if response.status_code == 200:
                logger.info(f"Categoria '{category}' criada")
                category_refs.append({
                    "_type": "reference",
                    "_ref": category_id,
                    "_key": str(uuid.uuid4())[:8]
                })
            else:
                logger.error(f"Erro ao criar categoria '{category}': {response.text}")
                
        except Exception as e:
            logger.error(f"Erro ao processar categoria '{category}': {str(e)}")
    
    return category_refs

def ensure_tags_exist(tags):
    """Garante que as tags existem no Strapi"""
    project_id = strapi_CONFIG["project_id"]
    dataset = strapi_CONFIG["dataset"]
    api_version = strapi_CONFIG["api_version"]
    api_token = os.environ.get("strapi_API_TOKEN")
    
    if not all([project_id, api_token]):
        return []
        
    headers = {"Authorization": f"Bearer {api_token}"}
    mutation_url = get_strapi_api_url(project_id, dataset)
    
    tag_refs = []
    
    for tag in tags:
        try:
            tag_slug = criar_slug(tag)
            tag_id = f"tag-{tag_slug}"
            
            # Verificar se existe
            query_url = f"https://{project_id}.api.strapi.io/v{api_version}/data/query/{dataset}"
            params = {"query": f'*[_type == "tag" && _id == "{tag_id}"][0]'}
            
            response = requests.get(query_url, headers=headers, params=params)
            
            if response.status_code == 200:
                result = response.json().get("result")
                if result:
                    tag_refs.append({
                        "_type": "reference",
                        "_ref": tag_id,
                        "_key": str(uuid.uuid4())[:8]
                    })
                    continue
            
            # Criar tag
            tag_doc = {
                "_type": "tag",
                "_id": tag_id,
                "name": tag,
                "slug": {
                    "_type": "slug",
                    "current": tag_slug
                }
            }
            
            mutations = {
                "mutations": [{
                    "createIfNotExists": tag_doc
                }]
            }
            
            response = requests.post(mutation_url, headers=headers, json=mutations)
            
            if response.status_code == 200:
                logger.info(f"Tag '{tag}' criada")
                tag_refs.append({
                    "_type": "reference",
                    "_ref": tag_id,
                    "_key": str(uuid.uuid4())[:8]
                })
            else:
                logger.error(f"Erro ao criar tag '{tag}': {response.text}")
                
        except Exception as e:
            logger.error(f"Erro ao processar tag '{tag}': {str(e)}")
    
    return tag_refs

def detect_crypto_categories(title, content):
    """Detecta categorias baseadas no conteúdo"""
    text = f"{title} {content}".lower()
    
    categories = []
    
    # Mapeamento de palavras-chave para categorias
    category_mappings = {
        "Bitcoin": ["bitcoin", "btc", "satoshi"],
        "Ethereum": ["ethereum", "eth", "vitalik"],
        "DeFi": ["defi", "decentralized finance", "yield", "liquidity"],
        "NFT": ["nft", "non-fungible", "opensea", "digital art"],
        "Análise de Mercado": ["price", "market", "trading", "análise", "preço"],
        "Regulação": ["regulation", "sec", "government", "regulação", "governo"],
        "Tecnologia": ["blockchain", "smart contract", "technology", "tecnologia"],
        "Altcoins": ["altcoin", "xrp", "ada", "dot", "bnb", "sol"]
    }
    
    for category, keywords in category_mappings.items():
        for keyword in keywords:
            if keyword in text:
                if category not in categories:
                    categories.append(category)
                break
    
    # Se nenhuma categoria específica, usar "Criptomoedas"
    if not categories:
        categories.append("Criptomoedas")
    
    return categories[:3]  # Máximo 3 categorias

def extract_crypto_tags(title, content):
    """Extrai tags relevantes do conteúdo"""
    text = f"{title} {content}".lower()
    
    tags = []
    
    # Lista de criptomoedas populares
    crypto_tags = [
        "bitcoin", "ethereum", "xrp", "bnb", "solana", "cardano",
        "dogecoin", "shiba", "polygon", "avalanche", "chainlink",
        "tron", "usdt", "usdc", "dai", "maker", "aave", "uniswap"
    ]
    
    # Verificar menções de criptomoedas
    for crypto in crypto_tags:
        if crypto in text and crypto not in tags:
            tags.append(crypto)
    
    # Adicionar tags temáticas
    theme_tags = {
        "trading": ["trade", "trading", "exchange"],
        "defi": ["defi", "yield", "staking"],
        "nft": ["nft", "opensea", "digital art"],
        "web3": ["web3", "metaverse", "dao"],
        "mining": ["mining", "miner", "hashrate"],
        "wallet": ["wallet", "ledger", "metamask"]
    }
    
    for tag, keywords in theme_tags.items():
        for keyword in keywords:
            if keyword in text and tag not in tags:
                tags.append(tag)
                break
    
    return tags[:5]  # Máximo 5 tags

@tool("Publish to Strapi with full metadata")
def publish_to_strapi_enhanced(post_data: str) -> str:
    """
    Publica um post no Strapi com suporte completo para tags, categorias e autor.
    Detecta automaticamente categorias e tags baseadas no conteúdo.
    
    Args:
        post_data: JSON string com dados do post
        
    Returns:
        JSON com resultado da publicação
    """
    try:
        # Parse dos dados
        if isinstance(post_data, str):
            data = json.loads(post_data)
        else:
            data = post_data
        
        # Garantir que temos os campos necessários
        if not data.get("title") or not data.get("content"):
            return json.dumps({
                "success": False,
                "error": "Título e conteúdo são obrigatórios"
            })
        
        # Extrair texto do conteúdo para análise
        content_text = ""
        if isinstance(data["content"], list):
            for block in data["content"]:
                if isinstance(block, dict) and "children" in block:
                    for child in block["children"]:
                        if isinstance(child, dict) and "text" in child:
                            content_text += child["text"] + " "
        
        # Detectar categorias e tags automaticamente
        categories = detect_crypto_categories(data["title"], content_text)
        tags = extract_crypto_tags(data["title"], content_text)
        
        logger.info(f"Categorias detectadas: {categories}")
        logger.info(f"Tags detectadas: {tags}")
        
        # Garantir que autor existe
        author_id = ensure_author_exists()
        
        # Garantir que categorias existem e obter referências
        category_refs = ensure_categories_exist(categories)
        
        # Garantir que tags existem e obter referências
        tag_refs = ensure_tags_exist(tags)
        
        # Preparar documento para publicação
        post_doc = {
            "_type": "post",
            "title": data["title"],
            "slug": data.get("slug", {"_type": "slug", "current": criar_slug(data["title"])}),
            "publishedAt": data.get("publishedAt", datetime.now().isoformat()),
            "excerpt": data.get("excerpt", ""),
            "content": data["content"],
            "mainImage": data.get("mainImage"),
            "originalSource": data.get("originalSource")
        }
        
        # Adicionar metadados se disponíveis
        if author_id:
            post_doc["author"] = {
                "_type": "reference",
                "_ref": author_id
            }
        
        if category_refs:
            post_doc["categories"] = category_refs
            
        if tag_refs:
            post_doc["tags"] = tag_refs
        
        # Configurações do Strapi
        project_id = strapi_CONFIG["project_id"]
        dataset = strapi_CONFIG["dataset"]
        api_token = os.environ.get("strapi_API_TOKEN")
        
        if not all([project_id, api_token]):
            return json.dumps({
                "success": False,
                "error": "Credenciais do Strapi não configuradas"
            })
        
        # URL da API
        url = get_strapi_api_url(project_id, dataset)
        
        # Headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_token}"
        }
        
        # Mutação
        mutations = {
            "mutations": [{
                "create": post_doc
            }]
        }
        
        logger.info(f"Publicando post: {data['title']}")
        
        # Enviar requisição
        response = requests.post(url, headers=headers, json=mutations, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            document_id = result.get("results", [{}])[0].get("id")
            
            return json.dumps({
                "success": True,
                "document_id": document_id,
                "message": "Post publicado com sucesso",
                "categories": categories,
                "tags": tags,
                "author": "Crypto Frontier"
            })
        else:
            return json.dumps({
                "success": False,
                "error": f"Erro HTTP {response.status_code}: {response.text}"
            })
            
    except Exception as e:
        logger.error(f"Erro ao publicar: {str(e)}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })