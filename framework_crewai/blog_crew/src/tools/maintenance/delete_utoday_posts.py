#!/usr/bin/env python3
"""
Script para deletar em massa postagens do U.Today no Sanity CMS.
"""

import os
import json
import logging
import requests
import sys
from pathlib import Path
from urllib.parse import quote

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("delete_utoday")

# Configurações do Sanity
PROJECT_ID = "z4sx85c6"
DATASET = "production"
API_VERSION = "2023-05-03"

def get_SANITY_API_TOKEN():
    """Obtém o token de API do Sanity das variáveis de ambiente."""
    token = os.environ.get("SANITY_API_TOKEN")
    if not token:
        raise ValueError("SANITY_API_TOKEN não está definido nas variáveis de ambiente")
    return token

def list_utoday_posts():
    """Lista todas as postagens que vieram do U.Today."""
    try:
        SANITY_API_TOKEN = get_SANITY_API_TOKEN()
        
        # Query GROQ para encontrar posts do U.Today
        query = '*[_type == "post" && source == "U.Today"]{_id, title, source, slug}'
        encoded_query = quote(query)
        
        # URL da API do Sanity
        url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query={encoded_query}"
        
        headers = {
            "Authorization": f"Bearer {SANITY_API_TOKEN}"
        }
        
        logger.info("Buscando posts do U.Today no Sanity...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        result = response.json().get("result", [])
        logger.info(f"Encontrados {len(result)} posts do U.Today")
        
        return result
        
    except Exception as e:
        logger.error(f"Erro ao listar posts do U.Today: {str(e)}")
        return []

def delete_document(document_id):
    """Deleta um documento específico do Sanity."""
    try:
        SANITY_API_TOKEN = get_SANITY_API_TOKEN()
        
        # URL da API do Sanity para mutações
        url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SANITY_API_TOKEN}"
        }
        
        # Mutação para deletar o documento
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
        logger.error(f"Erro ao deletar documento {document_id}: {str(e)}")
        return False, str(e)

def delete_all_utoday_posts():
    """Deleta todos os posts do U.Today."""
    # Listar todos os posts do U.Today
    posts = list_utoday_posts()
    
    if not posts:
        logger.info("Nenhum post do U.Today encontrado para deletar.")
        return {"success": True, "deleted_count": 0, "failed_count": 0}
    
    logger.info(f"Iniciando deleção de {len(posts)} posts do U.Today...")
    
    deleted_count = 0
    failed_count = 0
    failed_posts = []
    
    for post in posts:
        post_id = post.get("_id")
        post_title = post.get("title", "Sem título")
        
        logger.info(f"Deletando: {post_title} (ID: {post_id})")
        
        success, result = delete_document(post_id)
        
        if success:
            deleted_count += 1
            logger.info(f"✓ Post deletado com sucesso: {post_title}")
        else:
            failed_count += 1
            failed_posts.append({
                "id": post_id,
                "title": post_title,
                "error": str(result)
            })
            logger.error(f"✗ Falha ao deletar: {post_title} - {result}")
    
    return {
        "success": failed_count == 0,
        "deleted_count": deleted_count,
        "failed_count": failed_count,
        "failed_posts": failed_posts
    }

def remove_utoday_from_feeds():
    """Remove o U.Today do arquivo feeds.json."""
    try:
        feeds_file = Path(__file__).parent / "feeds.json"
        
        if not feeds_file.exists():
            logger.warning("Arquivo feeds.json não encontrado")
            return False
        
        # Ler o arquivo atual
        with open(feeds_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Filtrar feeds para remover U.Today
        original_feeds = data.get("feeds", [])
        filtered_feeds = [feed for feed in original_feeds if feed.get("name") != "U.Today"]
        
        if len(filtered_feeds) < len(original_feeds):
            data["feeds"] = filtered_feeds
            
            # Salvar o arquivo atualizado
            with open(feeds_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            logger.info("U.Today removido do feeds.json")
            return True
        else:
            logger.info("U.Today não estava no feeds.json")
            return True
            
    except Exception as e:
        logger.error(f"Erro ao remover U.Today do feeds.json: {str(e)}")
        return False

def main():
    """Função principal."""
    if len(sys.argv) > 1 and sys.argv[1] == "--confirm":
        confirmed = True
    else:
        print("ATENÇÃO: Esta operação irá deletar TODOS os posts do U.Today no Sanity!")
        print("Isso NÃO pode ser desfeito!")
        print("\nPara confirmar, execute:")
        print("python delete_utoday_posts.py --confirm")
        return 1
    
    logger.info("=== INICIANDO REMOÇÃO COMPLETA DO U.TODAY ===")
    
    try:
        # 1. Deletar todos os posts do U.Today
        logger.info("1. Deletando posts do U.Today do Sanity...")
        delete_result = delete_all_utoday_posts()
        
        logger.info(f"Posts deletados: {delete_result['deleted_count']}")
        logger.info(f"Falhas: {delete_result['failed_count']}")
        
        if delete_result['failed_count'] > 0:
            logger.error("Alguns posts falharam ao ser deletados:")
            for failed_post in delete_result['failed_posts']:
                logger.error(f"  - {failed_post['title']}: {failed_post['error']}")
        
        # 2. Remover U.Today do feeds.json
        logger.info("2. Removendo U.Today das configurações...")
        feeds_result = remove_utoday_from_feeds()
        
        # 3. Mostrar resumo
        logger.info("=== REMOÇÃO CONCLUÍDA ===")
        logger.info(f"Posts deletados do Sanity: {delete_result['deleted_count']}")
        logger.info(f"Configuração atualizada: {'✓' if feeds_result else '✗'}")
        
        if delete_result['success'] and feeds_result:
            logger.info("U.Today removido completamente do sistema!")
            return 0
        else:
            logger.warning("Remoção concluída com alguns problemas")
            return 1
            
    except Exception as e:
        logger.error(f"Erro durante a remoção: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())