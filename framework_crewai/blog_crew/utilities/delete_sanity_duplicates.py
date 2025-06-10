#!/usr/bin/env python3
"""
Script para identificar e excluir artigos duplicados no Sanity CMS.
Este script remove todas as duplicatas, mantendo apenas o documento mais recente de cada título.

Uso: python delete_sanity_duplicates.py [--dry-run]
     --dry-run: apenas mostra as duplicatas, sem excluí-las
"""

import os
import sys
import requests
import json
from urllib.parse import quote
from collections import defaultdict

# Configuração de logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("duplicates_cleaner")

# Configurações do Sanity
PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
DATASET = "production"
API_VERSION = "2023-05-03"

def get_SANITY_API_TOKEN():
    """Obtém o token de API do Sanity das variáveis de ambiente"""
    token = os.environ.get("SANITY_API_TOKEN")
    if not token:
        logger.error("SANITY_API_TOKEN não definido")
        print("Erro: SANITY_API_TOKEN não definido. Defina a variável de ambiente antes de executar o script.")
        sys.exit(1)
    return token

def fetch_all_posts():
    """Obtém todos os posts do Sanity CMS"""
    token = get_SANITY_API_TOKEN()
    
    # Query para obter todos os posts com _id, título e criatedAt
    query = '*[_type == "post"]{_id, title, _createdAt}'
    encoded_query = quote(query)
    
    # URL da API do Sanity
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query={encoded_query}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        # Fazer a requisição
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extrair resultados
        result = response.json().get("result", [])
        logger.info(f"Total de artigos encontrados: {len(result)}")
        
        return result
    except Exception as e:
        logger.error(f"Erro ao buscar posts: {str(e)}")
        sys.exit(1)

def find_duplicates(posts):
    """Identifica posts com títulos duplicados"""
    title_to_posts = defaultdict(list)
    
    # Agrupar posts por título
    for post in posts:
        if post.get("title"):
            title_to_posts[post["title"]].append(post)
    
    # Filtrar apenas os títulos com mais de um post
    duplicates = {title: posts for title, posts in title_to_posts.items() if len(posts) > 1}
    
    return duplicates

def delete_document(document_id):
    """Exclui um documento do Sanity CMS"""
    token = get_SANITY_API_TOKEN()
    
    # URL da API do Sanity
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
    
    # Headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    # Mutation para excluir o documento
    body = {
        "mutations": [
            {
                "delete": {
                    "id": document_id
                }
            }
        ]
    }
    
    try:
        # Fazer a requisição
        response = requests.post(url, headers=headers, json=body)
        response.raise_for_status()
        
        return response.json()
    except Exception as e:
        logger.error(f"Erro ao excluir documento {document_id}: {str(e)}")
        return None

def main():
    # Verificar argumentos
    dry_run = "--dry-run" in sys.argv
    
    if dry_run:
        logger.info("Executando em modo de simulação (--dry-run)")
    
    # Obter todos os posts
    posts = fetch_all_posts()
    
    # Encontrar duplicatas
    duplicates = find_duplicates(posts)
    
    if not duplicates:
        logger.info("Nenhuma duplicata encontrada. Nada a fazer.")
        return
    
    logger.info(f"Encontrados {len(duplicates)} títulos com duplicatas")
    
    # Contador para acompanhar o progresso
    total_deleted = 0
    
    # Processar cada conjunto de duplicatas
    for title, dupe_posts in duplicates.items():
        # Ordenar por data de criação (mais recente primeiro)
        sorted_posts = sorted(dupe_posts, key=lambda x: x.get("_createdAt", ""), reverse=True)
        
        # O primeiro é o mais recente, vamos mantê-lo
        keep = sorted_posts[0]
        to_delete = sorted_posts[1:]
        
        logger.info(f"Título: {title}")
        logger.info(f"  Mantendo: {keep['_id']} (criado em {keep.get('_createdAt', 'data desconhecida')})")
        
        # Processar posts para excluir
        for post in to_delete:
            post_id = post["_id"]
            logger.info(f"  Excluindo: {post_id} (criado em {post.get('_createdAt', 'data desconhecida')})")
            
            if not dry_run:
                result = delete_document(post_id)
                if result:
                    logger.info(f"  Post excluído com sucesso: {post_id}")
                    total_deleted += 1
                else:
                    logger.error(f"  Falha ao excluir post: {post_id}")
    
    # Mostrar resumo
    if dry_run:
        logger.info(f"SIMULAÇÃO: {len(duplicates)} títulos contêm duplicatas, {sum(len(posts)-1 for posts in duplicates.values())} posts seriam excluídos")
    else:
        logger.info(f"Operação concluída: {total_deleted} posts duplicados excluídos")

if __name__ == "__main__":
    main()