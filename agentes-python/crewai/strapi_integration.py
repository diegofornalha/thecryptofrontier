#!/usr/bin/env python3
"""
Integração do Blog Crew com o Strapi v5
Coordenado pelo Guardian para supervisão e monitoramento
"""

import json
import requests
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class StrapiIntegration:
    """Cliente para integração com Strapi v5"""
    
    def __init__(self):
        self.base_url = os.getenv('STRAPI_URL', 'http://localhost:1337')
        self.api_token = os.getenv('STRAPI_API_TOKEN', '')
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_token}'
        }
        self.stats = {
            'created': 0,
            'failed': 0,
            'errors': []
        }
    
    def validate_post_data(self, data: Dict) -> List[str]:
        """Valida os dados do post antes de enviar"""
        errors = []
        
        # Campos obrigatórios
        if not data.get('title'):
            errors.append('title é obrigatório')
        if not data.get('content'):
            errors.append('content é obrigatório')
        
        # Validações de tipo
        if 'readingTime' in data and not isinstance(data['readingTime'], int):
            errors.append('readingTime deve ser um número inteiro')
        
        if 'featured' in data and not isinstance(data['featured'], bool):
            errors.append('featured deve ser boolean')
        
        # Validações de tamanho
        if data.get('title') and len(data['title']) > 255:
            errors.append('title não pode ter mais de 255 caracteres')
        
        if data.get('excerpt') and len(data['excerpt']) > 500:
            errors.append('excerpt não pode ter mais de 500 caracteres')
        
        return errors
    
    def format_post_data(self, raw_data: Dict) -> Dict:
        """Formata os dados para o padrão do Strapi"""
        # Calcula tempo de leitura se não fornecido
        if 'readingTime' not in raw_data and raw_data.get('content'):
            words = len(raw_data['content'].split())
            raw_data['readingTime'] = max(1, words // 200)
        
        # Gera slug se não fornecido
        if not raw_data.get('slug'):
            raw_data['slug'] = self._generate_slug(raw_data['title'])
        
        # Estrutura padrão do Strapi
        formatted = {
            'data': {
                'title': raw_data['title'],
                'content': raw_data['content'],
                'slug': raw_data['slug'],
                'excerpt': raw_data.get('excerpt', ''),
                'author': raw_data.get('author', 'AI Agent'),
                'tags': raw_data.get('tags', []),
                'categories': raw_data.get('categories', []),
                'readingTime': raw_data.get('readingTime', 5),
                'featured': raw_data.get('featured', False),
                'publishedAt': raw_data.get('publishedAt', datetime.now().isoformat())
            }
        }
        
        # Adiciona SEO se fornecido
        if raw_data.get('seo') or raw_data.get('metaDescription'):
            formatted['data']['seo'] = {
                'metaTitle': raw_data.get('seo', {}).get('metaTitle', raw_data['title']),
                'metaDescription': raw_data.get('seo', {}).get('metaDescription', 
                                              raw_data.get('metaDescription', raw_data.get('excerpt', ''))),
                'keywords': raw_data.get('seo', {}).get('keywords', raw_data.get('tags', []))
            }
        
        return formatted
    
    def create_post(self, raw_data: Dict) -> Dict:
        """Cria um post no Strapi"""
        try:
            # Valida dados
            errors = self.validate_post_data(raw_data)
            if errors:
                raise ValueError(f"Validação falhou: {', '.join(errors)}")
            
            # Formata dados
            post_data = self.format_post_data(raw_data)
            
            # Envia para o Strapi
            response = requests.post(
                f"{self.base_url}/api/posts",
                json=post_data,
                headers=self.headers
            )
            
            if response.status_code in [200, 201]:
                self.stats['created'] += 1
                data = response.json()
                return {
                    'success': True,
                    'id': data['data']['id'],
                    'slug': data['data']['attributes']['slug'],
                    'url': f"/blog/{data['data']['attributes']['slug']}"
                }
            else:
                error_msg = response.json().get('error', {}).get('message', response.text)
                raise Exception(f"Erro do Strapi: {error_msg}")
                
        except Exception as e:
            self.stats['failed'] += 1
            self.stats['errors'].append({
                'title': raw_data.get('title', 'Sem título'),
                'error': str(e)
            })
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_article(self, raw_data: Dict) -> Dict:
        """Cria um article no Strapi"""
        try:
            # Adapta campos para Article
            article_data = {
                'title': raw_data['title'],
                'content': raw_data['content'],
                'summary': raw_data.get('excerpt', raw_data.get('summary', '')),
                'author': raw_data.get('author', 'AI Agent'),
                'category': raw_data.get('category', raw_data.get('categories', ['Geral'])[0] if raw_data.get('categories') else 'Geral'),
                'tags': raw_data.get('tags', []),
                'publishDate': raw_data.get('publishedAt', datetime.now().isoformat()),
                'readTime': raw_data.get('readingTime', 5),
                'isHighlighted': raw_data.get('featured', False),
                'metaDescription': raw_data.get('metaDescription', ''),
                'metaKeywords': ', '.join(raw_data.get('tags', []))
            }
            
            # Formata para Strapi
            formatted = {'data': article_data}
            
            # Envia para o Strapi
            response = requests.post(
                f"{self.base_url}/api/articles",
                json=formatted,
                headers=self.headers
            )
            
            if response.status_code in [200, 201]:
                self.stats['created'] += 1
                data = response.json()
                return {
                    'success': True,
                    'id': data['data']['id'],
                    'slug': data['data']['attributes']['slug'],
                    'url': f"/articles/{data['data']['attributes']['slug']}"
                }
            else:
                error_msg = response.json().get('error', {}).get('message', response.text)
                raise Exception(f"Erro do Strapi: {error_msg}")
                
        except Exception as e:
            self.stats['failed'] += 1
            self.stats['errors'].append({
                'title': raw_data.get('title', 'Sem título'),
                'error': str(e)
            })
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_multiple_posts(self, posts: List[Dict]) -> List[Dict]:
        """Cria múltiplos posts"""
        results = []
        
        for i, post in enumerate(posts):
            logger.info(f"[{i+1}/{len(posts)}] Criando: {post.get('title', 'Sem título')}")
            
            result = self.create_post(post)
            results.append(result)
            
            if result['success']:
                logger.info(f"✅ Sucesso! URL: {result['url']}")
            else:
                logger.error(f"❌ Erro: {result['error']}")
        
        return results
    
    def _generate_slug(self, text: str) -> str:
        """Gera slug a partir do texto"""
        import re
        import unicodedata
        
        # Normaliza e remove acentos
        text = unicodedata.normalize('NFKD', text)
        text = text.encode('ascii', 'ignore').decode('ascii')
        
        # Converte para lowercase e substitui espaços
        text = re.sub(r'[^\w\s-]', '', text.lower())
        text = re.sub(r'[-\s]+', '-', text)
        
        return text.strip('-')
    
    def show_stats(self):
        """Exibe estatísticas"""
        logger.info("\n📊 Estatísticas:")
        logger.info(f"✅ Posts criados: {self.stats['created']}")
        logger.info(f"❌ Falhas: {self.stats['failed']}")
        
        if self.stats['errors']:
            logger.info("\n❌ Erros detalhados:")
            for i, err in enumerate(self.stats['errors']):
                logger.error(f"{i+1}. {err['title']}: {err['error']}")


class GuardianMonitor:
    """Integração com o Guardian para monitoramento"""
    
    def __init__(self, strapi_client: StrapiIntegration):
        self.strapi = strapi_client
        self.guardian_api = os.getenv('GUARDIAN_API_URL', 'http://localhost:8000')
        
    def notify_start(self, task_name: str, total_posts: int):
        """Notifica o Guardian sobre início de tarefa"""
        try:
            payload = {
                'event': 'task_started',
                'task': task_name,
                'total_items': total_posts,
                'timestamp': datetime.now().isoformat()
            }
            
            requests.post(f"{self.guardian_api}/events", json=payload)
            logger.info(f"Guardian notificado: Iniciando {task_name}")
        except:
            pass  # Guardian é opcional
    
    def notify_progress(self, task_name: str, current: int, total: int):
        """Notifica progresso ao Guardian"""
        try:
            payload = {
                'event': 'task_progress',
                'task': task_name,
                'current': current,
                'total': total,
                'percentage': (current / total) * 100,
                'timestamp': datetime.now().isoformat()
            }
            
            requests.post(f"{self.guardian_api}/events", json=payload)
        except:
            pass
    
    def notify_complete(self, task_name: str, stats: Dict):
        """Notifica conclusão ao Guardian"""
        try:
            payload = {
                'event': 'task_completed',
                'task': task_name,
                'stats': stats,
                'timestamp': datetime.now().isoformat()
            }
            
            requests.post(f"{self.guardian_api}/events", json=payload)
            logger.info(f"Guardian notificado: {task_name} concluído")
        except:
            pass


class CrewAIAdapter:
    """Adaptador para integrar com CrewAI"""
    
    def __init__(self):
        self.strapi = StrapiIntegration()
        self.guardian = GuardianMonitor(self.strapi)
    
    def process_crew_output(self, crew_output: Dict) -> List[Dict]:
        """Processa saída do CrewAI e cria posts no Strapi"""
        posts = []
        
        # Extrai posts do output do CrewAI
        if 'articles' in crew_output:
            posts = crew_output['articles']
        elif 'posts' in crew_output:
            posts = crew_output['posts']
        elif 'results' in crew_output:
            posts = crew_output['results']
        else:
            # Assume que o próprio output é um post
            posts = [crew_output]
        
        # Notifica Guardian
        self.guardian.notify_start('crew_ai_import', len(posts))
        
        # Processa posts
        results = []
        for i, post in enumerate(posts):
            # Adapta formato do CrewAI para Strapi
            adapted_post = self._adapt_crew_post(post)
            
            # Cria post
            result = self.strapi.create_post(adapted_post)
            results.append(result)
            
            # Notifica progresso
            self.guardian.notify_progress('crew_ai_import', i + 1, len(posts))
        
        # Notifica conclusão
        self.guardian.notify_complete('crew_ai_import', self.strapi.stats)
        
        # Exibe estatísticas
        self.strapi.show_stats()
        
        return results
    
    def _adapt_crew_post(self, crew_post: Dict) -> Dict:
        """Adapta formato do CrewAI para formato esperado pelo Strapi"""
        return {
            'title': crew_post.get('title', crew_post.get('headline', '')),
            'content': crew_post.get('content', crew_post.get('body', crew_post.get('text', ''))),
            'excerpt': crew_post.get('excerpt', crew_post.get('summary', crew_post.get('description', ''))),
            'author': crew_post.get('author', crew_post.get('writer', 'CrewAI Agent')),
            'tags': crew_post.get('tags', crew_post.get('keywords', [])),
            'categories': crew_post.get('categories', crew_post.get('topics', [])),
            'featured': crew_post.get('featured', crew_post.get('highlight', False)),
            'seo': {
                'metaTitle': crew_post.get('seo_title', crew_post.get('meta_title', '')),
                'metaDescription': crew_post.get('seo_description', crew_post.get('meta_description', '')),
                'keywords': crew_post.get('seo_keywords', crew_post.get('keywords', []))
            }
        }


# Funções utilitárias para uso direto
def create_post_from_file(file_path: str):
    """Cria posts a partir de um arquivo JSON"""
    client = StrapiIntegration()
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if isinstance(data, list):
        results = client.create_multiple_posts(data)
    else:
        results = [client.create_post(data)]
    
    client.show_stats()
    return results


def create_test_post():
    """Cria um post de teste"""
    client = StrapiIntegration()
    
    test_post = {
        'title': 'Post de Teste - Integração CrewAI',
        'content': '## Teste de Integração\n\nEste post foi criado pela integração Python com o Strapi v5.',
        'excerpt': 'Testando a integração entre CrewAI e Strapi',
        'author': 'Python Integration',
        'tags': ['teste', 'integração', 'crewai'],
        'categories': ['Testes'],
        'featured': True
    }
    
    result = client.create_post(test_post)
    print(f"\nResultado: {json.dumps(result, indent=2)}")
    return result


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == 'test':
            create_test_post()
        elif sys.argv[1] == 'import' and len(sys.argv) > 2:
            create_post_from_file(sys.argv[2])
        else:
            print("Uso: python strapi_integration.py [test|import <arquivo>]")
    else:
        print("""
Integração Strapi v5 - CrewAI

Uso:
  python strapi_integration.py test              # Cria post de teste
  python strapi_integration.py import posts.json # Importa de arquivo

Para usar em outros scripts:
  from strapi_integration import StrapiIntegration, CrewAIAdapter
        """)