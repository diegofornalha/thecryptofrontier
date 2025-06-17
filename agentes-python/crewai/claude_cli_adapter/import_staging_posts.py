#!/usr/bin/env python3
"""
Importa posts do staging usando JWT
"""
import requests
import json
from pathlib import Path

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

# Ler JWT salvo (execute create_posts_with_jwt.py primeiro)
try:
    with open('.jwt_token', 'r') as f:
        JWT_TOKEN = f.read().strip()
except:
    print("❌ JWT não encontrado. Execute create_posts_with_jwt.py primeiro!")
    exit(1)

headers = {
    'Authorization': f'Bearer {JWT_TOKEN}',
    'Content-Type': 'application/json'
}

# Importar todos os JSONs do staging
staging_dir = Path('./staging_posts')
for json_file in staging_dir.glob('*.json'):
    print(f"\n📤 Importando {json_file.name}...")
    
    with open(json_file, 'r') as f:
        article = json.load(f)
    
    post_data = {"data": article}
    
    resp = requests.post(
        f"{STRAPI_URL}/api/posts",
        headers=headers,
        json=post_data
    )
    
    if resp.status_code in [200, 201]:
        print(f"✅ Sucesso! ID: {resp.json().get('data', {}).get('id')}")
    else:
        print(f"❌ Erro: {resp.status_code}")
