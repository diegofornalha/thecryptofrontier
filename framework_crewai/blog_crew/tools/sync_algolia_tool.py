#!/usr/bin/env python3
"""
Ferramenta CrewAI para sincronizar documentos do Sanity CMS com o Algolia.
"""

import os
import json
import logging
import sys
from typing import Dict, List, Any, Optional, Set
from crewai.tools import BaseTool, tool
from algoliasearch.search_client import SearchClient
import requests
from urllib.parse import quote
from datetime import datetime

# Configuração de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("sync_algolia_tool")

# Configurações do Sanity
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

# Configurações do Algolia
ALGOLIA_APP_ID = os.environ.get("ALGOLIA_APP_ID", "42TZWHW8UP")
ALGOLIA_ADMIN_API_KEY = os.environ.get("ALGOLIA_ADMIN_API_KEY", "d0cb55ec8f07832bc5f57da0bd25c535")  # Admin API Key
ALGOLIA_INDEX_NAME = os.environ.get("ALGOLIA_INDEX_NAME", "development_mcpx_content")

class AlgoliaToolError(Exception):
    """Exceção personalizada para erros da ferramenta Algolia"""
    pass

def is_document_already_indexed(doc, indexed_info):
    """
    Verifica se um documento já está indexado no Algolia.
    Faz verificação por ID, slug e URL para evitar duplicação.
    
    Args:
        doc: Documento preparado para indexação
        indexed_info: Informações sobre documentos já indexados
    
    Returns:
        bool: True se o documento já estiver indexado
    """
    # Verificar por ID
    if doc.get('objectID') in indexed_info['ids']:
        return True
    
    # Verificar por slug
    if 'slug' in doc and doc['slug'] and doc['slug'] in indexed_info['slugs']:
        logger.info(f"Documento com slug '{doc['slug']}' já está indexado com ID diferente")
        return True
    
    # Verificar por URL da fonte original
    if ('originalSource' in doc and isinstance(doc['originalSource'], dict) and 
            'url' in doc['originalSource'] and doc['originalSource']['url']):
        url = doc['originalSource']['url']
        if url in indexed_info['urls']:
            logger.info(f"Documento com URL '{url}' já está indexado com ID diferente")
            return True
    
    return False

@tool
def sync_sanity_to_algolia(document_type: str = 'post') -> str:
    """
    Sincroniza documentos do Sanity CMS com o Algolia.
    Verifica quais documentos já estão indexados e indexa apenas os novos,
    evitando duplicações por ID, slug ou URL da fonte original.
    
    Args:
        document_type: Tipo de documento Sanity a ser sincronizado (padrão: 'post')
    
    Returns:
        Mensagem informando o resultado da sincronização
    """
    try:
        # Verificar variáveis de ambiente
        for env_var, name in [
            ("SANITY_API_TOKEN", "token da API do Sanity"),
            ("ALGOLIA_APP_ID", "ID da aplicação Algolia"),
            ("ALGOLIA_ADMIN_API_KEY", "chave da API do Algolia")
        ]:
            if not os.environ.get(env_var) and not (env_var == "ALGOLIA_APP_ID" and ALGOLIA_APP_ID):
                raise AlgoliaToolError(f"{env_var} não está definido. Defina a variável de ambiente {env_var}.")
        
        # Buscar documentos do Sanity
        sanity_documents = get_sanity_documents(document_type)
        
        if not sanity_documents:
            return f"Nenhum documento do tipo '{document_type}' encontrado no Sanity."
        
        # Buscar informações dos documentos já indexados no Algolia
        indexed_info = get_indexed_documents()
        
        # Filtrar documentos que ainda não estão indexados
        documents_to_index = []
        skipped_documents = 0
        duplicates_prevented = 0
        
        for doc in sanity_documents:
            # Preparar documento para indexação
            prepared_doc = prepare_document_for_algolia(doc)
            
            # Verificação avançada para evitar duplicação
            if is_document_already_indexed(prepared_doc, indexed_info):
                if prepared_doc.get('objectID') not in indexed_info['ids']:
                    duplicates_prevented += 1
                else:
                    skipped_documents += 1
            else:
                documents_to_index.append(prepared_doc)
        
        # Informações sobre os documentos
        status = [
            f"Documentos encontrados no Sanity: {len(sanity_documents)}",
            f"Documentos já indexados no Algolia (por ID): {len(indexed_info['ids'])}"
        ]
        
        if duplicates_prevented > 0:
            status.append(f"Duplicações evitadas por slug/URL: {duplicates_prevented}")
            
        status.append(f"Documentos para indexar: {len(documents_to_index)}")
        
        # Indexar documentos no Algolia
        if documents_to_index:
            success = index_documents(documents_to_index)
            if success:
                return (
                    "\n".join(status) + "\n\n"
                    f"Sincronização concluída: {len(documents_to_index)} documentos indexados, "
                    f"{skipped_documents + duplicates_prevented} já existentes"
                )
            else:
                raise AlgoliaToolError("Erro ao indexar documentos no Algolia")
        else:
            return "\n".join(status) + f"\n\nTodos os {skipped_documents + duplicates_prevented} documentos já estão indexados no Algolia"
    
    except AlgoliaToolError as e:
        return f"Erro na sincronização Sanity-Algolia: {str(e)}"
    except ImportError as e:
        return f"Erro de dependência: {str(e)}. Instale as bibliotecas necessárias com pip."
    except Exception as e:
        return f"Erro inesperado: {str(e)}"

