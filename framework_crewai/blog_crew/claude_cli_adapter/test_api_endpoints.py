#!/usr/bin/env python3
"""
Testa diferentes endpoints do Strapi para descobrir o correto
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Lista de possíveis endpoints
endpoints = [
    '/api/posts',
    '/api/post',
    '/api/articles',
    '/api/article',
    '/api/blogs',
    '/api/blog',
    '/api/contents',
    '/api/content',
    '/api/pages',
    '/api/page',
    '/api/entries',
    '/api/entry',
    '/api',
    '/api/content-types',
    '/api/content-manager/collection-types/api::post.post'
]

print("🔍 Testando endpoints do Strapi...\n")

# Testar GET em cada endpoint
print("=== TESTANDO GET ===")
for endpoint in endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code != 404:
            print(f"✅ {endpoint} - Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                if 'data' in data:
                    print(f"   → Dados encontrados: {type(data['data'])}")
        else:
            print(f"❌ {endpoint} - 404 Not Found")
    except Exception as e:
        print(f"❌ {endpoint} - Erro: {str(e)[:50]}")

# Testar POST nos endpoints que responderam
print("\n=== TESTANDO POST ===")
test_data = {
    "data": {
        "title": "Teste API Discovery",
        "content": "Testando endpoints",
        "status": "published"
    }
}

for endpoint in endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    try:
        resp = requests.post(url, headers=headers, json=test_data, timeout=5)
        if resp.status_code not in [404, 405]:
            print(f"✅ {endpoint} - Status: {resp.status_code}")
            if resp.status_code in [200, 201]:
                print(f"   → POST funcionou!")
        elif resp.status_code == 405:
            print(f"⚠️  {endpoint} - 405 Method Not Allowed")
        else:
            print(f"❌ {endpoint} - 404 Not Found")
    except Exception as e:
        print(f"❌ {endpoint} - Erro: {str(e)[:50]}")

# Testar descoberta de API
print("\n=== DESCOBERTA DE API ===")
discovery_endpoints = [
    '/api-docs',
    '/documentation',
    '/swagger',
    '/openapi',
    '/_health',
    '/admin/api',
    '/content-manager/explorer'
]

for endpoint in discovery_endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code != 404:
            print(f"✅ {endpoint} - Status: {resp.status_code}")
    except:
        pass

print("\n💡 Se todos retornaram 404 ou 405:")
print("1. O content-type pode ter um nome diferente")
print("2. A API pode estar desabilitada")
print("3. Verifique no admin: Content-Type Builder")