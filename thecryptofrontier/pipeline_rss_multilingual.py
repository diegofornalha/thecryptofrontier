#!/usr/bin/env python3
"""
Pipeline RSS Multilíngue com Sistema de Rotação de Chaves e Seleção de Idiomas (PADRÃO STRAPI i18n)
Baseado na documentação oficial do Strapi via Context7
Busca artigos RSS 
Traduz 
Publica usando documentId correto
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
import time

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
    """Integração com Strapi seguindo padrão oficial i18n"""
    
    def __init__(self):
        self.strapi_url = "https://ale-blog.agentesintegrados.com"
        self.strapi_token = os.environ.get('STRAPI_API_TOKEN_PRODUCTION')
        self.headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
        
    def create_base_post(self, post_data, locale='en'):
        """Cria post base seguindo padrão Context7/Strapi"""
        try:
            data = {
                "data": {
                    "title": post_data['title'],
                    "content": post_data['content'], 
                    "slug": post_data['slug'],
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
            
            if response.status_code in [200, 201]:
                result = response.json()['data']
                document_id = result['documentId']
                post_id = result['id']
                logger.info(f"✅ Post base criado: {post_data['title'][:50]}...")
                logger.info(f" DocumentID: {document_id}")
                return {'id': post_id, 'documentId': document_id}
            else:
                logger.error(f"❌ Erro ao criar post base: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Erro na criação do post base: {e}")
            return None
    
    def create_localization(self, document_id, post_data, locale):
        """Cria localização usando PUT seguindo padrão Context7/Strapi"""
        try:
            data = {
                "data": {
                    "title": post_data['title'],
                    "content": post_data['content'],
                    "slug": post_data['slug'],
                    "publishedAt": datetime.now().isoformat()
                }
            }
            
            response = requests.put(
                f"{self.strapi_url}/api/posts/{document_id}?locale={locale}",
                headers=self.headers,
                json=data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()['data']
                post_id = result['id']
                logger.info(f"✅ Localização {locale} criada - ID: {post_id}")
                return {'id': post_id, 'locale': locale}
            else:
                logger.error(f"❌ Erro ao criar localização {locale}: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Erro na criação da localização {locale}: {e}")
            return None

class MultilingualRSSPipeline:
    def __init__(self, languages: str = None):
        self.rss_feed = "https://thecryptobasic.com/feed/"
        self.processed_file = Path("processed_multilingual_articles.json")
        self.strapi = StrapiI18nIntegration()
        self.api_manager = get_api_key_manager()
        
        # Idiomas habilitados
        if languages:
            self.enabled_languages = [lang.strip() for lang in languages.split(',')]
        else:
            self.enabled_languages = [lang.strip() for lang in os.environ.get('ENABLED_LANGUAGES', 'en,pt-BR,es').split(',')]
        
        logger.info(f"Idiomas habilitados: {self.enabled_languages}")

        # Configurações do Strapi
        self.strapi_url = "https://ale-blog.agentesintegrados.com"
        self.strapi_token = os.environ.get('STRAPI_API_TOKEN_PRODUCTION')
        self.headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
        
        self.processed_articles = self._load_processed_articles()
        
    def _load_processed_articles(self) -> set:
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    data = json.load(f)
                    return set(data.get('ids', []))
            except Exception as e:
                logger.error(f"Erro ao carregar artigos processados: {e}")
        return set()
    
    def _save_processed_articles(self):
        try:
            with open(self.processed_file, 'w') as f:
                json.dump({
                    'ids': list(self.processed_articles),
                    'updated': datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar artigos processados: {e}")
    
    def fetch_rss_articles(self, limit: int = 3) -> List[Dict]:
        logger.info(f"🔍 Buscando artigos de {self.rss_feed}")
        try:
            feed = feedparser.parse(self.rss_feed)
            new_articles = []
            for entry in feed.entries[:limit * 2]:
                article_id = entry.get('id', entry.get('link'))
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
        if not self.api_manager.configure_gemini():
            logger.error("❌ Não foi possível configurar Gemini - todas as chaves esgotaram")
            return None
        
        language_prompts = {
            'pt-BR': f"Traduza o seguinte {'título' if is_title else 'texto'} para português brasileiro...",
            'en': f"Keep the following {'title' if is_title else 'text'} in English, but improve...",
            'es': f"Traduce el siguiente {'título' if is_title else 'texto'} al español..."
        }
        prompt = language_prompts.get(target_language, language_prompts['en'])
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            self.api_manager.record_request(success=True)
            result = response.text.strip()
            logger.info(f"✅ Tradução {target_language}: {result[:50]}...")
            return result
        except Exception as e:
            logger.error(f"❌ Erro na tradução para {target_language}: {e}")
            self.api_manager.record_request(success=False)
            return None
    
    def _generate_slug(self, title: str) -> str:
        slug = title.lower()
        slug = re.sub(r'[áàâãäå]', 'a', slug)
        slug = re.sub(r'[éèêë]', 'e', slug)
        slug = re.sub(r'[íìîï]', 'i', slug)
        slug = re.sub(r'[óòôõöø]', 'o', slug)
        slug = re.sub(r'[úùûü]', 'u', slug)
        slug = re.sub(r'[ç]', 'c', slug)
        slug = re.sub(r'[ñ]', 'n', slug)
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        return slug[:50].strip('-')
    
    def _clean_content(self, content: str) -> str:
        content = re.sub(r'<strong>(.*?)</strong>', r'**\1**', content)
        content = re.sub(r'<b>(.*?)</b>', r'**\1**', content)
        content = re.sub(r'<em>(.*?)</em>', r'*\1*', content)
        content = re.sub(r'<i>(.*?)</i>', r'*\1*', content)
        content = re.sub(r'<[^>]+>', '', content)
        content = re.sub(r'\s+', ' ', content)
        sentences = content.split('.')
        unique_sentences = []
        seen = set()
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and sentence not in seen:
                unique_sentences.append(sentence)
                seen.add(sentence)
        cleaned_content = '. '.join(unique_sentences)
        return cleaned_content.strip()

    def publish_to_strapi_with_correct_i18n(self, articles):
        published_articles = []
        for article in articles:
            try:
                logger.info(f"\n Processando: {article['title'][:60]}...")
                
                # 1. Criar post base em inglês (sempre)
                logger.info(" Criando post base em inglês...")
                english_title = self.translate_text(article['title'], 'en', is_title=True)
                english_content = self.translate_text(article['content'], 'en', is_title=False)
                
                if not english_title or not english_content:
                    logger.error("❌ Falha na tradução inglesa - pulando")
                    continue
                
                base_post_data = {
                    'title': english_title,
                    'content': self._clean_content(english_content),
                    'slug': self._generate_slug(english_title)
                }
                
                base_result = self.strapi.create_base_post(base_post_data, 'en')
                if not base_result:
                    logger.error("❌ Falha ao criar post base - pulando")
                    continue
                
                document_id = base_result['documentId']
                base_id = base_result['id']
                time.sleep(2)
                
                # 2. Criar localizações
                localizations = []
                for lang in self.enabled_languages:
                    if lang == 'en': continue # Pular inglês, já é base
                    
                    logger.info(f" Criando localização em {lang}...")
                    lang_title = self.translate_text(article['title'], lang, is_title=True)
                    lang_content = self.translate_text(article['content'], lang, is_title=False)
                    
                    if lang_title and lang_content:
                        lang_data = {
                            'title': lang_title,
                            'content': self._clean_content(lang_content),
                            'slug': self._generate_slug(lang_title)
                        }
                        lang_result = self.strapi.create_localization(document_id, lang_data, lang)
                        if lang_result:
                            localizations.append(lang_result)
                        time.sleep(2)
                    else:
                        logger.warning(f"⚠️  Tradução para {lang} falhou. Pulando localização.")

                self.processed_articles.add(article['id'])
                result = {
                    'article_id': article['id'],
                    'document_id': document_id,
                    'base_id': base_id,
                    'base_title': english_title,
                    'base_locale': 'en',
                    'localizations': localizations,
                    'total_locales': 1 + len(localizations)
                }
                published_articles.append(result)
                logger.info(f"🎉 Artigo publicado com padrão i18n correto!")
                self._save_processed_articles()
                
            except Exception as e:
                logger.error(f"❌ Erro ao processar artigo: {e}")
                continue
        return published_articles
    
    def run_correct_i18n_pipeline(self, limit: int = 1):
        logger.info("🚀 Iniciando pipeline com padrão i18n correto (Context7)...")
        key_status = self.api_manager.get_status()
        logger.info(f" Status das chaves: {key_status['total_requests_today']}/{key_status['max_requests_today']}")
        articles = self.fetch_rss_articles(limit)
        if not articles:
            logger.info(" Nenhum artigo novo encontrado")
            return
        published = self.publish_to_strapi_with_correct_i18n(articles)
        logger.info(f"\n Pipeline concluído! Artigos publicados: {len(published)}")
        final_status = self.api_manager.get_status()
        logger.info(f" Requests usados: {final_status['total_requests_today']}/{final_status['max_requests_today']}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Pipeline RSS Multilíngue - Padrão i18n Correto")
    parser.add_argument('--limit', type=int, default=1, help='Número de artigos para processar')
    parser.add_argument('--languages', type=str, help='Idiomas para publicar (ex: "pt-BR,es")')
    args = parser.parse_args()
    
    pipeline = MultilingualRSSPipeline(languages=args.languages)
    pipeline.run_correct_i18n_pipeline(args.limit)

if __name__ == "__main__":
    main()