#!/usr/bin/env python3
"""
Script para publicar todos os 10 artigos com as imagens já geradas
"""

import os
import json
import logging
import feedparser
import requests
from pathlib import Path
from datetime import datetime
import re
import unicodedata
import google.generativeai as genai
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("publish_all")

# APIs
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

# Strapi
strapi_PROJECT_ID = os.environ.get("strapi_PROJECT_ID")
strapi_DATASET = "production"
strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")
strapi_API_VERSION = "2023-05-03"

# Diretórios
IMAGES_DIR = Path("posts_imagens")
POSTS_DIR = Path("posts_processados")
POSTS_DIR.mkdir(exist_ok=True)

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

def translate_text(text: str, is_title: bool = False) -> str:
    """Traduz texto usando Gemini"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""Traduza o seguinte {'título' if is_title else 'texto'} para português brasileiro.
Mantenha termos técnicos em inglês quando apropriado (Bitcoin, blockchain, etc).
{'Seja conciso e impactante.' if is_title else 'Mantenha o tom profissional e informativo.'}

Texto: {text}"""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Erro na tradução: {e}")
        return text

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

def upload_image_to_strapi(image_path: Path) -> str:
    """Upload de imagem para o Strapi usando upload binário"""
    try:
        # URL da API - usando v2021-06-07 como na documentação
        url = f"https://{strapi_PROJECT_ID}.api.strapi.io/v2021-06-07/assets/images/{strapi_DATASET}"
        
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

def publish_to_strapi(article: dict, image_id: str = None) -> bool:
    """Publica artigo no Strapi"""
    try:
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
        url = f"https://{strapi_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/data/mutate/{strapi_DATASET}"
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
║        PUBLICAÇÃO DOS 10 ARTIGOS COM IMAGENS                ║
║                                                              ║
║   Usando imagens já geradas                                  ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # 1. Buscar artigos do RSS
    logger.info("📡 Buscando artigos do feed RSS...")
    feed = feedparser.parse("https://thecryptobasic.com/feed/")
    articles = feed.entries[:10]  # Pegar os 10 primeiros
    
    logger.info(f"Encontrados {len(articles)} artigos")
    
    # 2. Listar imagens disponíveis
    images = sorted(IMAGES_DIR.glob("crypto_*.png"))
    logger.info(f"Encontradas {len(images)} imagens")
    
    # 3. Processar cada artigo
    success_count = 0
    
    for i, entry in enumerate(articles):
        try:
            logger.info(f"\n{'='*60}")
            logger.info(f"Artigo {i+1}/10: {entry.title[:60]}...")
            
            # Preparar dados do artigo
            article = {
                'title': entry.title,
                'link': entry.link,
                'summary': entry.get('summary', '')[:500],
                'content': entry.get('content', [{}])[0].get('value', entry.get('summary', ''))
            }
            
            # Traduzir
            logger.info("🌐 Traduzindo...")
            article['title_pt'] = translate_text(article['title'], is_title=True)
            article['summary_pt'] = translate_text(article['summary'])
            article['content_pt'] = translate_text(article['content'])
            
            # Salvar dados
            filename = f"article_{i+1}_{create_slug(article['title_pt'])}.json"
            with open(POSTS_DIR / filename, 'w', encoding='utf-8') as f:
                json.dump(article, f, ensure_ascii=False, indent=2)
            
            # Upload da imagem (se disponível)
            image_id = None
            if i < len(images):
                logger.info(f"🎨 Fazendo upload da imagem: {images[i].name}")
                image_id = upload_image_to_strapi(images[i])
            
            # Publicar
            logger.info("📤 Publicando no Strapi...")
            if publish_to_strapi(article, image_id):
                success_count += 1
            
        except Exception as e:
            logger.error(f"Erro ao processar artigo {i+1}: {e}")
    
    # Resumo
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                        CONCLUÍDO                             ║
║                                                              ║
║   Artigos publicados: {success_count}/10                             ║
╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()