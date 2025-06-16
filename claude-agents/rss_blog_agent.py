#!/usr/bin/env python3
"""
Agente RSS para Blog - Integração sem API Keys externas
Monitora feeds RSS e cria posts automaticamente no Strapi
"""
import os
import json
import feedparser
import asyncio
import aiohttp
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Set
import hashlib
import re
from pathlib import Path
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RSSBlogAgent:
    """Agente para monitorar RSS e criar posts automaticamente"""
    
    def __init__(self):
        self.strapi_url = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com')
        self.strapi_token = os.getenv('STRAPI_API_TOKEN', '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb')
        
        # Feeds RSS configurados
        self.feeds = [
            {
                'name': 'The Crypto Basic',
                'url': 'https://thecryptobasic.com/feed/',
                'category': 'crypto-news',
                'language': 'en'
            }
        ]
        
        # Arquivo para rastrear posts processados
        self.processed_file = Path('processed_rss_posts.json')
        self.processed_guids: Set[str] = self.load_processed_guids()
        
    def load_processed_guids(self) -> Set[str]:
        """Carrega GUIDs já processados"""
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    data = json.load(f)
                    return set(data.get('guids', []))
            except:
                pass
        return set()
    
    def save_processed_guids(self):
        """Salva GUIDs processados"""
        data = {
            'guids': list(self.processed_guids),
            'last_update': datetime.now().isoformat()
        }
        with open(self.processed_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def generate_slug(self, title: str) -> str:
        """Gera slug a partir do título"""
        import unicodedata
        # Remove acentos
        slug = unicodedata.normalize('NFKD', title.lower())
        slug = ''.join([c for c in slug if not unicodedata.combining(c)])
        # Mantém apenas letras, números, hífens e underscores
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        return slug[:100]  # Limita tamanho
    
    def clean_html(self, html_content: str) -> str:
        """Remove tags HTML básicas"""
        # Remove scripts e styles
        html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)
        html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL)
        
        # Converte quebras de linha
        html_content = html_content.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
        html_content = html_content.replace('</p>', '\n\n').replace('<p>', '')
        
        # Remove todas as tags HTML
        html_content = re.sub(r'<[^>]+>', '', html_content)
        
        # Limpa entidades HTML
        html_content = html_content.replace('&nbsp;', ' ')
        html_content = html_content.replace('&amp;', '&')
        html_content = html_content.replace('&lt;', '<')
        html_content = html_content.replace('&gt;', '>')
        html_content = html_content.replace('&quot;', '"')
        html_content = html_content.replace('&#39;', "'")
        
        # Remove espaços extras
        html_content = re.sub(r'\n\s*\n', '\n\n', html_content)
        html_content = re.sub(r' +', ' ', html_content)
        
        return html_content.strip()
    
    def translate_simple(self, text: str, from_lang: str = 'en', to_lang: str = 'pt') -> str:
        """Tradução simples usando substituições básicas (sem API)"""
        # Por enquanto, retorna o texto original
        # Em uma implementação real, você poderia:
        # 1. Usar um dicionário de traduções comuns
        # 2. Integrar com uma API de tradução local/gratuita
        # 3. Usar modelos de tradução offline
        
        # Adiciona nota de que é conteúdo traduzido
        if from_lang != to_lang:
            return f"[Conteúdo original em {from_lang.upper()}]\n\n{text}"
        return text
    
    async def check_feeds(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Verifica feeds RSS por novos artigos"""
        new_articles = []
        
        for feed_config in self.feeds:
            try:
                logger.info(f"Verificando feed: {feed_config['name']}")
                feed = feedparser.parse(feed_config['url'])
                
                if feed.bozo:
                    logger.error(f"Erro ao parsear feed {feed_config['name']}: {feed.bozo_exception}")
                    continue
                
                for entry in feed.entries[:limit]:
                    # Gera GUID único
                    guid = entry.get('id', entry.get('link', ''))
                    if not guid:
                        continue
                    
                    # Verifica se já foi processado
                    if guid in self.processed_guids:
                        continue
                    
                    # Extrai informações
                    article = {
                        'guid': guid,
                        'title': entry.get('title', 'Sem título'),
                        'link': entry.get('link', ''),
                        'published': entry.get('published_parsed'),
                        'summary': entry.get('summary', ''),
                        'content': entry.get('content', [{}])[0].get('value', '') if entry.get('content') else '',
                        'feed': feed_config
                    }
                    
                    # Se não tem conteúdo, usa o resumo
                    if not article['content']:
                        article['content'] = article['summary']
                    
                    new_articles.append(article)
                    
            except Exception as e:
                logger.error(f"Erro ao verificar feed {feed_config['name']}: {e}")
        
        return new_articles
    
    async def create_post_from_article(self, article: Dict[str, Any]) -> Dict[str, Any]:
        """Cria post no Strapi a partir de artigo RSS"""
        try:
            # Limpa conteúdo HTML
            content = self.clean_html(article['content'] or article['summary'])
            
            # Traduz se necessário
            if article['feed']['language'] != 'pt':
                title = self.translate_simple(article['title'], article['feed']['language'], 'pt')
                content = self.translate_simple(content, article['feed']['language'], 'pt')
            else:
                title = article['title']
            
            # Gera slug
            slug = self.generate_slug(title)
            
            # Cria excerpt
            excerpt = content[:200] + '...' if len(content) > 200 else content
            
            # Prepara dados do post
            post_data = {
                'data': {
                    'title': title,
                    'slug': slug,
                    'content': content,
                    'excerpt': excerpt,
                    'publishedAt': datetime.now().isoformat(),
                    'author': 'RSS Bot'
                }
            }
            
            # Envia para o Strapi
            async with aiohttp.ClientSession() as session:
                headers = {
                    'Authorization': f'Bearer {self.strapi_token}',
                    'Content-Type': 'application/json'
                }
                
                async with session.post(
                    f'{self.strapi_url}/api/posts',
                    json=post_data,
                    headers=headers
                ) as response:
                    if response.status in [200, 201]:
                        result = await response.json()
                        logger.info(f"Post criado com sucesso: {title}")
                        
                        # Marca como processado
                        self.processed_guids.add(article['guid'])
                        self.save_processed_guids()
                        
                        return result['data']
                    else:
                        error_text = await response.text()
                        logger.error(f"Erro ao criar post: {response.status} - {error_text}")
                        return None
                        
        except Exception as e:
            logger.error(f"Erro ao processar artigo: {e}")
            return None
    
    async def run_import(self, limit: int = 5) -> Dict[str, Any]:
        """Executa importação de artigos RSS"""
        logger.info(f"Iniciando importação RSS (limite: {limit} artigos)")
        
        # Verifica feeds
        new_articles = await self.check_feeds(limit)
        logger.info(f"Encontrados {len(new_articles)} novos artigos")
        
        # Processa artigos
        results = {
            'total': len(new_articles),
            'success': 0,
            'failed': 0,
            'posts': []
        }
        
        for article in new_articles:
            post = await self.create_post_from_article(article)
            if post:
                results['success'] += 1
                results['posts'].append({
                    'id': post.get('id'),
                    'title': post.get('title'),
                    'slug': post.get('slug')
                })
            else:
                results['failed'] += 1
        
        logger.info(f"Importação concluída: {results['success']} sucesso, {results['failed']} falhas")
        return results
    
    async def get_status(self) -> Dict[str, Any]:
        """Retorna status do agente RSS"""
        return {
            'processed_posts': len(self.processed_guids),
            'feeds': len(self.feeds),
            'feed_list': [f['name'] for f in self.feeds],
            'strapi_url': self.strapi_url,
            'last_update': self.processed_file.stat().st_mtime if self.processed_file.exists() else None
        }

# Interface CLI simples
async def main():
    """Interface de linha de comando"""
    import sys
    
    agent = RSSBlogAgent()
    
    if len(sys.argv) < 2:
        print("Uso: python rss_blog_agent.py [comando]")
        print("Comandos disponíveis:")
        print("  check    - Verifica feeds por novos artigos")
        print("  import   - Importa novos artigos (padrão: 5)")
        print("  import N - Importa N artigos")
        print("  status   - Mostra status do agente")
        print("  clear    - Limpa cache de artigos processados")
        return
    
    command = sys.argv[1]
    
    if command == 'check':
        articles = await agent.check_feeds()
        print(f"Encontrados {len(articles)} novos artigos:")
        for article in articles:
            print(f"  - {article['title']}")
    
    elif command == 'import':
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        results = await agent.run_import(limit)
        print(f"Importação concluída:")
        print(f"  Total: {results['total']}")
        print(f"  Sucesso: {results['success']}")
        print(f"  Falhas: {results['failed']}")
        if results['posts']:
            print("\nPosts criados:")
            for post in results['posts']:
                print(f"  - [{post['id']}] {post['title']}")
    
    elif command == 'status':
        status = await agent.get_status()
        print("Status do RSS Agent:")
        print(f"  Posts processados: {status['processed_posts']}")
        print(f"  Feeds configurados: {status['feeds']}")
        print(f"  Feeds: {', '.join(status['feed_list'])}")
        print(f"  Strapi URL: {status['strapi_url']}")
    
    elif command == 'clear':
        agent.processed_guids.clear()
        agent.save_processed_guids()
        print("Cache de artigos processados limpo!")
    
    else:
        print(f"Comando desconhecido: {command}")

if __name__ == "__main__":
    asyncio.run(main())