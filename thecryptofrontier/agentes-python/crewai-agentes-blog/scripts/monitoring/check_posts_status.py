#!/usr/bin/env python3
"""
Verifica status dos posts no Strapi
"""
import requests
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

STRAPI_PROJECT_ID = os.getenv('STRAPI_PROJECT_ID')
strapi_DATASET = os.getenv('strapi_DATASET', 'production')
strapi_API_TOKEN = os.getenv('strapi_API_TOKEN')

def check_posts():
    # Buscar posts recentes
    query = '*[_type == "post"] | order(_createdAt desc) [0...15]{_id, title, mainImage, _createdAt}'
    
    url = f'https://{STRAPI_PROJECT_ID}.api.strapi.io/v2021-10-21/data/query/{strapi_DATASET}'
    params = {'query': query}
    headers = {'Authorization': f'Bearer {strapi_API_TOKEN}'}
    
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code == 200:
        posts = response.json()['result']
        print(f'\n📊 Status dos últimos {len(posts)} posts:\n')
        
        with_image = 0
        without_image = 0
        
        for i, post in enumerate(posts, 1):
            has_image = post.get('mainImage') is not None
            status = '✅ Com imagem' if has_image else '❌ Sem imagem'
            
            if has_image:
                with_image += 1
            else:
                without_image += 1
            
            # Data de criação
            created = post.get('_createdAt', '')
            if created:
                try:
                    dt = datetime.fromisoformat(created.replace('Z', '+00:00'))
                    created = dt.strftime('%d/%m %H:%M')
                except:
                    created = 'Data desconhecida'
            
            print(f'{i:2d}. {status} | {created} | {post["title"][:50]}...')
        
        print(f'\n📈 Resumo:')
        print(f'   Com imagem: {with_image}')
        print(f'   Sem imagem: {without_image}')
        print(f'   Total: {len(posts)}')
    else:
        print(f'Erro ao buscar posts: {response.status_code}')
        print(response.text)

if __name__ == '__main__':
    check_posts()