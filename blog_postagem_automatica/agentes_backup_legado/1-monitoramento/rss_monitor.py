#!/usr/bin/env python

import os
import sys
import json
import time
from datetime import datetime
import feedparser
from urllib.parse import urlparse
from pathlib import Path
import sqlite3

# Adicionar diretório pai ao PATH para importar corretamente
sys.path.append(str(Path(__file__).parent.parent.parent))

# Importar do pacote principal
from agentes_backup_legado.config import RSS_FEEDS, DATABASE_PATH
from agentes_backup_legado.logger import setup_logger
from agentes_backup_legado.db_manager import DatabaseManager

# Configurar logging
logger = setup_logger("rss_monitor")

def obter_feeds_rss():
    """Obtém a lista de feeds RSS para monitorar.
    
    Primeiro tenta ler de RSS_FEEDS nas configurações, 
    depois tenta ler de arquivo, e por fim retorna feeds padrão.
    """
    # Verificar configuração
    if RSS_FEEDS:
        logger.info(f"Usando feeds RSS da configuração: {len(RSS_FEEDS)} feeds")
        return RSS_FEEDS
    
    # Tentar ler de arquivo
    feeds_file = Path(__file__).parent.parent.parent / "feeds.json"
    if feeds_file.exists():
        try:
            with open(feeds_file, "r", encoding="utf-8") as f:
                feeds = json.load(f)
                if isinstance(feeds, list) and feeds:
                    logger.info(f"Carregados {len(feeds)} feeds RSS do arquivo feeds.json")
                    return feeds
        except Exception as e:
            logger.error(f"Erro ao ler arquivo feeds.json: {e}")
    
    # Feeds padrão
    default_feeds = [
        "https://cointelegraph.com/rss",
        "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "https://decrypt.co/feed",
        "https://blog.chain.link/rss/",
        "https://bitcoin.org/en/rss/blog.xml",
        "https://bitcoinmagazine.com/feed",
    ]
    
    logger.info(f"Usando {len(default_feeds)} feeds RSS padrão")
    return default_feeds

def verificar_artigo_processado(db, title, url):
    """Verifica se um artigo já foi processado anteriormente.
    
    Busca no banco de dados pelo título ou URL do artigo.
    
    Args:
        db: Instância do DatabaseManager
        title: Título do artigo
        url: URL do artigo
        
    Returns:
        True se o artigo já foi processado, False caso contrário
    """
    if not title and not url:
        logger.warning("Verificação de artigo sem título e URL")
        return False
        
    # Buscar por título ou URL
    return db.artigo_existe(title, url)

def salvar_artigo_processado(db, title, url, status="processado"):
    """Salva um artigo como processado no banco de dados.
    
    Args:
        db: Instância do DatabaseManager
        title: Título do artigo
        url: URL do artigo
        status: Status do processamento (processado, rejeitado, etc.)
    """
    if not title and not url:
        logger.warning("Tentativa de salvar artigo sem título e URL")
        return
        
    # Inserir no banco de dados
    db.inserir_artigo({
        "title": title,
        "url": url,
        "date": datetime.now().isoformat(),
        "status": status,
        "processado_em": datetime.now().isoformat()
    })

def processar_feed(feed_url, max_entries=5):
    """Processa um feed RSS e extrai informações dos artigos.
    
    Args:
        feed_url: URL do feed RSS
        max_entries: Número máximo de entradas a processar
        
    Returns:
        Lista de dicionários contendo informações dos artigos
    """
    logger.info(f"Processando feed: {feed_url}")
    
    try:
        # Parse do feed
        feed = feedparser.parse(feed_url)
        
        # Verificar se o feed foi carregado corretamente
        if not feed or not hasattr(feed, 'entries') or not feed.entries:
            logger.warning(f"Feed vazio ou inválido: {feed_url}")
            return []
            
        # Extrair domínio para identificação
        domain = urlparse(feed_url).netloc
        
        # Processar entradas
        artigos = []
        for i, entry in enumerate(feed.entries):
            if i >= max_entries:
                break
                
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
            if "content" in entry and entry.content:
                artigo["content"] = entry.content[0].value
            elif "summary" in entry:
                artigo["content"] = entry.summary
            else:
                artigo["content"] = ""
                
            # Extrair autor se disponível
            if "author" in entry:
                artigo["author"] = entry.author
                
            # Extrair tags se disponíveis
            if "tags" in entry:
                artigo["tags"] = [tag.term for tag in entry.tags]
                
            artigos.append(artigo)
            
        logger.info(f"Extraídos {len(artigos)} artigos do feed {feed_url}")
        return artigos
        
    except Exception as e:
        logger.error(f"Erro ao processar feed {feed_url}: {str(e)}")
        return []

def processar_todos_feeds(max_entries_por_feed=5, callback=None):
    """Processa todos os feeds RSS configurados.
    
    Args:
        max_entries_por_feed: Número máximo de entradas a processar por feed
        callback: Função a ser chamada para cada artigo encontrado
        
    Returns:
        Lista de todos os artigos encontrados
    """
    logger.info("Iniciando processamento de todos os feeds")
    
    # Obter lista de feeds
    feeds = obter_feeds_rss()
    
    # Inicializar banco de dados
    db = DatabaseManager()
    
    # Processar cada feed
    todos_artigos = []
    
    for feed_url in feeds:
        artigos = processar_feed(feed_url, max_entries_por_feed)
        
        for artigo in artigos:
            # Verificar se já processamos este artigo
            if verificar_artigo_processado(db, artigo["title"], artigo["link"]):
                logger.info(f"Artigo já processado: {artigo['title']}")
                continue
                
            todos_artigos.append(artigo)
            
            # Chamar callback se fornecido
            if callback and callable(callback):
                callback(artigo)
                
    logger.info(f"Processamento concluído. Total de novos artigos: {len(todos_artigos)}")
    return todos_artigos

def monitorar_feeds(intervalo_minutos=60, callback=None):
    """Monitora continuamente os feeds RSS em intervalos regulares.
    
    Args:
        intervalo_minutos: Intervalo em minutos entre verificações
        callback: Função a ser chamada para cada artigo encontrado
    """
    logger.info(f"Iniciando monitoramento de feeds a cada {intervalo_minutos} minutos")
    
    try:
        while True:
            # Processar feeds
            novos_artigos = processar_todos_feeds(callback=callback)
            
            logger.info(f"Encontrados {len(novos_artigos)} novos artigos")
            
            # Aguardar até a próxima verificação
            logger.info(f"Aguardando {intervalo_minutos} minutos até a próxima verificação")
            time.sleep(intervalo_minutos * 60)
            
    except KeyboardInterrupt:
        logger.info("Monitoramento interrompido pelo usuário")
    except Exception as e:
        logger.error(f"Erro no monitoramento: {str(e)}")
        raise

if __name__ == "__main__":
    # Teste simples do módulo
    def print_artigo(artigo):
        print(f"Novo artigo: {artigo['title']}")
        print(f"Link: {artigo['link']}")
        print(f"Data: {artigo['date']}")
        print("---")
        
    # Monitorar por 5 minutos de teste
    monitorar_feeds(1, print_artigo) 