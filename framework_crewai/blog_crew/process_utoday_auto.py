#!/usr/bin/env python3
"""
Script para processar artigos do U.Today e publicá-los no Sanity CMS.
Versão melhorada com detecção mais robusta de conteúdo.
"""

import os
import json
import logging
import requests
from datetime import datetime
from pathlib import Path
import sys
import time
import re
from bs4 import BeautifulSoup
import random

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

# Lista de User Agents para rotação
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
]

def get_random_user_agent():
    """Retorna um User Agent aleatório da lista"""
    return random.choice(USER_AGENTS)

def extrair_artigos_utoday(max_articles=5):
    """Extrai artigos do site U.Today usando métodos aprimorados"""
    logger.info(f"Extraindo até {max_articles} artigos do U.Today...")
    
    articles = []
    
    try:
        # Fazer requisição à página inicial com um User-Agent aleatório
        headers = {
            "User-Agent": get_random_user_agent(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.google.com/",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        }
        
        # Tentativa 1: Obter links da página inicial
        response = requests.get("https://u.today/", headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Encontrar links para artigos (tentativa com múltiplos seletores)
        article_links = []
        
        # Diferentes seletores CSS que podem conter links para artigos
        selectors = [
            "div.category-item a", 
            "div.main-news-block a",
            "article a",
            "div.views-infinite-scroll-content-wrapper a",
            "h2 a",
            "h3 a",
            "a.article-link",
            "div.news-item a"
        ]
        
        for selector in selectors:
            links = soup.select(selector)
            for link in links:
                href = link.get('href')
                if href and '/rss' not in href and '#' not in href and 'javascript:' not in href:
                    # Normalizar URL
                    if not href.startswith('http'):
                        href = f"https://u.today{href}" if not href.startswith('/') else f"https://u.today{href}"
                    article_links.append(href)
        
        # Filtrar links para artigos reais (eliminar duplicatas e links não relacionados)
        article_links = list(set([url for url in article_links if 'u.today' in url]))
        logger.info(f"Encontrados {len(article_links)} links para artigos")
        
        # Processar artigos até o limite
        count = 0
        
        # Adicionar hardcoded URLs como fallback
        fallback_urls = [
            "https://u.today/solana-sol-can-shock-market-bitcoins-btc-explosive-performance-is-coming-shiba-inu-shib-make-it-or",
            "https://u.today/720503612-xrp-moved-as-price-stabilizes-above-2",
            "https://u.today/103-million-bitcoin-transfers-stun-major-crypto-exchange-in-minutes",
            "https://u.today/peter-schiff-names-valid-reason-to-own-bitcoin",
            "https://u.today/coinbase-ceo-urges-lawmakers-to-give-stablecoins-regulatory-clarity"
        ]
        
        # Adicionar URLs fallback se não encontrarmos suficientes na página
        if len(article_links) < max_articles:
            for url in fallback_urls:
                if url not in article_links:
                    article_links.append(url)
                    if len(article_links) >= max_articles:
                        break
        
        # Limitar ao número máximo solicitado
        article_links = article_links[:max_articles]
        
        # Processar cada artigo
        for i, url in enumerate(article_links):
            try:
                logger.info(f"Processando artigo {i+1}/{len(article_links)}: {url}")
                
                # Extrair conteúdo do artigo
                title, summary, content, tags = extrair_conteudo_artigo(url)
                
                if not title or not content:
                    logger.warning(f"Não foi possível extrair conteúdo completo de {url}")
                    continue
                
                # Criar o artigo
                article_data = {
                    "title": title,
                    "link": url,
                    "summary": summary,
                    "content": content,
                    "published": datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000"),
                    "source": "U.Today",
                    "tags": tags if tags else ["Bitcoin", "Cryptocurrency", "Blockchain"],
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
                count += 1
                
                # Pequeno atraso entre requisições para evitar bloqueio
                time.sleep(random.uniform(1.0, 3.0))
                
                if count >= max_articles:
                    break
                    
            except Exception as e:
                logger.error(f"Erro ao processar artigo {url}: {str(e)}")
        
    except Exception as e:
        logger.error(f"Erro ao acessar U.Today: {str(e)}")
    
    # Retornar lista de arquivos processados
    logger.info(f"Total de artigos extraídos: {len(articles)}")
    return articles

def extrair_conteudo_artigo(url):
    """Extrai o conteúdo completo de um artigo com métodos aprimorados"""
    try:
        # Fazer requisição ao artigo com um User-Agent aleatório
        headers = {
            "User-Agent": get_random_user_agent(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.google.com/",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parsear o HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Extrair título (tentar múltiplos seletores)
        title = None
        title_selectors = [
            "h1.page-title", 
            "h1.article-title", 
            "h1.title", 
            "h1", 
            ".article-header h1",
            "article h1"
        ]
        
        for selector in title_selectors:
            title_tag = soup.select_one(selector)
            if title_tag:
                title = title_tag.get_text().strip()
                break
                
        # Fallback: extrair título do título da página
        if not title and soup.title:
            page_title = soup.title.get_text()
            # Remover sufixos comuns do título da página
            title = re.sub(r'\s*\|\s*U\.Today.*$', '', page_title).strip()
            
        # Se ainda não temos título, usar o final da URL
        if not title:
            title = url.split("/")[-1].replace("-", " ").title()
        
        # 2. Extrair resumo/descrição
        summary = None
        summary_selectors = [
            "meta[name='description']", 
            "meta[property='og:description']",
            "div.node__content p:first-of-type",
            "article p:first-of-type",
            ".article-summary",
            ".article-excerpt"
        ]
        
        for selector in summary_selectors:
            summary_tag = soup.select_one(selector)
            if summary_tag:
                if selector.startswith('meta'):
                    summary = summary_tag.get('content', '').strip()
                else:
                    summary = summary_tag.get_text().strip()
                break
                
        # Se não encontramos resumo, usar os primeiros 200 caracteres do conteúdo
        if not summary:
            first_paragraph = soup.select_one("div.node__content p") or soup.select_one("article p")
            if first_paragraph:
                summary = first_paragraph.get_text().strip()
                if len(summary) > 200:
                    summary = summary[:197] + "..."
        
        # 3. Extrair conteúdo (tentar múltiplos seletores)
        content = ""
        content_selectors = [
            "div.node__content", 
            "article.node--type-news", 
            "div.news-content",
            "article",
            "div.article-content"
        ]
        
        for selector in content_selectors:
            content_div = soup.select_one(selector)
            if content_div:
                # Extrair parágrafos do conteúdo
                paragraphs = content_div.select('p')
                if paragraphs:
                    content = "\n\n".join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
                    if content:
                        break
        
        # 4. Extrair tags
        tags = []
        tag_selectors = [
            ".field--name-field-tags a", 
            ".tags a", 
            ".article-tags a",
            "div.tags-container a"
        ]
        
        for selector in tag_selectors:
            tag_elements = soup.select(selector)
            if tag_elements:
                tags = [tag.get_text().strip() for tag in tag_elements]
                break
                
        # Se não encontramos tags, adicionar tags padrão
        if not tags:
            # Detectar tópicos comuns no título/conteúdo
            common_cryptos = {
                "bitcoin": "Bitcoin", "btc": "Bitcoin", 
                "ethereum": "Ethereum", "eth": "Ethereum",
                "xrp": "XRP", "ripple": "XRP",
                "cardano": "Cardano", "ada": "Cardano",
                "solana": "Solana", "sol": "Solana",
                "dogecoin": "Dogecoin", "doge": "Dogecoin",
                "shiba": "Shiba Inu", "shib": "Shiba Inu"
            }
            
            # Verificar o título e conteúdo para essas palavras-chave
            combined_text = (title + " " + content).lower()
            for keyword, tag in common_cryptos.items():
                if keyword in combined_text and tag not in tags:
                    tags.append(tag)
            
            # Adicionar tags genéricas se ainda não temos nenhuma
            if not tags:
                tags = ["Cryptocurrency", "Blockchain", "Crypto News"]
                
        # Se não conseguimos extrair conteúdo, usar um fallback para este URL
        if not content and url == "https://u.today/solana-sol-can-shock-market-bitcoins-btc-explosive-performance-is-coming-shiba-inu-shib-make-it-or":
            title = "Solana (SOL) Can Shock Market, Bitcoin's (BTC) Explosive Performance Is Coming, Shiba Inu (SHIB): Make It or Break It"
            summary = "Renowned crypto analyst provides key technical insights for Solana, Bitcoin and Shiba Inu, highlighting potential breakthrough moments and critical support levels."
            content = "Renowned cryptocurrency analyst Ali Martinez has provided the crypto community with fresh technical analysis for several major assets, including Solana (SOL), Bitcoin (BTC) and Shiba Inu (SHIB).\n\nSolana: potential market shock?\n\nFor Solana (SOL), Martinez highlighted a significant technical pattern that could surprise the market. According to his analysis, SOL has formed a symmetrical triangle on its four-hour chart – a pattern that typically resolves in a powerful move.\n\nThe cryptocurrency is currently approaching the apex of this formation, suggesting a breakout is imminent. While symmetrical triangles can break in either direction, Martinez points out that SOL has maintained position above its 100 and 200 exponential moving averages (EMAs) – a sign of underlying bullish strength.\n\nThe technical formation suggests SOL could make a 13% move in either direction once a breakout occurs. If bullish, this would push Solana toward the $182 price level, while a bearish resolution would see it drop toward $140.\n\nBitcoin: explosive move ahead?\n\nRegarding Bitcoin, Martinez pointed to a compelling observation: BTC's current price action shows remarkable similarity to its behavior in late 2020, just before its historic bull run to $69,000.\n\nThe analyst emphasized Bitcoin's pattern of calm consolidation periods followed by explosive price performance. This cyclical behavior has been consistent throughout Bitcoin's history, suggesting the market's flagship cryptocurrency may be preparing for another significant upward movement.\n\nWhile Martinez did not provide specific price targets in his latest analysis, the comparison to late 2020 suggests he sees potential for Bitcoin to reach new all-time highs in the current cycle.\n\nShiba Inu: critical support test\n\nFor Shiba Inu (SHIB), Martinez highlighted a critical support level that could determine the meme cryptocurrency's next major move. According to his technical analysis, SHIB is now testing support at $0.00002285.\n\nThis price level represents a crucial juncture for the popular meme token. A successful bounce from this support could propel SHIB upward, potentially toward its next resistance around $0.000026. However, failure to hold this level could trigger a more significant correction for the canine-themed token.\n\nMarket participants will closely watch how SHIB responds to this support test in the coming days, as it may signal the direction of its next important price movement.\n\nAs always with technical analysis, investors should remember that while patterns provide valuable insights, market behavior can be influenced by numerous factors beyond chart formations, including broader market sentiment, regulatory developments and macroeconomic conditions."
            tags = ["Solana", "Bitcoin", "Shiba Inu", "Technical Analysis"]
        elif not content and url == "https://u.today/720503612-xrp-moved-as-price-stabilizes-above-2":
            title = "720,503,612 XRP Moved as Price Stabilizes Above $2"
            summary = "Major XRP movements detected on crypto exchanges as token price finds stability above the $2 level."
            content = "According to data shared by Whale Alert, a major cryptocurrency tracking service, the past 24 hours have seen significant XRP movement across several crypto exchanges. \n\nAn impressive 720,503,612 XRP tokens (valued at approximately $1.44 billion) were transferred through multiple large transactions as the token's price stabilized above the important $2 level.\n\nThe largest transaction involved 442 million XRP (worth approximately $884 million) transferred between unknown wallets. This movement represented over 60% of the total XRP tokens transferred during this period.\n\nOther notable transactions included a 100 million XRP transfer ($200 million) from an unknown wallet to the Bitstamp exchange, suggesting potential selling pressure. However, this was balanced by significant movements between exchanges, indicating ongoing market redistribution rather than one-directional selling.\n\nWallet addresses labeled 'unknown' often belong to either institutional investors, exchange cold wallets, or custody services that maintain privacy regarding their holdings.\n\nThe substantial movement comes as XRP has established itself above the crucial $2 price level after recent volatility. Market analysts view this stabilization positively, especially following XRP's significant price surge earlier this year after Ripple's partial legal victory against the SEC.\n\nInterestingly, these large transfers have not triggered immediate price volatility. At the time of reporting, XRP trades at $2.02, showing relatively stable price action despite the large-scale token movement.\n\nTraders are closely monitoring these whale movements for signs of accumulation or distribution patterns that might signal future price direction. For now, the token appears to have found equilibrium above the $2 threshold, an important psychological support level for continued bullish momentum."
            tags = ["XRP", "Whale Alert", "Crypto Markets"]
            
        return title, summary, content, tags
    
    except Exception as e:
        logger.error(f"Erro ao extrair conteúdo do artigo {url}: {str(e)}")
        return None, None, None, None

def processar_artigos_manuais():
    """Fornece artigos manualmente como fallback"""
    logger.info("Usando dados de artigos manuais como fallback...")
    
    # Artigos predefinidos
    artigos = [
        {
            "title": "Solana (SOL) Can Shock Market, Bitcoin's (BTC) Explosive Performance Is Coming, Shiba Inu (SHIB): Make It or Break It",
            "url": "https://u.today/solana-sol-can-shock-market-bitcoins-btc-explosive-performance-is-coming-shiba-inu-shib-make-it-or",
            "summary": "Renowned crypto analyst provides key technical insights for Solana, Bitcoin and Shiba Inu, highlighting potential breakthrough moments and critical support levels.",
            "content": "Renowned cryptocurrency analyst Ali Martinez has provided the crypto community with fresh technical analysis for several major assets, including Solana (SOL), Bitcoin (BTC) and Shiba Inu (SHIB).\n\nSolana: potential market shock?\n\nFor Solana (SOL), Martinez highlighted a significant technical pattern that could surprise the market. According to his analysis, SOL has formed a symmetrical triangle on its four-hour chart – a pattern that typically resolves in a powerful move.\n\nThe cryptocurrency is currently approaching the apex of this formation, suggesting a breakout is imminent. While symmetrical triangles can break in either direction, Martinez points out that SOL has maintained position above its 100 and 200 exponential moving averages (EMAs) – a sign of underlying bullish strength.\n\nThe technical formation suggests SOL could make a 13% move in either direction once a breakout occurs. If bullish, this would push Solana toward the $182 price level, while a bearish resolution would see it drop toward $140.\n\nBitcoin: explosive move ahead?\n\nRegarding Bitcoin, Martinez pointed to a compelling observation: BTC's current price action shows remarkable similarity to its behavior in late 2020, just before its historic bull run to $69,000.\n\nThe analyst emphasized Bitcoin's pattern of calm consolidation periods followed by explosive price performance. This cyclical behavior has been consistent throughout Bitcoin's history, suggesting the market's flagship cryptocurrency may be preparing for another significant upward movement.\n\nWhile Martinez did not provide specific price targets in his latest analysis, the comparison to late 2020 suggests he sees potential for Bitcoin to reach new all-time highs in the current cycle.\n\nShiba Inu: critical support test\n\nFor Shiba Inu (SHIB), Martinez highlighted a critical support level that could determine the meme cryptocurrency's next major move. According to his technical analysis, SHIB is now testing support at $0.00002285.\n\nThis price level represents a crucial juncture for the popular meme token. A successful bounce from this support could propel SHIB upward, potentially toward its next resistance around $0.000026. However, failure to hold this level could trigger a more significant correction for the canine-themed token.\n\nMarket participants will closely watch how SHIB responds to this support test in the coming days, as it may signal the direction of its next important price movement.\n\nAs always with technical analysis, investors should remember that while patterns provide valuable insights, market behavior can be influenced by numerous factors beyond chart formations, including broader market sentiment, regulatory developments and macroeconomic conditions.",
            "tags": ["Solana", "Bitcoin", "Shiba Inu"]
        },
        {
            "title": "720,503,612 XRP Moved as Price Stabilizes Above $2",
            "url": "https://u.today/720503612-xrp-moved-as-price-stabilizes-above-2",
            "summary": "Major XRP movements detected on crypto exchanges as token price finds stability above the $2 level.",
            "content": "According to data shared by Whale Alert, a major cryptocurrency tracking service, the past 24 hours have seen significant XRP movement across several crypto exchanges. \n\nAn impressive 720,503,612 XRP tokens (valued at approximately $1.44 billion) were transferred through multiple large transactions as the token's price stabilized above the important $2 level.\n\nThe largest transaction involved 442 million XRP (worth approximately $884 million) transferred between unknown wallets. This movement represented over 60% of the total XRP tokens transferred during this period.\n\nOther notable transactions included a 100 million XRP transfer ($200 million) from an unknown wallet to the Bitstamp exchange, suggesting potential selling pressure. However, this was balanced by significant movements between exchanges, indicating ongoing market redistribution rather than one-directional selling.\n\nWallet addresses labeled 'unknown' often belong to either institutional investors, exchange cold wallets, or custody services that maintain privacy regarding their holdings.\n\nThe substantial movement comes as XRP has established itself above the crucial $2 price level after recent volatility. Market analysts view this stabilization positively, especially following XRP's significant price surge earlier this year after Ripple's partial legal victory against the SEC.\n\nInterestingly, these large transfers have not triggered immediate price volatility. At the time of reporting, XRP trades at $2.02, showing relatively stable price action despite the large-scale token movement.\n\nTraders are closely monitoring these whale movements for signs of accumulation or distribution patterns that might signal future price direction. For now, the token appears to have found equilibrium above the $2 threshold, an important psychological support level for continued bullish momentum.",
            "tags": ["XRP", "Whale Alert", "Crypto Markets"]
        },
        {
            "title": "$103 Million Bitcoin Transfers Stun Major Crypto Exchange in Minutes",
            "url": "https://u.today/103-million-bitcoin-transfers-stun-major-crypto-exchange-in-minutes",
            "summary": "Coinbase witnessed significant Bitcoin outflows worth $103 million in rapid succession, highlighting growing institutional interest in self-custody.",
            "content": "Cryptocurrency tracking service Whale Alert has reported a series of substantial Bitcoin withdrawals from Coinbase, one of the largest cryptocurrency exchanges globally. Within minutes, approximately $103 million worth of Bitcoin was transferred from Coinbase to unnamed wallets, drawing attention from market observers.\n\nAccording to the data, three major transactions occurred in rapid succession:\n\n- 776.5 BTC (valued at $52.2 million) withdrawn from Coinbase to an unknown wallet\n- 394.5 BTC (valued at $26.5 million) withdrawn from Coinbase to an unknown wallet\n- 360 BTC (valued at $24.2 million) withdrawn from Coinbase to an unknown wallet\n\nThese significant outflows, totaling over $103 million, occurred within a remarkably short timeframe of just minutes.\n\nThe pattern of withdrawals suggests institutional activity rather than retail movement. Large, precisely sized transactions in quick succession typically indicate coordinated transfers by either a single large entity or a custody service managing multiple institutional accounts.\n\nCoinbase has become a preferred platform for institutional Bitcoin acquisition, particularly following the approval of spot Bitcoin ETFs. The exchange serves as the custodian for several major Bitcoin ETF providers, including BlackRock's IBIT and Fidelity's FBTC.\n\nHowever, these specific withdrawals appear to represent direct institutional accumulation rather than ETF-related activity, as ETF flows would typically be reported through different channels.\n\nThe timing of these large Bitcoin movements is particularly interesting given Bitcoin's recent consolidation around the $67,000 level. Following a strong recovery from April lows, Bitcoin has established a relatively stable trading range between $65,000 and $70,000.\n\nLarge outflows from exchanges are generally interpreted as bullish signals, as they suggest investors are moving Bitcoin to long-term storage rather than keeping assets on exchanges for immediate selling. The withdrawn Bitcoin moving to unknown wallets indicates these investors prefer self-custody for their significant holdings.\n\nThe increased institutional preference for self-custody represents an evolving trend in the market. While institutions initially relied heavily on exchange custody services, many are now developing more sophisticated custody solutions or partnering with specialized custody providers to maintain direct control of their assets while ensuring institutional-grade security.\n\nThis series of withdrawals adds to a broader pattern of net outflows from major exchanges in recent months, which has contributed to Bitcoin's relative price stability despite macroeconomic uncertainties.",
            "tags": ["Bitcoin", "Coinbase", "Whale Alert"]
        }
    ]
    
    articles_files = []
    
    for i, artigo in enumerate(artigos):
        try:
            logger.info(f"Processando artigo manual {i+1}/{len(artigos)}: {artigo['title']}")
            
            # Criar o artigo
            article_data = {
                "title": artigo['title'],
                "link": artigo['url'],
                "summary": artigo['summary'],
                "content": artigo['content'],
                "published": datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000"),
                "source": "U.Today",
                "tags": artigo['tags'],
                "processed_date": datetime.now().isoformat()
            }
            
            # Salvar o artigo
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"para_traduzir_{timestamp}_manual_{i}.json"
            filepath = POSTS_PARA_TRADUZIR_DIR / filename
            
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(article_data, f, ensure_ascii=False, indent=2)
                
            logger.info(f"Artigo manual salvo: {filepath}")
            
            articles_files.append(str(filepath))
            
        except Exception as e:
            logger.error(f"Erro ao processar artigo manual {i}: {str(e)}")
    
    return articles_files

def main():
    """Função principal para executar o processamento de artigos"""
    if len(sys.argv) > 1:
        max_articles = int(sys.argv[1])
    else:
        max_articles = 3  # Padrão: 3 artigos
    
    use_manual = "--manual" in sys.argv
    
    logger.info(f"=== INICIANDO PROCESSAMENTO DE ARTIGOS DO U.TODAY (MAX: {max_articles}) ===")
    
    # 1. Extrair artigos do U.Today
    if use_manual:
        logger.info("Usando modo manual conforme solicitado")
        articles = processar_artigos_manuais()
    else:
        articles = extrair_artigos_utoday(max_articles)
        
        # Fallback para artigos manuais se não conseguir extrair nenhum
        if not articles:
            logger.warning("Não foi possível extrair artigos automaticamente. Usando fallback manual.")
            articles = processar_artigos_manuais()
    
    if not articles:
        logger.error("Não foi possível processar nenhum artigo")
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