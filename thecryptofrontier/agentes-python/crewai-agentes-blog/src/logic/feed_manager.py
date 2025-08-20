"""
Gerenciador de feeds RSS para o blog
"""

import json
import logging
import os
from pathlib import Path
import feedparser
from datetime import datetime

# Configuração de logging
logger = logging.getLogger("feed_manager")

class FeedManager:
    """Gerencia os feeds RSS e suas operações"""
    
    def __init__(self, feeds_file=None):
        """Inicializa o gerenciador de feeds"""
        # Se não for especificado um arquivo, buscar o feeds.json na raiz do projeto
        self.feeds_file = feeds_file
        if not self.feeds_file:
            # Procurar em locais comuns
            possible_paths = [
                "feeds.json",
                "../feeds.json",
                "../../feeds.json",
                os.path.join(os.path.dirname(__file__), "../..", "feeds.json")
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    self.feeds_file = path
                    break
                    
            if not self.feeds_file or not os.path.exists(self.feeds_file):
                # Se ainda não encontrou, usar o caminho absoluto baseado no diretório do script
                project_root = Path(__file__).resolve().parents[2]
                self.feeds_file = project_root / "feeds.json"
        
        # Carregar feeds
        self.feeds = self._load_feeds()
    
    def _load_feeds(self):
        """Carrega os feeds RSS do arquivo"""
        try:
            logger.info(f"Carregando feeds de: {self.feeds_file}")
            if os.path.exists(self.feeds_file):
                with open(self.feeds_file, "r") as f:
                    feeds = json.load(f)
                logger.info(f"Carregados {len(feeds)} feeds")
                return feeds
            else:
                logger.warning(f"Arquivo de feeds não encontrado: {self.feeds_file}")
                return []
        except Exception as e:
            logger.error(f"Erro ao carregar feeds: {str(e)}")
            return []
    
    def get_feeds(self):
        """Retorna a lista de feeds"""
        return self.feeds
    
    def get_feed_entries(self, limit=5):
        """Busca as entradas mais recentes dos feeds"""
        results = []
        
        for feed in self.feeds:
            try:
                logger.info(f"Buscando entradas para feed: {feed['name']} ({feed['url']})")
                parsed_feed = feedparser.parse(feed["url"])
                
                # Verificar se o feed foi parseado corretamente
                if not hasattr(parsed_feed, "entries"):
                    logger.warning(f"Feed sem entradas: {feed['name']}")
                    continue
                    
                entries = parsed_feed.entries[:limit]
                logger.info(f"Encontradas {len(entries)} entradas no feed {feed['name']}")
                
                # Processar cada entrada do feed
                for i, entry in enumerate(entries):
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
                    
            except Exception as e:
                logger.error(f"Erro ao processar feed {feed['name']}: {str(e)}")
        
        return results
    
    def save_feed_entry(self, entry, output_dir, prefix="article"):
        """Salva uma entrada de feed como um arquivo JSON"""
        try:
            # Garantir que o diretório existe
            os.makedirs(output_dir, exist_ok=True)
            
            # Gerar um nome de arquivo baseado no timestamp
            timestamp = int(datetime.now().timestamp())
            index = entry.get("index", 0)
            filename = f"{prefix}_{timestamp}_{index}.json"
            filepath = os.path.join(output_dir, filename)
            
            # Salvar no arquivo
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(entry, f, ensure_ascii=False, indent=2)
                
            logger.info(f"Entrada salva com sucesso: {filepath}")
            return {"success": True, "path": filepath}
        except Exception as e:
            logger.error(f"Erro ao salvar entrada: {str(e)}")
            return {"success": False, "error": str(e)}