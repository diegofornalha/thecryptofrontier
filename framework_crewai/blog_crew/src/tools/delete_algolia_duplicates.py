#!/usr/bin/env python3
"""
Script para identificar e excluir documentos duplicados no Algolia.
Este script sincroniza a base do Algolia com o Strapi, removendo documentos que não estão mais no Strapi
ou que são duplicados por título.

Uso: python delete_algolia_duplicates.py [--dry-run]
     --dry-run: apenas mostra as alterações, sem excluir nada
"""

import os
import sys
import requests
from urllib.parse import quote
import json
import time
from collections import defaultdict
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("algolia_cleaner")

# Configurações do Strapi
strapi_PROJECT_ID = os.environ.get("strapi_PROJECT_ID", "z4sx85c6")
strapi_DATASET = "production"
strapi_API_VERSION = "2023-05-03"

# Configurações do Algolia
ALGOLIA_APP_ID = os.environ.get("ALGOLIA_APP_ID", "42TZWHW8UP")
ALGOLIA_API_KEY = os.environ.get("ALGOLIA_ADMIN_API_KEY", "d0cb55ec8f07832bc5f57da0bd25c535")
ALGOLIA_INDEX_NAME = os.environ.get("ALGOLIA_INDEX_NAME", "development_mcpx_content")

def get_strapi_documents():
    """Obtém todos os documentos do tipo post do Strapi"""
    # Obter token do Strapi
    strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")
    if not strapi_API_TOKEN:
        logger.error("strapi_API_TOKEN não está definido")
        sys.exit(1)
    
    # Query para obter todos os posts do Strapi
    query = '*[_type == "post"]{ _id, title, slug { current } }'
    encoded_query = quote(query)
    
    # URL da API do Strapi
    url = f"https://{strapi_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/data/query/{strapi_DATASET}?query={encoded_query}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {strapi_API_TOKEN}"
    }
    
    try:
        # Fazer a requisição
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extrair resultados
        result = response.json().get("result", [])
        logger.info(f"Total de documentos no Strapi: {len(result)}")
        
        # Criar dicionários para facilitar o acesso
        by_id = {doc["_id"]: doc for doc in result}
        by_title = defaultdict(list)
        for doc in result:
            if "title" in doc:
                by_title[doc["title"]].append(doc)
        
        return {
            "documents": result,
            "by_id": by_id,
            "by_title": by_title
        }
    
    except Exception as e:
        logger.error(f"Erro ao obter documentos do Strapi: {str(e)}")
        sys.exit(1)

def get_algolia_documents():
    """Obtém todos os documentos do Algolia"""
    try:
        # URL da API do Algolia
        url = f"https://{ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/{ALGOLIA_INDEX_NAME}/browse"
        
        # Headers
        headers = {
            "X-Algolia-API-Key": ALGOLIA_API_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID
        }
        
        # Parâmetros
        params = {
            "hitsPerPage": 1000  # Máximo
        }
        
        # Fazer a requisição para obter o cursor
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        hits = data.get("hits", [])
        logger.info(f"Total de documentos no Algolia: {len(hits)}")
        
        # Criar dicionários para facilitar o acesso
        by_objectid = {hit["objectID"]: hit for hit in hits}
        by_title = defaultdict(list)
        for hit in hits:
            if "title" in hit:
                by_title[hit["title"]].append(hit)
        
        return {
            "documents": hits,
            "by_objectid": by_objectid,
            "by_title": by_title
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter documentos do Algolia: {str(e)}")
        sys.exit(1)

def delete_from_algolia(object_ids, dry_run=False):
    """Exclui documentos do Algolia por ID"""
    if not object_ids:
        logger.info("Nenhum documento para excluir")
        return
    
    if dry_run:
        logger.info(f"SIMULAÇÃO: {len(object_ids)} documentos seriam excluídos do Algolia")
        for object_id in object_ids:
            logger.info(f"  {object_id}")
        return
    
    try:
        # URL da API do Algolia
        url = f"https://{ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/{ALGOLIA_INDEX_NAME}/batch"
        
        # Headers
        headers = {
            "X-Algolia-API-Key": ALGOLIA_API_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "Content-Type": "application/json"
        }
        
        # Preparar batch de objetos em grupos de 1000 (limite da API)
        for i in range(0, len(object_ids), 1000):
            batch = object_ids[i:i+1000]
            
            # Preparar payload
            requests_batch = []
            for object_id in batch:
                requests_batch.append({
                    "action": "deleteObject",
                    "body": {
                        "objectID": object_id
                    }
                })
            
            payload = {
                "requests": requests_batch
            }
            
            # Enviar requisição
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Batch {i//1000 + 1}: {len(batch)} documentos excluídos com sucesso (TaskID: {result.get('taskID')})")
            
            # Pequena pausa entre batches para não sobrecarregar a API
            if i + 1000 < len(object_ids):
                time.sleep(1)
        
        logger.info(f"Total de documentos excluídos do Algolia: {len(object_ids)}")
        
    except Exception as e:
        logger.error(f"Erro ao excluir documentos do Algolia: {str(e)}")
        sys.exit(1)

def main():
    # Verificar argumentos
    dry_run = "--dry-run" in sys.argv
    
    if dry_run:
        logger.info("Executando em modo de simulação (--dry-run)")
    
    # Obter documentos do Strapi
    strapi_data = get_strapi_documents()
    
    # Obter documentos do Algolia
    algolia_data = get_algolia_documents()
    
    # 1. Identificar documentos no Algolia que não existem mais no Strapi
    docs_to_delete = []
    
    for object_id in algolia_data["by_objectid"]:
        if object_id not in strapi_data["by_id"]:
            docs_to_delete.append(object_id)
    
    logger.info(f"Documentos no Algolia que não existem no Strapi: {len(docs_to_delete)}")
    
    # 2. Identificar duplicatas por título no Algolia
    duplicate_titles = {}
    
    for title, docs in algolia_data["by_title"].items():
        if len(docs) > 1:
            duplicate_titles[title] = docs
    
    logger.info(f"Títulos com duplicatas no Algolia: {len(duplicate_titles)}")
    
    # Para cada título com duplicatas, manter apenas um e excluir os outros
    for title, docs in duplicate_titles.items():
        # Ordenar por publishedAtTimestamp, preservando o mais recente
        sorted_docs = sorted(docs, key=lambda x: x.get("publishedAtTimestamp", 0), reverse=True)
        
        # Manter o primeiro (mais recente) e excluir os outros
        to_keep = sorted_docs[0]
        to_delete = sorted_docs[1:]
        
        logger.info(f"Título: {title}")
        logger.info(f"  Mantendo: {to_keep['objectID']}")
        
        for doc in to_delete:
            logger.info(f"  Excluindo duplicata: {doc['objectID']}")
            docs_to_delete.append(doc["objectID"])
    
    # Excluir documentos do Algolia
    delete_from_algolia(docs_to_delete, dry_run)
    
    if dry_run:
        logger.info(f"SIMULAÇÃO: {len(docs_to_delete)} documentos seriam excluídos do Algolia")
    else:
        logger.info(f"Total de documentos excluídos do Algolia: {len(docs_to_delete)}")

if __name__ == "__main__":
    main()