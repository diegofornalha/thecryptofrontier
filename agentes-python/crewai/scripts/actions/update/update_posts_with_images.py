#!/usr/bin/env python3
"""
Script para atualizar posts existentes no Strapi com suas imagens geradas
"""

import os
import json
import logging
import requests
from pathlib import Path
from datetime import datetime
import re
import unicodedata
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("update_posts_images")

# Strapi config
STRAPI_PROJECT_ID = os.environ.get("STRAPI_PROJECT_ID", "z4sx85c6")
strapi_DATASET = "production"
strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")
strapi_API_VERSION = "2023-05-03"

# Diretórios
IMAGES_DIR = Path("posts_imagens")
PUBLISHED_DIR = Path("posts_publicados")

def get_api_url(endpoint="query"):
    """Retorna URL da API do Strapi"""
    if endpoint == "query":
        return f"https://{STRAPI_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/data/query/{strapi_DATASET}"
    else:
        return f"https://{STRAPI_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/data/mutate/{strapi_DATASET}"

def get_headers():
    """Retorna headers para requisição"""
    headers = {"Content-Type": "application/json"}
    if strapi_API_TOKEN:
        headers["Authorization"] = f"Bearer {strapi_API_TOKEN}"
    return headers

def create_slug(title: str) -> str:
    """Cria slug a partir do título"""
    # Normalizar para remover acentos
    slug = unicodedata.normalize('NFKD', title.lower())
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    # Remover caracteres especiais
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug[:80]

def list_recent_posts(limit=20):
    """Lista posts recentes do Strapi"""
    query = f'*[_type == "post"] | order(publishedAt desc)[0..{limit-1}]{{_id, title, slug, mainImage, publishedAt}}'
    url = f"{get_api_url('query')}?query={query}"
    
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        return response.json().get("result", [])
    else:
        logger.error(f"Erro ao buscar posts: {response.status_code}")
        return []

def upload_image_to_strapi(image_path: Path) -> str:
    """Upload de imagem para o Strapi usando upload binário"""
    try:
        # URL da API - usando v2021-06-07 como na documentação
        url = f"https://{STRAPI_PROJECT_ID}.api.strapi.io/v2021-06-07/assets/images/{strapi_DATASET}"
        
        # Determinar content type baseado na extensão
        content_type = 'image/png' if image_path.suffix.lower() == '.png' else 'image/jpeg'
        
        # Headers com Content-Type específico
        headers = {
            'Authorization': f'Bearer {strapi_API_TOKEN}',
            'Content-Type': content_type
        }
        
        # Upload binário direto
        with open(image_path, 'rb') as f:
            response = requests.post(url, headers=headers, data=f)
            
            if response.status_code == 200:
                data = response.json()
                asset_id = data['document']['_id']
                logger.info(f"✅ Imagem enviada: {asset_id}")
                return asset_id
            else:
                logger.error(f"Erro no upload: {response.status_code}")
                logger.error(f"Resposta: {response.text}")
                return None
                
    except Exception as e:
        logger.error(f"Erro ao fazer upload: {e}")
        return None

def update_post_with_image(post_id: str, image_asset_id: str) -> bool:
    """Atualiza um post existente com uma imagem"""
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
                            "alt": "Imagem do artigo sobre criptomoedas"
                        }
                    }
                }
            }]
        }
        
        response = requests.post(
            get_api_url('mutate'), 
            headers=get_headers(), 
            json=mutations
        )
        
        if response.status_code == 200:
            logger.info(f"✅ Post {post_id} atualizado com imagem!")
            return True
        else:
            logger.error(f"❌ Erro ao atualizar post: {response.status_code}")
            logger.error(response.text)
            return False
            
    except Exception as e:
        logger.error(f"Erro ao atualizar post: {e}")
        return False

def find_matching_image(title: str, timestamp: str = None) -> Path:
    """Tenta encontrar uma imagem correspondente ao post"""
    # Lista todas as imagens disponíveis
    images = sorted(IMAGES_DIR.glob("crypto_*.png"))
    
    if not images:
        return None
    
    # Se temos timestamp do arquivo publicado, tentar encontrar imagem próxima
    if timestamp:
        try:
            # Extrair timestamp do nome do arquivo
            post_timestamp = int(timestamp.split('_')[1])
            
            # Procurar imagem com timestamp próximo (dentro de 5 minutos)
            for image in images:
                match = re.search(r'crypto_(\d+)_', image.name)
                if match:
                    img_timestamp = int(match.group(1))
                    if abs(img_timestamp - post_timestamp) < 300:  # 5 minutos
                        return image
        except:
            pass
    
    # Se não encontrou por timestamp, retornar primeira imagem disponível
    return images[0] if images else None

def main():
    logger.info("""
╔══════════════════════════════════════════════════════════════╗
║       ATUALIZAÇÃO DE POSTS COM IMAGENS GERADAS              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    if not strapi_API_TOKEN:
        logger.error("❌ strapi_API_TOKEN não configurado!")
        return
    
    # 1. Buscar posts recentes do Strapi
    logger.info("📋 Buscando posts recentes do Strapi...")
    posts = list_recent_posts()
    
    # Filtrar posts sem imagem
    posts_sem_imagem = [p for p in posts if not p.get('mainImage')]
    logger.info(f"Encontrados {len(posts_sem_imagem)} posts sem imagem")
    
    if not posts_sem_imagem:
        logger.info("✅ Todos os posts já têm imagem!")
        return
    
    # 2. Listar arquivos publicados
    published_files = list(PUBLISHED_DIR.glob("*.json"))
    logger.info(f"Encontrados {len(published_files)} arquivos publicados")
    
    # 3. Processar cada post sem imagem
    updated_count = 0
    
    for post in posts_sem_imagem:
        try:
            logger.info(f"\n{'='*60}")
            logger.info(f"Post: {post['title']}")
            post_slug = post.get('slug', {}).get('current', '')
            
            # Tentar encontrar arquivo publicado correspondente
            matching_file = None
            for pub_file in published_files:
                with open(pub_file, 'r', encoding='utf-8') as f:
                    pub_data = json.load(f)
                    pub_title_pt = pub_data.get('title_pt', '')
                    
                    # Comparar por slug ou título similar
                    if (create_slug(pub_title_pt) == post_slug or 
                        pub_title_pt.lower() in post['title'].lower() or
                        post['title'].lower() in pub_title_pt.lower()):
                        matching_file = pub_file
                        break
            
            # Encontrar imagem
            if matching_file:
                # Extrair timestamp do nome do arquivo
                timestamp = matching_file.stem
                image_path = find_matching_image(post['title'], timestamp)
            else:
                # Usar qualquer imagem disponível
                image_path = find_matching_image(post['title'])
            
            if image_path:
                logger.info(f"🎨 Usando imagem: {image_path.name}")
                
                # Upload da imagem
                asset_id = upload_image_to_strapi(image_path)
                
                if asset_id:
                    # Atualizar post
                    if update_post_with_image(post['_id'], asset_id):
                        updated_count += 1
                        # Mover imagem para pasta de processadas
                        processed_dir = Path("posts_imagens_usadas")
                        processed_dir.mkdir(exist_ok=True)
                        image_path.rename(processed_dir / image_path.name)
            else:
                logger.warning(f"⚠️  Nenhuma imagem disponível para este post")
                
        except Exception as e:
            logger.error(f"Erro ao processar post: {e}")
    
    # Resumo
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                        CONCLUÍDO                             ║
║                                                              ║
║   Posts atualizados com imagem: {updated_count}/{len(posts_sem_imagem)}                   ║
╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()