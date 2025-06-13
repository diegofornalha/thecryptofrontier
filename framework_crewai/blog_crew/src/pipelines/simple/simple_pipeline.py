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
from bs4 import BeautifulSoup, NavigableString

# Carregar variáveis de ambiente do diretório do projeto
env_path = Path(__file__).parent.parent.parent.parent / '.env'
load_dotenv(env_path)

# Configuração de logging
LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / 'pipeline.log'),
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
        # Usar a nova API key diretamente
        api_key = "AIzaSyALJKZfAQLrHp-pRJmUZDJvESIWYQ8561U"
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
    """Faz upload da imagem para o Sanity usando upload binário"""
    try:
        # URL da API - usando v2021-06-07 como na documentação
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/assets/images/{SANITY_DATASET}"
        
        # Determinar content type baseado na extensão
        content_type = 'image/png' if image_path.suffix.lower() == '.png' else 'image/jpeg'
        
        # Headers com Content-Type específico
        headers = {
            'Authorization': f'Bearer {SANITY_API_TOKEN}',
            'Content-Type': content_type
        }
        
        # Upload binário direto
        with open(image_path, 'rb') as f:
            response = requests.post(url, headers=headers, data=f)
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

def convert_markdown_to_html(text: str) -> str:
    """
    Converte sintaxe Markdown básica para HTML
    Suporta: negrito (**texto**), itálico (*texto*), código (`código`)
    """
    # Processar código inline primeiro para proteger de outras conversões
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    
    # Negrito: **texto** ou __texto__
    text = re.sub(r'\*\*([^\*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'__([^_]+)__', r'<strong>\1</strong>', text)
    
    # Itálico: *texto* ou _texto_ (evitar conflito com negrito)
    text = re.sub(r'(?<!\*)\*([^\*]+)\*(?!\*)', r'<em>\1</em>', text)
    text = re.sub(r'(?<!_)_([^_]+)_(?!_)', r'<em>\1</em>', text)
    
    return text

def process_paragraph_with_links(element) -> Dict:
    """Processa um parágrafo preservando links no formato Sanity"""
    import uuid
    block_key = str(uuid.uuid4())[:8]
    
    block = {
        "_type": "block",
        "_key": block_key,
        "style": "normal",
        "markDefs": [],
        "children": []
    }
    
    span_count = 0
    mark_count = 0
    
    def process_element(el, parent_marks=[]):
        nonlocal span_count, mark_count
        
        if isinstance(el, NavigableString):
            text = str(el)
            if text.strip():
                block["children"].append({
                    "_type": "span",
                    "_key": f"span{span_count}",
                    "text": text,
                    "marks": parent_marks.copy()
                })
                span_count += 1
        
        elif el.name == 'a':
            # Criar markDef para o link
            href = el.get('href', '')
            if href:
                mark_key = f"link{mark_count}"
                mark_def = {
                    "_type": "link",
                    "_key": mark_key,
                    "href": href
                }
                
                # Adicionar target blank se presente
                if el.get('target') == '_blank':
                    mark_def["blank"] = True
                
                block["markDefs"].append(mark_def)
                
                # Processar conteúdo do link com a marca
                new_marks = parent_marks + [mark_key]
                for child in el.children:
                    process_element(child, new_marks)
                
                mark_count += 1
            else:
                # Link sem href, processar como texto normal
                for child in el.children:
                    process_element(child, parent_marks)
        
        elif el.name in ['strong', 'b']:
            new_marks = parent_marks + ['strong']
            for child in el.children:
                process_element(child, new_marks)
        
        elif el.name in ['em', 'i']:
            new_marks = parent_marks + ['em']
            for child in el.children:
                process_element(child, new_marks)
        
        elif el.name == 'code':
            new_marks = parent_marks + ['code']
            for child in el.children:
                process_element(child, new_marks)
        
        else:
            # Outros elementos, processar filhos
            for child in el.children:
                process_element(child, parent_marks)
    
    # Processar todos os filhos do elemento
    for child in element.children:
        process_element(child)
    
    return block

def format_content_blocks(content: str) -> List[Dict]:
    """Formata conteúdo em blocos para o Sanity, preservando imagens e links"""
    # Converter Markdown para HTML primeiro
    content = convert_markdown_to_html(content)
    
    soup = BeautifulSoup(content, 'html.parser')
    
    blocks = []
    block_count = 0
    processed_images = set()  # Para evitar duplicatas
    
    # Processar todos os elementos relevantes
    elements = soup.find_all(['p', 'figure', 'img', 'h1', 'h2', 'h3', 'h4', 'blockquote'])
    
    for element in elements:
        if element.name == 'p':
            # Verificar se tem conteúdo significativo
            if element.get_text(strip=True):
                block = process_paragraph_with_links(element)
                if block["children"]:  # Só adicionar se tiver conteúdo
                    blocks.append(block)
                    block_count += 1
                
        elif element.name in ['figure']:
            # Processar figure com img
            img_tag = element.find('img')
            if img_tag and img_tag.get('src'):
                img_url = img_tag.get('src')
                
                # Evitar duplicatas
                if img_url not in processed_images:
                    processed_images.add(img_url)
                    
                    img_alt = img_tag.get('alt', '')
                    caption_elem = element.find('figcaption')
                    caption = caption_elem.get_text(strip=True) if caption_elem else ''
                    
                    # Criar bloco de imagem do Sanity
                    blocks.append({
                        "_type": "image",
                        "_key": f"image{block_count}",
                        "url": img_url,
                        "alt": img_alt or caption or "Imagem do artigo",
                        "caption": caption if caption else None
                    })
                    block_count += 1
                    
        elif element.name == 'img':
            # Processar img solta (não dentro de figure)
            img_url = element.get('src')
            if img_url and img_url not in processed_images:
                processed_images.add(img_url)
                
                img_alt = element.get('alt', '')
                
                # Criar bloco de imagem do Sanity
                blocks.append({
                    "_type": "image",
                    "_key": f"image{block_count}",
                    "url": img_url,
                    "alt": img_alt or "Imagem do artigo",
                    "caption": None
                })
                block_count += 1
                
        elif element.name in ['h1', 'h2', 'h3', 'h4']:
            text = element.get_text(strip=True)
            if text:
                blocks.append({
                    "_type": "block",
                    "_key": f"block{block_count}",
                    "style": element.name,
                    "markDefs": [],
                    "children": [{
                        "_type": "span",
                        "_key": f"span{block_count}",
                        "text": text,
                        "marks": []
                    }]
                })
                block_count += 1
                
        elif element.name == 'blockquote':
            # Processar blockquote preservando formatação interna
            if element.get_text(strip=True):
                block = process_paragraph_with_links(element)
                block["style"] = "blockquote"
                if block["children"]:
                    blocks.append(block)
                    block_count += 1
    
    # Fallback se não conseguiu processar
    if not blocks:
        text_content = soup.get_text(separator='\n\n', strip=True)
        paragraphs = [p.strip() for p in text_content.split('\n\n') if p.strip() and len(p.strip()) > 50]
        
        for i, para in enumerate(paragraphs[:15]):
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
    required_vars = ["GOOGLE_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
    if GENERATE_IMAGES:
        required_vars.append("OPENAI_API_KEY")
    
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