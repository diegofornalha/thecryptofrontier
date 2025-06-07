#!/usr/bin/env python3
"""
Pipeline Simplificado para Blog Automatizado
Coleta RSS → Traduz → Gera Imagens → Publica no Sanity
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

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler('pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("simple_pipeline")

# Configurações
RSS_FEED = "https://thecryptobasic.com/feed/"
ARTICLE_LIMIT = int(os.environ.get("ARTICLE_LIMIT", "3"))
PROCESSED_FILE = Path("processed_articles.json")
GENERATE_IMAGES = os.environ.get("GENERATE_IMAGES", "false").lower() == "true"

# Diretórios
BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts_processados"
IMAGES_DIR = BASE_DIR / "posts_imagens"
POSTS_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# APIs - inicializadas apenas quando necessário
genai_configured = False
openai_client = None

# Sanity
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID")
SANITY_DATASET = "production"
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_API_VERSION = "2023-05-03"

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
    """Traduz texto usando Gemini"""
    global genai_configured
    if not genai_configured:
        genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
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

def generate_image(title: str, summary: str) -> Optional[str]:
    """Gera imagem usando DALL-E 3"""
    global openai_client
    if not openai_client:
        openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    try:
        # Detectar criptomoeda principal
        crypto_keywords = {
            'bitcoin': 'Bitcoin orange and gold',
            'ethereum': 'Ethereum purple and silver',
            'xrp': 'XRP blue and white',
            'solana': 'Solana purple gradient',
            'cardano': 'Cardano blue',
        }
        
        style = "professional cryptocurrency themed"
        for crypto, color in crypto_keywords.items():
            if crypto in title.lower():
                style = f"{color} themed"
                break
        
        prompt = f"""Create a professional cryptocurrency news image.
Style: Modern, clean, {style}
Elements: Abstract geometric patterns, subtle blockchain networks, digital art
Mood: Professional, trustworthy, innovative
Text overlay: None
Resolution: High quality, sharp details"""
        
        logger.info(f"Gerando imagem para: {title[:50]}...")
        
        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="hd",
            n=1,
        )
        
        image_url = response.data[0].url
        
        # Download da imagem
        img_response = requests.get(image_url)
        img_response.raise_for_status()
        
        # Salvar localmente
        filename = f"crypto_{int(time.time())}_{hashlib.md5(title.encode()).hexdigest()[:8]}.png"
        image_path = IMAGES_DIR / filename
        
        with open(image_path, 'wb') as f:
            f.write(img_response.content)
        
        logger.info(f"Imagem salva: {filename}")
        
        # Upload para Sanity
        return upload_to_sanity(image_path, title)
        
    except Exception as e:
        logger.error(f"Erro ao gerar imagem: {e}")
        return None

def upload_to_sanity(image_path: Path, title: str) -> Optional[str]:
    """Faz upload da imagem para o Sanity"""
    try:
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/assets/images/{SANITY_DATASET}"
        
        with open(image_path, 'rb') as f:
            files = {'file': (image_path.name, f, 'image/png')}
            headers = {'Authorization': f'Bearer {SANITY_API_TOKEN}'}
            
            response = requests.post(url, files=files, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            asset_id = data['document']['_id']
            
            logger.info(f"Imagem enviada para Sanity: {asset_id}")
            return asset_id
            
    except Exception as e:
        logger.error(f"Erro no upload para Sanity: {e}")
        return None

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

def format_content_blocks(content: str) -> List[Dict]:
    """Formata conteúdo em blocos para o Sanity"""
    # Remove tags HTML
    content = re.sub(r'<[^>]+>', '', content)
    
    # Divide em parágrafos
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    
    blocks = []
    for i, para in enumerate(paragraphs[:10]):  # Limita a 10 parágrafos
        if len(para) > 50:  # Ignora parágrafos muito curtos
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

def publish_to_sanity(article: Dict, image_id: Optional[str] = None) -> bool:
    """Publica artigo no Sanity"""
    try:
        doc_id = f"post-{create_slug(article['title_pt'])}"
        
        document = {
            "_type": "post",
            "_id": doc_id,
            "title": article['title_pt'],
            "slug": {
                "_type": "slug",
                "current": create_slug(article['title_pt'])
            },
            "publishedAt": datetime.now().isoformat(),
            "excerpt": article['summary_pt'][:200],
            "content": format_content_blocks(article['content_pt']),
            # Remover categories por enquanto - campo pode não estar no schema
            # "categories": [{
            #     "_type": "reference",
            #     "_ref": "category-crypto-news"
            # }],
            "originalSource": {
                "url": article['link'],
                "title": article['title'],
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
        
        # Envia para Sanity
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SANITY_API_TOKEN}"
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
        logger.error(f"Erro ao publicar no Sanity: {e}")
        return False

def process_article(article: Dict) -> bool:
    """Processa um artigo completo"""
    try:
        logger.info(f"\n{'='*60}")
        logger.info(f"Processando: {article['title']}")
        
        # Sempre salvar o artigo processado, mesmo se falhar depois
        timestamp = int(time.time())
        
        # 1. Traduzir
        logger.info("1. Traduzindo...")
        article['title_pt'] = translate_text(article['title'], is_title=True)
        article['summary_pt'] = translate_text(article['summary'])
        article['content_pt'] = translate_text(article['content'])
        
        # Salvar versão traduzida
        filename = f"post_{timestamp}_{create_slug(article['title_pt'])}.json"
        article['filename'] = filename
        with open(POSTS_DIR / filename, 'w', encoding='utf-8') as f:
            json.dump(article, f, ensure_ascii=False, indent=2)
        logger.info(f"Artigo salvo: {filename}")
        
        # 2. Gerar imagem (opcional)
        image_id = None
        if GENERATE_IMAGES:
            logger.info("2. Gerando imagem...")
            image_id = generate_image(article['title_pt'], article['summary_pt'])
        else:
            logger.info("2. Geração de imagens desativada")
        
        # 3. Publicar
        logger.info("3. Publicando no Sanity...")
        success = publish_to_sanity(article, image_id)
        
        return success
        
    except Exception as e:
        logger.error(f"Erro ao processar artigo: {e}")
        return False

def main():
    """Pipeline principal"""
    logger.info("""
╔══════════════════════════════════════════════════════════════╗
║              PIPELINE SIMPLIFICADO - BLOG CRYPTO             ║
║                                                              ║
║   RSS → Tradução → Imagens → Publicação                      ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar variáveis de ambiente
    required_vars = ["GOOGLE_API_KEY", "OPENAI_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
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
    success_count = 0
    for i, article in enumerate(new_articles[:ARTICLE_LIMIT]):
        logger.info(f"\nArtigo {i+1}/{min(len(new_articles), ARTICLE_LIMIT)}")
        
        if process_article(article):
            success_count += 1
            processed_ids.add(article['id'])
            save_processed_articles(processed_ids)
            
        # Pausa entre artigos
        if i < len(new_articles) - 1:
            time.sleep(5)
    
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