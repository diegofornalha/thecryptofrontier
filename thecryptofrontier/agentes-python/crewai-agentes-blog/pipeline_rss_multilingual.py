#!/usr/bin/env python3
"""
Pipeline RSS Multilíngue com Sistema de Rotação de Chaves
Busca artigos RSS → Traduz → Publica em PT-BR, EN, ES
"""

import sys
import os
import feedparser
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import json
import re
from typing import List, Dict

# Carregar variáveis de ambiente
load_dotenv('.env', override=True)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler('pipeline_multilingual.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Adicionar src ao path
sys.path.insert(0, 'src')

# Importar sistema de chaves e integração Strapi
from utils.api_key_manager import get_api_key_manager
import requests
import google.generativeai as genai

class StrapiI18nIntegration:
    def __init__(self):
        self.strapi_url = "https://ale-blog-preview.agentesintegrados.com"
        self.strapi_token = os.environ.get('STRAPI_API_TOKEN_PREVIEW')
        self.headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
        
    def create_post(self, post_data, locale='pt-BR'):
        """Cria um post no Strapi com o idioma especificado"""
        try:
            data = {
                "data": {
                    "title": post_data['title'],
                    "content": post_data['content'], 
                    "slug": post_data['slug'],
                    "excerpt": post_data.get('excerpt', ''),
                    "publishedAt": datetime.now().isoformat(),
                    "locale": locale
                }
            }
            
            response = requests.post(
                f"{self.strapi_url}/api/posts",
                headers=self.headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                post_id = result['data']['id']
                logger.info(f"Post criado com sucesso em {locale}: {post_data['title'][:50]}...")
                return post_id
            else:
                logger.error(f"Erro ao criar post: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Erro na criação do post: {e}")
            return None

class MultilingualRSSPipeline:
    def __init__(self):
        self.rss_feed = "https://thecryptobasic.com/feed/"
        self.processed_file = Path("processed_multilingual_articles.json")
        self.strapi = StrapiI18nIntegration()
        self.api_manager = get_api_key_manager()
        
        # Carregar artigos já processados
        self.processed_articles = self._load_processed_articles()
        
    def _load_processed_articles(self) -> set:
        """Carrega IDs de artigos já processados"""
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    data = json.load(f)
                    return set(data.get('ids', []))
            except Exception as e:
                logger.error(f"Erro ao carregar artigos processados: {e}")
        return set()
    
    def _save_processed_articles(self):
        """Salva IDs de artigos processados"""
        try:
            with open(self.processed_file, 'w') as f:
                json.dump({
                    'ids': list(self.processed_articles),
                    'updated': datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar artigos processados: {e}")
    
    def fetch_rss_articles(self, limit: int = 3) -> List[Dict]:
        """Busca artigos do feed RSS"""
        logger.info(f"🔍 Buscando artigos de {self.rss_feed}")
        
        try:
            feed = feedparser.parse(self.rss_feed)
            new_articles = []
            
            for entry in feed.entries[:limit * 2]:  # Pegar mais para ter margem
                article_id = entry.get('id', entry.get('link'))
                
                # Pular se já foi processado
                if article_id in self.processed_articles:
                    continue
                
                article = {
                    'id': article_id,
                    'title': entry.get('title', ''),
                    'link': entry.get('link', ''),
                    'summary': entry.get('summary', '')[:500],
                    'published': entry.get('published', ''),
                    'content': entry.get('content', [{}])[0].get('value', entry.get('summary', ''))
                }
                
                new_articles.append(article)
                
                if len(new_articles) >= limit:
                    break
            
            logger.info(f"✅ Encontrados {len(new_articles)} artigos novos")
            return new_articles
            
        except Exception as e:
            logger.error(f"❌ Erro ao buscar RSS: {e}")
            return []
    
    def translate_text(self, text: str, target_language: str, is_title: bool = False) -> str:
        """Traduz texto usando sistema de rotação de chaves"""
        
        # Configurar Gemini com sistema de rotação
        if not self.api_manager.configure_gemini():
            logger.error("❌ Não foi possível configurar Gemini - todas as chaves esgotaram")
            return text
        
        # Definir prompts por idioma
        language_prompts = {
            'pt-BR': f"""Traduza o seguinte {'título' if is_title else 'texto'} para português brasileiro.
Mantenha termos técnicos em inglês quando apropriado (Bitcoin, blockchain, DeFi, etc).
Foque no mercado brasileiro e regulamentações da CVM/Banco Central.
{'Seja conciso e impactante.' if is_title else 'Mantenha o tom profissional e informativo.'}

Texto: {text}""",
            
            'en': f"""Keep the following {'title' if is_title else 'text'} in English, but improve and adapt for global crypto audience.
Focus on international markets, SEC/CFTC regulations, and global adoption.
{'Make it engaging and impactful.' if is_title else 'Keep professional and informative tone.'}

Text: {text}""",
            
            'es': f"""Traduce el siguiente {'título' if is_title else 'texto'} al español.
Mantén términos técnicos en inglés cuando sea apropiado (Bitcoin, blockchain, DeFi, etc).
Enfócate en mercados de América Latina y regulaciones hispanas.
{'Sé conciso e impactante.' if is_title else 'Mantén un tono profesional e informativo.'}

Texto: {text}"""
        }
        
        prompt = language_prompts.get(target_language, language_prompts['en'])
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
            # Registrar sucesso
            self.api_manager.record_request(success=True)
            
            result = response.text.strip()
            logger.info(f"✅ Tradução {target_language}: {result[:50]}...")
            return result
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Detectar erro de quota
            if "quota" in error_msg or "rate limit" in error_msg or "429" in error_msg:
                logger.warning(f"🚨 Quota esgotada na chave atual: {e}")
                self.api_manager.record_request(success=False)
                
                # Tentar próxima chave
                if self.api_manager.configure_gemini():
                    logger.info("🔄 Tentando novamente com próxima chave...")
                    try:
                        model = genai.GenerativeModel('gemini-1.5-flash')
                        response = model.generate_content(prompt)
                        self.api_manager.record_request(success=True)
                        result = response.text.strip()
                        logger.info(f"✅ Tradução {target_language} (2ª tentativa): {result[:50]}...")
                        return result
                    except Exception as e2:
                        logger.error(f"❌ Falha na segunda tentativa: {e2}")
                        self.api_manager.record_request(success=False)
            else:
                logger.error(f"❌ Erro na tradução (não é quota): {e}")
                self.api_manager.record_request(success=True)
            
            return text
    
    def _generate_slug(self, title: str) -> str:
        """Gera slug amigável a partir do título"""
        import unicodedata
        
        # Remover acentos
        slug = unicodedata.normalize('NFD', title)
        slug = ''.join(c for c in slug if unicodedata.category(c) != 'Mn')
        
        # Converter para minúsculas e substituir espaços/caracteres especiais por hífen
        slug = re.sub(r'[^\w\s-]', '', slug.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        
        # Remover hífens do início e fim
        slug = slug.strip('-')
        
        return slug[:100]  # Limitar tamanho
    
    def process_article(self, article: Dict) -> Dict:
        """Processa um artigo em todos os idiomas"""
        article_id = article['id']
        title = article['title']
        content = article['content']
        
        logger.info(f"\n📄 Processando: {title[:60]}...")
        
        results = {
            'article_id': article_id,
            'original_title': title,
            'translations': {},
            'success_count': 0,
            'total_count': 3
        }
        
        # Definir idiomas alvo
        languages = {
            'pt-BR': 'Português Brasileiro',
            'en': 'English', 
            'es': 'Español'
        }
        
        for locale, language_name in languages.items():
            try:
                logger.info(f"🌐 Traduzindo para {language_name}...")
                
                # Traduzir título e conteúdo
                translated_title = self.translate_text(title, locale, is_title=True)
                translated_content = self.translate_text(content, locale, is_title=False)
                
                # Gerar slug
                slug = self._generate_slug(translated_title)
                
                # Preparar dados para publicação
                post_data = {
                    'title': translated_title,
                    'content': translated_content,
                    'slug': slug,
                    'excerpt': translated_content[:200] + '...' if len(translated_content) > 200 else translated_content
                }
                
                # Publicar no Strapi
                logger.info(f"📤 Publicando {language_name}...")
                post_id = self.strapi.create_post(post_data, locale)
                
                if post_id:
                    results['translations'][locale] = {
                        'title': translated_title,
                        'slug': slug,
                        'post_id': post_id,
                        'success': True
                    }
                    results['success_count'] += 1
                    logger.info(f"✅ {language_name}: ID {post_id} - /{locale}/post/{slug}/")
                else:
                    results['translations'][locale] = {
                        'title': translated_title,
                        'slug': slug,
                        'post_id': None,
                        'success': False
                    }
                    logger.error(f"❌ {language_name}: Falha na publicação")
                    
            except Exception as e:
                logger.error(f"❌ Erro ao processar {language_name}: {e}")
                results['translations'][locale] = {
                    'title': title,
                    'slug': '',
                    'post_id': None,
                    'success': False,
                    'error': str(e)
                }
        
        return results
    
    def run_pipeline(self, limit: int = 2):
        """Executa o pipeline completo"""
        logger.info("\n" + "="*80)
        logger.info("🚀 PIPELINE RSS MULTILÍNGUE INICIADO")
        logger.info("="*80)
        
        # Verificar status das chaves
        status = self.api_manager.get_status()
        logger.info(f"🔑 Chaves disponíveis: {len([k for k in status['keys_status'] if not k['exhausted']])}/{status['total_keys']}")
        logger.info(f"📈 Capacidade total: {status['max_requests_today']} requests/dia")
        logger.info(f"📊 Usado hoje: {status['total_requests_today']} requests")
        
        # Buscar artigos
        articles = self.fetch_rss_articles(limit)
        
        if not articles:
            logger.info("ℹ️ Nenhum artigo novo encontrado")
            return
        
        logger.info(f"🎯 Processando {len(articles)} artigos em 3 idiomas")
        
        # Processar cada artigo
        total_success = 0
        total_attempts = 0
        
        for i, article in enumerate(articles, 1):
            logger.info(f"\n{'='*60}")
            logger.info(f"📄 ARTIGO {i}/{len(articles)}")
            logger.info(f"{'='*60}")
            
            result = self.process_article(article)
            
            # Marcar como processado
            self.processed_articles.add(result['article_id'])
            
            # Contabilizar resultados
            total_success += result['success_count']
            total_attempts += result['total_count']
            
            logger.info(f"📊 Artigo {i} - Sucessos: {result['success_count']}/{result['total_count']}")
        
        # Salvar artigos processados
        self._save_processed_articles()
        
        # Status final
        logger.info("\n" + "="*80)
        logger.info("🎉 PIPELINE CONCLUÍDO")
        logger.info("="*80)
        logger.info(f"📊 Resultados finais:")
        logger.info(f"   📄 Artigos processados: {len(articles)}")
        logger.info(f"   ✅ Posts criados: {total_success}/{total_attempts}")
        logger.info(f"   📈 Taxa de sucesso: {(total_success/total_attempts)*100:.1f}%")
        
        # Status das chaves após processamento
        final_status = self.api_manager.get_status()
        logger.info(f"   📈 Requests utilizados: {final_status['total_requests_today']}/{final_status['max_requests_today']}")
        
        available_keys = len([k for k in final_status['keys_status'] if not k['exhausted']])
        logger.info(f"   🔄 Chaves ainda disponíveis: {available_keys}/{final_status['total_keys']}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Pipeline RSS Multilíngue")
    parser.add_argument('--limit', type=int, default=2, help='Número de artigos para processar')
    
    args = parser.parse_args()
    
    pipeline = MultilingualRSSPipeline()
    pipeline.run_pipeline(args.limit)

if __name__ == "__main__":
    main() 