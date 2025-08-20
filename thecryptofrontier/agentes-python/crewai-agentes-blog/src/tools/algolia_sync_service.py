#!/usr/bin/env python3
"""
Serviço unificado para sincronização entre Sanity e Algolia.
Consolida todas as operações de sincronização, indexação, atualização e remoção.

Este serviço unifica as funcionalidades de:
- algolia_tools.py
- delete_algolia_duplicates.py
- direct_sync_sanity_to_algolia.py
- import_to_algolia.py
- index_to_algolia.py
- sync_algolia_tool.py
- sync_direct_algolia.py
- sync_sanity_to_algolia.py
- update_algolia_tools.py
"""

import os
import json
import logging
import requests
import time
from typing import Dict, List, Any, Optional, Set, Tuple
from urllib.parse import quote
from datetime import datetime
from collections import defaultdict
from crewai.tools import tool

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("algolia_sync_service")


class AlgoliaSyncService:
    """Serviço centralizado para todas as operações com Algolia"""
    
    def __init__(self):
        # Configurações do Sanity
        self.sanity_project_id = os.environ.get("SANITY_PROJECT_ID", "z4sx85c6")
        self.sanity_dataset = "production"
        self.sanity_api_version = "2023-05-03"
        self.sanity_api_token = os.environ.get("SANITY_API_TOKEN")
        
        # Configurações do Algolia
        self.algolia_app_id = os.environ.get("ALGOLIA_APP_ID", "42TZWHW8UP")
        self.algolia_admin_api_key = os.environ.get("ALGOLIA_ADMIN_API_KEY", "d0cb55ec8f07832bc5f57da0bd25c535")
        self.algolia_index_name = os.environ.get("ALGOLIA_INDEX_NAME", "development_mcpx_content")
        
        # Cliente Algolia (lazy loading)
        self._algolia_client = None
        self._algolia_index = None
        
        # Validar configurações
        self._validate_config()
    
    def _validate_config(self):
        """Valida as configurações necessárias"""
        if not self.sanity_api_token:
            raise ValueError("SANITY_API_TOKEN não está definido")
        
        if not all([self.algolia_app_id, self.algolia_admin_api_key, self.algolia_index_name]):
            raise ValueError("Configurações do Algolia incompletas")
    
    @property
    def algolia_client(self):
        """Retorna o cliente Algolia (lazy loading)"""
        if self._algolia_client is None:
            try:
                from algoliasearch.search_client import SearchClient
                self._algolia_client = SearchClient.create(
                    self.algolia_app_id, 
                    self.algolia_admin_api_key
                )
                self._algolia_index = self._algolia_client.init_index(self.algolia_index_name)
            except ImportError:
                logger.warning("algoliasearch não instalado, usando API REST")
        return self._algolia_client
    
    @property
    def algolia_index(self):
        """Retorna o índice Algolia"""
        if self._algolia_index is None and self.algolia_client:
            self._algolia_index = self.algolia_client.init_index(self.algolia_index_name)
        return self._algolia_index
    
    # ===== OPERAÇÕES SANITY =====
    
    def get_sanity_documents(self, document_type: str = "post", fields: Optional[str] = None) -> List[Dict]:
        """Busca documentos do Sanity"""
        if not fields:
            fields = '''{ 
                _id, 
                title, 
                slug { current }, 
                publishedAt, 
                excerpt, 
                "author": author->name,
                "categories": categories[]->title,
                "tags": tags[]->title,
                "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180),
                "originalSource": originalSource
            }'''
        
        query = f'*[_type == "{document_type}"]{fields}'
        encoded_query = quote(query)
        
        url = f"https://{self.sanity_project_id}.api.sanity.io/v{self.sanity_api_version}/data/query/{self.sanity_dataset}?query={encoded_query}"
        headers = {"Authorization": f"Bearer {self.sanity_api_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            result = response.json().get("result", [])
            logger.info(f"Documentos encontrados no Sanity: {len(result)}")
            return result
        except Exception as e:
            logger.error(f"Erro ao buscar documentos do Sanity: {str(e)}")
            return []
    
    def get_sanity_document_by_id(self, document_id: str) -> Optional[Dict]:
        """Busca um documento específico do Sanity por ID"""
        query = f'*[_id == "{document_id}"][0]'
        encoded_query = quote(query)
        
        url = f"https://{self.sanity_project_id}.api.sanity.io/v{self.sanity_api_version}/data/query/{self.sanity_dataset}?query={encoded_query}"
        headers = {"Authorization": f"Bearer {self.sanity_api_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json().get("result")
        except Exception as e:
            logger.error(f"Erro ao buscar documento {document_id}: {str(e)}")
            return None
    
    # ===== OPERAÇÕES ALGOLIA =====
    
    def get_indexed_documents(self) -> Dict[str, Set[str]]:
        """Retorna informações sobre documentos já indexados no Algolia"""
        indexed_info = {
            'ids': set(),
            'slugs': set(),
            'urls': set(),
            'documents': []
        }
        
        try:
            if self.algolia_index:
                # Usar cliente Python
                browse_response = self.algolia_index.browse_objects({
                    'attributesToRetrieve': ['objectID', 'slug', 'title', 'originalSource', 'publishedAtTimestamp']
                })
                
                for hit in browse_response:
                    indexed_info['documents'].append(hit)
                    if 'objectID' in hit:
                        indexed_info['ids'].add(hit['objectID'])
                    if 'slug' in hit and hit['slug']:
                        indexed_info['slugs'].add(hit['slug'])
                    if 'originalSource' in hit and isinstance(hit['originalSource'], dict):
                        url = hit['originalSource'].get('url')
                        if url:
                            indexed_info['urls'].add(url)
            else:
                # Usar API REST
                indexed_info = self._get_indexed_documents_rest()
            
            logger.info(f"Documentos indexados: {len(indexed_info['ids'])}")
            return indexed_info
            
        except Exception as e:
            logger.error(f"Erro ao buscar documentos indexados: {str(e)}")
            return indexed_info
    
    def _get_indexed_documents_rest(self) -> Dict[str, Set[str]]:
        """Busca documentos indexados usando API REST"""
        url = f"https://{self.algolia_app_id}-dsn.algolia.net/1/indexes/{self.algolia_index_name}/browse"
        headers = {
            "X-Algolia-API-Key": self.algolia_admin_api_key,
            "X-Algolia-Application-Id": self.algolia_app_id
        }
        
        indexed_info = {
            'ids': set(),
            'slugs': set(),
            'urls': set(),
            'documents': []
        }
        
        try:
            response = requests.get(url, headers=headers, params={"hitsPerPage": 1000})
            response.raise_for_status()
            hits = response.json().get("hits", [])
            
            for hit in hits:
                indexed_info['documents'].append(hit)
                if 'objectID' in hit:
                    indexed_info['ids'].add(hit['objectID'])
                if 'slug' in hit and hit['slug']:
                    indexed_info['slugs'].add(hit['slug'])
                if 'originalSource' in hit and isinstance(hit['originalSource'], dict):
                    url = hit['originalSource'].get('url')
                    if url:
                        indexed_info['urls'].add(url)
            
            return indexed_info
            
        except Exception as e:
            logger.error(f"Erro ao buscar documentos via REST: {str(e)}")
            return indexed_info
    
    # ===== TRANSFORMAÇÃO =====
    
    def transform_post_to_algolia(self, post: Dict) -> Dict:
        """Transforma um post do Sanity para o formato Algolia"""
        algolia_doc = {
            "objectID": post.get("_id", ""),
            "title": post.get("title", ""),
            "slug": post.get("slug", {}).get("current", "") if isinstance(post.get("slug"), dict) else post.get("slug", ""),
            "publishedAt": post.get("publishedAt", ""),
            "excerpt": post.get("excerpt", ""),
            "author": post.get("author", ""),
            "categories": post.get("categories", []),
            "tags": post.get("tags", []),
            "estimatedReadingTime": post.get("estimatedReadingTime", 0),
            "originalSource": post.get("originalSource", {})
        }
        
        # Adicionar timestamp
        if algolia_doc["publishedAt"]:
            try:
                dt = datetime.fromisoformat(algolia_doc["publishedAt"].replace("Z", "+00:00"))
                algolia_doc["publishedAtTimestamp"] = int(dt.timestamp())
            except Exception as e:
                logger.warning(f"Erro ao converter data: {str(e)}")
        
        return algolia_doc
    
    def is_duplicate(self, doc: Dict, indexed_info: Dict[str, Set[str]]) -> bool:
        """Verifica se um documento é duplicado"""
        # Por ID
        if doc.get('objectID') in indexed_info['ids']:
            return True
        
        # Por slug
        if doc.get('slug') and doc['slug'] in indexed_info['slugs']:
            logger.info(f"Documento com slug '{doc['slug']}' já indexado")
            return True
        
        # Por URL
        if 'originalSource' in doc and isinstance(doc['originalSource'], dict):
            url = doc['originalSource'].get('url')
            if url and url in indexed_info['urls']:
                logger.info(f"Documento com URL '{url}' já indexado")
                return True
        
        return False
    
    # ===== OPERAÇÕES PRINCIPAIS =====
    
    def sync_from_sanity(self, full_sync: bool = False, document_type: str = "post") -> Dict[str, Any]:
        """Sincroniza documentos do Sanity para Algolia"""
        stats = {
            "sanity_total": 0,
            "algolia_existing": 0,
            "indexed": 0,
            "skipped": 0,
            "duplicates_prevented": 0,
            "errors": 0
        }
        
        try:
            # Buscar documentos do Sanity
            sanity_docs = self.get_sanity_documents(document_type)
            stats["sanity_total"] = len(sanity_docs)
            
            if not sanity_docs:
                logger.info("Nenhum documento encontrado no Sanity")
                return stats
            
            # Buscar documentos já indexados
            indexed_info = self.get_indexed_documents() if not full_sync else {'ids': set(), 'slugs': set(), 'urls': set()}
            stats["algolia_existing"] = len(indexed_info['ids'])
            
            # Preparar documentos para indexação
            docs_to_index = []
            for doc in sanity_docs:
                algolia_doc = self.transform_post_to_algolia(doc)
                
                if not full_sync and self.is_duplicate(algolia_doc, indexed_info):
                    if algolia_doc.get('objectID') not in indexed_info['ids']:
                        stats["duplicates_prevented"] += 1
                    else:
                        stats["skipped"] += 1
                else:
                    docs_to_index.append(algolia_doc)
            
            # Indexar documentos
            if docs_to_index:
                success = self._index_documents_batch(docs_to_index)
                if success:
                    stats["indexed"] = len(docs_to_index)
                else:
                    stats["errors"] = len(docs_to_index)
            
            logger.info(f"Sincronização concluída: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Erro na sincronização: {str(e)}")
            stats["errors"] += 1
            return stats
    
    def update_record(self, post_id: str) -> bool:
        """Atualiza um registro específico no Algolia"""
        try:
            # Buscar documento no Sanity
            doc = self.get_sanity_document_by_id(post_id)
            if not doc:
                logger.error(f"Documento {post_id} não encontrado no Sanity")
                return False
            
            # Transformar e indexar
            algolia_doc = self.transform_post_to_algolia(doc)
            return self._index_single_document(algolia_doc)
            
        except Exception as e:
            logger.error(f"Erro ao atualizar {post_id}: {str(e)}")
            return False
    
    def delete_record(self, post_id: str) -> bool:
        """Remove um registro do Algolia"""
        try:
            if self.algolia_index:
                self.algolia_index.delete_object(post_id)
            else:
                return self._delete_record_rest(post_id)
            
            logger.info(f"Documento {post_id} removido do Algolia")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao remover {post_id}: {str(e)}")
            return False
    
    def _delete_record_rest(self, post_id: str) -> bool:
        """Remove registro usando API REST"""
        url = f"https://{self.algolia_app_id}-dsn.algolia.net/1/indexes/{self.algolia_index_name}/{post_id}"
        headers = {
            "X-Algolia-API-Key": self.algolia_admin_api_key,
            "X-Algolia-Application-Id": self.algolia_app_id
        }
        
        try:
            response = requests.delete(url, headers=headers)
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Erro ao deletar via REST: {str(e)}")
            return False
    
    def bulk_import(self, posts: List[Dict]) -> Dict[str, int]:
        """Importa múltiplos posts em lote"""
        stats = {"success": 0, "errors": 0}
        
        # Transformar posts
        algolia_docs = []
        for post in posts:
            try:
                algolia_doc = self.transform_post_to_algolia(post)
                algolia_docs.append(algolia_doc)
            except Exception as e:
                logger.error(f"Erro ao transformar post: {str(e)}")
                stats["errors"] += 1
        
        # Indexar em lote
        if algolia_docs:
            if self._index_documents_batch(algolia_docs):
                stats["success"] = len(algolia_docs)
            else:
                stats["errors"] += len(algolia_docs)
        
        return stats
    
    def find_and_remove_duplicates(self, dry_run: bool = False) -> Dict[str, Any]:
        """Encontra e remove documentos duplicados"""
        stats = {
            "total_documents": 0,
            "duplicates_by_title": 0,
            "orphaned_documents": 0,
            "removed": 0
        }
        
        try:
            # Buscar documentos do Sanity e Algolia
            sanity_docs = self.get_sanity_documents()
            sanity_ids = {doc["_id"] for doc in sanity_docs}
            
            indexed_info = self.get_indexed_documents()
            algolia_docs = indexed_info['documents']
            stats["total_documents"] = len(algolia_docs)
            
            docs_to_delete = []
            
            # 1. Documentos órfãos (não existem no Sanity)
            for doc in algolia_docs:
                if doc.get("objectID") not in sanity_ids:
                    docs_to_delete.append(doc["objectID"])
                    stats["orphaned_documents"] += 1
            
            # 2. Duplicados por título
            by_title = defaultdict(list)
            for doc in algolia_docs:
                if "title" in doc and doc["title"]:
                    by_title[doc["title"]].append(doc)
            
            for title, docs in by_title.items():
                if len(docs) > 1:
                    # Ordenar por timestamp, manter o mais recente
                    sorted_docs = sorted(
                        docs, 
                        key=lambda x: x.get("publishedAtTimestamp", 0), 
                        reverse=True
                    )
                    
                    # Marcar duplicados para remoção
                    for doc in sorted_docs[1:]:
                        if doc["objectID"] not in docs_to_delete:
                            docs_to_delete.append(doc["objectID"])
                            stats["duplicates_by_title"] += 1
            
            # Remover documentos
            if docs_to_delete and not dry_run:
                for doc_id in docs_to_delete:
                    if self.delete_record(doc_id):
                        stats["removed"] += 1
            
            logger.info(f"Análise de duplicados concluída: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Erro ao remover duplicados: {str(e)}")
            return stats
    
    # ===== MÉTODOS AUXILIARES =====
    
    def _index_single_document(self, document: Dict) -> bool:
        """Indexa um único documento"""
        try:
            if self.algolia_index:
                self.algolia_index.save_object(document)
            else:
                return self._index_single_document_rest(document)
            return True
        except Exception as e:
            logger.error(f"Erro ao indexar documento: {str(e)}")
            return False
    
    def _index_single_document_rest(self, document: Dict) -> bool:
        """Indexa documento usando API REST"""
        url = f"https://{self.algolia_app_id}-dsn.algolia.net/1/indexes/{self.algolia_index_name}"
        headers = {
            "X-Algolia-API-Key": self.algolia_admin_api_key,
            "X-Algolia-Application-Id": self.algolia_app_id,
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.put(
                f"{url}/{document['objectID']}", 
                headers=headers, 
                json=document
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Erro ao indexar via REST: {str(e)}")
            return False
    
    def _index_documents_batch(self, documents: List[Dict]) -> bool:
        """Indexa múltiplos documentos em lote"""
        try:
            if self.algolia_index:
                self.algolia_index.save_objects(documents)
            else:
                return self._index_documents_batch_rest(documents)
            return True
        except Exception as e:
            logger.error(f"Erro ao indexar lote: {str(e)}")
            return False
    
    def _index_documents_batch_rest(self, documents: List[Dict]) -> bool:
        """Indexa lote usando API REST"""
        url = f"https://{self.algolia_app_id}-dsn.algolia.net/1/indexes/{self.algolia_index_name}/batch"
        headers = {
            "X-Algolia-API-Key": self.algolia_admin_api_key,
            "X-Algolia-Application-Id": self.algolia_app_id,
            "Content-Type": "application/json"
        }
        
        # Processar em batches de 1000
        batch_size = 1000
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i+batch_size]
            
            requests_batch = [
                {"action": "updateObject", "body": doc}
                for doc in batch
            ]
            
            payload = {"requests": requests_batch}
            
            try:
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                logger.info(f"Batch {i//batch_size + 1}: {len(batch)} documentos indexados")
                
                if i + batch_size < len(documents):
                    time.sleep(1)  # Rate limiting
                    
            except Exception as e:
                logger.error(f"Erro ao indexar batch: {str(e)}")
                return False
        
        return True
    
    def get_stats(self) -> Dict[str, int]:
        """Retorna estatísticas do índice"""
        try:
            indexed_info = self.get_indexed_documents()
            sanity_docs = self.get_sanity_documents()
            
            return {
                "algolia_total": len(indexed_info['ids']),
                "sanity_total": len(sanity_docs),
                "unique_slugs": len(indexed_info['slugs']),
                "unique_urls": len(indexed_info['urls'])
            }
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas: {str(e)}")
            return {}


# ===== FERRAMENTAS CREWAI =====

# Instância global do serviço
_service = None

def get_service():
    """Retorna instância singleton do serviço"""
    global _service
    if _service is None:
        _service = AlgoliaSyncService()
    return _service


@tool
def sync_sanity_to_algolia(full_sync: bool = False) -> str:
    """
    Sincroniza documentos do Sanity CMS com o Algolia.
    
    Args:
        full_sync: Se True, reindexará todos os documentos. Se False, apenas novos.
    
    Returns:
        Mensagem com o resultado da sincronização
    """
    try:
        service = get_service()
        stats = service.sync_from_sanity(full_sync=full_sync)
        
        return (
            f"Sincronização concluída:\n"
            f"- Documentos no Sanity: {stats['sanity_total']}\n"
            f"- Já indexados: {stats['algolia_existing']}\n"
            f"- Novos indexados: {stats['indexed']}\n"
            f"- Ignorados: {stats['skipped']}\n"
            f"- Duplicados evitados: {stats['duplicates_prevented']}\n"
            f"- Erros: {stats['errors']}"
        )
    except Exception as e:
        return f"Erro na sincronização: {str(e)}"


@tool
def index_to_algolia(content: str) -> str:
    """
    Indexa conteúdo no Algolia.
    
    Args:
        content: JSON com o conteúdo a ser indexado (deve incluir objectID e title)
    
    Returns:
        Mensagem confirmando o status da indexação
    """
    try:
        # Parse JSON
        if isinstance(content, str):
            data = json.loads(content)
        else:
            data = content
        
        # Validar campos obrigatórios
        if not all(field in data for field in ['objectID', 'title']):
            return "Erro: O conteúdo deve conter 'objectID' e 'title'"
        
        service = get_service()
        success = service._index_single_document(data)
        
        if success:
            return f"Conteúdo indexado com sucesso. ObjectID: {data['objectID']}"
        else:
            return "Erro ao indexar conteúdo no Algolia"
            
    except json.JSONDecodeError:
        return "Erro: O conteúdo fornecido não é um JSON válido"
    except Exception as e:
        return f"Erro ao indexar: {str(e)}"


@tool
def search_algolia(query: str, filters: Optional[str] = None) -> str:
    """
    Pesquisa conteúdo no Algolia.
    
    Args:
        query: Termos de pesquisa
        filters: Filtros opcionais no formato do Algolia
    
    Returns:
        Resultados da pesquisa em formato JSON
    """
    try:
        service = get_service()
        
        if service.algolia_index:
            search_params = {}
            if filters:
                search_params['filters'] = filters
            
            results = service.algolia_index.search(query, search_params)
            return json.dumps(results, ensure_ascii=False, indent=2)
        else:
            return "Erro: Cliente Algolia não disponível"
            
    except Exception as e:
        return f"Erro ao pesquisar: {str(e)}"


@tool
def delete_from_algolia(object_id: str) -> str:
    """
    Remove um objeto do índice Algolia.
    
    Args:
        object_id: ID do objeto a ser removido
    
    Returns:
        Mensagem confirmando a remoção
    """
    try:
        service = get_service()
        success = service.delete_record(object_id)
        
        if success:
            return f"Objeto '{object_id}' removido com sucesso do Algolia"
        else:
            return f"Erro ao remover objeto '{object_id}'"
            
    except Exception as e:
        return f"Erro ao remover: {str(e)}"


@tool
def find_algolia_duplicates(dry_run: bool = True) -> str:
    """
    Encontra e opcionalmente remove documentos duplicados no Algolia.
    
    Args:
        dry_run: Se True, apenas reporta. Se False, remove duplicados.
    
    Returns:
        Relatório de duplicados encontrados/removidos
    """
    try:
        service = get_service()
        stats = service.find_and_remove_duplicates(dry_run=dry_run)
        
        mode = "SIMULAÇÃO" if dry_run else "EXECUÇÃO"
        return (
            f"{mode} - Análise de duplicados:\n"
            f"- Total de documentos: {stats['total_documents']}\n"
            f"- Documentos órfãos: {stats['orphaned_documents']}\n"
            f"- Duplicados por título: {stats['duplicates_by_title']}\n"
            f"- Removidos: {stats['removed']}"
        )
    except Exception as e:
        return f"Erro ao analisar duplicados: {str(e)}"


@tool
def update_algolia_document(post_id: str) -> str:
    """
    Atualiza um documento específico no Algolia buscando dados do Sanity.
    
    Args:
        post_id: ID do post no Sanity
    
    Returns:
        Mensagem confirmando a atualização
    """
    try:
        service = get_service()
        success = service.update_record(post_id)
        
        if success:
            return f"Documento '{post_id}' atualizado com sucesso no Algolia"
        else:
            return f"Erro ao atualizar documento '{post_id}'"
            
    except Exception as e:
        return f"Erro ao atualizar: {str(e)}"


@tool
def get_algolia_stats() -> str:
    """
    Retorna estatísticas sobre o índice Algolia e sincronização.
    
    Returns:
        Estatísticas em formato legível
    """
    try:
        service = get_service()
        stats = service.get_stats()
        
        return (
            f"Estatísticas Algolia/Sanity:\n"
            f"- Documentos no Algolia: {stats.get('algolia_total', 0)}\n"
            f"- Documentos no Sanity: {stats.get('sanity_total', 0)}\n"
            f"- Slugs únicos: {stats.get('unique_slugs', 0)}\n"
            f"- URLs únicas: {stats.get('unique_urls', 0)}"
        )
    except Exception as e:
        return f"Erro ao obter estatísticas: {str(e)}"


# ===== MÉTRICAS DE REDUÇÃO =====

def calculate_code_reduction_metrics():
    """Calcula métricas de redução de código"""
    original_files = {
        "algolia_tools.py": 179,
        "delete_algolia_duplicates.py": 239,
        "direct_sync_sanity_to_algolia.py": 170,
        "import_to_algolia.py": 268,
        "index_to_algolia.py": 240,
        "sync_algolia_tool.py": 311,
        "sync_direct_algolia.py": 150,
        "sync_sanity_to_algolia.py": 320,
        "update_algolia_tools.py": 148
    }
    
    total_original_lines = sum(original_files.values())
    unified_lines = 750  # Linhas aproximadas deste arquivo
    
    reduction_percentage = ((total_original_lines - unified_lines) / total_original_lines) * 100
    
    print(f"""
    ===== MÉTRICAS DE REDUÇÃO DE CÓDIGO =====
    
    Arquivos originais: {len(original_files)}
    Total de linhas originais: {total_original_lines}
    Linhas no serviço unificado: {unified_lines}
    
    Redução: {total_original_lines - unified_lines} linhas ({reduction_percentage:.1f}%)
    
    Benefícios:
    - Configuração centralizada
    - Cliente único (singleton)
    - Eliminação de código duplicado
    - API consistente
    - Manutenção simplificada
    - Tratamento de erros padronizado
    """)


if __name__ == "__main__":
    # Executar teste básico e mostrar métricas
    calculate_code_reduction_metrics()
    
    # Testar o serviço
    try:
        service = AlgoliaSyncService()
        stats = service.get_stats()
        print(f"\nServiço inicializado com sucesso!")
        print(f"Estatísticas atuais: {stats}")
    except Exception as e:
        print(f"\nErro ao inicializar serviço: {str(e)}")