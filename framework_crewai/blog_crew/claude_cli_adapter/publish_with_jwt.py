#!/usr/bin/env python3
"""
Publicar artigo via JWT - Script simplificado
"""
import requests
import json
from pathlib import Path
from datetime import datetime
import getpass

print("🚀 PUBLICAR ARTIGO NO STRAPI")
print("="*60)

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

# Solicitar senha
print("\nVou publicar como usuário: diegofornalha")
password = getpass.getpass("Digite sua senha do Strapi: ")

# Login
print("\n🔄 Fazendo login...")
login_resp = requests.post(
    f"{STRAPI_URL}/api/auth/local",
    json={"identifier": "diegofornalha", "password": password},
    timeout=10
)

if login_resp.status_code != 200:
    print(f"❌ Erro no login: {login_resp.status_code}")
    print(login_resp.text)
    exit(1)

jwt_token = login_resp.json()['jwt']
print("✅ Login bem-sucedido!")

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
if not article_file.exists():
    print("❌ Arquivo do artigo não encontrado!")
    exit(1)

with open(article_file, 'r') as f:
    article = json.load(f)

# Preparar dados
post_data = {
    "data": {
        "title": article['title'],
        "slug": article['slug'],
        "content": article['content'],
        "excerpt": article.get('excerpt', ''),
        "publishedAt": datetime.now().isoformat()
    }
}

# Headers
headers = {
    'Authorization': f'Bearer {jwt_token}',
    'Content-Type': 'application/json'
}

# Tentar publicar em /api/blogs
print("\n📤 Publicando em /api/blogs...")
resp = requests.post(
    f"{STRAPI_URL}/api/blogs",
    headers=headers,
    json=post_data,
    timeout=30
)

print(f"Status: {resp.status_code}")

if resp.status_code in [200, 201]:
    result = resp.json()
    post_id = result.get('data', {}).get('id')
    
    print("\n🎉 ARTIGO PUBLICADO COM SUCESSO!")
    print(f"ID: {post_id}")
    print(f"URL: {STRAPI_URL}/api/blogs/{post_id}")
    print(f"Preview: https://ale-blog-preview.agentesintegrados.com/blog/{article['slug']}")
else:
    print(f"❌ Erro: {resp.text}")
    
    # Tentar /api/posts também
    print("\n📤 Tentando /api/posts...")
    resp = requests.post(
        f"{STRAPI_URL}/api/posts",
        headers=headers,
        json=post_data,
        timeout=30
    )
    
    if resp.status_code in [200, 201]:
        print("✅ Publicado em /api/posts!")
    else:
        print(f"❌ Também falhou: {resp.status_code}")