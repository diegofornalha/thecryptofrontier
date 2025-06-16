#!/bin/bash

# Script para publicar artigo localmente
# Execute este script e digite sua senha quando solicitado

echo "🚀 PUBLICAR ARTIGO NO STRAPI"
echo "========================================"
echo ""
echo "Digite sua senha do Strapi (usuário: diegofornalha):"
read -s STRAPI_PASSWORD

# Exportar como variável de ambiente
export STRAPI_USER="diegofornalha"
export STRAPI_PASS="$STRAPI_PASSWORD"

# Executar script Python
python3 - << 'EOF'
import os
import requests
import json
from pathlib import Path
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
username = os.environ.get('STRAPI_USER')
password = os.environ.get('STRAPI_PASS')

print("\n🔄 Fazendo login...")

# Login
login_resp = requests.post(
    f"{STRAPI_URL}/api/auth/local",
    json={"identifier": username, "password": password},
    timeout=10
)

if login_resp.status_code != 200:
    print(f"❌ Erro no login: {login_resp.status_code}")
    exit(1)

jwt_token = login_resp.json()['jwt']
print("✅ Login bem-sucedido!")

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
if article_file.exists():
    with open(article_file, 'r') as f:
        article = json.load(f)
else:
    article = {
        "title": "DeFi Yield Farming em 2025: Mercado de $129 Bilhões",
        "slug": "defi-yield-farming-2025",
        "content": "# DeFi em 2025\n\nConteúdo do artigo...",
        "excerpt": "Resumo do artigo"
    }

# Publicar
headers = {
    'Authorization': f'Bearer {jwt_token}',
    'Content-Type': 'application/json'
}

post_data = {
    "data": {
        "title": article['title'],
        "slug": article['slug'],
        "content": article['content'],
        "excerpt": article.get('excerpt', ''),
        "publishedAt": datetime.now().isoformat()
    }
}

# Tentar /api/blogs primeiro
print("\n📤 Publicando...")
resp = requests.post(
    f"{STRAPI_URL}/api/blogs",
    headers=headers,
    json=post_data,
    timeout=30
)

if resp.status_code in [200, 201]:
    print("\n🎉 ARTIGO PUBLICADO COM SUCESSO!")
    post_id = resp.json().get('data', {}).get('id')
    print(f"ID: {post_id}")
    print(f"Preview: https://ale-blog-preview.agentesintegrados.com/")
else:
    print(f"❌ Erro: {resp.status_code}")
    print(resp.text[:200])
EOF

echo ""
echo "========================================"
echo "FIM"