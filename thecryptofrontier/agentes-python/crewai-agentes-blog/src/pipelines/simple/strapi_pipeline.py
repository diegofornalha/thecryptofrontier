#!/usr/bin/env python3
"""
Pipeline Simplificado para Blog Automatizado - Versão Strapi
Coleta RSS → Traduz → Gera Imagens → Publica no Strapi (Open Source)
"""

import os
import json
import logging
import feedparser
import requests
from datetime import datetime
from pathlib import Path
import time
import re
import google.generativeai as genai
from openai import OpenAI
from typing import List, Dict, Optional
import hashlib
from dotenv import load_dotenv
from bs4 import BeautifulSoup, NavigableString

# Carregar variáveis de ambiente
env_path = Path(__file__).parent.parent.parent.parent / '.env'
load_dotenv(env_path)

# Configuração de logging
LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / 'strapi_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("strapi_pipeline")

# Configurações
RSS_FEED = "https://thecryptobasic.com/feed/"
ARTICLE_LIMIT = int(os.environ.get("ARTICLE_LIMIT", "10"))
PROCESSED_FILE = Path("processed_articles_strapi.json")
GENERATE_IMAGES = os.environ.get("GENERATE_IMAGES", "false").lower() == "true"

# Diretórios
BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts_processados"
IMAGES_DIR = BASE_DIR / "posts_imagens"
POSTS_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# APIs
genai_configured = False
openai_client = None

# Strapi Configuration
STRAPI_URL = os.environ.get("STRAPI_URL", "http://localhost:1337")
STRAPI_API_TOKEN = os.environ.get("STRAPI_API_TOKEN", "")

def load_processed_articles() -> set:
    """Carrega IDs de artigos já processados"""
    if PROCESSED_FILE.exists():
        with open(PROCESSED_FILE, 'r') as f:
            data = json.load(f)
            return set(data.get('ids', []))
    return set()

def save_processed_articles(ids: set):
    """Salva IDs de artigos processados"""
    with open(PROCESSED_FILE, 'w') as f:
        json.dump({'ids': list(ids), 'updated': datetime.now().isoformat()}, f)

def fetch_rss_articles() -> List[Dict]:
    """Busca artigos do feed RSS"""
    logger.info(f"Buscando artigos de {RSS_FEED}")
    feed = feedparser.parse(RSS_FEED)
    
    articles = []
    for entry in feed.entries[:ARTICLE_LIMIT]:
        article = {
            'id': hashlib.md5(entry.link.encode()).hexdigest(),
            'title': entry.title,
            'link': entry.link,
            'published': entry.published if hasattr(entry, 'published') else datetime.now().isoformat(),
            'summary': entry.summary if hasattr(entry, 'summary') else '',
            'content': entry.content[0].value if hasattr(entry, 'content') else entry.summary
        }
        articles.append(article)
    
    return articles

def translate_text(text: str, is_title: bool = False) -> str:
    """Traduz texto usando Gemini"""
    global genai_configured
    if not genai_configured:
        api_key = os.environ.get("GOOGLE_API_KEY") or "AIzaSyALJKZfAQLrHp-pRJmUZDJvESIWYQ8561U"
        genai.configure(api_key=api_key)
        genai_configured = True
    
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

def create_slug(title: str) -> str:
    """Cria slug a partir do título"""
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug[:200]

def upload_image_to_strapi(image_path: Path) -> Optional[int]:
    """Faz upload de imagem para o Strapi"""
    try:
        with open(image_path, 'rb') as f:
            files = {'files': (image_path.name, f, 'image/jpeg')}
            headers = {
                'Authorization': f'Bearer {STRAPI_API_TOKEN}'
            } if STRAPI_API_TOKEN else {}
            
            response = requests.post(
                f"{STRAPI_URL}/api/upload",
                files=files,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0]['id'] if data else None
    except Exception as e:
        logger.error(f"Erro no upload da imagem: {e}")
    
    return None

