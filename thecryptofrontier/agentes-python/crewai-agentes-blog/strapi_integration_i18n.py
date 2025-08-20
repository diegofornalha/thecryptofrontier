#!/usr/bin/env python3
"""
Integração Strapi com schema correto - apenas campos que existem
"""

import json
import requests
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
from pathlib import Path
import re
import unicodedata

from dotenv import load_dotenv
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StrapiI18nIntegration:
    """Integração com Strapi v5 usando apenas campos do schema real"""
    
    def __init__(self, locale: str = 'pt-BR'):
        self.base_url = os.getenv('STRAPI_URL', 'http://localhost:1337')
        self.api_token = os.getenv('STRAPI_API_TOKEN', '')
        self.locale = locale
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_token}'
        }
        self.stats = {
            'created': 0,
            'failed': 0,
            'errors': []
        }
        
        # Configuração de locales disponíveis
        self.available_locales = ['en', 'pt-BR', 'es']
        self.default_locale = 'pt-BR'
    
    def set_locale(self, locale: str):
        """Define o locale para as próximas operações"""
        if locale in self.available_locales:
            self.locale = locale
            logger.info(f"Locale alterado para: {locale}")
        else:
            logger.warning(f"Locale '{locale}' não disponível. Locales disponíveis: {self.available_locales}")
    
    def get_available_locales(self) -> List[str]:
        """Retorna lista de locales disponíveis"""
        try:
            response = requests.get(
                f"{self.base_url}/api/i18n/locales",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                return [locale['code'] for locale in data['data']]
            return self.available_locales
        except Exception as e:
            logger.warning(f"Erro ao buscar locales: {e}")
            return self.available_locales
    
    def validate_post_data(self, data: Dict) -> List[str]:
        """Valida os dados do post antes de enviar - apenas campos do schema"""
        errors = []
        
        # Campos obrigatórios (baseado no schema real)
        if not data.get('title'):
            errors.append('title é obrigatório')
        if not data.get('content'):
            errors.append('content é obrigatório')
        
        # Validações de tamanho
        if data.get('title') and len(data['title']) > 255:
            errors.append('title não pode ter mais de 255 caracteres')
        
        if data.get('excerpt') and len(data['excerpt']) > 500:
            errors.append('excerpt não pode ter mais de 500 caracteres')
        
        return errors
    
    def _generate_slug(self, text: str) -> str:
        """Gera slug URL-friendly"""
        # Remove acentos
        text = unicodedata.normalize('NFD', text)
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        
        # Converte para minúsculas e substitui espaços/caracteres especiais
        text = re.sub(r'[^\w\s-]', '', text.lower())
        text = re.sub(r'[-\s]+', '-', text)
        
        return text.strip('-')
    
    def format_post_data(self, raw_data: Dict, locale: Optional[str] = None) -> Dict:
        """Formata os dados para o padrão do Strapi - APENAS campos do schema"""
        # Define locale a ser usado
        target_locale = locale or self.locale
        
        # Gera slug se não fornecido
        if not raw_data.get('slug'):
            raw_data['slug'] = self._generate_slug(raw_data['title'])
        
        # Estrutura APENAS com campos que existem no schema
        formatted = {
            'data': {
                'title': raw_data['title'],
                'content': raw_data['content'],
                'slug': raw_data['slug'],
                'excerpt': raw_data.get('excerpt', ''),
                'locale': target_locale
            }
        }
        
        return formatted
    
    def create_post(self, raw_data: Dict, locale: Optional[str] = None) -> Dict:
        """Cria um post no Strapi com suporte a locale específico"""
        try:
            # Define locale
            target_locale = locale or self.locale
            
            # Valida dados
            errors = self.validate_post_data(raw_data)
            if errors:
                raise ValueError(f"Validação falhou: {', '.join(errors)}")
            
            # Formata dados com locale
            post_data = self.format_post_data(raw_data, target_locale)
            
            # Adiciona parâmetro locale na URL
            url = f"{self.base_url}/api/posts?locale={target_locale}"
            
            # Envia para o Strapi
            response = requests.post(url, json=post_data, headers=self.headers)
            
            if response.status_code in [200, 201]:
                self.stats['created'] += 1
                data = response.json()
                logger.info(f"Post criado com sucesso em {target_locale}: {data['data']['title']}")
                return {
                    'success': True,
                    'id': data['data']['id'],
                    'locale': target_locale,
                    'slug': data['data']['slug'],
                    'url': f"/{target_locale}/post/{data['data']['slug']}"
                }
            else:
                error_msg = response.json().get('error', {}).get('message', response.text)
                raise Exception(f"Erro do Strapi: {error_msg}")
                
        except Exception as e:
            self.stats['failed'] += 1
            self.stats['errors'].append({
                'title': raw_data.get('title', 'Sem título'),
                'locale': target_locale,
                'error': str(e)
            })
            
            logger.error(f"Erro ao criar post em {target_locale}: {e}")
            return {
                'success': False,
                'error': str(e),
                'locale': target_locale
            }
    
    def show_stats(self):
        """Mostra estatísticas de operações"""
        print(f"\n📊 Estatísticas:")
        print(f"   ✅ Criados: {self.stats['created']}")
        print(f"   ❌ Falharam: {self.stats['failed']}")
        if self.stats['errors']:
            print(f"   🔍 Erros:")
            for error in self.stats['errors']:
                print(f"      - {error['title']} ({error['locale']}): {error['error']}")

def test_schema_compliance():
    """Teste com schema correto"""
    
    client = StrapiI18nIntegration()
    
    print('🔧 TESTE: SCHEMA CORRETO - APENAS CAMPOS QUE EXISTEM')
    print('=' * 55)
    
    # Teste com apenas os campos do schema
    test_data = {
        'title': '✅ Schema Correto - Sistema Funcionando',
        'content': '''## Schema Perfeitamente Alinhado! 🎯

O sistema agora usa **apenas os campos que existem** no schema do Strapi:

### ✅ Campos utilizados:
- **title** (string, obrigatório)
- **content** (richtext)
- **slug** (uid, auto-gerado)
- **excerpt** (text, opcional)
- **locale** (para i18n)

### 🚀 Resultado:
**Sistema funcionando sem erros de schema!**''',
        'excerpt': 'Sistema corrigido para usar apenas campos do schema real'
    }
    
    # Testar nos 3 idiomas
    for locale in ['pt-BR', 'en', 'es']:
        print(f'\n🌐 Testando {locale}:')
        result = client.create_post(test_data, locale)
        
        if result['success']:
            print(f'   ✅ Sucesso - ID: {result["id"]}')
            print(f'   🔗 Slug: {result["slug"]}')
        else:
            print(f'   ❌ Erro: {result["error"]}')
    
    client.show_stats()

if __name__ == '__main__':
    test_schema_compliance()
