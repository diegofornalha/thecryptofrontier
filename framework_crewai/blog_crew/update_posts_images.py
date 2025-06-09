#!/usr/bin/env python3
"""
Script para atualizar posts publicados com suas imagens correspondentes
"""
import os
import json
import requests
import time
from pathlib import Path
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
SANITY_DATASET = os.getenv("SANITY_DATASET", "production")
SANITY_API_TOKEN = os.getenv("SANITY_API_TOKEN")

def get_posts_without_images():
    """Busca posts sem imagem no Sanity"""
    query = '*[_type == "post" && !defined(mainImage)]{_id, title, slug}'
    
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/{SANITY_DATASET}"
    params = {"query": query}
    headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}"}
    
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code == 200:
        return response.json()["result"]
    else:
        logger.error(f"Erro ao buscar posts: {response.text}")
        return []

def find_image_for_post(post_title):
    """Encontra imagem correspondente ao post"""
    images_dir = Path("posts_imagens")
    
    # Normalizar título para comparação
    title_normalized = post_title.lower().strip()
    
    # Procurar por correspondências
    for image_file in images_dir.glob("*.png"):
        # Extrair título da imagem (formato: bitcoin-test-TIMESTAMP.png)
        image_name = image_file.stem.lower()
        
        # Verificar correspondências parciais
        title_words = title_normalized.split()[:3]  # Primeiras 3 palavras
        
        if any(word in image_name for word in title_words if len(word) > 3):
            logger.info(f"Encontrada imagem para '{post_title}': {image_file.name}")
            return image_file
    
    return None

def upload_image_to_sanity(image_path):
    """Upload de imagem para o Sanity"""
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        upload_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-03-25/assets/images/{SANITY_DATASET}"
        headers = {
            "Authorization": f"Bearer {SANITY_API_TOKEN}",
            "Content-Type": "image/png"
        }
        
        filename = f"crypto-{int(time.time())}-{image_path.name}"
        
        response = requests.post(
            upload_url,
            headers=headers,
            data=image_data,
            params={"filename": filename}
        )
        
        if response.status_code == 200:
            result = response.json()
            asset_id = result["document"]["_id"]
            logger.info(f"Imagem uploaded com sucesso: {asset_id}")
            return asset_id
        else:
            logger.error(f"Erro no upload: {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Erro ao fazer upload da imagem: {e}")
        return None

def update_post_with_image(post_id, image_asset_id, post_title):
    """Atualiza post com a imagem"""
    try:
        mutations = {
            "mutations": [{
                "patch": {
                    "id": post_id,
                    "set": {
                        "mainImage": {
                            "_type": "image",
                            "asset": {
                                "_type": "reference",
                                "_ref": image_asset_id
                            },
                            "alt": f"Imagem ilustrativa: {post_title}",
                            "caption": "Imagem gerada por IA"
                        }
                    }
                }
            }]
        }
        
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/{SANITY_DATASET}"
        headers = {
            "Authorization": f"Bearer {SANITY_API_TOKEN}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=mutations, headers=headers)
        
        if response.status_code == 200:
            logger.info(f"✅ Post '{post_title}' atualizado com imagem!")
            return True
        else:
            logger.error(f"Erro ao atualizar post: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Erro ao atualizar post: {e}")
        return False

def main():
    """Executa o processo de atualização"""
    logger.info("=== Iniciando atualização de imagens nos posts ===")
    
    # 1. Buscar posts sem imagem
    posts = get_posts_without_images()
    logger.info(f"Encontrados {len(posts)} posts sem imagem")
    
    if not posts:
        logger.info("Todos os posts já têm imagem!")
        return
    
    # 2. Para cada post, tentar encontrar e fazer upload da imagem
    updated_count = 0
    
    for post in posts:
        logger.info(f"\nProcessando: {post['title']}")
        
        # Encontrar imagem correspondente
        image_path = find_image_for_post(post['title'])
        
        if not image_path:
            logger.warning(f"Imagem não encontrada para: {post['title']}")
            continue
        
        # Upload da imagem
        asset_id = upload_image_to_sanity(image_path)
        
        if not asset_id:
            logger.error(f"Falha no upload da imagem para: {post['title']}")
            continue
        
        # Atualizar post
        if update_post_with_image(post['_id'], asset_id, post['title']):
            updated_count += 1
            
            # Mover imagem para pasta de processadas
            processed_dir = Path("posts_imagens_processadas")
            processed_dir.mkdir(exist_ok=True)
            
            new_path = processed_dir / image_path.name
            image_path.rename(new_path)
            logger.info(f"Imagem movida para: {new_path}")
        
        # Pequena pausa entre requests
        time.sleep(1)
    
    logger.info(f"\n=== Processo concluído! ===")
    logger.info(f"Posts atualizados: {updated_count}/{len(posts)}")

if __name__ == "__main__":
    main()