def get_sanity_documents(document_type, fields=None):
    """
    Busca documentos de um tipo específico no Sanity CMS.
    
    Args:
        document_type: Tipo de documento a ser buscado
        fields: Campos específicos a serem retornados
    
    Returns:
        list: Lista de documentos
    """
    # Definir campos a serem retornados
    if not fields:
        fields = """{ 
            _id, 
            title, 
            slug { current }, 
            publishedAt, 
            excerpt, 
            "author": author->name,
            "categories": categories[]->title,
            "tags": tags[]->title,
            "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180)
        }"""
    
    # Obter o token do Sanity
    sanity_token = os.environ.get("SANITY_API_TOKEN")
    if not sanity_token:
        raise AlgoliaToolError("SANITY_API_TOKEN não está definido")
    
    # Construir a query GROQ
    query = f'*[_type == "{document_type}"]{fields}'
    encoded_query = quote(query)
    
    # URL da API do Sanity
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}?query={encoded_query}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {sanity_token}"
    }
    
    # Fazer a requisição
    logger.info(f"Buscando documentos do tipo '{document_type}' no Sanity...")
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    # Extrair os resultados
    result = response.json().get("result", [])
    logger.info(f"Documentos encontrados no Sanity: {len(result)}")
    
    return result

def get_indexed_documents():
    """
    Retorna informações sobre documentos já indexados no Algolia.
    
    Returns:
        dict: Dicionário com IDs e slugs dos documentos indexados
    """
    # Verificar se as credenciais existem
    if not ALGOLIA_APP_ID or not ALGOLIA_ADMIN_API_KEY:
        raise AlgoliaToolError("Credenciais do Algolia não configuradas")
    
    # Inicializar cliente Algolia
    client = SearchClient.create(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY)
    index = client.init_index(ALGOLIA_INDEX_NAME)
    
    # Buscar todos os objetos usando a API de browse
    documents = []
    browse_response = index.browse_objects({
        'attributesToRetrieve': ['objectID', 'slug', 'originalSource.url']
    })
    
    for hit in browse_response:
        documents.append(hit)
    
    # Armazenar informações de IDs e slugs para evitar duplicação
    indexed_info = {
        'ids': set(),
        'slugs': set(),
        'urls': set()
    }
    
    for doc in documents:
        if 'objectID' in doc:
            indexed_info['ids'].add(doc['objectID'])
        
        if 'slug' in doc and doc['slug']:
            indexed_info['slugs'].add(doc['slug'])
        
        # Extrair URL da fonte original, se disponível
        if 'originalSource' in doc and isinstance(doc['originalSource'], dict) and 'url' in doc['originalSource']:
            url = doc['originalSource']['url']
            if url:
                indexed_info['urls'].add(url)
    
    logger.info(f"Documentos já indexados no Algolia: {len(indexed_info['ids'])}")
    logger.info(f"Slugs únicos indexados: {len(indexed_info['slugs'])}")
    logger.info(f"URLs únicas indexadas: {len(indexed_info['urls'])}")
    
    return indexed_info

def prepare_document_for_algolia(document):
    """
    Prepara um documento do Sanity para indexação no Algolia.
    
    Args:
        document: Documento do Sanity
    
    Returns:
        dict: Documento preparado para o Algolia
    """
    # Copiar documento para não modificar o original
    prepared_doc = document.copy()
    
    # Definir objectID para o Algolia (usar _id do Sanity)
    if '_id' in prepared_doc:
        prepared_doc['objectID'] = prepared_doc['_id']
    
    # Converter slug de objeto para string se necessário
    if 'slug' in prepared_doc and isinstance(prepared_doc['slug'], dict) and 'current' in prepared_doc['slug']:
        prepared_doc['slug'] = prepared_doc['slug']['current']
    
    # Adicionar campos de filtragem
    if 'publishedAt' in prepared_doc:
        # Converter data para timestamp se necessário para facilitar ordenação
        if isinstance(prepared_doc['publishedAt'], str):
            try:
                dt = datetime.fromisoformat(prepared_doc['publishedAt'].replace('Z', '+00:00'))
                prepared_doc['publishedAtTimestamp'] = int(dt.timestamp())
            except Exception as e:
                logger.warning(f"Erro ao converter data de publicação: {str(e)}")
    
    return prepared_doc

def index_documents(documents):
    """
    Indexa documentos no Algolia.
    
    Args:
        documents: Lista de documentos a serem indexados
    
    Returns:
        bool: True se a indexação foi bem-sucedida, False caso contrário
    """
    # Verificar se há documentos para indexar
    if not documents:
        logger.info("Nenhum documento para indexar")
        return True
    
    # Verificar se as credenciais existem
    if not ALGOLIA_APP_ID or not ALGOLIA_ADMIN_API_KEY:
        raise AlgoliaToolError("Credenciais do Algolia não configuradas")
    
    # Inicializar cliente Algolia
    client = SearchClient.create(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY)
    index = client.init_index(ALGOLIA_INDEX_NAME)
    
    # Indexar os documentos
    response = index.save_objects(documents)
    logger.info(f"Documentos indexados com sucesso: {len(documents)}")
    
    return True