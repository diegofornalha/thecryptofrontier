"""
Leitor de RSS simplificado
Adaptado do código existente mas sem dependências do CrewAI
"""

import feedparser
import hashlib
import logging
from datetime import datetime
from typing import List, Dict, Optional
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class RSSReader:
    """
    Leitor de feeds RSS para coletar artigos
    """
    
    def __init__(self, feed_url: str):
        """
        Inicializa o leitor RSS
        
        Args:
            feed_url: URL do feed RSS
        """
        self.feed_url = feed_url
        
        # Blacklist de palavras para filtrar spam/propaganda
        self.blacklist_keywords = [
            'LiteFinance',
            'Partner Application',
            'RoboForex',
            'sponsored',
            'advertisement',
            'promo code',
            'casino',
            'gambling'
        ]
    
    def _generate_article_id(self, url: str) -> str:
        """Gera ID único para o artigo baseado na URL"""
        return hashlib.md5(url.encode()).hexdigest()
    
    def _clean_html(self, html_content: str) -> str:
        """Remove tags HTML e limpa o conteúdo"""
        if not html_content:
            return ""
        
        # Parse HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remover scripts e styles
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extrair texto
        text = soup.get_text()
        
        # Limpar espaços extras
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def _is_valid_article(self, article: Dict) -> bool:
        """
        Verifica se o artigo é válido (não é spam/propaganda)
        
        Args:
            article: Dados do artigo
            
        Returns:
            True se o artigo é válido
        """
        # Verificar título e conteúdo
        text_to_check = f"{article.get('title', '')} {article.get('summary', '')}"
        text_lower = text_to_check.lower()
        
        # Verificar blacklist
        for keyword in self.blacklist_keywords:
            if keyword.lower() in text_lower:
                logger.info(f"Artigo rejeitado por blacklist: {keyword}")
                return False
        
        # Verificar se tem conteúdo mínimo
        if len(article.get('content', '')) < 100:
            logger.info("Artigo rejeitado: conteúdo muito curto")
            return False
        
        return True
    
    def fetch_articles(self, limit: int = 10) -> List[Dict]:
        """
        Busca artigos do feed RSS
        
        Args:
            limit: Número máximo de artigos para retornar
            
        Returns:
            Lista de artigos
        """
        logger.info(f"Buscando artigos de {self.feed_url}")
        
        try:
            # Parse do feed
            feed = feedparser.parse(self.feed_url)
            
            if feed.bozo:
                logger.warning(f"Aviso ao parsear feed: {feed.bozo_exception}")
            
            articles = []
            
            for entry in feed.entries[:limit * 2]:  # Buscar mais para compensar filtros
                try:
                    # Extrair dados básicos
                    article = {
                        'id': self._generate_article_id(entry.link),
                        'title': entry.title,
                        'link': entry.link,
                        'published': entry.published if hasattr(entry, 'published') else datetime.now().isoformat(),
                        'summary': self._clean_html(entry.summary) if hasattr(entry, 'summary') else '',
                        'source': feed.feed.title if hasattr(feed.feed, 'title') else 'Unknown'
                    }
                    
                    # Extrair conteúdo completo
                    if hasattr(entry, 'content'):
                        article['content'] = self._clean_html(entry.content[0].value)
                    else:
                        article['content'] = article['summary']
                    
                    # Validar artigo
                    if self._is_valid_article(article):
                        articles.append(article)
                        
                        if len(articles) >= limit:
                            break
                    
                except Exception as e:
                    logger.error(f"Erro ao processar entrada do feed: {e}")
                    continue
            
            logger.info(f"Coletados {len(articles)} artigos válidos")
            return articles
            
        except Exception as e:
            logger.error(f"Erro ao buscar feed RSS: {e}")
            return []
    
    def fetch_single_article(self, url: str) -> Optional[Dict]:
        """
        Busca um artigo específico pelo URL
        
        Args:
            url: URL do artigo
            
        Returns:
            Dados do artigo ou None se não encontrado
        """
        articles = self.fetch_articles(limit=50)  # Buscar mais artigos
        
        for article in articles:
            if article['link'] == url:
                return article
        
        return None