#!/usr/bin/env python3
"""
Testa endpoints possíveis baseado na documentação do Strapi
"""
import requests
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
STRAPI_API_TOKEN = 'ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd'

headers = {
    'Authorization': f'Bearer {STRAPI_API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Testando endpoints baseado na documentação Strapi...\n")

# Dados de teste
test_data = {
    "data": {
        "title": f"Teste API - {datetime.now().strftime('%H:%M:%S')}",
        "content": "Teste de criação via API"
    }
}

# 1. Testar Collection Types (plural) - mais comum
print("1️⃣ Testando Collection Types (plural)...")
collection_endpoints = [
    '/api/posts',      # Se content-type = post
    '/api/articles',   # Se content-type = article
    '/api/blogs',      # Se content-type = blog
]

for endpoint in collection_endpoints:
    print(f"\n📍 Testando: {endpoint}")
    
    # GET - Listar
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        print(f"  GET: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            if 'data' in data:
                print(f"  ✅ Endpoint válido! Items: {len(data.get('data', []))}")
                
                # Se GET funciona, testar POST
                post_resp = requests.post(
                    f"{STRAPI_URL}{endpoint}", 
                    headers=headers, 
                    json=test_data,
                    timeout=5
                )
                print(f"  POST: {post_resp.status_code}")
                
                if post_resp.status_code in [200, 201]:
                    print("  ✅ POST bem-sucedido!")
                    result = post_resp.json()
                    if 'data' in result and 'id' in result['data']:
                        print(f"  📝 Criado ID: {result['data']['id']}")
                elif post_resp.status_code == 403:
                    print("  🔒 403 Forbidden - verificar permissões de 'create'")
                elif post_resp.status_code == 400:
                    print(f"  ⚠️  400 Bad Request: {post_resp.text[:100]}")
                    
        elif resp.status_code == 403:
            print("  🔒 403 Forbidden - verificar permissões de 'find'")
            
    except Exception as e:
        print(f"  ❌ Erro: {str(e)}")

# 2. Testar Single Types (singular) - menos comum
print("\n\n2️⃣ Testando Single Types (singular)...")
single_endpoints = [
    '/api/post',       # Se single type = post
    '/api/article',    # Se single type = article
    '/api/blog',       # Se single type = blog
]

for endpoint in single_endpoints:
    print(f"\n📍 Testando: {endpoint}")
    
    # GET - Buscar único
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        print(f"  GET: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"  ✅ Single type válido!")
            
            # PUT para atualizar single type
            put_resp = requests.put(
                f"{STRAPI_URL}{endpoint}", 
                headers=headers, 
                json=test_data,
                timeout=5
            )
            print(f"  PUT: {put_resp.status_code}")
            
    except Exception as e:
        print(f"  ❌ Erro: {str(e)}")

# 3. Verificar com API Token se tem acesso administrativo
print("\n\n3️⃣ Verificando acesso do Token...")
admin_endpoints = [
    '/api/users/me',
    '/api/content-type-builder/content-types',
]

for endpoint in admin_endpoints:
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        print(f"{endpoint}: {resp.status_code}")
        
        if resp.status_code == 200 and endpoint == '/api/users/me':
            user_data = resp.json()
            print(f"  ✅ Token válido para usuário: {user_data.get('username', 'N/A')}")
            
    except Exception as e:
        print(f"{endpoint}: Erro - {str(e)}")

print("\n\n📋 Resumo e Próximos Passos:")
print("1. Se nenhum endpoint retornou 200, o content-type não está exposto na API")
print("2. Se GET retorna 403, as permissões de 'find' não estão habilitadas")
print("3. Se POST retorna 403, as permissões de 'create' não estão habilitadas")
print("4. Se GET funciona mas POST retorna 400, verifique os campos obrigatórios")
print("\n💡 No Strapi Admin:")
print("   Settings → Users & Permissions → Roles → Authenticated")
print("   Marcar permissões para o content-type correto")