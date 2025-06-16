#!/usr/bin/env python3
"""
Habilita permissões públicas para Post
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔧 Tentando habilitar permissões PUBLIC para Post...\n")

# 1. Buscar role Public
print("1️⃣ Buscando role Public...")
resp = requests.get(f"{STRAPI_URL}/api/users-permissions/roles", headers=headers)
if resp.status_code == 200:
    roles = resp.json().get('roles', [])
    public_role = next((r for r in roles if r['type'] == 'public'), None)
    
    if public_role:
        role_id = public_role['id']
        print(f"✅ Role Public encontrado: ID={role_id}")
        
        # 2. Atualizar permissões
        print("\n2️⃣ Atualizando permissões...")
        
        update_data = {
            "role": {
                "permissions": {
                    "api::post.post": {
                        "controllers": {
                            "post": {
                                "find": True,
                                "findOne": True,
                                "create": True,
                                "update": False,
                                "delete": False
                            }
                        }
                    }
                }
            }
        }
        
        update_resp = requests.put(
            f"{STRAPI_URL}/api/users-permissions/roles/{role_id}",
            headers=headers,
            json=update_data
        )
        
        print(f"Status: {update_resp.status_code}")
        if update_resp.status_code == 200:
            print("✅ Permissões atualizadas!")
        else:
            print(f"❌ Erro: {update_resp.text[:200]}")

# 3. Testar se funcionou
print("\n3️⃣ Testando acesso público...")

# Teste sem token
print("\nTeste GET (sem token):")
resp = requests.get(f"{STRAPI_URL}/api/posts")
print(f"Status: {resp.status_code}")

print("\nTeste POST (sem token):")
test_data = {
    "data": {
        "title": "Teste Public API",
        "content": "Teste de criação pública",
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
    print("✅ Funcionou! Post criado publicamente!")
    result = resp.json()
    print(f"ID: {result.get('data', {}).get('id', 'N/A')}")
elif resp.status_code == 405:
    print("❌ Ainda retorna 405 - permissões não foram aplicadas")
    print("\n⚠️  Configure manualmente no painel admin:")
    print("1. Settings → Users & Permissions → Roles → Public")
    print("2. Marque permissões para Post")
    print("3. Salve")

# 4. Testar também com token
print("\n4️⃣ Testando com token para comparar...")
resp = requests.post(
    f"{STRAPI_URL}/api/posts",
    headers=headers,
    json=test_data
)
print(f"POST com token: {resp.status_code}")

print("\n" + "="*50)
print("💡 CONCLUSÃO")
print("="*50)
print("\nSe ainda não funciona:")
print("1. As permissões precisam ser configuradas manualmente")
print("2. Pode haver uma policy customizada bloqueando")
print("3. O Strapi pode precisar ser reiniciado")