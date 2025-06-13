#!/usr/bin/env python3
"""
Script para sincronizar diretamente todos os documentos do Sanity para o Algolia,
sem depender da biblioteca algoliasearch.

Uso: python direct_sync_sanity_to_algolia.py
"""

import os
import sys
import requests
import json
from urllib.parse import quote
from datetime import datetime
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("direct_sync")

# Configurações do Sanity
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "z4sx85c6")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

# Configurações do Algolia
ALGOLIA_APP_ID = os.environ.get("ALGOLIA_APP_ID", "42TZWHW8UP")
ALGOLIA_API_KEY = os.environ.get("ALGOLIA_ADMIN_API_KEY", "d0cb55ec8f07832bc5f57da0bd25c535")
ALGOLIA_INDEX_NAME = os.environ.get("ALGOLIA_INDEX_NAME", "development_mcpx_content")

def get_sanity_documents():
    """Obtém todos os documentos do tipo post do Sanity"""
    # Obter token do Sanity
    SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
    if not SANITY_API_TOKEN:
        logger.error("SANITY_API_TOKEN não está definido")
        sys.exit(1)
    
    # Query para obter todos os posts do Sanity com os campos necessários
    query = '''*[_type == "post"]{
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
    encoded_query = quote(query)
    
    # URL da API do Sanity
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}?query={encoded_query}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    try:
        # Fazer a requisição
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extrair resultados
        result = response.json().get("result", [])
        logger.info(f"Total de documentos no Sanity: {len(result)}")
        
        return result
    
    except Exception as e:
        logger.error(f"Erro ao obter documentos do Sanity: {str(e)}")
        sys.exit(1)

def prepare_for_algolia(sanity_docs):
    """Prepara documentos do Sanity para indexação no Algolia"""
    algolia_docs = []
    
    for doc in sanity_docs:
        # Criar documento para o Algolia
        algolia_doc = {
            "objectID": doc["_id"],
            "title": doc.get("title", ""),
            "slug": doc.get("slug", {}).get("current", "") if isinstance(doc.get("slug"), dict) else doc.get("slug", ""),
            "publishedAt": doc.get("publishedAt", ""),
            "excerpt": doc.get("excerpt", ""),
            "author": doc.get("author", ""),
            "categories": doc.get("categories", []),
            "tags": doc.get("tags", []),
            "estimatedReadingTime": doc.get("estimatedReadingTime", 0),
            "originalSource": doc.get("originalSource", {})
        }
        
        # Adicionar timestamp para ordenação
        if algolia_doc["publishedAt"]:
            try:
                dt = datetime.fromisoformat(algolia_doc["publishedAt"].replace("Z", "+00:00"))
                algolia_doc["publishedAtTimestamp"] = int(dt.timestamp())
            except Exception as e:
                logger.warning(f"Erro ao converter data para timestamp: {str(e)}")
        
        algolia_docs.append(algolia_doc)
    
    return algolia_docs

def send_to_algolia(algolia_docs):
    """Envia documentos para o Algolia"""
    if not algolia_docs:
        logger.info("Nenhum documento para enviar ao Algolia")
        return
    
    # URL da API do Algolia
    url = f"https://{ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/{ALGOLIA_INDEX_NAME}/batch"
    
    # Headers
    headers = {
        "X-Algolia-API-Key": ALGOLIA_API_KEY,
        "X-Algolia-Application-Id": ALGOLIA_APP_ID,
        "Content-Type": "application/json"
    }
    
    # Processar em batches de 1000 (limite da API)
    batch_size = 1000
    batches = [algolia_docs[i:i+batch_size] for i in range(0, len(algolia_docs), batch_size)]
    
    for i, batch in enumerate(batches):
        # Preparar requests para o batch
        requests_batch = []
        for doc in batch:
            requests_batch.append({
                "action": "updateObject",
                "body": doc
            })
        
        payload = {
            "requests": requests_batch
        }
        
        try:
            # Enviar batch
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Batch {i+1}/{len(batches)}: {len(batch)} documentos enviados (TaskID: {result.get('taskID')})")
            
        except Exception as e:
            logger.error(f"Erro ao enviar batch {i+1} para o Algolia: {str(e)}")
    
    logger.info(f"Total de documentos enviados para o Algolia: {len(algolia_docs)}")

def main():
    # Obter documentos do Sanity
    sanity_docs = get_sanity_documents()
    
    # Preparar documentos para o Algolia
    algolia_docs = prepare_for_algolia(sanity_docs)
    
    # Enviar documentos para o Algolia
    send_to_algolia(algolia_docs)
    
    logger.info("Sincronização concluída!")

if __name__ == "__main__":
    main()