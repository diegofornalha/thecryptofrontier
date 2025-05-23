#!/usr/bin/env python3
"""
Script de teste para verificar se o pipeline está pegando apenas artigos novos
"""

import os
import json
import logging
from pathlib import Path

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("test_new_articles")

# Importar funções do run_pipeline
from run_pipeline import obter_artigos_publicados, monitorar_feeds

def main():
    """Testa se o pipeline está funcionando corretamente"""
    logger.info("=== TESTANDO BUSCA DE ARTIGOS NOVOS ===")
    
    # 1. Obter artigos já publicados
    published_titles = obter_artigos_publicados()
    logger.info(f"Artigos já publicados no Sanity: {len(published_titles)}")
    
    # Mostrar alguns títulos como exemplo
    if published_titles:
        sample_titles = list(published_titles)[:5]
        logger.info("Exemplos de títulos já publicados:")
        for title in sample_titles:
            logger.info(f"  - {title}")
    
    # 2. Buscar novos artigos (simulando o pipeline)
    logger.info("\nBuscando artigos do RSS...")
    new_articles = monitorar_feeds(max_articles=5)
    
    logger.info(f"\nArtigos encontrados: {len(new_articles)}")
    
    # 3. Mostrar detalhes dos artigos encontrados
    for article_path in new_articles:
        with open(article_path, "r", encoding="utf-8") as f:
            article = json.load(f)
        logger.info(f"  - {article['title']}")
        logger.info(f"    Fonte: {article['source']}")
        logger.info(f"    Link: {article['link']}")
    
    logger.info("\n=== TESTE CONCLUÍDO ===")
    if new_articles:
        logger.info(f"✅ Encontrados {len(new_articles)} artigos novos (não publicados)")
    else:
        logger.info("⚠️ Nenhum artigo novo encontrado. Todos os artigos podem já estar publicados.")

if __name__ == "__main__":
    main()