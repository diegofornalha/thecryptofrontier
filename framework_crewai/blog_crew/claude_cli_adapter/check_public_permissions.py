#!/usr/bin/env python3
"""
Verifica e configura permissões do role Public
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Verificando permissões dos roles...\n")

# 1. Buscar todos os roles
print("1️⃣ Buscando roles...")
try:
    resp = requests.get(f"{STRAPI_URL}/api/users-permissions/roles", headers=headers)
    if resp.status_code == 200:
        roles = resp.json().get('roles', [])
        
        for role in roles:
            print(f"\n📋 Role: {role['name']} (type: {role['type']})")
            role_id = role['id']
            
            # Verificar permissões específicas
            perm_resp = requests.get(f"{STRAPI_URL}/api/users-permissions/permissions", headers=headers)
            if perm_resp.status_code == 200:
                all_perms = perm_resp.json().get('permissions', {})
                post_perms = all_perms.get('api::post.post', {})
                
                if post_perms:
                    print("   Permissões para Post encontradas")
                else:
                    print("   ❌ Sem permissões para Post")
                    
except Exception as e:
    print(f"Erro: {e}")

# 2. Tentar habilitar para o role Public
print("\n2️⃣ Habilitando permissões para role Public...")
try:
    # Buscar role public
    resp = requests.get(f"{STRAPI_URL}/api/users-permissions/roles", headers=headers)
    if resp.status_code == 200:
        roles = resp.json().get('roles', [])
        public_role = next((r for r in roles if r['type'] == 'public'), None)
        
        if public_role:
            role_id = public_role['id']
            print(f"Role Public ID: {role_id}")
            
            # Atualizar permissões
            update_data = {
                "role": {
                    "permissions": {
                        "api::post.post": {
                            "controllers": {
                                "post": {
                                    "find": True,
                                    "findOne": True,
                                    "create": True
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
            print(f"Update status: {update_resp.status_code}")
            
except Exception as e:
    print(f"Erro: {e}")

# 3. Testar com e sem token
print("\n3️⃣ Testando acesso...")

# Sem token (público)
print("\nTeste público (sem token):")
resp = requests.get(f"{STRAPI_URL}/api/posts")
print(f"GET /api/posts (sem token): {resp.status_code}")

# Com token
print("\nTeste com token:")
resp = requests.get(f"{STRAPI_URL}/api/posts", headers=headers)
print(f"GET /api/posts (com token): {resp.status_code}")

# Testar POST
print("\nTeste POST:")
test_data = {
    "data": {
        "title": "Teste",
        "status": "published"
    }
}
resp = requests.post(f"{STRAPI_URL}/api/posts", headers=headers, json=test_data)
print(f"POST /api/posts: {resp.status_code}")
if resp.status_code != 404:
    print(f"Response: {resp.text[:200]}")

print("\n📋 Resumo:")
print("Se ainda retorna 404, as permissões precisam ser configuradas manualmente:")
print("1. Settings → Users & Permissions Plugin → Roles")
print("2. Clique em 'Public' ou 'Authenticated'")
print("3. Marque permissões para 'Post'")
print("4. Salve")