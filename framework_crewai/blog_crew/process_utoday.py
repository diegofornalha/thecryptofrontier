#!/usr/bin/env python3
"""
Script para processar artigos do U.Today e publicá-los no Sanity CMS.
"""

import os
import json
import logging
import requests
from datetime import datetime
from pathlib import Path
import sys
from urllib.parse import quote
from bs4 import BeautifulSoup

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("utoday_processor")

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

def extrair_artigos_utoday(max_articles=10):
    """Extrai artigos do site U.Today"""
    logger.info("Extraindo artigos do U.Today...")
    
    try:
        # Fazer requisição ao site
        response = requests.get("https://u.today/", headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        })
        response.raise_for_status()
        
        # Parsear o HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Encontrar artigos
        articles = []
        article_tags = soup.select('article.category-item')[:max_articles]
        
        for i, article in enumerate(article_tags):
            try:
                # Extrair título e link
                title_tag = article.select_one('h2.category-item__title a')
                if not title_tag:
                    continue
                    
                title = title_tag.text.strip()
                link = title_tag.get('href')
                if not link.startswith('http'):
                    link = f"https://u.today{link}"
                
                # Extrair resumo
                summary_tag = article.select_one('div.category-item__description')
                summary = summary_tag.text.strip() if summary_tag else ""
                
                # Extrair conteúdo completo do artigo
                content = extrair_conteudo_artigo(link)
                
                # Criar o artigo
                article_data = {
                    "title": title,
                    "link": link,
                    "summary": summary,
                    "content": content,
                    "published": datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000"),
                    "source": "U.Today",
                    "tags": ["Bitcoin", "Cryptocurrency", "Blockchain"],
                    "processed_date": datetime.now().isoformat()
                }
                
                # Salvar o artigo
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                filename = f"para_traduzir_{timestamp}_{i}.json"
                filepath = POSTS_PARA_TRADUZIR_DIR / filename
                
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(article_data, f, ensure_ascii=False, indent=2)
                    
                logger.info(f"Artigo salvo: {filepath}")
                
                articles.append(str(filepath))
            except Exception as e:
                logger.error(f"Erro ao processar artigo {i}: {str(e)}")
        
        logger.info(f"Total de artigos extraídos: {len(articles)}")
        return articles
    
    except Exception as e:
        logger.error(f"Erro ao extrair artigos: {str(e)}")
        return []

def extrair_conteudo_artigo(url):
    """Extrai o conteúdo completo de um artigo"""
    try:
        # Fazer requisição ao artigo
        response = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        })
        response.raise_for_status()
        
        # Parsear o HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Encontrar o conteúdo do artigo
        content_div = soup.select_one('div.node__content')
        if not content_div:
            return "Conteúdo não encontrado"
        
        paragraphs = content_div.select('p')
        content = "\n\n".join([p.text for p in paragraphs])
        
        return content
    
    except Exception as e:
        logger.error(f"Erro ao extrair conteúdo do artigo {url}: {str(e)}")
        return "Erro ao extrair conteúdo"

def main():
    """Função principal para executar o processamento de artigos"""
    if len(sys.argv) > 1:
        max_articles = int(sys.argv[1])
    else:
        max_articles = 5  # Padrão: 5 artigos
    
    logger.info(f"=== INICIANDO PROCESSAMENTO DE ARTIGOS DO U.TODAY (MAX: {max_articles}) ===")
    
    # 1. Extrair artigos do U.Today
    articles = extrair_artigos_utoday(max_articles)
    
    if not articles:
        logger.error("Não foi possível extrair artigos do U.Today")
        sys.exit(1)
    
    # 2. Traduzir artigos
    translated_articles = traduzir_artigos(articles)
    
    # 3. Formatar artigos
    formatted_articles = formatar_artigos(translated_articles)
    
    # 4. Publicar artigos
    publish_results = publicar_artigos(formatted_articles)
    
    # Mostrar resultados
    logger.info("=== PROCESSAMENTO CONCLUÍDO ===")
    logger.info(f"Artigos extraídos: {len(articles)}")
    logger.info(f"Artigos traduzidos: {len(translated_articles)}")
    logger.info(f"Artigos formatados: {len(formatted_articles)}")
    logger.info(f"Artigos publicados: {publish_results['success_count']}")
    logger.info(f"Falhas na publicação: {publish_results['failed_count']}")
    
    # Retornar sucesso/falha
    return 0 if publish_results['failed_count'] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())