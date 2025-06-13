#!/usr/bin/env python3
"""
Script para deletar posts do U.Today no Algolia.
"""

import os
import json
import logging
import sys

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("delete_utoday_algolia")

def delete_utoday_from_algolia():
    """Deleta todos os posts do U.Today do Algolia."""
    try:
        # Importação local do Algolia (versão 3.x)
        from algoliasearch.search_client import SearchClient
        
        # Verificar credenciais
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_ADMIN_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            logger.error("Credenciais do Algolia não configuradas")
            return {"success": False, "error": "Credenciais não configuradas"}
        
        # Conectar ao Algolia
        client = SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        # Buscar todos os posts do U.Today
        logger.info("Buscando posts do U.Today no Algolia...")
        
        search_params = {
            'filters': 'source:"U.Today"',
            'hitsPerPage': 1000,  # Máximo permitido
            'attributesToRetrieve': ['objectID', 'title', 'source']
        }
        
        results = index.search('', search_params)
        hits = results.get('hits', [])
        
        logger.info(f"Encontrados {len(hits)} posts do U.Today no Algolia")
        
        if not hits:
            logger.info("Nenhum post do U.Today encontrado no Algolia")
            return {"success": True, "deleted_count": 0, "failed_count": 0}
        
        # Deletar cada post
        deleted_count = 0
        failed_count = 0
        failed_posts = []
        
        for hit in hits:
            object_id = hit.get('objectID')
            title = hit.get('title', 'Sem título')
            
            try:
                logger.info(f"Deletando: {title} (ID: {object_id})")
                
                # Deletar o objeto
                result = index.delete_object(object_id)
                
                deleted_count += 1
                logger.info(f"✓ Post deletado: {title}")
                
            except Exception as e:
                failed_count += 1
                failed_posts.append({
                    "id": object_id,
                    "title": title,
                    "error": str(e)
                })
                logger.error(f"✗ Falha ao deletar: {title} - {str(e)}")
        
        # Aguardar processamento do Algolia
        if deleted_count > 0:
            logger.info("Aguardando processamento do Algolia...")
            index.wait_task(0)  # Wait for the last operation
        
        return {
            "success": failed_count == 0,
            "deleted_count": deleted_count,
            "failed_count": failed_count,
            "failed_posts": failed_posts
        }
        
    except ImportError as e:
        logger.error(f"Erro de importação: {str(e)}")
        return {"success": False, "error": f"Erro de importação: {str(e)}", "deleted_count": 0, "failed_count": 0}
    except Exception as e:
        logger.error(f"Erro ao deletar do Algolia: {str(e)}")
        return {"success": False, "error": str(e), "deleted_count": 0, "failed_count": 0}

def main():
    """Função principal."""
    if len(sys.argv) > 1 and sys.argv[1] == "--confirm":
        confirmed = True
    else:
        print("ATENÇÃO: Esta operação irá deletar TODOS os posts do U.Today no Algolia!")
        print("Isso NÃO pode ser desfeito!")
        print("\nPara confirmar, execute:")
        print("python delete_utoday_algolia.py --confirm")
        return 1
    
    logger.info("=== INICIANDO REMOÇÃO DO U.TODAY DO ALGOLIA ===")
    
    try:
        result = delete_utoday_from_algolia()
        
        logger.info(f"Posts deletados: {result['deleted_count']}")
        logger.info(f"Falhas: {result['failed_count']}")
        
        if result['failed_count'] > 0:
            logger.error("Alguns posts falharam ao ser deletados:")
            for failed_post in result['failed_posts']:
                logger.error(f"  - {failed_post['title']}: {failed_post['error']}")
        
        logger.info("=== REMOÇÃO DO ALGOLIA CONCLUÍDA ===")
        
        if result['success']:
            logger.info("Todos os posts do U.Today foram removidos do Algolia!")
            return 0
        else:
            logger.warning("Remoção concluída com alguns problemas")
            return 1
            
    except Exception as e:
        logger.error(f"Erro durante a remoção: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())