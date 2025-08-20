"""
Cliente unificado para API de conteúdo (atualmente Sanity, futuramente Strapi)

Este módulo fornece uma interface abstrata para gerenciamento de conteúdo,
facilitando a migração futura de Sanity para Strapi.

IMPORTANTE: Apesar dos nomes de funções e comentários mencionarem "Strapi",
este cliente AINDA usa a API do Sanity. A nomenclatura foi mantida para
facilitar a migração futura.

Características:
- Interface unificada para todas as operações de conteúdo
- Padrão Singleton para garantir instância única
- Suporte completo para tags, categorias e autor
- Detecção automática de metadados baseada no conteúdo
- Registro de métricas para monitoramento
"""

import os
import json
import logging
import requests
import uuid
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from functools import wraps
import time

logger = logging.getLogger("content_api_client")

# Métricas para monitoramento
class APIMetrics:
    """Classe para registrar métricas de uso da API"""
    def __init__(self):
        self.requests = 0
        self.successes = 0
        self.failures = 0
        self.total_time = 0
        self.operations = {
            'create': 0,
            'update': 0,
            'get': 0,
            'delete': 0,
            'tag': 0,
            'category': 0,
            'author': 0
        }
    
    def record_request(self, operation: str, success: bool, duration: float):
        """Registra uma requisição"""
        self.requests += 1
        if success:
            self.successes += 1
        else:
            self.failures += 1
        self.total_time += duration
        if operation in self.operations:
            self.operations[operation] += 1
    
    def get_stats(self) -> Dict:
        """Retorna estatísticas de uso"""
        return {
            'total_requests': self.requests,
            'successful_requests': self.successes,
            'failed_requests': self.failures,
            'success_rate': self.successes / self.requests if self.requests > 0 else 0,
            'average_response_time': self.total_time / self.requests if self.requests > 0 else 0,
            'operations': self.operations
        }

