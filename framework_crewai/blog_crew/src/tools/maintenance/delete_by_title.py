#!/usr/bin/env python3
"""
Script para deletar posts por título, slug OU ID no Sanity CMS e Algolia.
Busca inteligente que procura por:
- Título do post
- Slug do post  
- ID do documento (Sanity)
"""

import os
import json
import logging
import requests
import sys
from urllib.parse import quote

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("delete_by_title")

# Configurações do Sanity
PROJECT_ID = "uvuq2a47"
DATASET = "production"
API_VERSION = "2023-05-03"

def get_SANITY_API_TOKEN():
    """Obtém o token de API do Sanity das variáveis de ambiente."""
    token = os.environ.get("SANITY_API_TOKEN")
    if not token:
        raise ValueError("SANITY_API_TOKEN não está definido nas variáveis de ambiente")
    return token

def search_posts_by_title_or_slug_sanity(search_term):
    """Busca posts no Sanity pelo título, slug OU ID."""
    try:
        SANITY_API_TOKEN = get_SANITY_API_TOKEN()
        
        # Verificar se é um ID do Sanity (formato específico)
        if len(search_term) > 15 and not "/" in search_term and not " " in search_term:
            # Buscar diretamente por ID
            query = f'*[_type == "post" && _id == "{search_term}"]{{_id, title, slug, source}}'
            logger.info(f"Buscando posts no Sanity por ID: {search_term}")
        else:
            # Query GROQ para buscar posts pelo título OU slug
            query = f'*[_type == "post" && (title match "{search_term}*" || slug.current match "{search_term}*" || title match "*{search_term}*" || slug.current match "*{search_term}*")]{{_id, title, slug, source}}'
            logger.info(f"Buscando posts no Sanity com título/slug: {search_term}")
        
        encoded_query = quote(query)
        
        url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query={encoded_query}"
        
        headers = {
            "Authorization": f"Bearer {SANITY_API_TOKEN}"
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json().get("result", [])
        logger.info(f"Encontrados {len(result)} posts no Sanity")
        
        return result
        
    except Exception as e:
        logger.error(f"Erro ao buscar posts no Sanity: {str(e)}")
        return []

def delete_sanity_document(document_id):
    """Deleta um documento específico do Sanity."""
    try:
        SANITY_API_TOKEN = get_SANITY_API_TOKEN()
        
        url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SANITY_API_TOKEN}"
        }
        
        mutations = {
            "mutations": [
                {
                    "delete": {
                        "id": document_id
                    }
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=mutations)
        response.raise_for_status()
        
        result = response.json()
        
        if "transactionId" in result:
            return True, result.get("transactionId")
        else:
            return False, result
            
    except Exception as e:
        logger.error(f"Erro ao deletar documento Sanity {document_id}: {str(e)}")
        return False, str(e)

def search_posts_by_title_or_slug_algolia(search_term):
    """Busca posts no Algolia pelo título, slug OU ID."""
    try:
        from algoliasearch.search_client import SearchClient
        
        # Verificar credenciais
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_ADMIN_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            logger.error("Credenciais do Algolia não configuradas")
            return []
        
        client = SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        # Verificar se é um ID (formato específico)
        if len(search_term) > 15 and not "/" in search_term and not " " in search_term:
            logger.info(f"Buscando posts no Algolia por ID: {search_term}")
            # Buscar diretamente por objectID
            search_params = {
                'filters': f'objectID:"{search_term}"',
                'hitsPerPage': 100,
                'attributesToRetrieve': ['objectID', 'title', 'source', 'slug']
            }
            results = index.search('', search_params)
            return results.get('hits', [])
        else:
            logger.info(f"Buscando posts no Algolia com título/slug: {search_term}")
            
            search_params = {
                'query': search_term,
                'hitsPerPage': 100,
                'attributesToRetrieve': ['objectID', 'title', 'source', 'slug']
            }
            
            results = index.search('', search_params)
            hits = results.get('hits', [])
            
            # Filtrar por título OU slug similar
            matching_hits = []
            search_lower = search_term.lower()
            
            for hit in hits:
                hit_title = hit.get('title', '').lower()
                hit_slug = hit.get('slug', '').lower()
                
                # Verificar se o termo está no título ou slug
                if (search_lower in hit_title or hit_title in search_lower or 
                    search_lower in hit_slug or hit_slug in search_lower):
                    matching_hits.append(hit)
            
            logger.info(f"Encontrados {len(matching_hits)} posts no Algolia")
            return matching_hits
        
    except ImportError:
        logger.error("Biblioteca algoliasearch não instalada")
        return []
    except Exception as e:
        logger.error(f"Erro ao buscar posts no Algolia: {str(e)}")
        return []

def delete_algolia_object(object_id):
    """Deleta um objeto específico do Algolia."""
    try:
        from algoliasearch.search_client import SearchClient
        
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_ADMIN_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            return False, "Credenciais não configuradas"
        
        client = SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        result = index.delete_object(object_id)
        return True, result
        
    except Exception as e:
        logger.error(f"Erro ao deletar objeto Algolia {object_id}: {str(e)}")
        return False, str(e)

def delete_posts_by_search_term(search_term, confirm=False):
    """Deleta posts pelo título, slug OU ID em ambos os sistemas."""
    if not confirm:
        # Detectar se é um ID
        search_type = "ID" if len(search_term) > 15 and not "/" in search_term and not " " in search_term else "título/slug"
        print(f"ATENÇÃO: Esta operação irá deletar TODOS os posts com {search_type} similar a:")
        print(f"'{search_term}'")
        print("Isso NÃO pode ser desfeito!")
        print("\nPara confirmar, execute:")
        print(f"python delete_by_title.py \"{search_term}\" --confirm")
        return {"success": False, "message": "Operação cancelada"}
    
    # Detectar tipo de busca
    search_type = "ID" if len(search_term) > 15 and not "/" in search_term and not " " in search_term else "TÍTULO/SLUG"
    logger.info(f"=== INICIANDO DELEÇÃO DE POSTS COM {search_type}: {search_term} ===")
    
    results = {
        "sanity": {"deleted": 0, "failed": 0, "posts": []},
        "algolia": {"deleted": 0, "failed": 0, "posts": []}
    }
    
    # 1. Deletar do Sanity
    logger.info("1. Buscando e deletando do Sanity...")
    sanity_posts = search_posts_by_title_or_slug_sanity(search_term)
    
    for post in sanity_posts:
        post_id = post.get("_id")
        post_title = post.get("title", "Sem título")
        post_slug = post.get("slug", {}).get("current", "sem-slug") if post.get("slug") else "sem-slug"
        
        logger.info(f"Deletando do Sanity: {post_title} (slug: {post_slug}, ID: {post_id})")
        
        success, result = delete_sanity_document(post_id)
        
        if success:
            results["sanity"]["deleted"] += 1
            results["sanity"]["posts"].append({
                "id": post_id, 
                "title": post_title, 
                "slug": post_slug,
                "status": "deleted"
            })
            logger.info(f"✓ Deletado do Sanity: {post_title}")
        else:
            results["sanity"]["failed"] += 1
            results["sanity"]["posts"].append({
                "id": post_id, 
                "title": post_title, 
                "slug": post_slug,
                "status": "failed", 
                "error": str(result)
            })
            logger.error(f"✗ Falha no Sanity: {post_title} - {result}")
    
    # 2. Deletar do Algolia
    logger.info("2. Buscando e deletando do Algolia...")
    algolia_posts = search_posts_by_title_or_slug_algolia(search_term)
    
    for post in algolia_posts:
        object_id = post.get("objectID")
        post_title = post.get("title", "Sem título")
        post_slug = post.get("slug", "sem-slug")
        
        logger.info(f"Deletando do Algolia: {post_title} (slug: {post_slug}, ID: {object_id})")
        
        success, result = delete_algolia_object(object_id)
        
        if success:
            results["algolia"]["deleted"] += 1
            results["algolia"]["posts"].append({
                "id": object_id, 
                "title": post_title, 
                "slug": post_slug,
                "status": "deleted"
            })
            logger.info(f"✓ Deletado do Algolia: {post_title}")
        else:
            results["algolia"]["failed"] += 1
            results["algolia"]["posts"].append({
                "id": object_id, 
                "title": post_title, 
                "slug": post_slug,
                "status": "failed", 
                "error": str(result)
            })
            logger.error(f"✗ Falha no Algolia: {post_title} - {result}")
    
    # 3. Resumo
    logger.info("=== RESUMO DA DELEÇÃO ===")
    logger.info(f"Sanity - Deletados: {results['sanity']['deleted']}, Falhas: {results['sanity']['failed']}")
    logger.info(f"Algolia - Deletados: {results['algolia']['deleted']}, Falhas: {results['algolia']['failed']}")
    
    total_deleted = results["sanity"]["deleted"] + results["algolia"]["deleted"]
    total_failed = results["sanity"]["failed"] + results["algolia"]["failed"]
    
    results["success"] = total_failed == 0
    results["total_deleted"] = total_deleted
    results["total_failed"] = total_failed
    
    return results

def main():
    """Função principal."""
    if len(sys.argv) < 2:
        print("Uso: python delete_by_title.py \"Título, Slug ou ID do Post\" [--confirm]")
        print("\nExemplos:")
        print('python delete_by_title.py "Bitcoin Price Analysis" --confirm')
        print('python delete_by_title.py "bitcoin-price-prediction-2024" --confirm')
        print('python delete_by_title.py "yyI2iEG3EcZDDf0Q6thQG8" --confirm  # ID do Sanity')
        print('python delete_by_title.py "solana" --confirm  # Busca qualquer post com "solana" no título ou slug')
        return 1
    
    search_term = sys.argv[1]
    confirm = "--confirm" in sys.argv
    
    try:
        results = delete_posts_by_search_term(search_term, confirm)
        
        if results.get("success"):
            logger.info(f"Deleção concluída com sucesso! Total deletado: {results['total_deleted']}")
            return 0
        elif results.get("message"):
            print(results["message"])
            return 1
        else:
            logger.warning(f"Deleção concluída com problemas. Falhas: {results['total_failed']}")
            return 1
            
    except Exception as e:
        logger.error(f"Erro durante a deleção: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())