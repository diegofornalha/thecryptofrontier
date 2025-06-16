#!/usr/bin/env python3
"""
Testar todos os métodos e endpoints possíveis
"""
import requests
from datetime import datetime

print("🔍 TESTANDO TODOS OS MÉTODOS")
print("="*60)

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = 'ad5ad144c16d2ee0abb263185dd6bdb6dd3ded97f2b7f8a33fc986239eedd6991791bbf35442fcb60b4016b8f696aa4e181d2b3412db82e1ebabc458684172815f4bde15b731c9edb5ff8dc9be126534c2c22c6cddaca94f7709428c7e20631181bcd53e47ff06b9210f71a4a6bd50948032883ac43c30e9b2356cb7a99508a2'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Dados mínimos
data = {
    "data": {
        "title": "Test Post",
        "content": "Test content",
        "publishedAt": datetime.now().isoformat()
    }
}

# Testar diferentes endpoints e métodos
endpoints = [
    '/api/posts',
    '/api/post',
    '/api/blogs',
    '/api/blog',
    '/api/articles',
    '/api/article',
    '/api/content/posts',
    '/api/content-manager/posts',
    '/content-manager/collection-types/api::post.post',
    '/api/collection-types/post',
]

print("\n📋 Testando endpoints:")
for endpoint in endpoints:
    print(f"\n{endpoint}:")
    
    # GET
    try:
        get_resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        print(f"  GET  -> {get_resp.status_code}")
    except:
        print(f"  GET  -> ❌ Erro")
    
    # POST
    try:
        post_resp = requests.post(f"{STRAPI_URL}{endpoint}", headers=headers, json=data, timeout=5)
        print(f"  POST -> {post_resp.status_code}")
        if post_resp.status_code in [200, 201]:
            print(f"  ✅ SUCESSO! Resposta: {post_resp.json()}")
            break
    except:
        print(f"  POST -> ❌ Erro")

print("\n" + "="*60)