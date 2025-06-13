#!/usr/bin/env python3
"""
Script para editar posts do Sanity via terminal
"""

import os
import sys
import json
import requests
from datetime import datetime
import argparse

# Configurações do Sanity
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "z4sx85c6")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")

def get_api_url(endpoint="query"):
    """Retorna URL da API do Sanity"""
    if endpoint == "query":
        return f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}"
    else:
        return f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"

def get_headers():
    """Retorna headers para requisição"""
    headers = {"Content-Type": "application/json"}
    if SANITY_API_TOKEN:
        headers["Authorization"] = f"Bearer {SANITY_API_TOKEN}"
    return headers

def list_posts(limit=10):
    """Lista posts recentes"""
    query = f'*[_type == "post"] | order(publishedAt desc)[0..{limit-1}]{{_id, title, publishedAt, slug}}'
    url = f"{get_api_url('query')}?query={query}"
    
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        posts = response.json().get("result", [])
        print(f"\n📝 Posts encontrados ({len(posts)}):")
        print("-" * 80)
        for i, post in enumerate(posts):
            date = post.get('publishedAt', 'N/A')[:10] if post.get('publishedAt') else 'N/A'
            print(f"{i+1}. [{date}] {post.get('title', 'Sem título')}")
            print(f"   ID: {post.get('_id')}")
            print(f"   Slug: {post.get('slug', {}).get('current', 'N/A')}")
            print()
        return posts
    else:
        print(f"❌ Erro ao buscar posts: {response.status_code}")
        return []

def get_post(post_id):
    """Busca um post específico"""
    query = f'*[_id == "{post_id}"][0]'
    url = f"{get_api_url('query')}?query={query}"
    
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        return response.json().get("result")
    return None

def update_post(post_id, updates):
    """Atualiza um post"""
    mutations = {
        "mutations": [{
            "patch": {
                "id": post_id,
                "set": updates
            }
        }]
    }
    
    response = requests.post(
        get_api_url('mutate'), 
        headers=get_headers(), 
        json=mutations
    )
    
    if response.status_code == 200:
        print(f"✅ Post atualizado com sucesso!")
        return True
    else:
        print(f"❌ Erro ao atualizar: {response.status_code}")
        print(response.text)
        return False

def main():
    parser = argparse.ArgumentParser(description='Editar posts do Sanity via terminal')
    parser.add_argument('action', choices=['list', 'edit', 'update'], 
                       help='Ação a executar')
    parser.add_argument('--id', help='ID do post')
    parser.add_argument('--title', help='Novo título')
    parser.add_argument('--excerpt', help='Novo resumo')
    parser.add_argument('--published', help='Nova data de publicação (YYYY-MM-DD)')
    parser.add_argument('--limit', type=int, default=10, help='Limite de posts para listar')
    
    args = parser.parse_args()
    
    if not SANITY_API_TOKEN:
        print("⚠️  Token do Sanity não configurado. As operações podem ser limitadas.")
        print("Configure com: export SANITY_API_TOKEN='seu-token-aqui'")
    
    if args.action == 'list':
        list_posts(args.limit)
    
    elif args.action == 'edit':
        if not args.id:
            # Se não passou ID, lista posts para escolher
            posts = list_posts()
            if posts:
                try:
                    choice = int(input("\nEscolha o número do post para editar: ")) - 1
                    if 0 <= choice < len(posts):
                        post_id = posts[choice]['_id']
                        post = get_post(post_id)
                        if post:
                            print(f"\n📄 Editando: {post.get('title')}")
                            print("-" * 80)
                            print(f"Título atual: {post.get('title')}")
                            print(f"Resumo atual: {post.get('excerpt', 'N/A')}")
                            print(f"Publicado em: {post.get('publishedAt', 'N/A')}")
                            
                            # Perguntar o que editar
                            print("\nO que deseja editar? (deixe em branco para manter)")
                            new_title = input("Novo título: ").strip()
                            new_excerpt = input("Novo resumo: ").strip()
                            
                            updates = {}
                            if new_title:
                                updates['title'] = new_title
                            if new_excerpt:
                                updates['excerpt'] = new_excerpt
                            
                            if updates:
                                if input("\nConfirmar alterações? (s/n): ").lower() == 's':
                                    update_post(post_id, updates)
                            else:
                                print("Nenhuma alteração realizada.")
                except (ValueError, IndexError):
                    print("Escolha inválida.")
        else:
            # Editar post específico pelo ID
            post = get_post(args.id)
            if post:
                print(f"\n📄 Post encontrado: {post.get('title')}")
                updates = {}
                if args.title:
                    updates['title'] = args.title
                if args.excerpt:
                    updates['excerpt'] = args.excerpt
                if args.published:
                    updates['publishedAt'] = f"{args.published}T00:00:00Z"
                
                if updates:
                    update_post(args.id, updates)
                else:
                    print("Nenhuma alteração especificada.")
            else:
                print(f"Post com ID {args.id} não encontrado.")
    
    elif args.action == 'update':
        if not args.id:
            print("Por favor, forneça o ID do post com --id")
            return
        
        updates = {}
        if args.title:
            updates['title'] = args.title
        if args.excerpt:
            updates['excerpt'] = args.excerpt
        if args.published:
            updates['publishedAt'] = f"{args.published}T00:00:00Z"
        
        if updates:
            update_post(args.id, updates)
        else:
            print("Nenhuma alteração especificada.")

if __name__ == "__main__":
    main()