#!/usr/bin/env python3
"""
Debug final - testa todas as possibilidades
"""
import requests
import json
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Debug Final - Testando todas as possibilidades\n")

# 1. Verificar se o endpoint existe mesmo
print("1️⃣ Verificando endpoints disponíveis...")
possible_endpoints = [
    '/api/posts',
    '/api/post',
    '/api/blog-posts',
    '/api/articles',
    '/api/contents',
    '/api/blogs'
]

for endpoint in possible_endpoints:
    resp = requests.options(f"{STRAPI_URL}{endpoint}")
    if resp.status_code != 404:
        print(f"✅ {endpoint}: Status {resp.status_code}, Allow: {resp.headers.get('Allow', 'N/A')}")

# 2. Testar com dados mínimos e completos
print("\n2️⃣ Testando POST com diferentes formatos de dados...")

test_payloads = [
    # Formato 1: Mínimo
    {
        "data": {
            "title": "Teste Mínimo"
        }
    },
    # Formato 2: Com status
    {
        "data": {
            "title": "Teste com Status",
            "status": "published"
        }
    },
    # Formato 3: Completo
    {
        "data": {
            "title": "Teste Completo",
            "content": "Conteúdo de teste",
            "slug": "teste-completo",
            "status": "published",
            "publishedAt": datetime.now().isoformat()
        }
    },
    # Formato 4: Sem wrapper "data"
    {
        "title": "Teste Sem Data Wrapper",
        "content": "Teste"
    }
]

for i, payload in enumerate(test_payloads):
    print(f"\nTeste {i+1}: {list(payload.keys())}")
    resp = requests.post(f"{STRAPI_URL}/api/posts", headers=headers, json=payload)
    print(f"  Status: {resp.status_code}")
    if resp.status_code not in [404, 405]:
        print(f"  Response: {resp.text[:200]}")

# 3. Verificar se precisa de outro header
print("\n3️⃣ Testando com headers adicionais...")
additional_headers = {
    **headers,
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
}

resp = requests.post(
    f"{STRAPI_URL}/api/posts", 
    headers=additional_headers, 
    json={"data": {"title": "Teste Headers"}}
)
print(f"Com headers extras: {resp.status_code}")

# 4. Verificar roles e permissões atuais
print("\n4️⃣ Verificando configuração de roles...")
resp = requests.get(f"{STRAPI_URL}/api/users-permissions/permissions", headers=headers)
if resp.status_code == 200:
    perms = resp.json().get('permissions', {})
    post_perms = perms.get('api::post.post', {})
    if post_perms:
        print("Permissões encontradas para api::post.post")
        print(json.dumps(post_perms, indent=2)[:300])
    else:
        print("❌ Nenhuma permissão encontrada para api::post.post")

# 5. Tentar endpoint alternativo de criação
print("\n5️⃣ Testando endpoints alternativos...")
alt_endpoints = [
    '/api/content-manager/collection-types/api::post.post',
    '/api/content-manager/collection-types/api::post.post/actions/create',
    '/admin/api/content-manager/collection-types/api::post.post'
]

for endpoint in alt_endpoints:
    resp = requests.post(
        f"{STRAPI_URL}{endpoint}",
        headers=headers,
        json={"title": "Teste Alternativo"}
    )
    if resp.status_code != 404:
        print(f"{endpoint}: {resp.status_code}")

print("\n" + "="*50)
print("📋 CONCLUSÃO")
print("="*50)

print("\nSe todos os testes retornaram 404 ou 405:")
print("1. As permissões não foram aplicadas corretamente")
print("2. O Strapi pode precisar ser reiniciado")
print("3. Pode haver um proxy/cache impedindo")

print("\n🔧 Última tentativa - No painel admin:")
print("1. Vá em Settings → Users & Permissions → Roles")
print("2. Clique em AMBOS 'Public' e 'Authenticated'")
print("3. Para cada um, marque em Post:")
print("   - find ✅")
print("   - findOne ✅") 
print("   - create ✅")
print("4. Salve CADA role separadamente")
print("5. Se possível, reinicie o Strapi")