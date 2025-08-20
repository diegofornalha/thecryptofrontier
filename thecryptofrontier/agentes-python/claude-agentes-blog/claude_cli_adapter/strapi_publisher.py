#!/usr/bin/env python3
"""
Publisher unificado para Strapi v5 com suporte a:
- Autenticação via API Token ou JWT
- Internacionalização (i18n)
- Publicação em múltiplos idiomas
"""
import os
import json
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

class StrapiAuth:
    """Gerenciador de autenticação para Strapi"""
    
    def __init__(self):
        self.url = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com').rstrip('/')
        self.api_token = os.getenv('STRAPI_API_TOKEN')
        self.email = os.getenv('STRAPI_EMAIL')
        self.password = os.getenv('STRAPI_PASSWORD')
        self.jwt_token = None
        
    def get_headers(self) -> Dict[str, str]:
        """Retorna headers com autenticação apropriada"""
        headers = {'Content-Type': 'application/json'}
        
        # Preferir API Token se disponível
        if self.api_token:
            headers['Authorization'] = f'Bearer {self.api_token}'
        elif self.jwt_token:
            headers['Authorization'] = f'Bearer {self.jwt_token}'
        else:
            # Tentar fazer login se tiver credenciais
            if self.email and self.password:
                self.login()
                if self.jwt_token:
                    headers['Authorization'] = f'Bearer {self.jwt_token}'
        
        return headers
    
    def login(self) -> bool:
        """Faz login e obtém JWT token"""
        if not self.email or not self.password:
            print("❌ Email e senha não configurados")
            return False
            
        try:
            response = requests.post(
                f"{self.url}/api/auth/local",
                json={
                    "identifier": self.email,
                    "password": self.password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.jwt_token = data['jwt']
                print("✅ Login realizado com sucesso")
                
                # Salvar JWT para uso futuro
                with open('.jwt_token', 'w') as f:
                    f.write(self.jwt_token)
                
                return True
            else:
                print(f"❌ Erro no login: {response.status_code}")
                print(response.text)
                return False
                
        except Exception as e:
            print(f"❌ Erro de conexão no login: {e}")
            return False

class StrapiPublisher:
    """Publisher com suporte completo para Strapi v5"""
    
    def __init__(self):
        self.auth = StrapiAuth()
        self.url = self.auth.url
        
    def create_post(self, article: Dict, locale: str = 'pt') -> Optional[Dict]:
        """
        Cria novo post em idioma específico
        
        Args:
            article: Dados do artigo
            locale: Código do idioma (pt, en, es, etc)
        """
        headers = self.auth.get_headers()
        
        if 'Authorization' not in headers:
            print("❌ Falha na autenticação - verifique as credenciais")
            return None
        
        # Preparar dados para Strapi v5
        strapi_data = {
            "data": {
                "title": article['title'],
                "slug": article['slug'],
                "content": article['content'],
                "excerpt": article.get('excerpt', ''),
                "locale": locale,
                "publishedAt": datetime.now().isoformat()
            }
        }
        
        # Adicionar campos opcionais
        optional_fields = ['tags', 'categories', 'seo', 'meta_description']
        for field in optional_fields:
            if field in article:
                strapi_data['data'][field] = article[field]
        
        print(f"\n📤 Criando artigo em {locale}: {article['title']}")
        
        try:
            response = requests.post(
                f"{self.url}/api/posts",
                headers=headers,
                json=strapi_data
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ Artigo criado com sucesso!")
                
                # Log detalhes
                data = result.get('data', {})
                if 'id' in data:
                    print(f"   ID: {data['id']}")
                if 'documentId' in data:
                    print(f"   Document ID: {data['documentId']}")
                
                return result
            
            elif response.status_code == 403:
                print("❌ Erro 403: Permissão negada")
                print("💡 Verifique:")
                print("   1. Se o token tem permissão para criar posts")
                print("   2. Se o content-type 'posts' está configurado corretamente")
                print("   3. Se as permissões públicas/autenticadas estão corretas")
            
            elif response.status_code == 401:
                print("❌ Erro 401: Não autorizado")
                print("💡 Token inválido ou expirado")
            
            else:
                print(f"❌ Erro {response.status_code}")
                print(f"Resposta: {response.text}")
            
            return None
            
        except requests.exceptions.ConnectionError:
            print("❌ Erro de conexão - Strapi está rodando?")
            return None
        except Exception as e:
            print(f"❌ Erro: {e}")
            return None
    
    def update_locale_version(self, document_id: str, article: Dict, locale: str) -> Optional[Dict]:
        """Cria/atualiza versão em outro idioma"""
        headers = self.auth.get_headers()
        
        if 'Authorization' not in headers:
            return None
        
        strapi_data = {
            "data": {
                "title": article['title'],
                "slug": f"{article['slug']}-{locale}",
                "content": article['content'],
                "excerpt": article.get('excerpt', '')
            }
        }
        
        # Adicionar campos opcionais
        if 'seo' in article:
            strapi_data['data']['seo'] = article['seo']
        
        print(f"🔄 Criando versão em {locale} para documento {document_id}")
        
        try:
            # Tentar PUT com locale
            response = requests.put(
                f"{self.url}/api/posts/{document_id}?locale={locale}",
                headers=headers,
                json=strapi_data
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Versão em {locale} criada!")
                return response.json()
            else:
                print(f"❌ Erro ao criar versão em {locale}: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Erro: {e}")
            return None
    
    def publish_all_locales(self, document_id: str) -> bool:
        """Publica todas as versões de idioma"""
        headers = self.auth.get_headers()
        
        if 'Authorization' not in headers:
            return False
        
        # Para Strapi v5, publicar significa atualizar com publishedAt
        publish_data = {
            "data": {
                "publishedAt": datetime.now().isoformat()
            }
        }
        
        try:
            response = requests.put(
                f"{self.url}/api/posts/{document_id}?locale=all",
                headers=headers,
                json=publish_data
            )
            
            if response.status_code == 200:
                print("✅ Todas as versões publicadas!")
                return True
            else:
                print(f"⚠️ Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erro ao publicar: {e}")
            return False

def translate_with_claude(article: Dict, target_locale: str) -> Dict:
    """Traduz artigo usando Claude CLI"""
    from claude_agent import ClaudeAgent
    
    agent = ClaudeAgent()
    
    locale_languages = {
        'en': 'English',
        'es': 'Spanish', 
        'fr': 'French',
        'de': 'German',
        'it': 'Italian'
    }
    
    if target_locale == 'pt':
        return article  # Já está em português
    
    target_lang = locale_languages.get(target_locale, 'English')
    
    print(f"🔄 Traduzindo para {target_lang}...")
    
    # Traduzir campos principais
    translated = {
        'title': agent.translate(f"Translate to {target_lang}: {article['title']}"),
        'content': agent.translate(f"Translate to {target_lang}, keep markdown:\n{article['content']}"),
        'excerpt': agent.translate(f"Translate to {target_lang}: {article.get('excerpt', '')}") if article.get('excerpt') else '',
        'slug': article['slug'],  # Manter slug original
        'tags': article.get('tags', []),
        'categories': article.get('categories', [])
    }
    
    # Traduzir SEO se existir
    if 'seo' in article:
        translated['seo'] = {
            'metaTitle': agent.translate(f"Translate to {target_lang}: {article['seo'].get('metaTitle', '')}"),
            'metaDescription': agent.translate(f"Translate to {target_lang}: {article['seo'].get('metaDescription', '')}"),
            'keywords': article['seo'].get('keywords', [])
        }
    
    return translated

def publish_multilingual(article_path: str, locales: List[str] = ['pt', 'en']) -> bool:
    """
    Publica artigo em múltiplos idiomas
    
    Args:
        article_path: Caminho do arquivo JSON
        locales: Lista de idiomas para publicar
    """
    # Ler artigo
    with open(article_path, 'r', encoding='utf-8') as f:
        article = json.load(f)
    
    publisher = StrapiPublisher()
    
    print(f"\n{'='*60}")
    print(f"📚 Publicação Multilíngue: {article['title']}")
    print(f"🌍 Idiomas: {', '.join(locales)}")
    print(f"{'='*60}")
    
    results = {}
    document_id = None
    
    # Publicar primeiro idioma (criar documento)
    first_locale = locales[0]
    
    if first_locale != 'pt':
        article_first = translate_with_claude(article, first_locale)
    else:
        article_first = article
    
    result = publisher.create_post(article_first, first_locale)
    if result and result.get('data'):
        document_id = result['data'].get('documentId') or result['data'].get('id')
        results[first_locale] = True
    else:
        results[first_locale] = False
        return False
    
    # Criar versões nos outros idiomas
    for locale in locales[1:]:
        print(f"\n{'─'*40}")
        
        if locale != 'pt':
            article_locale = translate_with_claude(article, locale)
        else:
            article_locale = article
        
        result = publisher.update_locale_version(document_id, article_locale, locale)
        results[locale] = result is not None
    
    # Publicar todas as versões
    if document_id and all(results.values()):
        print(f"\n{'─'*40}")
        publisher.publish_all_locales(document_id)
    
    # Resumo
    print(f"\n{'='*60}")
    print("📊 Resumo da publicação:")
    for locale, success in results.items():
        status = "✅ Sucesso" if success else "❌ Falhou"
        print(f"   {locale}: {status}")
    print(f"{'='*60}\n")
    
    return all(results.values())

def test_connection():
    """Testa conexão e autenticação com Strapi"""
    print("🔍 Testando conexão com Strapi...\n")
    
    auth = StrapiAuth()
    
    # Verificar configurações
    print("📋 Configurações:")
    print(f"   URL: {auth.url}")
    print(f"   API Token: {'✅ Configurado' if auth.api_token else '❌ Não configurado'}")
    print(f"   Email: {'✅ Configurado' if auth.email else '❌ Não configurado'}")
    print(f"   Senha: {'✅ Configurada' if auth.password else '❌ Não configurada'}")
    
    # Testar conexão
    try:
        response = requests.get(f"{auth.url}/api/posts", headers=auth.get_headers())
        print(f"\n🌐 Conexão: ✅ OK")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   Autenticação: ✅ OK")
        elif response.status_code == 401:
            print("   Autenticação: ❌ Token inválido")
        elif response.status_code == 403:
            print("   Autenticação: ⚠️ Sem permissão")
        
    except Exception as e:
        print(f"\n🌐 Conexão: ❌ Falhou")
        print(f"   Erro: {e}")

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Publisher Strapi v5 com i18n')
    parser.add_argument('--test', action='store_true', help='Testar conexão')
    parser.add_argument('--file', type=str, help='Arquivo JSON para publicar')
    parser.add_argument('--locales', type=str, default='pt,en', help='Idiomas (ex: pt,en,es)')
    
    args = parser.parse_args()
    
    if args.test:
        test_connection()
        return
    
    if args.file:
        locales = args.locales.split(',')
        publish_multilingual(args.file, locales)
        return
    
    # Modo padrão: publicar primeiro arquivo em staging
    staging_dir = Path("staging_posts")
    if staging_dir.exists():
        json_files = list(staging_dir.glob("*.json"))
        if json_files:
            publish_multilingual(str(json_files[0]), ['pt', 'en'])
        else:
            print("❌ Nenhum arquivo encontrado em staging_posts/")
    else:
        print("❌ Diretório staging_posts/ não encontrado")

if __name__ == "__main__":
    main()