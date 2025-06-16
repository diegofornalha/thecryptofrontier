#!/usr/bin/env python3
"""
Debug de permissões do Strapi
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = 'ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd'

print("🔍 Debug de Permissões do Strapi\n")

# Headers
headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# 1. Verificar se é problema de nome do endpoint
print("1️⃣ Testando variações de endpoints...")
endpoints_to_test = [
    '/api/posts',
    '/api/post', 
    '/api/Posts',
    '/api/Post',
    '/api/blog-posts',
    '/api/blog-post'
]

for endpoint in endpoints_to_test:
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        print(f"{endpoint}: {resp.status_code}")
        if resp.status_code != 404:
            print(f"  ✅ Endpoint encontrado!")
            if resp.status_code == 200:
                data = resp.json()
                print(f"  📊 Response: {json.dumps(data, indent=2)[:200]}...")
    except Exception as e:
        print(f"{endpoint}: Erro - {str(e)}")

# 2. Verificar se conseguimos acessar alguma rota pública
print("\n2️⃣ Testando rotas públicas...")
public_routes = [
    '/api',
    '/_health',
    '/api/users-permissions/init'
]

for route in public_routes:
    try:
        resp = requests.get(f"{STRAPI_URL}{route}", timeout=5)
        print(f"{route}: {resp.status_code}")
    except Exception as e:
        print(f"{route}: Erro - {str(e)}")

# 3. Tentar criar post com dados mínimos
print("\n3️⃣ Tentando criar post com dados mínimos...")
minimal_data = {
    "data": {
        "title": "Teste Mínimo"
    }
}

try:
    resp = requests.post(
        f"{STRAPI_URL}/api/posts",
        headers=headers,
        json=minimal_data,
        timeout=5
    )
    print(f"POST /api/posts: {resp.status_code}")
    print(f"Response: {resp.text[:200]}")
except Exception as e:
    print(f"Erro: {str(e)}")

# 4. Informações sobre o problema
print("\n📋 Diagnóstico:")
print("- Se todos endpoints retornam 404: Permissões não estão configuradas")
print("- Se retorna 403: Token válido mas sem permissão")
print("- Se retorna 401: Problema com o token")
print("\n💡 Solução:")
print("1. No Strapi Admin, vá em: Settings → Users & Permissions → Roles")
print("2. Clique em 'Authenticated' (não em um usuário específico)")
print("3. Encontre 'Post' na lista")
print("4. Marque: find, findOne, create")
print("5. Clique em Save")
print("\n⚠️  Importante: As permissões devem ser configuradas no ROLE, não no usuário!")