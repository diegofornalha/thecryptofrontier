#!/usr/bin/env python3
"""
Encontra onde estão as permissões do Post
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Procurando permissões do Post...\n")

# 1. Listar todos os content-types
print("1️⃣ Content-types disponíveis:")
try:
    resp = requests.get(f"{STRAPI_URL}/api/content-type-builder/content-types", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        
        # Filtrar apenas API content-types (não plugins)
        api_types = [ct for ct in data['data'] if ct['uid'].startswith('api::')]
        
        print("\nContent-types da API:")
        for ct in api_types:
            kind = ct['schema'].get('kind', 'unknown')
            name = ct['schema'].get('displayName', ct['uid'])
            print(f"  - {name} ({ct['uid']}) - {kind}")
            
            if 'post' in ct['uid'].lower():
                print(f"    ✅ ENCONTRADO! {ct['uid']} é um {kind}")
                
except Exception as e:
    print(f"Erro: {e}")

# 2. Verificar permissões disponíveis
print("\n2️⃣ Verificando estrutura de permissões:")
try:
    resp = requests.get(f"{STRAPI_URL}/api/users-permissions/permissions", headers=headers)
    if resp.status_code == 200:
        perms = resp.json().get('permissions', {})
        
        # Procurar por post em qualquer lugar
        for key, value in perms.items():
            if 'post' in key.lower():
                print(f"\n  Encontrado: {key}")
                if isinstance(value, dict):
                    controllers = value.get('controllers', {})
                    for controller, actions in controllers.items():
                        print(f"    Controller: {controller}")
                        if isinstance(actions, dict):
                            for action in actions.keys():
                                print(f"      - {action}")
                                
except Exception as e:
    print(f"Erro: {e}")

# 3. Verificar roles e suas permissões
print("\n3️⃣ Verificando roles:")
try:
    resp = requests.get(f"{STRAPI_URL}/api/users-permissions/roles", headers=headers)
    if resp.status_code == 200:
        roles = resp.json().get('roles', [])
        
        for role in roles:
            print(f"\n  Role: {role['name']} (type: {role['type']})")
            
            # Tentar buscar permissões detalhadas do role
            role_resp = requests.get(f"{STRAPI_URL}/api/users-permissions/roles/{role['id']}", headers=headers)
            if role_resp.status_code == 200:
                role_data = role_resp.json()
                if 'permissions' in role_data:
                    # Procurar por post nas permissões
                    for perm_key in role_data['permissions']:
                        if 'post' in perm_key.lower():
                            print(f"    ✅ Tem permissões para: {perm_key}")
                            
except Exception as e:
    print(f"Erro: {e}")

print("\n" + "="*50)
print("📋 INSTRUÇÕES")
print("="*50)

print("\n✅ No painel admin:")
print("1. Vá em: Settings → Users & Permissions Plugin → Roles")
print("2. Clique em 'Authenticated'")
print("3. Procure na lista por:")
print("   - Application → Post (se for Collection Type)")
print("   - Application → Posts (plural)")
print("   - API → Post")
print("   - O nome exato encontrado acima")
print("\n4. Marque as permissões:")
print("   ✅ find")
print("   ✅ findOne")
print("   ✅ create")
print("   ✅ update")
print("\n5. Clique em SAVE")

print("\n💡 IMPORTANTE:")
print("- Se Post é Single Type, NÃO terá 'create'")
print("- Blog posts devem ser Collection Type")
print("- Marque permissões no ROLE, não no usuário")