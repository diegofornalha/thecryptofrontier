#!/usr/bin/env python3
"""
Script para processar artigos do The Crypto Basic e publicá-los no Sanity CMS.
"""

import os
import json
import logging
import feedparser
import requests
from datetime import datetime
from pathlib import Path
import sys
import time
import re
import random
from bs4 import BeautifulSoup

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cryptobasic_processor")

# Importar o pipeline para tradução, formatação e publicação
from run_pipeline import traduzir_artigos, formatar_artigos, publicar_artigos

# Definir diretórios
SCRIPT_DIR = Path(__file__).parent
POSTS_PARA_TRADUZIR_DIR = SCRIPT_DIR / "posts_para_traduzir"
POSTS_TRADUZIDOS_DIR = SCRIPT_DIR / "posts_traduzidos"
POSTS_FORMATADOS_DIR = SCRIPT_DIR / "posts_formatados"
POSTS_PUBLICADOS_DIR = SCRIPT_DIR / "posts_publicados"

# Criar diretórios se não existirem
POSTS_PARA_TRADUZIR_DIR.mkdir(exist_ok=True)
POSTS_TRADUZIDOS_DIR.mkdir(exist_ok=True)
POSTS_FORMATADOS_DIR.mkdir(exist_ok=True)
POSTS_PUBLICADOS_DIR.mkdir(exist_ok=True)

# Lista de User Agents para rotação
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
]

def get_random_user_agent():
    """Retorna um User Agent aleatório da lista"""
    return random.choice(USER_AGENTS)