# Decorador para registrar métricas
def track_metrics(operation: str):
    """Decorador para rastrear métricas de operações"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            start_time = time.time()
            try:
                result = func(self, *args, **kwargs)
                success = result.get('success', False) if isinstance(result, dict) else True
                duration = time.time() - start_time
                self._metrics.record_request(operation, success, duration)
                return result
            except Exception as e:
                duration = time.time() - start_time
                self._metrics.record_request(operation, False, duration)
                raise e
        return wrapper
    return decorator

class ContentAPIClient:
    """
    Cliente unificado para API de conteúdo (atualmente Sanity, futuramente Strapi)
    
    Esta classe fornece uma interface abstrata para todas as operações de conteúdo,
    unificando as funcionalidades de sanity_tools.py, sanity_tools_enhanced.py e
    sanity_client.py em uma única API coerente.
    """
    
    _instance = None
    
    def __new__(cls):
        """Implementa padrão Singleton"""
        if cls._instance is None:
            cls._instance = super(ContentAPIClient, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Inicializa o cliente se ainda não foi inicializado"""
        if self._initialized:
            return
            
        # Configurações (NOTA: Ainda usando Sanity!)
        self.project_id = os.environ.get("SANITY_PROJECT_ID", "")
        self.dataset = os.environ.get("SANITY_DATASET", "production")
        self.api_version = "2023-05-03"
        self.api_token = os.environ.get("SANITY_API_TOKEN")
        
        # Validar configuração
        if not self.project_id:
            logger.warning("ID do projeto não configurado (SANITY_PROJECT_ID)")
        if not self.api_token:
            logger.warning("Token de API não configurado (SANITY_API_TOKEN)")
            
        # Inicializar métricas
        self._metrics = APIMetrics()
        
        # Cache para evitar requisições desnecessárias
        self._cache = {
            'categories': {},
            'tags': {},
            'author': None
        }
        
        self._initialized = True
        logger.info("ContentAPIClient inicializado (usando Sanity API)")
    
    def get_api_url(self, endpoint: str = "mutate") -> str:
        """Constrói URL da API"""
        base_url = f"https://{self.project_id}.api.sanity.io/v{self.api_version}"
        if endpoint == "query":
            return f"{base_url}/data/query/{self.dataset}"
        else:
            return f"{base_url}/data/mutate/{self.dataset}"
    
    def get_headers(self) -> Dict[str, str]:
        """Retorna headers para requisições"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_token}"
        }
    
    @staticmethod
    def criar_slug(titulo: str) -> str:
        """Cria um slug a partir de um título"""
        slug = titulo.lower()
        slug = unicodedata.normalize('NFKD', slug)
        slug = ''.join([c for c in slug if not unicodedata.combining(c)])
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        return slug.strip('-')
    
    @staticmethod
    def gerar_chave() -> str:
        """Gera uma chave aleatória"""
        return str(uuid.uuid4())[:8]
    
    @staticmethod
    def texto_para_portable_text(texto: str) -> List[Dict]:
        """Converte texto simples para formato Portable Text"""
        # Remover tags HTML
        texto = re.sub(r'<[^>]*>', '', texto)
        
        # Dividir em parágrafos
        paragrafos = [p.strip() for p in texto.split("\n\n") if p.strip()]
        
        # Criar blocos
        blocos = []
        for paragrafo in paragrafos:
            bloco = {
                "_type": "block",
                "_key": ContentAPIClient.gerar_chave(),
                "style": "normal",
                "markDefs": [],
                "children": [
                    {
                        "_type": "span",
                        "_key": ContentAPIClient.gerar_chave(),
                        "text": paragrafo,
                        "marks": []
                    }
                ]
            }
            blocos.append(bloco)
        
        return blocos
    
    def detect_categories(self, title: str, content: str) -> List[str]:
        """Detecta categorias baseadas no conteúdo"""
        text = f"{title} {content}".lower()
        categories = []
        
        # Mapeamento de palavras-chave para categorias
        category_mappings = {
            "Bitcoin": ["bitcoin", "btc", "satoshi", "lightning network"],
            "Ethereum": ["ethereum", "eth", "vitalik", "smart contract", "erc-20"],
            "DeFi": ["defi", "decentralized finance", "yield", "liquidity", "amm", "dex"],
            "NFT": ["nft", "non-fungible", "opensea", "digital art", "erc-721"],
            "Análise de Mercado": ["price", "market", "trading", "análise", "preço", "chart"],
            "Regulação": ["regulation", "sec", "government", "regulação", "governo", "compliance"],
            "Tecnologia": ["blockchain", "consensus", "technology", "tecnologia", "protocol"],
            "Altcoins": ["altcoin", "xrp", "ada", "dot", "bnb", "sol", "avax", "matic"]
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
    
    def extract_tags(self, title: str, content: str) -> List[str]:
        """Extrai tags relevantes do conteúdo"""
        text = f"{title} {content}".lower()
        tags = []
        
        # Lista de criptomoedas e termos relevantes
        crypto_tags = [
            "bitcoin", "ethereum", "xrp", "bnb", "solana", "cardano",
            "dogecoin", "shiba", "polygon", "avalanche", "chainlink",
            "tron", "usdt", "usdc", "dai", "maker", "aave", "uniswap",
            "compound", "sushiswap", "pancakeswap", "curve", "convex"
        ]
        
        # Verificar menções
        for crypto in crypto_tags:
            if crypto in text and crypto not in tags:
                tags.append(crypto)
        
        # Tags temáticas
        theme_tags = {
            "trading": ["trade", "trading", "exchange", "order book"],
            "defi": ["defi", "yield", "staking", "farming", "liquidity"],
            "nft": ["nft", "opensea", "digital art", "collectible"],
            "web3": ["web3", "metaverse", "dao", "governance"],
            "mining": ["mining", "miner", "hashrate", "proof of work"],
            "wallet": ["wallet", "ledger", "metamask", "custody"]
        }
        
        for tag, keywords in theme_tags.items():
            for keyword in keywords:
                if keyword in text and tag not in tags:
                    tags.append(tag)
                    break
        
        return tags[:5]  # Máximo 5 tags
    
    @track_metrics('author')
    def ensure_author_exists(self, author_name: str = "Crypto Frontier") -> Optional[Dict]:
        """Garante que o autor existe no sistema"""
        # Verificar cache
        if self._cache['author'] and self._cache['author']['name'] == author_name:
            return self._cache['author']
        
        try:
            author_slug = self.criar_slug(author_name)
            author_id = f"author-{author_slug}"
            
            # Verificar se existe
            query_url = self.get_api_url("query")
            params = {"query": f'*[_type == "author" && _id == "{author_id}"][0]'}
            
            response = requests.get(query_url, headers=self.get_headers(), params=params)
            
            if response.status_code == 200:
                result = response.json().get("result")
                if result:
                    logger.info(f"Autor '{author_name}' já existe")
                    self._cache['author'] = result
                    return {"_type": "reference", "_ref": author_id}
            
            # Criar autor
            logger.info(f"Criando autor '{author_name}'...")
            
            author_doc = {
                "_type": "author",
                "_id": author_id,
                "name": author_name,
                "slug": {
                    "_type": "slug",
                    "current": author_slug
                },
                "bio": "Notícias e análises sobre criptomoedas e blockchain"
            }
            
            mutations = {
                "mutations": [{
                    "createIfNotExists": author_doc
                }]
            }
            
            response = requests.post(
                self.get_api_url(), 
                headers=self.get_headers(), 
                json=mutations
            )
            
            if response.status_code == 200:
                logger.info(f"Autor '{author_name}' criado com sucesso")
                self._cache['author'] = author_doc
                return {"_type": "reference", "_ref": author_id}
            else:
                logger.error(f"Erro ao criar autor: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Erro ao garantir autor: {str(e)}")
            return None
    
    @track_metrics('category')
    def manage_categories(self, categories: List[str]) -> List[Dict]:
        """Cria ou obtém referências para categorias"""
        category_refs = []
        
        for category in categories:
            # Verificar cache
            if category in self._cache['categories']:
                category_refs.append(self._cache['categories'][category])
                continue
            
            try:
                category_slug = self.criar_slug(category)
                category_id = f"category-{category_slug}"
                
                # Verificar se existe
                query_url = self.get_api_url("query")
                params = {"query": f'*[_type == "category" && _id == "{category_id}"][0]'}
                
                response = requests.get(query_url, headers=self.get_headers(), params=params)
                
                if response.status_code == 200:
                    result = response.json().get("result")
                    if result:
                        ref = {
                            "_type": "reference",
                            "_ref": category_id,
                            "_key": self.gerar_chave()
                        }
                        self._cache['categories'][category] = ref
                        category_refs.append(ref)
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
                
                response = requests.post(
                    self.get_api_url(), 
                    headers=self.get_headers(), 
                    json=mutations
                )
                
                if response.status_code == 200:
                    logger.info(f"Categoria '{category}' criada")
                    ref = {
                        "_type": "reference",
                        "_ref": category_id,
                        "_key": self.gerar_chave()
                    }
                    self._cache['categories'][category] = ref
                    category_refs.append(ref)
                else:
                    logger.error(f"Erro ao criar categoria '{category}': {response.text}")
                    
            except Exception as e:
                logger.error(f"Erro ao processar categoria '{category}': {str(e)}")
        
        return category_refs
    
    @track_metrics('tag')
    def manage_tags(self, tags: List[str]) -> List[Dict]:
        """Cria ou obtém referências para tags"""
        tag_refs = []
        
        for tag in tags:
            # Verificar cache
            if tag in self._cache['tags']:
                tag_refs.append(self._cache['tags'][tag])
                continue
            
            try:
                tag_slug = self.criar_slug(tag)
                tag_id = f"tag-{tag_slug}"
                
                # Verificar se existe
                query_url = self.get_api_url("query")
                params = {"query": f'*[_type == "tag" && _id == "{tag_id}"][0]'}
                
                response = requests.get(query_url, headers=self.get_headers(), params=params)
                
                if response.status_code == 200:
                    result = response.json().get("result")
                    if result:
                        ref = {
                            "_type": "reference",
                            "_ref": tag_id,
                            "_key": self.gerar_chave()
                        }
                        self._cache['tags'][tag] = ref
                        tag_refs.append(ref)
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
                
                response = requests.post(
                    self.get_api_url(), 
                    headers=self.get_headers(), 
                    json=mutations
                )
                
                if response.status_code == 200:
                    logger.info(f"Tag '{tag}' criada")
                    ref = {
                        "_type": "reference",
                        "_ref": tag_id,
                        "_key": self.gerar_chave()
                    }
                    self._cache['tags'][tag] = ref
                    tag_refs.append(ref)
                else:
                    logger.error(f"Erro ao criar tag '{tag}': {response.text}")
                    
            except Exception as e:
                logger.error(f"Erro ao processar tag '{tag}': {str(e)}")
        
        return tag_refs
    
    @track_metrics('create')
    def create_post(self, post_data: Dict[str, Any], auto_metadata: bool = True) -> Dict[str, Any]:
        """
        Cria um novo post no sistema
        
        Args:
            post_data: Dados do post (title, content, excerpt, etc.)
            auto_metadata: Se True, detecta automaticamente categorias e tags
            
        Returns:
            Dict com resultado da operação
        """
        try:
            # Validar dados obrigatórios
            if not post_data.get("title") or not post_data.get("content"):
                return {
                    "success": False,
                    "error": "Título e conteúdo são obrigatórios"
                }
            
            # Preparar conteúdo
            content = post_data.get("content")
            if isinstance(content, str):
                content = self.texto_para_portable_text(content)
            
            # Extrair texto para análise
            content_text = ""
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and "children" in block:
                        for child in block["children"]:
                            if isinstance(child, dict) and "text" in child:
                                content_text += child["text"] + " "
            
            # Auto-detectar metadados se habilitado
            if auto_metadata:
                categories = self.detect_categories(post_data["title"], content_text)
                tags = self.extract_tags(post_data["title"], content_text)
                logger.info(f"Metadados detectados - Categorias: {categories}, Tags: {tags}")
            else:
                categories = post_data.get("categories", [])
                tags = post_data.get("tags", [])
            
            # Garantir que autor existe
            author_ref = self.ensure_author_exists()
            
            # Gerenciar categorias e tags
            category_refs = self.manage_categories(categories) if categories else []
            tag_refs = self.manage_tags(tags) if tags else []
            
            # Preparar documento
            post_doc = {
                "_type": "post",
                "title": post_data["title"],
                "slug": {
                    "_type": "slug",
                    "current": post_data.get("slug", self.criar_slug(post_data["title"]))
                },
                "publishedAt": post_data.get("publishedAt", datetime.now().isoformat()),
                "excerpt": post_data.get("excerpt", "")[:299],  # Limitar a 299 caracteres
                "content": content
            }
            
            # Adicionar campos opcionais
            if post_data.get("mainImage"):
                post_doc["mainImage"] = post_data["mainImage"]
            
            if author_ref:
                post_doc["author"] = author_ref
            
            if category_refs:
                post_doc["categories"] = category_refs
            
            if tag_refs:
                post_doc["tags"] = tag_refs
            
            if post_data.get("originalSource"):
                post_doc["originalSource"] = post_data["originalSource"]
            
            # Criar mutação
            mutations = {
                "mutations": [{
                    "create": post_doc
                }]
            }
            
            # Enviar requisição
            logger.info(f"Criando post: {post_data['title']}")
            response = requests.post(
                self.get_api_url(),
                headers=self.get_headers(),
                json=mutations,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                document_id = result.get("results", [{}])[0].get("id")
                
                return {
                    "success": True,
                    "document_id": document_id,
                    "message": "Post criado com sucesso",
                    "categories": categories,
                    "tags": tags,
                    "author": "Crypto Frontier"
                }
            else:
                return {
                    "success": False,
                    "error": f"Erro HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Erro ao criar post: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @track_metrics('update')
    def update_post(self, post_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualiza um post existente
        
        Args:
            post_id: ID do post
            updates: Campos a atualizar
            
        Returns:
            Dict com resultado da operação
        """
        try:
            # Preparar patch
            patch_doc = {"_id": post_id}
            
            # Processar atualizações
            if "title" in updates:
                patch_doc["title"] = updates["title"]
            
            if "slug" in updates:
                patch_doc["slug"] = {
                    "_type": "slug",
                    "current": updates["slug"]
                }
            
            if "content" in updates:
                content = updates["content"]
                if isinstance(content, str):
                    content = self.texto_para_portable_text(content)
                patch_doc["content"] = content
            
            if "excerpt" in updates:
                patch_doc["excerpt"] = updates["excerpt"][:299]
            
            if "categories" in updates:
                category_refs = self.manage_categories(updates["categories"])
                if category_refs:
                    patch_doc["categories"] = category_refs
            
            if "tags" in updates:
                tag_refs = self.manage_tags(updates["tags"])
                if tag_refs:
                    patch_doc["tags"] = tag_refs
            
            # Criar mutação
            mutations = {
                "mutations": [{
                    "patch": {
                        "id": post_id,
                        "set": patch_doc
                    }
                }]
            }
            
            # Enviar requisição
            logger.info(f"Atualizando post: {post_id}")
            response = requests.post(
                self.get_api_url(),
                headers=self.get_headers(),
                json=mutations,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Post atualizado com sucesso",
                    "post_id": post_id
                }
            else:
                return {
                    "success": False,
                    "error": f"Erro HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Erro ao atualizar post: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @track_metrics('get')
    def get_post(self, post_id: str = None, slug: str = None) -> Dict[str, Any]:
        """
        Obtém um post por ID ou slug
        
        Args:
            post_id: ID do post
            slug: Slug do post
            
        Returns:
            Dict com dados do post ou erro
        """
        try:
            if not post_id and not slug:
                return {
                    "success": False,
                    "error": "ID ou slug do post é obrigatório"
                }
            
            # Construir query
            if post_id:
                query = f'*[_type == "post" && _id == "{post_id}"][0]'
            else:
                query = f'*[_type == "post" && slug.current == "{slug}"][0]'
            
            # Fazer requisição
            query_url = self.get_api_url("query")
            params = {"query": query}
            
            response = requests.get(
                query_url,
                headers=self.get_headers(),
                params=params
            )
            
            if response.status_code == 200:
                result = response.json().get("result")
                if result:
                    return {
                        "success": True,
                        "post": result
                    }
                else:
                    return {
                        "success": False,
                        "error": "Post não encontrado"
                    }
            else:
                return {
                    "success": False,
                    "error": f"Erro HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Erro ao obter post: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @track_metrics('delete')
    def delete_post(self, post_id: str) -> Dict[str, Any]:
        """
        Deleta um post
        
        Args:
            post_id: ID do post
            
        Returns:
            Dict com resultado da operação
        """
        try:
            # Criar mutação
            mutations = {
                "mutations": [{
                    "delete": {
                        "id": post_id
                    }
                }]
            }
            
            # Enviar requisição
            logger.info(f"Deletando post: {post_id}")
            response = requests.post(
                self.get_api_url(),
                headers=self.get_headers(),
                json=mutations,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Post deletado com sucesso",
                    "post_id": post_id
                }
            else:
                return {
                    "success": False,
                    "error": f"Erro HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Erro ao deletar post: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_posts(self, limit: int = 10, offset: int = 0) -> Dict[str, Any]:
        """
        Lista posts
        
        Args:
            limit: Número máximo de posts
            offset: Offset para paginação
            
        Returns:
            Dict com lista de posts ou erro
        """
        try:
            # Construir query
            query = f'*[_type == "post"] | order(publishedAt desc) [{offset}...{offset + limit}]'
            
            # Fazer requisição
            query_url = self.get_api_url("query")
            params = {"query": query}
            
            response = requests.get(
                query_url,
                headers=self.get_headers(),
                params=params
            )
            
            if response.status_code == 200:
                result = response.json().get("result", [])
                return {
                    "success": True,
                    "posts": result,
                    "count": len(result)
                }
            else:
                return {
                    "success": False,
                    "error": f"Erro HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Erro ao listar posts: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_metrics(self) -> Dict[str, Any]:
        """Retorna métricas de uso da API"""
        return self._metrics.get_stats()
    
    def reset_cache(self):
        """Limpa o cache interno"""
        self._cache = {
            'categories': {},
            'tags': {},
            'author': None
        }
        logger.info("Cache limpo")

# Função helper para obter instância singleton
def get_content_client() -> ContentAPIClient:
    """Retorna a instância singleton do ContentAPIClient"""
    return ContentAPIClient()

# Guia de migração
MIGRATION_GUIDE = """
# Guia de Migração Sanity → Strapi

## Estado Atual
- **API em uso**: Sanity
- **Cliente unificado**: ContentAPIClient
- **Localização**: /framework_crewai/blog_crew/src/core/content_api_client.py

## Passos para Migração

### 1. Preparação
1. Configurar instância Strapi com mesmo schema
2. Migrar dados existentes do Sanity para Strapi
3. Testar APIs do Strapi

### 2. Atualização do Cliente
1. Modificar ContentAPIClient:
   - Alterar URLs de api.sanity.io para API do Strapi
   - Ajustar formato de queries (GROQ → GraphQL/REST)
   - Adaptar formato de mutações

### 3. Variáveis de Ambiente
Substituir:
- SANITY_PROJECT_ID → STRAPI_API_URL
- SANITY_API_TOKEN → STRAPI_API_TOKEN
- SANITY_DATASET → (remover ou adaptar)

### 4. Testes
1. Testar todas as operações CRUD
2. Verificar compatibilidade de formatos
3. Validar performance

### 5. Deploy
1. Atualizar variáveis em produção
2. Deploy gradual com feature flags
3. Monitorar métricas

## Código que Precisa Modificação

### URLs da API
```python
# Atual (Sanity)
f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"

# Futuro (Strapi)
f"{strapi_url}/api/posts"
```

### Formato de Queries
```python
# Atual (GROQ)
'*[_type == "post" && _id == "{post_id}"][0]'

# Futuro (REST)
f"/api/posts/{post_id}"
```

### Formato de Dados
- Sanity usa "_type", "_id", "_key"
- Strapi usa "id", "attributes"
- Adaptar conversores

## Benefícios da Arquitetura Atual
1. **Abstração única**: Apenas um arquivo para modificar
2. **Interface consistente**: APIs não mudam para consumidores
3. **Métricas integradas**: Comparação antes/depois da migração
4. **Cache unificado**: Otimização mantida
5. **Padrão Singleton**: Instância única, configuração centralizada
"""

if __name__ == "__main__":
    # Exemplo de uso
    client = get_content_client()
    
    # Criar um post
    result = client.create_post({
        "title": "Bitcoin atinge nova máxima histórica",
        "content": "O Bitcoin superou os $100,000 pela primeira vez...",
        "excerpt": "Análise do movimento histórico do Bitcoin"
    })
    
    print(f"Post criado: {result}")
    
    # Ver métricas
    print(f"Métricas: {client.get_metrics()}")
    
    # Imprimir guia de migração
    print(MIGRATION_GUIDE)