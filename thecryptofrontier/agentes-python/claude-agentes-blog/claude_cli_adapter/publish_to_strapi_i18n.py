#!/usr/bin/env python3
"""
Publica artigos no Strapi com suporte a internacionalização (i18n)
Baseado nas instruções do agente especializado em Strapi
"""
import os
import json
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, List, Optional

# Carregar variáveis de ambiente
load_dotenv()

STRAPI_URL = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com')
STRAPI_API_TOKEN = os.getenv('STRAPI_API_TOKEN', '')

class StrapiI18nPublisher:
    """Publicador com suporte a múltiplos idiomas"""
    
    def __init__(self, url: str, token: str):
        self.url = url.rstrip('/')
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_post(self, article_data: Dict, locale: str = 'pt') -> Optional[Dict]:
        """
        Cria um novo post em um idioma específico
        
        Args:
            article_data: Dados do artigo
            locale: Código do idioma (pt, en, es, etc)
        """
        # Preparar dados para Strapi v5 com locale
        strapi_data = {
            "data": {
                "title": article_data['title'],
                "slug": article_data['slug'],
                "content": article_data['content'],
                "excerpt": article_data.get('excerpt', ''),
                "status": "published",
                "locale": locale,  # Especifica o idioma
                "publishedAt": datetime.now().isoformat()
            }
        }
        
        # Adicionar campos opcionais se existirem
        if 'tags' in article_data:
            strapi_data['data']['tags'] = article_data['tags']
        if 'categories' in article_data:
            strapi_data['data']['categories'] = article_data['categories']
        if 'seo' in article_data:
            strapi_data['data']['seo'] = article_data['seo']
        
        print(f"📤 Criando artigo em {locale}: {article_data['title']}")
        
        try:
            response = requests.post(
                f"{self.url}/api/posts",
                headers=self.headers,
                json=strapi_data
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                document_id = result['data']['documentId']
                print(f"✅ Artigo criado em {locale}! Document ID: {document_id}")
                return result
            else:
                print(f"❌ Erro ao criar em {locale}: {response.status_code}")
                print(f"📝 Resposta: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Erro de conexão: {str(e)}")
            return None
    
    def update_locale_version(self, document_id: str, article_data: Dict, locale: str) -> Optional[Dict]:
        """
        Cria ou atualiza uma versão de idioma para um documento existente
        
        Args:
            document_id: ID do documento no Strapi
            article_data: Dados do artigo traduzido
            locale: Código do idioma
        """
        strapi_data = {
            "data": {
                "title": article_data['title'],
                "slug": f"{article_data['slug']}-{locale}",  # Slug único por idioma
                "content": article_data['content'],
                "excerpt": article_data.get('excerpt', ''),
            }
        }
        
        # Adicionar campos opcionais
        if 'seo' in article_data:
            strapi_data['data']['seo'] = article_data['seo']
        
        print(f"🔄 Atualizando versão em {locale} para documento {document_id}")
        
        try:
            response = requests.put(
                f"{self.url}/api/posts/{document_id}?locale={locale}",
                headers=self.headers,
                json=strapi_data
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Versão em {locale} atualizada!")
                return response.json()
            else:
                print(f"❌ Erro ao atualizar {locale}: {response.status_code}")
                print(f"📝 Resposta: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Erro: {str(e)}")
            return None
    
    def publish_locale(self, document_id: str, locale: str = '*') -> bool:
        """
        Publica uma versão específica de idioma ou todas
        
        Args:
            document_id: ID do documento
            locale: Código do idioma ou '*' para todos
        """
        # Nota: Esta é a sintaxe da Document Service API
        # Para REST API, seria um PUT com status: "published"
        
        publish_data = {
            "data": {
                "status": "published",
                "publishedAt": datetime.now().isoformat()
            }
        }
        
        locale_param = f"?locale={locale}" if locale != '*' else ""
        
        try:
            response = requests.put(
                f"{self.url}/api/posts/{document_id}/publish{locale_param}",
                headers=self.headers,
                json=publish_data
            )
            
            if response.status_code == 200:
                print(f"✅ Publicado: {locale}")
                return True
            else:
                # Tentar alternativa: atualizar com status published
                response = requests.put(
                    f"{self.url}/api/posts/{document_id}{locale_param}",
                    headers=self.headers,
                    json=publish_data
                )
                return response.status_code == 200
                
        except Exception as e:
            print(f"⚠️ Erro ao publicar: {e}")
            return False

def translate_article(article: Dict, target_locale: str) -> Dict:
    """
    Traduz um artigo para outro idioma usando Claude CLI
    
    Args:
        article: Artigo original
        target_locale: Idioma de destino
    """
    from claude_agent import ClaudeAgent
    
    agent = ClaudeAgent()
    
    # Mapa de locales para idiomas
    locale_map = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese'
    }
    
    target_language = locale_map.get(target_locale, 'English')
    
    # Traduzir título
    title_prompt = f"Translate this title to {target_language}, maintaining SEO optimization: {article['title']}"
    translated_title = agent.translate(title_prompt)
    
    # Traduzir conteúdo
    content_prompt = f"Translate this article to {target_language}, maintaining markdown formatting:\n\n{article['content']}"
    translated_content = agent.translate(content_prompt)
    
    # Traduzir excerpt
    excerpt_prompt = f"Translate this excerpt to {target_language}: {article.get('excerpt', '')}"
    translated_excerpt = agent.translate(excerpt_prompt) if article.get('excerpt') else ''
    
    # Criar artigo traduzido
    translated_article = article.copy()
    translated_article['title'] = translated_title
    translated_article['content'] = translated_content
    translated_article['excerpt'] = translated_excerpt
    
    # Traduzir SEO se existir
    if 'seo' in article:
        translated_article['seo'] = {
            'metaTitle': agent.translate(f"Translate to {target_language}: {article['seo'].get('metaTitle', '')}"),
            'metaDescription': agent.translate(f"Translate to {target_language}: {article['seo'].get('metaDescription', '')}"),
            'keywords': article['seo'].get('keywords', [])  # Keywords geralmente não precisam tradução
        }
    
    return translated_article

def publish_multilingual_article(article_path: str, locales: List[str] = ['pt', 'en']) -> Dict:
    """
    Publica um artigo em múltiplos idiomas
    
    Args:
        article_path: Caminho para o arquivo JSON do artigo
        locales: Lista de idiomas para publicar
    """
    # Ler artigo
    with open(article_path, 'r', encoding='utf-8') as f:
        article = json.load(f)
    
    publisher = StrapiI18nPublisher(STRAPI_URL, STRAPI_API_TOKEN)
    
    results = {}
    document_id = None
    
    for i, locale in enumerate(locales):
        print(f"\n{'='*50}")
        print(f"🌍 Processando idioma: {locale}")
        print(f"{'='*50}\n")
        
        # Se não for PT, traduzir
        if locale != 'pt':
            print(f"🔄 Traduzindo artigo para {locale}...")
            article_locale = translate_article(article, locale)
        else:
            article_locale = article
        
        if i == 0:
            # Criar o primeiro post
            result = publisher.create_post(article_locale, locale)
            if result:
                document_id = result['data']['documentId']
                results[locale] = result
        else:
            # Criar versões adicionais de idioma
            if document_id:
                result = publisher.update_locale_version(document_id, article_locale, locale)
                results[locale] = result
    
    # Publicar todas as versões
    if document_id:
        print(f"\n📢 Publicando todas as versões...")
        publisher.publish_locale(document_id, '*')
    
    return results

def main():
    """Função principal para testar publicação multilíngue"""
    print("🚀 Publicação Multilíngue no Strapi\n")
    
    if not STRAPI_API_TOKEN:
        print("❌ Token do Strapi não encontrado!")
        print("💡 Configure STRAPI_API_TOKEN no arquivo .env")
        return
    
    # Procurar artigos em staging
    staging_dir = Path("staging_posts")
    if not staging_dir.exists():
        print("❌ Diretório staging_posts não encontrado!")
        return
    
    # Pegar o primeiro artigo JSON
    json_files = list(staging_dir.glob("*.json"))
    if not json_files:
        print("❌ Nenhum artigo encontrado em staging_posts!")
        return
    
    article_path = json_files[0]
    print(f"📄 Publicando artigo: {article_path.name}")
    
    # Publicar em PT e EN
    results = publish_multilingual_article(
        str(article_path),
        locales=['pt', 'en']  # Pode adicionar mais idiomas aqui
    )
    
    print("\n✨ Publicação multilíngue completa!")
    print(f"\n📊 Resumo:")
    for locale, result in results.items():
        if result:
            print(f"  - {locale}: ✅ Sucesso")
        else:
            print(f"  - {locale}: ❌ Falhou")

if __name__ == "__main__":
    main()