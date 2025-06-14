#!/usr/bin/env python3
"""
Pipeline Ultra Simplificado - Sem APIs externas
Usa deep-translator para tradução (não requer API key)
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
from deep_translator import GoogleTranslator
from typing import List, Dict, Optional
import hashlib
from dotenv import load_dotenv
from bs4 import BeautifulSoup, NavigableString

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("ultra_simple_pipeline")

# Configurações
RSS_FEED = "https://thecryptobasic.com/feed/"
ARTICLE_LIMIT = int(os.environ.get("ARTICLE_LIMIT", "3"))
PROCESSED_FILE = Path("processed_articles.json")

# Diretórios
BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts_processados"
POSTS_DIR.mkdir(exist_ok=True)

# Strapi
strapi_PROJECT_ID = os.environ.get("strapi_PROJECT_ID", "z4sx85c6")
strapi_DATASET = "production"
strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")
strapi_API_VERSION = "2023-05-03"

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
    
    for entry in feed.entries[:ARTICLE_LIMIT * 2]:  # Pega o dobro para ter margem
        article = {
            'id': entry.get('id', entry.get('link')),
            'title': entry.get('title'),
            'link': entry.get('link'),
            'summary': entry.get('summary', '')[:500],
            'published': entry.get('published'),
            'content': entry.get('content', [{}])[0].get('value', entry.get('summary', ''))
        }
        articles.append(article)
    
    return articles

def translate_text(text: str, is_title: bool = False) -> str:
    """Traduz texto usando deep-translator (sem API key)"""
    try:
        translator = GoogleTranslator(source='en', target='pt')
        
        # Limitar tamanho para evitar problemas
        if len(text) > 5000:
            text = text[:5000]
        
        translated = translator.translate(text)
        return translated if translated else text
    except Exception as e:
        logger.error(f"Erro na tradução: {e}")
        return text

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
    return slug[:80]  # Limita tamanho

def clean_html(text: str) -> str:
    """Remove tags HTML do texto"""
    soup = BeautifulSoup(text, 'html.parser')
    return soup.get_text(separator=' ', strip=True)

def format_content_blocks(content: str) -> List[Dict]:
    """Formata conteúdo em blocos simples para o Strapi"""
    # Limpar HTML primeiro
    clean_content = clean_html(content)
    
    # Dividir em parágrafos
    paragraphs = [p.strip() for p in clean_content.split('\n') if p.strip() and len(p.strip()) > 50]
    
    blocks = []
    for i, para in enumerate(paragraphs[:10]):  # Limitar a 10 parágrafos
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

def publish_to_strapi(article: Dict) -> bool:
    """Publica artigo no Strapi"""
    try:
        doc_id = f"post-{create_slug(article['title_pt'])}"
        
        document = {
            "_type": "post",
            "_id": doc_id,
            "title": article['title_pt'][:99],  # Limitar título
            "slug": {
                "_type": "slug",
                "current": create_slug(article['title_pt'])
            },
            "publishedAt": datetime.now().isoformat(),
            "excerpt": article['summary_pt'][:200],
            "content": format_content_blocks(article['content_pt'])
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
        response.raise_for_status()
        
        logger.info(f"✅ Artigo publicado: {article['title_pt']}")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao publicar no Strapi: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Resposta: {e.response.text}")
        logger.error(f"Token usado: {strapi_API_TOKEN[:20]}...{strapi_API_TOKEN[-10:] if strapi_API_TOKEN else 'NONE'}")
        logger.error(f"URL: {url}")
        return False

def process_article(article: Dict) -> bool:
    """Processa um artigo completo"""
    try:
        logger.info(f"\n{'='*60}")
        logger.info(f"Processando: {article['title']}")
        
        # Sempre salvar o artigo processado, mesmo se falhar depois
        timestamp = int(time.time())
        
        # 1. Traduzir
        logger.info("1. Traduzindo com deep-translator...")
        article['title_pt'] = translate_text(article['title'], is_title=True)
        article['summary_pt'] = translate_text(article['summary'])
        article['content_pt'] = translate_text(article['content'])
        
        # Salvar versão traduzida
        filename = f"post_{timestamp}_{create_slug(article['title_pt'])}.json"
        article['filename'] = filename
        with open(POSTS_DIR / filename, 'w', encoding='utf-8') as f:
            json.dump(article, f, ensure_ascii=False, indent=2)
        logger.info(f"Artigo salvo: {filename}")
        
        # 2. Publicar
        logger.info("2. Publicando no Strapi...")
        success = publish_to_strapi(article)
        
        return success
        
    except Exception as e:
        logger.error(f"Erro ao processar artigo: {e}")
        return False

def main():
    """Pipeline principal"""
    logger.info("""
╔══════════════════════════════════════════════════════════════╗
║            PIPELINE ULTRA SIMPLES - BLOG CRYPTO              ║
║                                                              ║
║   RSS → Tradução (deep-translator) → Publicação              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar variáveis de ambiente
    if not strapi_API_TOKEN:
        logger.error("strapi_API_TOKEN não encontrado no .env")
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
    success_count = 0
    for i, article in enumerate(new_articles[:ARTICLE_LIMIT]):
        logger.info(f"\nArtigo {i+1}/{min(len(new_articles), ARTICLE_LIMIT)}")
        
        if process_article(article):
            success_count += 1
            processed_ids.add(article['id'])
            save_processed_articles(processed_ids)
            
        # Pausa entre artigos
        if i < len(new_articles) - 1:
            time.sleep(2)
    
    # Resumo
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                        PIPELINE CONCLUÍDO                     ║
║                                                              ║
║   Artigos processados: {success_count}/{min(len(new_articles), ARTICLE_LIMIT)}                                 ║
╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()