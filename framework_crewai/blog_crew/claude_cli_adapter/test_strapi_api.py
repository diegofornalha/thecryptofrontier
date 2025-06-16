#!/usr/bin/env python3
"""
Testa a API do Strapi
"""
import requests

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
STRAPI_API_TOKEN = '7ca61cb561fd731fe24b2994b6dafd749e0eb018bbd7da5f1c718b7b8581da5ea0aa4900de871307f816bbc8b066f509d979def8ba53c95f7ac2106c1381db83bcbdac861933ab67636ee027f402f64d457b0bc58e4fbb7566cdffeff090b58d157eabff60c325c2b35acda060375aed12542ed9504b9a1d239877edd56b1805'

headers = {
    'Authorization': f'Bearer {STRAPI_API_TOKEN}'
}

print("🔍 Testando API do Strapi...\n")

# Tentar diferentes endpoints
endpoints = [
    '/api/posts',
    '/api/post',
    '/api/articles',
    '/api/article',
    '/api/blogs',
    '/api/blog',
    '/api/content-manager/collection-types',
    '/api/users',
    '/api'
]

for endpoint in endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    print(f"Testando: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and isinstance(data['data'], list):
                print(f"  ✅ Endpoint válido! Encontrados {len(data['data'])} itens")
            else:
                print(f"  📝 Resposta: {str(data)[:100]}...")
                
    except Exception as e:
        print(f"  ❌ Erro: {str(e)}")
    
    print()

print("\n💡 Testando criar um post simples...")

# Dados mínimos para teste
test_data = {
    "data": {
        "title": "Teste API - Pipeline CrewAI",
        "content": "Este é um post de teste criado via API."
    }
}

# Tentar criar em diferentes endpoints
create_endpoints = ['/api/posts', '/api/post', '/api/articles']

for endpoint in create_endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    print(f"\nTentando POST em: {url}")
    
    try:
        response = requests.post(
            url, 
            headers={**headers, 'Content-Type': 'application/json'}, 
            json=test_data,
            timeout=5
        )
        print(f"  Status: {response.status_code}")
        print(f"  Resposta: {response.text[:200]}...")
        
        if response.status_code in [200, 201]:
            print("  ✅ POST bem-sucedido!")
            break
            
    except Exception as e:
        print(f"  ❌ Erro: {str(e)}")