#!/usr/bin/env python3
"""
Script para sincronizar diretamente os últimos 10 artigos com Algolia usando requisições HTTP
"""

import os
import json
import logging
import requests
from pathlib import Path
from datetime import datetime
from urllib.parse import quote

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sync_direct")

# Configurações
ALGOLIA_APP_ID = os.environ.get('ALGOLIA_APP_ID', '42TZWHW8UP')
ALGOLIA_ADMIN_API_KEY = os.environ.get('ALGOLIA_ADMIN_API_KEY', 'd0cb55ec8f07832bc5f57da0bd25c535')
ALGOLIA_INDEX_NAME = os.environ.get('ALGOLIA_INDEX_NAME', 'development_mcpx_content')

SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "z4sx85c6")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

def sync_to_algolia(documents):
    """Sincroniza documentos com Algolia usando API REST"""
    url = f"https://{ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/{ALGOLIA_INDEX_NAME}/batch"
    
    headers = {
        "X-Algolia-API-Key": ALGOLIA_ADMIN_API_KEY,
        "X-Algolia-Application-Id": ALGOLIA_APP_ID,
        "Content-Type": "application/json"
    }
    
    # Preparar batch de objetos
    requests_batch = []
    for doc in documents:
        requests_batch.append({
            "action": "updateObject",
            "body": doc
        })
    
    payload = {
        "requests": requests_batch
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    
    return response.json()

def main():
    """Sincroniza os últimos 10 artigos publicados"""
    POSTS_PUBLICADOS_DIR = Path(__file__).parent / "posts_publicados"
    
    # Listar arquivos publicados
    arquivos_publicados = list(POSTS_PUBLICADOS_DIR.glob("publicado_*.json"))
    
    # Ordenar por data de modificação (mais recentes primeiro)
    arquivos_publicados.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    
    # Pegar apenas os últimos 10
    ultimos_10 = arquivos_publicados[:10]
    
    if not ultimos_10:
        logger.info("Nenhum arquivo publicado encontrado")
        return
    
    logger.info(f"Encontrados {len(ultimos_10)} artigos publicados para sincronizar")
    
    # Buscar detalhes dos artigos publicados
    SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
    if not SANITY_API_TOKEN:
        logger.error("Token do Sanity não encontrado")
        return
    
    documents_to_sync = []
    
    for arquivo in ultimos_10:
        try:
            # Ler o arquivo publicado
            with open(arquivo, "r", encoding="utf-8") as f:
                post_data = json.load(f)
            
            title = post_data.get('title')
            
            if not title:
                logger.warning(f"Arquivo sem título: {arquivo}")
                continue
            
            logger.info(f"Processando: {title}")
            
            # Buscar o post no Sanity para obter o _id
            # Escapar título para GROQ
            escaped_title = title.replace('"', '\\"')
            query = f'*[_type == "post" && title == "{escaped_title}"][0]{{ _id, title, slug {{ current }}, publishedAt, excerpt }}'
            encoded_query = quote(query)
            
            url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}?query={encoded_query}"
            headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}"}
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            result = response.json().get("result")
            if not result:
                logger.warning(f"Post não encontrado no Sanity: {title}")
                continue
            
            # Preparar documento para Algolia
            algolia_doc = {
                "objectID": result.get('_id'),
                "title": result.get('title'),
                "slug": result.get('slug', {}).get('current') if isinstance(result.get('slug'), dict) else result.get('slug'),
                "publishedAt": result.get('publishedAt'),
                "excerpt": result.get('excerpt', ''),
                "originalSource": post_data.get('originalSource', {})
            }
            
            # Adicionar timestamp para ordenação
            if algolia_doc['publishedAt']:
                try:
                    dt = datetime.fromisoformat(algolia_doc['publishedAt'].replace('Z', '+00:00'))
                    algolia_doc['publishedAtTimestamp'] = int(dt.timestamp())
                except Exception:
                    pass
            
            documents_to_sync.append(algolia_doc)
            
        except Exception as e:
            logger.error(f"Erro ao processar {arquivo}: {str(e)}")
    
    # Sincronizar com Algolia
    if documents_to_sync:
        try:
            result = sync_to_algolia(documents_to_sync)
            logger.info(f"Sincronização com Algolia concluída: {len(documents_to_sync)} documentos")
            logger.info(f"TaskID: {result.get('taskID')}")
        except Exception as e:
            logger.error(f"Erro ao sincronizar com Algolia: {str(e)}")
    else:
        logger.info("Nenhum documento para sincronizar")

if __name__ == "__main__":
    main()