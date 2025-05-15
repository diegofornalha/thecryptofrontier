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
import time

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
    
    articles = []
    
    # Lista de URLs de artigos que queremos processar manualmente
    urls = [
        "https://u.today/solana-sol-can-shock-market-bitcoins-btc-explosive-performance-is-coming-shiba-inu-shib-make-it-or",
        "https://u.today/720503612-xrp-moved-as-price-stabilizes-above-2",
        "https://u.today/103-million-bitcoin-transfers-stun-major-crypto-exchange-in-minutes"
    ]
    
    # Limitar ao número máximo de artigos solicitado
    urls = urls[:max_articles]
    
    for i, url in enumerate(urls):
        try:
            logger.info(f"Processando artigo: {url}")
            
            # Extrair conteúdo completo do artigo
            title, summary, content = extrair_conteudo_artigo(url)
            
            if not title or not content:
                logger.warning(f"Não foi possível extrair conteúdo de {url}")
                continue
            
            # Criar o artigo
            article_data = {
                "title": title,
                "link": url,
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
            
            # Pequeno atraso para não sobrecarregar o servidor
            time.sleep(1)
            
        except Exception as e:
            logger.error(f"Erro ao processar artigo {i}: {str(e)}")
    
    logger.info(f"Total de artigos extraídos: {len(articles)}")
    return articles

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
        
        # Extrair título
        title_tag = soup.select_one('h1.page-title')
        title = title_tag.text.strip() if title_tag else "Título não encontrado"
        
        # Extrair resumo
        summary_tag = soup.select_one('div.node__content p')
        summary = summary_tag.text.strip() if summary_tag else ""
        
        # Encontrar o conteúdo do artigo
        content_div = soup.select_one('div.node__content')
        if not content_div:
            return title, summary, "Conteúdo não encontrado"
        
        paragraphs = content_div.select('p')
        content = "\n\n".join([p.text.strip() for p in paragraphs if p.text.strip()])
        
        return title, summary, content
    
    except Exception as e:
        logger.error(f"Erro ao extrair conteúdo do artigo {url}: {str(e)}")
        return None, None, None

def processar_artigo_manual(title, url, content):
    """Processa um artigo manualmente fornecido"""
    try:
        # Criar o artigo
        article_data = {
            "title": title,
            "link": url,
            "summary": content[:200] + "..." if len(content) > 200 else content,
            "content": content,
            "published": datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000"),
            "source": "U.Today",
            "tags": ["Bitcoin", "Cryptocurrency", "Blockchain"],
            "processed_date": datetime.now().isoformat()
        }
        
        # Salvar o artigo
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"para_traduzir_{timestamp}_manual.json"
        filepath = POSTS_PARA_TRADUZIR_DIR / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(article_data, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Artigo manual salvo: {filepath}")
        
        return str(filepath)
    
    except Exception as e:
        logger.error(f"Erro ao processar artigo manual: {str(e)}")
        return None

def main():
    """Função principal para executar o processamento de artigos"""
    if len(sys.argv) > 1:
        max_articles = int(sys.argv[1])
    else:
        max_articles = 3  # Padrão: 3 artigos
    
    logger.info(f"=== INICIANDO PROCESSAMENTO DE ARTIGOS DO U.TODAY (MAX: {max_articles}) ===")
    
    # 1. Extrair artigos do U.Today
    articles = extrair_artigos_utoday(max_articles)
    
    if not articles:
        logger.warning("Não foi possível extrair artigos do U.Today.")
        
        # Usar artigo manual como fallback
        manual_article = processar_artigo_manual(
            title="Solana (SOL) Can Shock Market, Bitcoin's (BTC) Explosive Performance Is Coming, Shiba Inu (SHIB): Make It or Break It",
            url="https://u.today/solana-sol-can-shock-market-bitcoins-btc-explosive-performance-is-coming-shiba-inu-shib-make-it-or",
            content="Renowned cryptocurrency analyst Ali Martinez has provided the crypto community with fresh technical analysis for several major assets, including Solana (SOL), Bitcoin (BTC) and Shiba Inu (SHIB).\n\nSolana: potential market shock?\n\nFor Solana (SOL), Martinez highlighted a significant technical pattern that could surprise the market. According to his analysis, SOL has formed a symmetrical triangle on its four-hour chart – a pattern that typically resolves in a powerful move.\n\nThe cryptocurrency is currently approaching the apex of this formation, suggesting a breakout is imminent. While symmetrical triangles can break in either direction, Martinez points out that SOL has maintained position above its 100 and 200 exponential moving averages (EMAs) – a sign of underlying bullish strength.\n\nThe technical formation suggests SOL could make a 13% move in either direction once a breakout occurs. If bullish, this would push Solana toward the $182 price level, while a bearish resolution would see it drop toward $140.\n\nBitcoin: explosive move ahead?\n\nRegarding Bitcoin, Martinez pointed to a compelling observation: BTC's current price action shows remarkable similarity to its behavior in late 2020, just before its historic bull run to $69,000.\n\nThe analyst emphasized Bitcoin's pattern of calm consolidation periods followed by explosive price performance. This cyclical behavior has been consistent throughout Bitcoin's history, suggesting the market's flagship cryptocurrency may be preparing for another significant upward movement."
        )
        
        if manual_article:
            articles = [manual_article]
        else:
            logger.error("Não foi possível processar nem mesmo o artigo manual de fallback")
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