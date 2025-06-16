#!/usr/bin/env python3
"""
Publicar usando a API interna do admin
"""
import requests
import json
from pathlib import Path
from datetime import datetime

print("🚀 PUBLICANDO VIA API DO ADMIN")
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
    print("❌ Erro no login")
    exit(1)

jwt_token = login_resp.json()['jwt']
print("✅ Login OK!")

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
with open(article_file, 'r') as f:
    article = json.load(f)

# Preparar dados para a API do admin
admin_data = {
    "title": article['title'],
    "slug": article['slug'],
    "content": article['content'],
    "excerpt": article.get('excerpt', ''),
    "publishedAt": datetime.now().isoformat()
}

# Headers
headers = {
    'Authorization': f'Bearer {jwt_token}',
    'Content-Type': 'application/json'
}

# Tentar pela API do content-manager
print("\n📤 Criando via content-manager...")
admin_resp = requests.post(
    f"{STRAPI_URL}/admin/content-manager/collection-types/api::post.post",
    headers=headers,
    json=admin_data,
    timeout=30
)

print(f"Status: {admin_resp.status_code}")

if admin_resp.status_code in [200, 201]:
    print("\n🎉 PUBLICADO COM SUCESSO!")
    result = admin_resp.json()
    print(f"ID: {result.get('id')}")
else:
    print(f"Resposta: {admin_resp.text[:300]}")
    
    # Alternativa: criar como rascunho e depois publicar
    print("\n📤 Tentando criar rascunho...")
    admin_data['publishedAt'] = None
    
    draft_resp = requests.post(
        f"{STRAPI_URL}/admin/api/content-manager/collection-types/api::post.post",
        headers=headers,
        json=admin_data,
        timeout=30
    )
    
    if draft_resp.status_code in [200, 201]:
        print("✅ Rascunho criado!")
        post_id = draft_resp.json().get('id')
        
        # Publicar o rascunho
        print("📤 Publicando rascunho...")
        publish_resp = requests.post(
            f"{STRAPI_URL}/admin/api/content-manager/collection-types/api::post.post/{post_id}/publish",
            headers=headers,
            timeout=30
        )
        
        if publish_resp.status_code == 200:
            print("🎉 PUBLICADO!")
    else:
        print(f"❌ Também falhou: {draft_resp.status_code}")

print("\n" + "="*60)
print("📌 INSTRUÇÕES MANUAIS:")
print("="*60)
print("\n1. Acesse: https://ale-blog.agentesintegrados.com/admin")
print("2. Vá em Content Manager → Posts")
print("3. Clique em '+ Create new entry'")
print("4. Copie e cole:")
print(f"\n   Título: {article['title']}")
print(f"   Slug: {article['slug']}")
print(f"   Excerpt: {article['excerpt'][:100]}...")
print("\n5. Cole o conteúdo completo do arquivo:")
print("   artigo_para_publicar.md")
print("\n6. Clique em 'Save' e depois 'Publish'")