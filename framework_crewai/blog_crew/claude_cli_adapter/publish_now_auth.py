#!/usr/bin/env python3
"""
Publicar artigo com autenticação
"""
import requests
import json
from pathlib import Path
from datetime import datetime

print("🚀 PUBLICANDO ARTIGO NO STRAPI")
print("="*60)

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

# Login
print("\n🔄 Fazendo login...")
login_resp = requests.post(
    f"{STRAPI_URL}/api/auth/local",
    json={
        "identifier": "diegofornalha@gmail.com",  # tentando com email
        "password": "Cancela@123"
    },
    timeout=10
)

if login_resp.status_code != 200:
    print(f"❌ Erro no login: {login_resp.status_code}")
    print(login_resp.text)
    exit(1)

auth_data = login_resp.json()
jwt_token = auth_data['jwt']
user = auth_data.get('user', {})
print(f"✅ Login bem-sucedido! Usuário: {user.get('username', 'N/A')}")

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
if article_file.exists():
    with open(article_file, 'r') as f:
        article = json.load(f)
    print("✅ Artigo carregado")
else:
    print("❌ Arquivo não encontrado, usando exemplo")
    article = {
        "title": "DeFi Yield Farming em 2025: Mercado de $129 Bilhões",
        "slug": "defi-yield-farming-2025",
        "content": "# DeFi em 2025\n\nConteúdo...",
        "excerpt": "Resumo"
    }

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

# Tentar publicar
endpoints = ['/api/blogs', '/api/posts', '/api/articles', '/api/blog-posts']
success = False

for endpoint in endpoints:
    print(f"\n📤 Tentando {endpoint}...")
    
    try:
        resp = requests.post(
            f"{STRAPI_URL}{endpoint}",
            headers=headers,
            json=post_data,
            timeout=30
        )
        
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code in [200, 201]:
            result = resp.json()
            post_id = result.get('data', {}).get('id')
            
            print("\n" + "🎉"*10)
            print("✅ ARTIGO PUBLICADO COM SUCESSO!")
            print("🎉"*10)
            
            print(f"\n📊 Detalhes:")
            print(f"   ID: {post_id}")
            print(f"   Endpoint: {endpoint}")
            print(f"   Título: {article['title'][:50]}...")
            
            print(f"\n🔗 Links:")
            print(f"   API: {STRAPI_URL}{endpoint}/{post_id}")
            print(f"   Admin: {STRAPI_URL}/admin/content-manager/")
            print(f"   Preview: https://ale-blog-preview.agentesintegrados.com/")
            
            success = True
            break
        else:
            print(f"   ❌ Erro: {resp.text[:200]}")
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")

if not success:
    print("\n😞 Não foi possível publicar")
    print("Verifique as permissões do seu usuário no Strapi")

print("\n" + "="*60)