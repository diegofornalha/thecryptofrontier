#!/usr/bin/env python
import os
import sys
import json
import requests
from datetime import datetime

# Obter tokens e configurações do Sanity
PROJECT_ID = os.environ.get('NEXT_PUBLIC_SANITY_PROJECT_ID', 'brby2yrg')
DATASET = os.environ.get('NEXT_PUBLIC_SANITY_DATASET', 'production')
API_VERSION = os.environ.get('NEXT_PUBLIC_SANITY_API_VERSION', '2023-05-03')
SANITY_TOKEN = os.environ.get('SANITY_DEV_TOKEN', '')

# Remover quebras de linha do token
SANITY_TOKEN = SANITY_TOKEN.replace('\n', '')

def get_sanity_posts():
    """Busca posts no Sanity CMS."""
    # Construir URL da API
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query=*[_type == 'post']"
    
    # Definir headers com token
    headers = {
        "Authorization": f"Bearer {SANITY_TOKEN}"
    }
    
    try:
        # Fazer requisição à API
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Levanta exceção se houver erro
        
        # Retornar dados
        return response.json().get('result', [])
    except Exception as e:
        print(f"Erro ao acessar a API do Sanity: {e}")
        return []

def format_date(date_string):
    """Formata data para exibição."""
    try:
        dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return dt.strftime('%d/%m/%Y %H:%M')
    except:
        return date_string

def main():
    # Buscar posts no Sanity
    posts = get_sanity_posts()
    
    # Verificar se foram encontrados posts
    if not posts:
        print("Nenhum post encontrado no Sanity CMS.")
        sys.exit(1)
    
    # Mostrar contagem de posts
    print(f"Encontrados {len(posts)} posts no Sanity CMS:\n")
    
    # Mostrar informações de cada post
    for i, post in enumerate(posts, 1):
        post_id = post.get('_id', 'ID não disponível')
        title = post.get('title', 'Título não disponível')
        created_at = format_date(post.get('_createdAt', 'Data não disponível'))
        slug = post.get('slug', {}).get('current', 'Slug não disponível')
        
        print(f"{i}. ID: {post_id}")
        print(f"   Título: {title}")
        print(f"   Slug: {slug}")
        print(f"   Criado em: {created_at}")
        print()
    
    # Se quiser ver os dados completos do primeiro post
    if posts and input("Deseja ver os detalhes completos do primeiro post? (s/n): ").lower() == 's':
        print("\nDetalhes completos do primeiro post:")
        print(json.dumps(posts[0], indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main() 