def publish_to_strapi(article: Dict, image_id: Optional[int] = None) -> bool:
    """Publica artigo no Strapi"""
    try:
        # Preparar dados do artigo
        article_data = {
            "data": {
                "title": article['title_pt'],
                "slug": create_slug(article['title_pt']),
                "content": article['content_pt'],
                "excerpt": article['summary_pt'][:200],
                "publishedAt": datetime.now().isoformat(),
                "status": "published",
                "originalSource": {
                    "url": article['link'],
                    "title": article['title'],
                    "site": "The Crypto Basic"
                }
            }
        }
        
        # Adicionar imagem se disponível
        if image_id:
            article_data['data']['featuredImage'] = image_id
        
        # Headers
        headers = {
            'Content-Type': 'application/json'
        }
        
        if STRAPI_API_TOKEN:
            headers['Authorization'] = f'Bearer {STRAPI_API_TOKEN}'
        
        # Enviar para Strapi
        response = requests.post(
            f"{STRAPI_URL}/api/articles",
            json=article_data,
            headers=headers
        )
        
        if response.status_code in [200, 201]:
            logger.info(f"✅ Artigo publicado no Strapi: {article['title_pt']}")
            return True
        else:
            logger.error(f"Erro ao publicar no Strapi: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Erro ao publicar no Strapi: {e}")
        return False

def process_article(article: Dict) -> Dict:
    """Processa um artigo completo"""
    logger.info(f"Processando: {article['title']}")
    
    # 1. Traduzir
    logger.info("1. Traduzindo...")
    article['title_pt'] = translate_text(article['title'], is_title=True)
    article['summary_pt'] = translate_text(article['summary'])
    article['content_pt'] = translate_text(article['content'])
    
    # 2. Salvar JSON local
    timestamp = int(datetime.now().timestamp())
    filename = f"post_{timestamp}_{create_slug(article['title_pt'])}.json"
    filepath = POSTS_DIR / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(article, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Artigo salvo: {filename}")
    
    # 3. Gerar imagem (se habilitado)
    image_id = None
    if GENERATE_IMAGES:
        logger.info("2. Gerando imagem...")
        # Aqui você pode adicionar a lógica de geração de imagem
        # image_path = generate_image(article['title_pt'], article['summary_pt'])
        # if image_path:
        #     image_id = upload_image_to_strapi(image_path)
    else:
        logger.info("2. Geração de imagens desativada")
    
    # 4. Publicar no Strapi
    logger.info("3. Publicando no Strapi...")
    success = publish_to_strapi(article, image_id)
    
    return {'success': success, 'article': article}

def main():
    """Função principal do pipeline"""
    logger.info("""
╔══════════════════════════════════════════════════════════════╗
║              PIPELINE SIMPLIFICADO - STRAPI CMS              ║
║                                                              ║
║   RSS → Tradução → Imagens → Publicação (Open Source)        ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar variáveis de ambiente
    required_vars = ["GOOGLE_API_KEY"]
    if GENERATE_IMAGES:
        required_vars.append("OPENAI_API_KEY")
    
    # Strapi pode funcionar sem token em desenvolvimento
    missing = [var for var in required_vars if not os.environ.get(var)]
    
    if missing:
        logger.error(f"Variáveis de ambiente faltando: {', '.join(missing)}")
        return
    
    # Carregar artigos processados
    processed_ids = load_processed_articles()
    
    # Buscar artigos
    articles = fetch_rss_articles()
    logger.info(f"Encontrados {len(articles)} artigos no feed")
    
    # Filtrar não processados
    new_articles = [a for a in articles if a['id'] not in processed_ids]
    logger.info(f"{len(new_articles)} artigos novos para processar")
    
    # Processar artigos
    processed_count = 0
    for i, article in enumerate(new_articles[:ARTICLE_LIMIT], 1):
        logger.info(f"\nArtigo {i}/{min(len(new_articles), ARTICLE_LIMIT)}")
        logger.info("=" * 60)
        
        result = process_article(article)
        if result['success']:
            processed_ids.add(article['id'])
            processed_count += 1
            save_processed_articles(processed_ids)
        
        # Delay entre artigos
        if i < min(len(new_articles), ARTICLE_LIMIT):
            time.sleep(5)
    
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                        PIPELINE CONCLUÍDO                     ║
║                                                              ║
║   Artigos processados: {processed_count}/{min(len(new_articles), ARTICLE_LIMIT)}                                 ║
╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()