"""
Ferramentas para monitoramento de feeds RSS.
"""

import os
import json
import time
import sqlite3
import hashlib
import feedparser
from datetime import datetime
from urllib.parse import urlparse
from crewai.tools.base_tool import Tool
from pathlib import Path
from pydantic import Field
from typing import Set, List, Dict, Optional

class RssFeedTool(Tool):
    """Ferramenta para monitorar e processar feeds RSS."""
    
    processed_items: Set[str] = Field(default_factory=set)
    default_feeds: List[str] = Field(default=[
        "https://thecryptobasic.com/feed"
    ])
    db_path: str = Field(default="posts_database.sqlite")
    
    def __init__(self):
        """Inicializa a ferramenta de feeds RSS."""
        super().__init__(
            name="RssFeedTool",
            description="Ferramenta para monitorar e processar feeds RSS de sites de criptomoedas.",
            func=self._run,
            return_direct=False
        )
        # Inicializar banco de dados
        self._init_db()
        
        # Carregar feeds da configuração legada se disponível
        try:
            import sys
            sys.path.append("agentes_backup_legado")
            from config import RSS_FEEDS
            self.default_feeds = RSS_FEEDS
            print(f"Carregados {len(RSS_FEEDS)} feeds RSS da configuração legada.")
        except ImportError:
            print("Usando feeds RSS padrão.")
    
    def _init_db(self):
        """Inicializa o banco de dados SQLite para controle de posts processados."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Verificar se a tabela existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'")
        if cursor.fetchone():
            # Lista de colunas a verificar e adicionar se não existirem
            colunas = [
                ("published_date", "TIMESTAMP"),
                ("source", "TEXT"),
                ("status", "TEXT DEFAULT 'processed'")
            ]
            
            # Verificar e adicionar cada coluna
            for coluna, tipo in colunas:
                try:
                    # Tentar executar query com a coluna para ver se existe
                    cursor.execute(f"SELECT {coluna} FROM posts LIMIT 1")
                except sqlite3.OperationalError:
                    # A coluna não existe, então vamos adicioná-la
                    print(f"Adicionando coluna {coluna} à tabela posts...")
                    cursor.execute(f"ALTER TABLE posts ADD COLUMN {coluna} {tipo}")
                    conn.commit()
        else:
            # Tabela não existe, criar do zero
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guid TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                link TEXT,
                processed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                published_date TIMESTAMP,
                source TEXT,
                status TEXT DEFAULT 'processed'
            )
            ''')
        
        conn.commit()
        conn.close()
        print("Banco de dados inicializado com sucesso.")
    
    def _is_post_processed(self, guid: str, content: str) -> bool:
        """Verifica se um post já foi processado com base no GUID e no hash do conteúdo.
        
        Args:
            guid: Identificador único do post (geralmente URL)
            content: Conteúdo do post para gerar hash
            
        Returns:
            True se o post já foi processado, False caso contrário
        """
        # Gerar hash do conteúdo
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
        
        # Verificar no banco de dados
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Verificar pelo GUID exato
        cursor.execute("SELECT id FROM posts WHERE guid = ?", (guid,))
        result = cursor.fetchone()
        
        # Se encontrar pelo GUID, já foi processado
        if result:
            conn.close()
            return True
            
        # Verificar pelo hash do conteúdo
        cursor.execute("SELECT id FROM posts WHERE content_hash = ?", (content_hash,))
        result = cursor.fetchone()
        
        conn.close()
        return result is not None
    
    def _save_processed_post(self, post: Dict[str, str]) -> None:
        """Salva um post como processado no banco de dados.
        
        Args:
            post: Dicionário com dados do post
        """
        guid = post.get("link", "")
        title = post.get("title", "")
        content = post.get("content", "")
        source = post.get("source", "")
        pub_date = post.get("date", datetime.now().isoformat())
        
        # Gerar hash do conteúdo
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
        
        # Salvar no banco de dados
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
            INSERT INTO posts (guid, title, content_hash, link, published_date, source, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (guid, title, content_hash, guid, pub_date, source, 'processed'))
            
            conn.commit()
            print(f"Post salvo no banco de dados: {title}")
        except sqlite3.IntegrityError:
            print(f"Post já existe no banco de dados: {title}")
        except Exception as e:
            print(f"Erro ao salvar post no banco de dados: {e}")
        finally:
            conn.close()
    
    def obter_feeds_rss(self):
        """Obtém a lista de feeds RSS para monitorar."""
        # Tentar ler de arquivo
        feeds_file = Path("feeds.json")
        if feeds_file.exists():
            try:
                with open(feeds_file, "r", encoding="utf-8") as f:
                    feeds = json.load(f)
                    if isinstance(feeds, list) and feeds:
                        return feeds
            except Exception as e:
                print(f"Erro ao ler arquivo feeds.json: {e}")
        
        # Feeds padrão se não encontrar configuração
        return self.default_feeds
    
    def _run(self, query=None, max_entries=5):
        """Executa a ferramenta de monitoramento de feeds RSS.
        
        Args:
            query: Consulta opcional para filtrar os feeds
            max_entries: Número máximo de entradas a retornar por feed
            
        Returns:
            Lista de artigos encontrados nos feeds
        """
        feeds = self.obter_feeds_rss()
        artigos = []
        
        for feed_item in feeds:
            try:
                # Extrair URL - pode ser string direta ou de um dict
                if isinstance(feed_item, dict) and 'url' in feed_item:
                    feed_url = feed_item['url']
                    feed_name = feed_item.get('name', feed_url) # Usar nome ou URL como fallback
                elif isinstance(feed_item, str):
                    feed_url = feed_item
                    feed_name = feed_item
                else:
                    print(f"Aviso: Item de feed inválido ignorado: {feed_item}")
                    continue # Pular item inválido

                print(f"Processando feed: {feed_name} ({feed_url})")
                feed = feedparser.parse(feed_url)
                
                if not feed or not hasattr(feed, 'entries') or not feed.entries:
                    continue
                    
                # Extrair domínio para identificação
                domain = urlparse(feed_url).netloc
                
                for i, entry in enumerate(feed.entries):
                    if i >= max_entries:
                        break
                        
                    # Extrair dados do artigo
                    entry_id = entry.get("id", entry.get("link", ""))
                    content = ""
                    if "content" in entry and entry.content:
                        content = entry.content[0].value
                    elif "summary" in entry:
                        content = entry.summary
                        
                    # Verificar no banco de dados se já processamos este artigo
                    if self._is_post_processed(entry_id, content):
                        print(f"Post já processado: {entry.get('title', 'Sem título')}")
                        continue
                        
                    # Extrair dados básicos
                    artigo = {
                        "title": entry.get("title", "Sem título"),
                        "link": entry.get("link", ""),
                        "source": domain,
                        "feed_url": feed_url
                    }
                    
                    # Extrair data de publicação
                    pub_date = entry.get("published_parsed", None)
                    if pub_date:
                        artigo["date"] = datetime(*pub_date[:6]).isoformat()
                    else:
                        artigo["date"] = datetime.now().isoformat()
                        
                    # Extrair conteúdo
                    artigo["content"] = content
                        
                    # Extrair autor se disponível
                    if "author" in entry:
                        artigo["author"] = entry.author
                        
                    # Extrair tags se disponíveis
                    if "tags" in entry:
                        artigo["tags"] = [tag.term for tag in entry.tags]
                        
                    # Salvar como processado
                    self._save_processed_post(artigo)
                    
                    # Adicionar à lista de artigos encontrados
                    artigos.append(artigo)
                    
            except Exception as e:
                print(f"Erro ao processar feed {feed_name}: {str(e)}")
        
        # Filtrar artigos com base na consulta, se fornecida
        if query and isinstance(query, str) and query.strip():
            query = query.lower()
            filtered_artigos = []
            
            for artigo in artigos:
                title = artigo.get("title", "").lower()
                content = artigo.get("content", "").lower()
                
                if query in title or query in content:
                    filtered_artigos.append(artigo)
                    
            return filtered_artigos
        
        return artigos 