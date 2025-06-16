#!/usr/bin/env python3
"""
Testa acesso público (sem token)
"""
import requests
import json
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

print("🔍 Testando acesso PUBLIC (sem autenticação)...\n")

# 1. Testar GET sem token
print("1️⃣ Testando GET /api/posts (sem token):")
resp = requests.get(f"{STRAPI_URL}/api/posts")
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    print("✅ GET público funcionando!")
    data = resp.json()
    print(f"Posts encontrados: {len(data.get('data', []))}")
else:
    print(f"❌ GET não funciona: {resp.text[:100]}")

# 2. Testar POST sem token
print("\n2️⃣ Testando POST /api/posts (sem token):")
test_data = {
    "data": {
        "title": f"Teste Público - {datetime.now().strftime('%H:%M:%S')}",
        "content": "Este post foi criado sem autenticação!",
        "status": "published"
    }
}

resp = requests.post(
    f"{STRAPI_URL}/api/posts",
    headers={'Content-Type': 'application/json'},
    json=test_data
)

print(f"Status: {resp.status_code}")

if resp.status_code in [200, 201]:
    print("✅ POST público funcionando!")
    result = resp.json()
    if 'data' in result:
        post_id = result['data'].get('id', 'N/A')
        print(f"Post criado com ID: {post_id}")
        print(f"URL: {STRAPI_URL}/api/posts/{post_id}")
elif resp.status_code == 400:
    print("⚠️  Bad Request - verificar campos obrigatórios")
    print(f"Erro: {resp.text[:200]}")
elif resp.status_code == 403:
    print("❌ Forbidden - permissões não configuradas")
elif resp.status_code == 404:
    print("❌ Not Found - endpoint não existe")
elif resp.status_code == 405:
    print("❌ Method Not Allowed - create não está permitido")
else:
    print(f"❌ Erro: {resp.text[:200]}")

# 3. Verificar métodos permitidos
print("\n3️⃣ Métodos permitidos em /api/posts:")
resp = requests.options(f"{STRAPI_URL}/api/posts")
allow_header = resp.headers.get('Allow', 'N/A')
print(f"Allow: {allow_header}")

if 'POST' in allow_header:
    print("✅ POST está na lista de métodos permitidos!")
else:
    print("❌ POST não está permitido")

print("\n" + "="*50)
print("📋 STATUS")
print("="*50)

print("\nSe POST retornou 405 ou 403:")
print("1. Vá em: Settings → Users & Permissions → Roles")
print("2. Clique em 'Public'")
print("3. Encontre 'Post' (em Application ou API)")
print("4. Marque:")
print("   ✅ find")
print("   ✅ findOne")
print("   ✅ create")
print("5. Clique em SAVE")
print("\nDepois execute este script novamente!")