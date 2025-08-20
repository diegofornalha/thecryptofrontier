"""
Ferramentas para evitar duplicação de artigos
"""

import logging
from datetime import datetime
import json
import os
from pathlib import Path
from crewai.tools import tool

logger = logging.getLogger("dedupe_tools")

@tool
def check_for_duplicates(articles, blacklist_file=None):
    """
    Verifica e remove duplicatas entre artigos baseado em título, URL e palavras da blacklist.
    
    Args:
        articles: Lista de artigos a verificar (cada artigo deve ser um dicionário com 'title' e 'link')
        blacklist_file: Caminho para arquivo JSON com lista de palavras blacklist (opcional)
        
    Returns:
        dict: Resultado com artigos filtrados e estatísticas
    """
    if not articles:
        return {
            "filtered_articles": [],
            "duplicates_removed": 0,
            "blacklisted_removed": 0
        }
    
    # Carregar palavras da blacklist
    blacklist_keywords = []
    try:
        if blacklist_file and os.path.exists(blacklist_file):
            with open(blacklist_file, 'r', encoding='utf-8') as f:
                blacklist_config = json.load(f)
                blacklist_keywords = blacklist_config.get('settings', {}).get('blacklist_keywords', [])
        else:
            # Tentar carregar da raiz do projeto
            project_root = Path(__file__).resolve().parents[1]
            feeds_file = project_root / 'feeds.json'
            if os.path.exists(feeds_file):
                with open(feeds_file, 'r', encoding='utf-8') as f:
                    blacklist_config = json.load(f)
                    blacklist_keywords = blacklist_config.get('settings', {}).get('blacklist_keywords', [])
            else:
                # Blacklist padrão se não encontrar arquivo
                blacklist_keywords = [
                    "sponsored", "advertisement", "partner content",
                    "LiteFinance", "lite finance", "Partner Application"
                ]
    except Exception as e:
        logger.warning(f"Erro ao carregar blacklist: {str(e)}")
        # Blacklist padrão como fallback
        blacklist_keywords = [
            "sponsored", "advertisement", "partner content",
            "LiteFinance", "lite finance", "Partner Application"
        ]
    
    logger.info(f"Palavras na blacklist: {blacklist_keywords}")
    
    # Conjuntos para rastrear duplicatas
    seen_titles = set()
    seen_urls = set()
    
    filtered_articles = []
    duplicates_removed = 0
    blacklisted_removed = 0
    
    for article in articles:
        title = article.get('title', '').lower()
        url = article.get('link', '')
        
        # Verificar duplicatas por título ou URL
        if title in seen_titles or url in seen_urls:
            logger.info(f"Removendo artigo duplicado: {article.get('title')}")
            duplicates_removed += 1
            continue
        
        # Verificar palavras da blacklist
        should_skip = False
        for keyword in blacklist_keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in title or keyword_lower in article.get('content', '').lower():
                logger.info(f"Removendo artigo com palavra na blacklist: {article.get('title')} (palavra: {keyword})")
                blacklisted_removed += 1
                should_skip = True
                break
        
        if should_skip:
            continue
        
        # Adicionar artigo aprovado
        filtered_articles.append(article)
        seen_titles.add(title)
        seen_urls.add(url)
    
    result = {
        "filtered_articles": filtered_articles,
        "duplicates_removed": duplicates_removed,
        "blacklisted_removed": blacklisted_removed,
        "total_processed": len(articles),
        "total_remaining": len(filtered_articles)
    }
    
    logger.info(f"Total artigos processados: {len(articles)}")
    logger.info(f"Duplicatas removidas: {duplicates_removed}")
    logger.info(f"Artigos na blacklist removidos: {blacklisted_removed}")
    logger.info(f"Artigos restantes: {len(filtered_articles)}")
    
    return result