def extrair_artigos_de_feed(max_articles=5):
    """Extrai artigos do feed RSS do The Crypto Basic"""
    logger.info(f"Extraindo até {max_articles} artigos do feed The Crypto Basic...")
    
    feed_url = "https://thecryptobasic.com/feed/"
    articles = []
    
    try:
        # Fazer requisição ao feed RSS
        headers = {
            "User-Agent": get_random_user_agent(),
            "Accept": "application/rss+xml, application/xml, application/atom+xml, text/xml",
        }
        
        response = requests.get(feed_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parsear o feed RSS
        feed = feedparser.parse(response.text)
        
        if not hasattr(feed, 'entries') or not feed.entries:
            logger.warning("Não foram encontradas entradas no feed")
            return []
        
        logger.info(f"Encontradas {len(feed.entries)} entradas no feed")
        
        # Limitar ao número máximo de artigos
        entries = feed.entries[:max_articles]
        
        for i, entry in enumerate(entries):
            try:
                logger.info(f"Processando artigo {i+1}/{len(entries)}: {entry.title}")
                
                # Extrair conteúdo do artigo
                content = ""
                if hasattr(entry, 'content') and entry.content:
                    for content_item in entry.content:
                        if content_item.get('type') == 'text/html':
                            content += content_item.get('value', '')
                elif hasattr(entry, 'summary'):
                    content = entry.summary
                
                # Se o conteúdo é HTML, extrair o texto
                if content and re.search(r'<[^>]+>', content):
                    content = extrair_texto_html(content)
                
                # Se o conteúdo ainda estiver vazio, buscar o conteúdo completo do artigo
                if not content:
                    content = extrair_conteudo_artigo(entry.link)
                
                # Criar o artigo
                summary = entry.get('summary', '')
                
                # Limpar HTML do resumo se presente
                if summary and re.search(r'<[^>]+>', summary):
                    summary = extrair_texto_html(summary)
                
                article_data = {
                    "title": entry.get('title', ''),
                    "link": entry.get('link', ''),
                    "summary": summary[:300] + "..." if len(summary) > 300 else summary,
                    "content": content,
                    "published": entry.get('published', datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")),
                    "source": "The Crypto Basic",
                    "tags": extract_tags(entry),
                    "processed_date": datetime.now().isoformat()
                }
                
                # Verificar se temos dados suficientes
                if not article_data["title"] or not article_data["content"]:
                    logger.warning(f"Pulando artigo {i+1} por falta de título ou conteúdo")
                    continue
                
                # Salvar o artigo
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                filename = f"para_traduzir_{timestamp}_{i}.json"
                filepath = POSTS_PARA_TRADUZIR_DIR / filename
                
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(article_data, f, ensure_ascii=False, indent=2)
                    
                logger.info(f"Artigo salvo: {filepath}")
                
                articles.append(str(filepath))
                
                # Pequeno atraso entre requisições
                time.sleep(random.uniform(0.5, 1.5))
                
            except Exception as e:
                logger.error(f"Erro ao processar artigo {i+1}: {str(e)}")
        
    except Exception as e:
        logger.error(f"Erro ao extrair artigos do feed: {str(e)}")
    
    logger.info(f"Total de artigos extraídos: {len(articles)}")
    return articles

def extract_tags(entry):
    """Extrai tags de uma entrada de feed"""
    tags = []
    
    # Tentar diferentes atributos onde as tags podem estar
    if hasattr(entry, 'tags'):
        tags = [tag.get('term', '') for tag in entry.tags]
    elif hasattr(entry, 'categories'):
        tags = entry.categories
    
    # Filtrar tags vazias
    tags = [tag for tag in tags if tag]
    
    # Se não encontramos tags, extrair palavras-chave comuns do título
    if not tags:
        common_cryptos = {
            "bitcoin": "Bitcoin", "btc": "Bitcoin", 
            "ethereum": "Ethereum", "eth": "Ethereum",
            "xrp": "XRP", "ripple": "XRP",
            "cardano": "Cardano", "ada": "Cardano",
            "solana": "Solana", "sol": "Solana",
            "dogecoin": "Dogecoin", "doge": "Dogecoin",
            "shiba": "Shiba Inu", "shib": "Shiba Inu"
        }
        
        title_lower = entry.title.lower()
        for keyword, tag in common_cryptos.items():
            if keyword in title_lower:
                tags.append(tag)
    
    # Adicionar tags genéricas se não encontramos nenhuma
    if not tags:
        tags = ["Cryptocurrency", "Blockchain", "Crypto News"]
    
    return tags

def extrair_texto_html(html_content):
    """Extrai texto de conteúdo HTML"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remover elementos script e style
        for script in soup(["script", "style"]):
            script.extract()
        
        # Extrair texto
        text = soup.get_text(separator="\n\n", strip=True)
        
        # Remover espaços em branco extras
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return "\n\n".join(lines)
        
    except Exception as e:
        logger.error(f"Erro ao extrair texto de HTML: {str(e)}")
        return html_content

def extrair_conteudo_artigo(url):
    """Extrai o conteúdo completo de um artigo"""
    try:
        # Fazer requisição ao artigo
        headers = {
            "User-Agent": get_random_user_agent(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parsear o HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Encontrar o conteúdo do artigo (diferentes seletores para maior chance de sucesso)
        content_selectors = [
            'div.entry-content',
            'article.post', 
            'div.post-content',
            'div.article-content',
            'div.content',
            'main'
        ]
        
        content_html = None
        for selector in content_selectors:
            content_div = soup.select_one(selector)
            if content_div:
                # Remover elementos de navegação, anúncios, etc.
                for el in content_div.select('.navigation, .wp-block-buttons, .addtoany_share_save_container, .comments-area, .yarpp-related'):
                    el.extract()
                
                content_html = str(content_div)
                break
        
        if not content_html:
            logger.warning(f"Não foi possível encontrar o conteúdo do artigo em {url}")
            return ""
        
        # Extrair texto do HTML
        return extrair_texto_html(content_html)
        
    except Exception as e:
        logger.error(f"Erro ao extrair conteúdo do artigo {url}: {str(e)}")
        return ""

def main():
    """Função principal para executar o processamento de artigos"""
    if len(sys.argv) > 1:
        max_articles = int(sys.argv[1])
    else:
        max_articles = 3  # Padrão: 3 artigos
    
    logger.info(f"=== INICIANDO PROCESSAMENTO DE ARTIGOS DO THE CRYPTO BASIC (MAX: {max_articles}) ===")
    
    # 1. Extrair artigos do feed
    articles = extrair_artigos_de_feed(max_articles)
    
    if not articles:
        logger.error("Não foi possível extrair nenhum artigo")
        sys.exit(1)
    
    # 2. Traduzir artigos
    translated_articles = traduzir_artigos(articles)
    
    # 3. Formatar artigos
    formatted_articles = formatar_artigos(translated_articles)
    
    # 4. Publicar artigos
    publish_results = publicar_artigos(formatted_articles)
    
    # Mostrar resultados
    logger.info("=== PROCESSAMENTO CONCLUÍDO ===")
    logger.info(f"Artigos processados: {len(articles)}")
    logger.info(f"Artigos traduzidos: {len(translated_articles)}")
    logger.info(f"Artigos formatados: {len(formatted_articles)}")
    logger.info(f"Artigos publicados: {publish_results['success_count']}")
    logger.info(f"Falhas na publicação: {publish_results['failed_count']}")
    
    # Retornar sucesso/falha
    return 0 if publish_results['failed_count'] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())