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
from multilingual_config import MultilingualConfig

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RSSBlogAgent:
    """Agente para monitorar RSS e criar posts automaticamente"""
    
    def __init__(self, publishing_strategy='original_only'):
        self.strapi_url = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com')
        self.strapi_token = os.getenv('STRAPI_API_TOKEN', '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb')
        
        # Configuração multi-idioma
        self.config = MultilingualConfig()
        self.publishing_strategy = publishing_strategy
        
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
        slug = re.sub(r'[^a-z0-9\s]', ' ', slug) # Substitui caracteres não alfanuméricos/espaço por espaço
        slug = re.sub(r'\s+', '-', slug) # Substitui múltiplos espaços por um hífen
        slug = re.sub(r'[^a-z0-9_.~-]', '', slug) # Remove caracteres não permitidos pelo Strapi
        slug = slug.strip('-') # Remove hífens no início e no fim
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
        """Tradução usando o agente tradutor"""
        try:
            from translator_agent import TranslatorAgent
            translator = TranslatorAgent()
            
            # Se for diferente idioma, traduz
            if from_lang != to_lang:
                translated = translator.translate(text, from_lang, to_lang)
                # Se a tradução falhou ou é muito similar, marca como não traduzido
                if translated == text or len(translated) < len(text) * 0.5:
                    return f"[Conteúdo original em {from_lang.upper()}]\n\n{text}"
                return translated
                
        except ImportError:
            # Se não conseguir importar o tradutor, usa método antigo
            if from_lang != to_lang:
                return f"[Conteúdo original em {from_lang.upper()}]\n\n{text}"
        
        return text
    
    

    def build_llm_prompt(self, original_title: str, original_content: str, original_lang: str, target_lang: str, guidelines: Dict[str, Any]) -> str:
        """Constrói o prompt para o LLM para gerar conteúdo contextualizado."""
        prompt = f"""
        Você é um especialista em marketing de conteúdo e tradução. Sua tarefa é reescrever o seguinte artigo para o idioma {target_lang} e contextualizá-lo para o público com as seguintes diretrizes:

        ## Diretrizes para {target_lang}:
        - Prefixo do Título: {guidelines.get('title_prefix', '')}
        - Foco de Mercado: {guidelines.get('market_focus', '')}
        - Exemplos de Moeda: {guidelines.get('currency_examples', '')}
        - Contexto Regulatório: {guidelines.get('regulatory_context', '')}
        - Audiência: {guidelines.get('audience', '')}
        - Tom: {guidelines.get('tone', '')}

        ## Artigo Original (Idioma: {original_lang}):
        Título: {original_title}
        Conteúdo:
        {original_content}

        ## Instruções:
        1. Crie um novo título em {target_lang} que seja atrativo e otimizado para SEO, sem incluir o prefixo do título nas diretrizes. O prefixo é apenas para sua referência.
        2. Gere um slug URL-friendly para o novo título.
        3. Escreva um resumo (excerpt) conciso e envolvente em {target_lang} (máximo 160 caracteres).
        4. Reescreva o conteúdo completo do artigo em Markdown para {target_lang}, incorporando as diretrizes de contextualização.
        5. Sugira 5-7 tags relevantes em {target_lang}.
        6. Sugira 1-2 categorias relevantes em {target_lang}.

        ## Formato de Saída (JSON):
        ```json
        {{
            "title": "novo título aqui",
            "slug": "novo-slug-aqui",
            "excerpt": "resumo conciso aqui",
            "content": "conteúdo completo em markdown aqui",
            "tags": ["tag1", "tag2"],
            "categories": ["categoria1"]
        }}
        ```
        """
        return prompt
    
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
                
                # Inverte para pegar os mais recentes que ainda não foram processados
                for entry in reversed(feed.entries[:limit*3]):
                    # Gera GUID único
                    guid = entry.get('id', entry.get('link', ''))
                    if not guid:
                        continue
                    
                    # Não verifica mais o cache local para forçar reprocessamento/atualização
                    # if guid in self.processed_guids:
                    #     continue
                    
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
    
    async def check_post_exists_in_strapi(self, slug: str) -> Dict[str, Any] | None:
        """Verifica se um post com o dado slug já existe no Strapi e retorna seus dados."""
        headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
        # Busca por slug
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f'{self.strapi_url}/api/posts?filters[slug][$eq]={slug}',
                headers=headers
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    if result and result['data'] and len(result['data']) > 0:
                        return result['data'][0] # Retorna o primeiro post encontrado
                return None

    async def create_post_from_article(self, article: Dict[str, Any]) -> Dict[str, Any]:
        """Cria post no Strapi a partir de artigo RSS"""
        try:
            # Limpa conteúdo HTML
            content = self.clean_html(article['content'] or article['summary'])
            
            # Determina idiomas alvo baseado na estratégia
            original_lang = article['feed']['language']
            target_languages = self.config.get_target_languages(original_lang, self.publishing_strategy)
            
            logger.info(f"Estratégia: {self.publishing_strategy}, Idiomas alvo: {target_languages}")
            
            # Para estratégia single_language, traduz para PT
            # if self.publishing_strategy == 'single_language' and 'pt' in target_languages:
            #     if original_lang != 'pt':
            #         title = self.translate_simple(article['title'], original_lang, 'pt')
            #         content = self.translate_simple(content, original_lang, 'pt')
            #     else:
            #         title = article['title']
            # else:
            #     # Para outras estratégias, mantém original por enquanto
            #     title = article['title']
            #     # Adiciona indicação do idioma se não for PT
            #     # if original_lang != 'pt':
            #     #     title = f"[{original_lang.upper()}] {title}" # Removido para não adicionar prefixo de idioma
            
            # Formata conteúdo em Markdown (removido, agora o LLM gera o conteúdo completo)

            # Gera slug
            base_slug = self.generate_slug(article['title'])

            # Processa para cada idioma alvo
            for lang in target_languages:
                lang_config = self.config.SUPPORTED_LANGUAGES.get(lang, {})
                guidelines = lang_config.get('guidelines', {})
                locale_code = lang_config.get('locale', lang)

                # Constrói o prompt para o LLM
                llm_prompt = self.build_llm_prompt(
                    article['title'],
                    content, # Conteúdo original limpo
                    original_lang,
                    lang,
                    guidelines
                )

                # Chama o LLM (usando o SimpleHybridBlogAgent para abstração)
                from simple_hybrid_blog_agent import SimpleHybridBlogAgent
                from llm_interface import GeminiLLM # Usando Gemini como LLM padrão para tradução
                llm_agent = SimpleHybridBlogAgent(GeminiLLM())

                # O LLM deve retornar um JSON com title, slug, content, excerpt, seo, tags, categories
                llm_output = await llm_agent.create_blog_post(
                    topic=article['title'], # Usar o título original como tópico
                    keywords=[] # Palavras-chave podem ser geradas pelo LLM ou passadas
                )

                if not llm_output:
                    logger.error(f"Falha ao gerar conteúdo para o idioma {lang} do artigo {article['title']}")
                    continue

                # Prepara dados do post para o Strapi
                post_data = {
                    'data': {
                        'title': llm_output.get('title'),
                        'slug': self.generate_slug(llm_output.get('title')), # Gera slug a partir do título gerado pelo LLM
                        'content': content,
                        'excerpt': llm_output.get('excerpt'),
                        'publishedAt': datetime.now().isoformat(),
                        'locale': locale_code # Define o locale correto
                    }
                }

                async with aiohttp.ClientSession() as session:
                    headers = {
                        'Authorization': f'Bearer {self.strapi_token}',
                        'Content-Type': 'application/json'
                    }
                    
                    existing_post = await self.check_post_exists_in_strapi(post_data['data']['slug'])
                    
                    if existing_post:
                        post_id = existing_post['id']
                        async with session.put(
                            f'{self.strapi_url}/api/posts/{post_id}',
                            json=post_data,
                            headers=headers
                        ) as response:
                            if response.status in [200]:
                                result = await response.json()
                                logger.info(f"Post atualizado com sucesso: {llm_output.get('title')} (ID: {post_id}, Locale: {locale_code})")
                                self.processed_guids.add(article['guid'])
                                self.save_processed_guids()
                                # Retorna o resultado da atualização para o run_import
                                return result['data']
                            else:
                                error_text = await response.text()
                                logger.error(f"Erro ao atualizar post: {response.status} - {error_text}")
                                return None
                    else:
                        async with session.post(
                            f'{self.strapi_url}/api/posts',
                            json=post_data,
                            headers=headers
                        ) as response:
                            if response.status in [200, 201]:
                                result = await response.json()
                                logger.info(f"Post criado com sucesso: {llm_output.get('title')} (Locale: {locale_code})")
                                
                                # Marca como processado
                                self.processed_guids.add(article['guid'])
                                self.save_processed_guids()
                                
                                # Retorna o resultado da criação para o run_import
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