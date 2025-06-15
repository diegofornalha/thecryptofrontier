#!/usr/bin/env python3
"""
Script para republicar artigos no Strapi usando os dados já processados
"""

import os
import json
import logging
import requests
from pathlib import Path
from datetime import datetime
import re
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("retry_publish")

# Strapi config
STRAPI_PROJECT_ID = os.environ.get("STRAPI_PROJECT_ID")
strapi_DATASET = "production"
strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")
strapi_API_VERSION = "2023-05-03"

def create_slug(title: str) -> str:
    """Cria slug a partir do título"""
    import unicodedata
    # Normalizar para remover acentos
    slug = unicodedata.normalize('NFKD', title.lower())
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    # Remover caracteres especiais
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug[:80]

def format_content_blocks(content: str) -> list:
    """Formata conteúdo em blocos para o Strapi"""
    # Remove tags HTML
    content = re.sub(r'<[^>]+>', '', content)
    
    # Divide em parágrafos
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    
    blocks = []
    for i, para in enumerate(paragraphs[:10]):
        if len(para) > 50:
            blocks.append({
                "_type": "block",
                "_key": f"block{i}",
                "style": "normal",
                "markDefs": [],
                "children": [{
                    "_type": "span",
                    "_key": f"span{i}",
                    "text": para,
                    "marks": []
                }]
            })
    
    return blocks

def upload_existing_image(image_path: Path, title: str) -> str:
    """Faz upload de imagem existente para o Strapi"""
    try:
        url = f"https://{STRAPI_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/assets/images/{strapi_DATASET}"
        
        with open(image_path, 'rb') as f:
            files = {'file': (image_path.name, f, 'image/png')}
            headers = {'Authorization': f'Bearer {strapi_API_TOKEN}'}
            
            response = requests.post(url, files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                asset_id = data['document']['_id']
                logger.info(f"✅ Imagem enviada: {asset_id}")
                return asset_id
            else:
                logger.error(f"Erro no upload: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        logger.error(f"Erro ao fazer upload: {e}")
        return None

def publish_to_strapi(article: dict, image_path: Path = None) -> bool:
    """Publica artigo no Strapi"""
    try:
        # Upload da imagem primeiro
        image_id = None
        if image_path and image_path.exists():
            logger.info(f"Fazendo upload da imagem: {image_path.name}")
            image_id = upload_existing_image(image_path, article.get('title_pt', article.get('title')))
        
        # Preparar documento
        title = article.get('title_pt', article.get('title'))
        doc_id = f"post-{create_slug(title)}"
        
        document = {
            "_type": "post",
            "_id": doc_id,
            "title": title,
            "slug": {
                "_type": "slug",
                "current": create_slug(title)
            },
            "publishedAt": datetime.now().isoformat() + "Z",
            "excerpt": article.get('summary_pt', article.get('summary', ''))[:200],
            "content": format_content_blocks(article.get('content_pt', article.get('content', ''))),
            "author": {
                "_type": "reference",
                "_ref": "author-default"
            },
            "categories": [{
                "_type": "reference",
                "_ref": "category-crypto-news"
            }],
            "originalSource": {
                "_type": "originalSource",
                "url": article.get('link', ''),
                "title": article.get('title', ''),
                "site": "The Crypto Basic"
            }
        }
        
        # Adiciona imagem se disponível
        if image_id:
            document["mainImage"] = {
                "_type": "image",
                "asset": {
                    "_type": "reference",
                    "_ref": image_id
                }
            }
        
        # Envia para Strapi
        url = f"https://{STRAPI_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/data/mutate/{strapi_DATASET}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {strapi_API_TOKEN}"
        }
        
        mutations = {
            "mutations": [{
                "createOrReplace": document
            }]
        }
        
        response = requests.post(url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            logger.info(f"✅ Publicado: {title}")
            return True
        else:
            logger.error(f"❌ Erro ao publicar: {response.status_code}")
            logger.error(f"Resposta: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Erro ao publicar: {e}")
        return False

def main():
    logger.info("""
╔══════════════════════════════════════════════════════════════╗
║              REPUBLICAÇÃO NO STRAPI                          ║
║                                                              ║
║   Usando artigos e imagens já processados                    ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar credenciais
    if not STRAPI_PROJECT_ID or not strapi_API_TOKEN:
        logger.error("Credenciais do Strapi não configuradas!")
        return
    
    # Diretórios
    posts_dir = Path("posts_processados")
    images_dir = Path("posts_imagens")
    
    # Listar arquivos JSON salvos
    json_files = sorted(posts_dir.glob("*.json")) if posts_dir.exists() else []
    
    if not json_files:
        logger.warning("Nenhum arquivo JSON encontrado em posts_processados/")
        logger.info("Procurando em outros diretórios...")
        
        # Procurar em outros lugares
        for dir_name in [".", "posts_traduzidos", "posts_formatados"]:
            dir_path = Path(dir_name)
            if dir_path.exists():
                files = list(dir_path.glob("post_*.json"))
                if files:
                    json_files = sorted(files)
                    logger.info(f"Encontrados {len(files)} arquivos em {dir_name}")
                    break
    
    if not json_files:
        logger.error("Nenhum arquivo para processar!")
        return
    
    logger.info(f"Encontrados {len(json_files)} arquivos para processar")
    
    # Processar cada arquivo
    success_count = 0
    for i, json_file in enumerate(json_files):
        try:
            logger.info(f"\nProcessando {i+1}/{len(json_files)}: {json_file.name}")
            
            # Ler dados do artigo
            with open(json_file, 'r', encoding='utf-8') as f:
                article = json.load(f)
            
            # Tentar encontrar imagem correspondente
            # Baseado no timestamp ou título
            image_path = None
            
            # Listar imagens disponíveis
            if images_dir.exists():
                # Pular a primeira imagem (bitcoin-test) e usar apenas as crypto_*
                images = sorted(images_dir.glob("crypto_*.png"))
                if i < len(images):
                    image_path = images[i]
                    logger.info(f"Usando imagem: {image_path.name}")
            
            # Publicar
            if publish_to_strapi(article, image_path):
                success_count += 1
                
                # Mover arquivo processado
                processed_dir = Path("posts_publicados")
                processed_dir.mkdir(exist_ok=True)
                
                new_path = processed_dir / f"publicado_{json_file.name}"
                json_file.rename(new_path)
                logger.info(f"Arquivo movido para: {new_path}")
                
        except Exception as e:
            logger.error(f"Erro ao processar {json_file.name}: {e}")
    
    # Resumo
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                        CONCLUÍDO                             ║
║                                                              ║
║   Artigos publicados: {success_count}/{len(json_files)}                           ║
╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()