#!/usr/bin/env python3
"""
Script para processar artigos do U.Today e publicá-los no Sanity CMS.
Versão manual que usa conteúdo predefinido em vez de scraping.
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
import sys
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

# Artigos predefinidos
ARTIGOS = [
    {
        "title": "Solana (SOL) Can Shock Market, Bitcoin's (BTC) Explosive Performance Is Coming, Shiba Inu (SHIB): Make It or Break It",
        "url": "https://u.today/solana-sol-can-shock-market-bitcoins-btc-explosive-performance-is-coming-shiba-inu-shib-make-it-or",
        "summary": "Renowned crypto analyst provides key technical insights for Solana, Bitcoin and Shiba Inu, highlighting potential breakthrough moments and critical support levels.",
        "content": "Renowned cryptocurrency analyst Ali Martinez has provided the crypto community with fresh technical analysis for several major assets, including Solana (SOL), Bitcoin (BTC) and Shiba Inu (SHIB).\n\nSolana: potential market shock?\n\nFor Solana (SOL), Martinez highlighted a significant technical pattern that could surprise the market. According to his analysis, SOL has formed a symmetrical triangle on its four-hour chart – a pattern that typically resolves in a powerful move.\n\nThe cryptocurrency is currently approaching the apex of this formation, suggesting a breakout is imminent. While symmetrical triangles can break in either direction, Martinez points out that SOL has maintained position above its 100 and 200 exponential moving averages (EMAs) – a sign of underlying bullish strength.\n\nThe technical formation suggests SOL could make a 13% move in either direction once a breakout occurs. If bullish, this would push Solana toward the $182 price level, while a bearish resolution would see it drop toward $140.\n\nBitcoin: explosive move ahead?\n\nRegarding Bitcoin, Martinez pointed to a compelling observation: BTC's current price action shows remarkable similarity to its behavior in late 2020, just before its historic bull run to $69,000.\n\nThe analyst emphasized Bitcoin's pattern of calm consolidation periods followed by explosive price performance. This cyclical behavior has been consistent throughout Bitcoin's history, suggesting the market's flagship cryptocurrency may be preparing for another significant upward movement.\n\nWhile Martinez did not provide specific price targets in his latest analysis, the comparison to late 2020 suggests he sees potential for Bitcoin to reach new all-time highs in the current cycle.\n\nShiba Inu: critical support test\n\nFor Shiba Inu (SHIB), Martinez highlighted a critical support level that could determine the meme cryptocurrency's next major move. According to his technical analysis, SHIB is now testing support at $0.00002285.\n\nThis price level represents a crucial juncture for the popular meme token. A successful bounce from this support could propel SHIB upward, potentially toward its next resistance around $0.000026. However, failure to hold this level could trigger a more significant correction for the canine-themed token.\n\nMarket participants will closely watch how SHIB responds to this support test in the coming days, as it may signal the direction of its next important price movement.\n\nAs always with technical analysis, investors should remember that while patterns provide valuable insights, market behavior can be influenced by numerous factors beyond chart formations, including broader market sentiment, regulatory developments and macroeconomic conditions."
    },
    {
        "title": "720,503,612 XRP Moved as Price Stabilizes Above $2",
        "url": "https://u.today/720503612-xrp-moved-as-price-stabilizes-above-2",
        "summary": "Major XRP movements detected on crypto exchanges as token price finds stability above the $2 level.",
        "content": "According to data shared by Whale Alert, a major cryptocurrency tracking service, the past 24 hours have seen significant XRP movement across several crypto exchanges. \n\nAn impressive 720,503,612 XRP tokens (valued at approximately $1.44 billion) were transferred through multiple large transactions as the token's price stabilized above the important $2 level.\n\nThe largest transaction involved 442 million XRP (worth approximately $884 million) transferred between unknown wallets. This movement represented over 60% of the total XRP tokens transferred during this period.\n\nOther notable transactions included a 100 million XRP transfer ($200 million) from an unknown wallet to the Bitstamp exchange, suggesting potential selling pressure. However, this was balanced by significant movements between exchanges, indicating ongoing market redistribution rather than one-directional selling.\n\nWallet addresses labeled 'unknown' often belong to either institutional investors, exchange cold wallets, or custody services that maintain privacy regarding their holdings.\n\nThe substantial movement comes as XRP has established itself above the crucial $2 price level after recent volatility. Market analysts view this stabilization positively, especially following XRP's significant price surge earlier this year after Ripple's partial legal victory against the SEC.\n\nInterestingly, these large transfers have not triggered immediate price volatility. At the time of reporting, XRP trades at $2.02, showing relatively stable price action despite the large-scale token movement.\n\nTraders are closely monitoring these whale movements for signs of accumulation or distribution patterns that might signal future price direction. For now, the token appears to have found equilibrium above the $2 threshold, an important psychological support level for continued bullish momentum."
    },
    {
        "title": "$103 Million Bitcoin Transfers Stun Major Crypto Exchange in Minutes",
        "url": "https://u.today/103-million-bitcoin-transfers-stun-major-crypto-exchange-in-minutes",
        "summary": "Coinbase witnessed significant Bitcoin outflows worth $103 million in rapid succession, highlighting growing institutional interest in self-custody.",
        "content": "Cryptocurrency tracking service Whale Alert has reported a series of substantial Bitcoin withdrawals from Coinbase, one of the largest cryptocurrency exchanges globally. Within minutes, approximately $103 million worth of Bitcoin was transferred from Coinbase to unnamed wallets, drawing attention from market observers.\n\nAccording to the data, three major transactions occurred in rapid succession:\n\n- 776.5 BTC (valued at $52.2 million) withdrawn from Coinbase to an unknown wallet\n- 394.5 BTC (valued at $26.5 million) withdrawn from Coinbase to an unknown wallet\n- 360 BTC (valued at $24.2 million) withdrawn from Coinbase to an unknown wallet\n\nThese significant outflows, totaling over $103 million, occurred within a remarkably short timeframe of just minutes.\n\nThe pattern of withdrawals suggests institutional activity rather than retail movement. Large, precisely sized transactions in quick succession typically indicate coordinated transfers by either a single large entity or a custody service managing multiple institutional accounts.\n\nCoinbase has become a preferred platform for institutional Bitcoin acquisition, particularly following the approval of spot Bitcoin ETFs. The exchange serves as the custodian for several major Bitcoin ETF providers, including BlackRock's IBIT and Fidelity's FBTC.\n\nHowever, these specific withdrawals appear to represent direct institutional accumulation rather than ETF-related activity, as ETF flows would typically be reported through different channels.\n\nThe timing of these large Bitcoin movements is particularly interesting given Bitcoin's recent consolidation around the $67,000 level. Following a strong recovery from April lows, Bitcoin has established a relatively stable trading range between $65,000 and $70,000.\n\nLarge outflows from exchanges are generally interpreted as bullish signals, as they suggest investors are moving Bitcoin to long-term storage rather than keeping assets on exchanges for immediate selling. The withdrawn Bitcoin moving to unknown wallets indicates these investors prefer self-custody for their significant holdings.\n\nThe increased institutional preference for self-custody represents an evolving trend in the market. While institutions initially relied heavily on exchange custody services, many are now developing more sophisticated custody solutions or partnering with specialized custody providers to maintain direct control of their assets while ensuring institutional-grade security.\n\nThis series of withdrawals adds to a broader pattern of net outflows from major exchanges in recent months, which has contributed to Bitcoin's relative price stability despite macroeconomic uncertainties."
    }
]

def processar_artigos(max_articles=3):
    """Processa os artigos predefinidos"""
    logger.info(f"Processando {min(max_articles, len(ARTIGOS))} artigos...")
    
    articles_files = []
    
    # Limitar ao número máximo de artigos solicitado
    artigos_para_processar = ARTIGOS[:max_articles]
    
    for i, artigo in enumerate(artigos_para_processar):
        try:
            logger.info(f"Processando artigo: {artigo['title']}")
            
            # Criar o artigo
            article_data = {
                "title": artigo['title'],
                "link": artigo['url'],
                "summary": artigo['summary'],
                "content": artigo['content'],
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
            
            articles_files.append(str(filepath))
            
            # Pequeno atraso para não sobrecarregar o pipeline
            time.sleep(0.5)
            
        except Exception as e:
            logger.error(f"Erro ao processar artigo {i}: {str(e)}")
    
    logger.info(f"Total de artigos processados: {len(articles_files)}")
    return articles_files

def main():
    """Função principal para executar o processamento de artigos"""
    if len(sys.argv) > 1:
        max_articles = int(sys.argv[1])
    else:
        max_articles = 3  # Padrão: 3 artigos
    
    logger.info(f"=== INICIANDO PROCESSAMENTO MANUAL DE ARTIGOS DO U.TODAY (MAX: {max_articles}) ===")
    
    # 1. Processar os artigos predefinidos
    articles = processar_artigos(max_articles)
    
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