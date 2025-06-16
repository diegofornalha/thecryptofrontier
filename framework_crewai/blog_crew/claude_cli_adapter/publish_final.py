#!/usr/bin/env python3
"""
Publicar artigo - Versão Final
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
        "identifier": "diegofornalha@gmail.com",
        "password": "Cancela@123"
    }
)

if login_resp.status_code != 200:
    print(f"❌ Erro no login")
    exit(1)

jwt_token = login_resp.json()['jwt']
print("✅ Login OK!")

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
if article_file.exists():
    with open(article_file, 'r') as f:
        article = json.load(f)
else:
    article = {
        "title": "DeFi Yield Farming em 2025: Como o Mercado de $129 Bilhões Está Revolucionando as Finanças",
        "slug": "defi-yield-farming-2025-mercado-129-bilhoes",
        "content": "Conteúdo do artigo...",
        "excerpt": "Resumo do artigo"
    }

# Preparar dados para o Strapi
post_data = {
    "data": {
        "title": article['title'],
        "slug": article['slug'],
        "content": article['content'],
        "excerpt": article.get('excerpt', ''),
        "publishedAt": datetime.now().isoformat()
    }
}

# Headers com JWT
headers = {
    'Authorization': f'Bearer {jwt_token}',
    'Content-Type': 'application/json'
}

# Primeiro, verificar se o endpoint existe
print("\n🔍 Verificando endpoint /api/posts...")
check_resp = requests.get(f"{STRAPI_URL}/api/posts", headers=headers)
print(f"   GET /api/posts -> {check_resp.status_code}")

# Tentar criar o post
print("\n📤 Criando post...")
create_resp = requests.post(
    f"{STRAPI_URL}/api/posts",
    headers=headers,
    json=post_data,
    timeout=30
)

print(f"   POST /api/posts -> {create_resp.status_code}")

if create_resp.status_code in [200, 201]:
    result = create_resp.json()
    post_id = result.get('data', {}).get('id')
    
    print("\n" + "🎉"*15)
    print("✅ ARTIGO PUBLICADO COM SUCESSO!")
    print("🎉"*15)
    
    print(f"\n📊 Detalhes:")
    print(f"   ID do Post: {post_id}")
    print(f"   Título: {article['title'][:60]}...")
    
    print(f"\n🔗 Links:")
    print(f"   API: {STRAPI_URL}/api/posts/{post_id}")
    print(f"   Admin: {STRAPI_URL}/admin/content-manager/collection-types/api::post.post/{post_id}")
    print(f"   Preview: https://ale-blog-preview.agentesintegrados.com/")
    
elif create_resp.status_code == 403:
    print("\n❌ Erro 403: Sem permissão para criar posts")
    print("   Seu usuário precisa ter permissão de 'create' em Posts")
    
elif create_resp.status_code == 405:
    print("\n❌ Erro 405: Método não permitido")
    print("   As permissões de criação não estão habilitadas")
    print("\n💡 Para resolver:")
    print("   1. Acesse o admin do Strapi")
    print("   2. Vá em Settings → Users & Permissions → Roles")
    print("   3. Edite o role do seu usuário")
    print("   4. Marque 'create' em Posts")
    print("   5. Salve as alterações")
    
else:
    print(f"\n❌ Erro {create_resp.status_code}")
    print(f"   Resposta: {create_resp.text[:300]}")

print("\n" + "="*60)