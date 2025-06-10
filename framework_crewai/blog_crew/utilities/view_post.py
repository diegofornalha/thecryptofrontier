#!/usr/bin/env python3
"""
Script para visualizar detalhes completos de um post do Sanity
"""

import os
import sys
import json
import requests
from datetime import datetime

# Configurações do Sanity
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")

def get_api_url():
    """Retorna URL da API do Sanity"""
    return f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}"

def get_headers():
    """Retorna headers para requisição"""
    headers = {"Content-Type": "application/json"}
    if SANITY_API_TOKEN:
        headers["Authorization"] = f"Bearer {SANITY_API_TOKEN}"
    return headers

def view_post(post_id):
    """Visualiza detalhes completos de um post"""
    # Query mais completa para pegar todos os campos
    query = f'''*[_id == "{post_id}"][0]{{
        _id,
        _type,
        _createdAt,
        _updatedAt,
        title,
        slug,
        publishedAt,
        excerpt,
        "contentPreview": pt::text(content)[0..500],
        mainImage,
        categories[]->{{title, slug}},
        tags[]->{{title, slug}},
        author->{{name, role}},
        originalSource,
        seo
    }}'''
    
    url = f"{get_api_url()}?query={query}"
    
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        post = response.json().get("result")
        if post:
            print("\n" + "="*80)
            print(f"📄 DETALHES DO POST")
            print("="*80)
            
            # Informações básicas
            print(f"\n🆔 ID: {post.get('_id')}")
            print(f"📌 Tipo: {post.get('_type')}")
            print(f"📅 Criado em: {post.get('_createdAt', 'N/A')}")
            print(f"🔄 Atualizado em: {post.get('_updatedAt', 'N/A')}")
            
            # Conteúdo principal
            print(f"\n📝 CONTEÚDO")
            print("-"*40)
            print(f"Título: {post.get('title', 'N/A')}")
            print(f"Slug: {post.get('slug', {}).get('current', 'N/A')}")
            print(f"Publicado em: {post.get('publishedAt', 'N/A')}")
            print(f"\nResumo: {post.get('excerpt', 'N/A')}")
            
            # Preview do conteúdo
            content_preview = post.get('contentPreview', '')
            if content_preview:
                print(f"\nPrévia do conteúdo:")
                print("-"*40)
                print(content_preview[:300] + "..." if len(content_preview) > 300 else content_preview)
            
            # Categorias e Tags
            categories = post.get('categories', [])
            if categories:
                print(f"\n🏷️  Categorias: {', '.join([c.get('title', '') for c in categories])}")
            
            tags = post.get('tags', [])
            if tags:
                print(f"🔖 Tags: {', '.join([t.get('title', '') for t in tags])}")
            
            # Autor
            author = post.get('author')
            if author:
                print(f"\n✍️  Autor: {author.get('name', 'N/A')} ({author.get('role', 'N/A')})")
            
            # Fonte original
            source = post.get('originalSource')
            if source:
                print(f"\n🔗 FONTE ORIGINAL")
                print("-"*40)
                print(f"Site: {source.get('site', 'N/A')}")
                print(f"Título: {source.get('title', 'N/A')}")
                print(f"URL: {source.get('url', 'N/A')}")
            
            # SEO
            seo = post.get('seo')
            if seo:
                print(f"\n🔍 SEO")
                print("-"*40)
                print(f"Meta título: {seo.get('metaTitle', 'N/A')}")
                print(f"Meta descrição: {seo.get('metaDescription', 'N/A')}")
                if seo.get('keywords'):
                    print(f"Palavras-chave: {', '.join(seo.get('keywords', []))}")
            
            print("\n" + "="*80)
            
            return post
        else:
            print(f"❌ Post com ID {post_id} não encontrado.")
    else:
        print(f"❌ Erro ao buscar post: {response.status_code}")
        print(response.text)
    
    return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python view_post.py <POST_ID>")
        print("Exemplo: python view_post.py IGLJ692qDuwtW5XRZhYk64")
        sys.exit(1)
    
    post_id = sys.argv[1]
    view_post(post_id)