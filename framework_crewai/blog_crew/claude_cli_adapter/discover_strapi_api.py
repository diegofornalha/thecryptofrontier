#!/usr/bin/env python3
"""
Descobre a estrutura da API do Strapi
"""
import requests
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
STRAPI_API_TOKEN = 'ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd'

headers = {
    'Authorization': f'Bearer {STRAPI_API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Descobrindo estrutura da API Strapi...\n")

# 1. Testar se é Strapi v4/v5
print("1️⃣ Verificando versão do Strapi...")
version_endpoints = [
    '/api',
    '/api/content-manager',
    '/_health',
    '/api/config'
]

for endpoint in version_endpoints:
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        if resp.status_code != 404:
            print(f"  {endpoint}: {resp.status_code}")
    except:
        pass

# 2. Tentar encontrar content-types
print("\n2️⃣ Procurando content-types...")

# Baseado na URL do admin: api::post.post
# Isso sugere que o content-type é "post" (singular)
possible_names = [
    'post',      # singular (mais provável baseado na URL)
    'posts',     # plural
    'article',   # alternativa singular
    'articles',  # alternativa plural
    'blog-post',
    'blog-posts'
]

found_endpoints = []

for name in possible_names:
    # Testar GET
    get_url = f"{STRAPI_URL}/api/{name}"
    try:
        resp = requests.get(get_url, headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"  ✅ GET {get_url}: {resp.status_code}")
            data = resp.json()
            if 'data' in data:
                count = len(data['data']) if isinstance(data['data'], list) else 1
                print(f"     Encontrados: {count} items")
                found_endpoints.append(name)
        elif resp.status_code == 403:
            print(f"  🔒 GET {get_url}: 403 Forbidden (existe mas sem permissão)")
            found_endpoints.append(name)
        elif resp.status_code != 404:
            print(f"  ❓ GET {get_url}: {resp.status_code}")
    except Exception as e:
        print(f"  ❌ Erro em {get_url}: {str(e)}")

# 3. Testar POST nos endpoints encontrados
if found_endpoints:
    print(f"\n3️⃣ Testando POST nos endpoints encontrados: {found_endpoints}")
    
    test_data = {
        "data": {
            "title": f"Teste API - {datetime.now().strftime('%H:%M:%S')}",
            "content": "Teste de criação via API"
        }
    }
    
    for name in found_endpoints:
        post_url = f"{STRAPI_URL}/api/{name}"
        try:
            resp = requests.post(post_url, headers=headers, json=test_data, timeout=5)
            print(f"\n  POST {post_url}: {resp.status_code}")
            
            if resp.status_code in [200, 201]:
                print("  ✅ POST bem-sucedido!")
                result = resp.json()
                if 'data' in result and 'id' in result['data']:
                    print(f"  📝 Criado com ID: {result['data']['id']}")
                    
                    # Tentar deletar o teste
                    del_url = f"{post_url}/{result['data']['id']}"
                    del_resp = requests.delete(del_url, headers=headers)
                    if del_resp.status_code in [200, 204]:
                        print("  🗑️  Teste deletado")
                        
            elif resp.status_code == 400:
                print(f"  ⚠️  Bad Request: {resp.text[:200]}")
                # Analisar campos obrigatórios
                if 'error' in resp.json():
                    error = resp.json()['error']
                    if 'details' in error:
                        print("  📋 Campos obrigatórios:")
                        details = error.get('details', {})
                        if isinstance(details, dict):
                            for field, info in details.items():
                                print(f"     - {field}")
                                
            elif resp.status_code == 403:
                print("  🔒 Forbidden - verificar permissões")
                
        except Exception as e:
            print(f"  ❌ Erro: {str(e)}")

else:
    print("\n❌ Nenhum endpoint de API encontrado")
    print("\n💡 Possíveis causas:")
    print("1. Content-type não está exposto na API")
    print("2. Permissões não estão configuradas")
    print("3. Nome do endpoint é diferente")
    
print("\n📝 Recomendações:")
print("1. Verificar no Strapi Admin → Settings → Users & Permissions → Roles → Public")
print("2. Habilitar permissões de 'find' e 'create' para o content-type")
print("3. Verificar o nome exato do content-type no Content-Type Builder")