"""
Ferramentas para trabalhar com feeds RSS
"""

import json
import logging
from datetime import datetime
from crewai.tools import tool
import os
from pathlib import Path

logger = logging.getLogger("rss_tools")

@tool
def read_rss_feeds(feeds_file=None):
    """Lê os feeds RSS configurados e retorna os artigos mais recentes."""
    import feedparser
    
    # Se não for especificado um arquivo, buscar o feeds.json na raiz do projeto
    if not feeds_file:
        # Procurar em locais comuns
        possible_paths = [
            "feeds.json",
            "../feeds.json",
            "../../feeds.json",
            os.path.join(os.path.dirname(__file__), "../..", "feeds.json")
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                feeds_file = path
                break
                
        if not feeds_file or not os.path.exists(feeds_file):
            # Se ainda não encontrou, usar o caminho absoluto baseado no diretório do script
            project_root = Path(__file__).resolve().parents[2]
            feeds_file = project_root / "feeds.json"
    
    logger.info(f"Carregando feeds de: {feeds_file}")
    
    # Carregar configuração de feeds
    try:
        with open(feeds_file, "r") as f:
            feeds_config = json.load(f)
    except Exception as e:
        logger.error(f"Erro ao carregar feeds de {feeds_file}: {str(e)}")
        return {"error": str(e), "feeds": []}
    
    results = []
    
    # Processar cada feed
    feeds_list = feeds_config.get("feeds", [])
    if not feeds_list:
        # Compatibilidade: verificar se feeds_config é uma lista direta de feeds
        feeds_list = feeds_config if isinstance(feeds_config, list) else []
    
    for feed in feeds_list:
        try:
            logger.info(f"Lendo feed: {feed['name']} ({feed['url']})")
            parsed_feed = feedparser.parse(feed["url"])
            
            # Verificar se o feed foi parseado corretamente
            if not hasattr(parsed_feed, "entries"):
                logger.warning(f"Feed sem entradas: {feed['name']}")
                continue
                
            # Processar os últimos 5 artigos do feed
            for i, entry in enumerate(parsed_feed.entries[:5]):
                # Extrair conteúdo do artigo
                content = ""
                if "content" in entry and entry.content:
                    for content_item in entry.content:
                        if content_item.get("type") == "text/html":
                            content += content_item.get("value", "")
                elif "summary" in entry:
                    content = entry.summary
                
                article = {
                    "title": entry.get("title", ""),
                    "link": entry.get("link", ""),
                    "summary": entry.get("summary", ""),
                    "content": content,
                    "published": entry.get("published", ""),
                    "source": feed["name"],
                    "tags": [tag.get("term", "") for tag in entry.get("tags", [])] if hasattr(entry, "tags") else [],
                    "processed_date": datetime.now().isoformat(),
                    "index": i
                }
                results.append(article)
            
            logger.info(f"Feed {feed['name']} processado com sucesso: {len(parsed_feed.entries[:5])} artigos")
            
        except Exception as e:
            logger.error(f"Erro ao processar feed {feed['name']}: {str(e)}")
    
    return results