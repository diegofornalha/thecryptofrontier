#!/usr/bin/env python3
"""
Verificar endpoints disponíveis
"""
import requests

print("🔍 VERIFICANDO ENDPOINTS DO STRAPI")
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

if login_resp.status_code == 200:
    jwt_token = login_resp.json()['jwt']
    print("✅ Login OK")
    
    headers = {
        'Authorization': f'Bearer {jwt_token}',
        'Content-Type': 'application/json'
    }
    
    # Testar GET em vários endpoints
    print("\n📋 Testando endpoints (GET):")
    endpoints = [
        '/api/blogs',
        '/api/posts', 
        '/api/articles',
        '/api/blog-posts',
        '/api/blog',
        '/api/post',
        '/api/article'
    ]
    
    for endpoint in endpoints:
        try:
            resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
            print(f"{endpoint} -> {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print(f"   ✅ Funciona! Tem {len(data.get('data', []))} itens")
        except:
            print(f"{endpoint} -> ❌ Erro")
    
    # Verificar content-types disponíveis
    print("\n📋 Verificando content-types:")
    try:
        resp = requests.get(f"{STRAPI_URL}/api/content-type-builder/content-types", headers=headers)
        if resp.status_code == 200:
            types = resp.json()
            print("Content types encontrados:")
            for ct in types.get('data', []):
                if 'api::' in ct.get('uid', ''):
                    print(f"   - {ct['uid']}")
    except:
        pass
        
else:
    print("❌ Erro no login")