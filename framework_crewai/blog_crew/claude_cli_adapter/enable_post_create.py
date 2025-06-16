#!/usr/bin/env python3
"""
Habilita permissão de create para posts
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = 'ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔧 Habilitando permissão de CREATE para posts...\n")

# 1. Verificar permissões atuais
print("1️⃣ Verificando permissões atuais...")
try:
    resp = requests.get(f"{STRAPI_URL}/api/users-permissions/permissions", headers=headers)
    if resp.status_code == 200:
        perms = resp.json().get('permissions', {})
        post_perms = perms.get('api::post.post', {})
        print(f"Permissões atuais para post: {json.dumps(post_perms, indent=2)[:200]}...")
except Exception as e:
    print(f"Erro: {e}")

# 2. Buscar o role authenticated
print("\n2️⃣ Buscando role Authenticated...")
try:
    resp = requests.get(f"{STRAPI_URL}/api/users-permissions/roles", headers=headers)
    if resp.status_code == 200:
        roles = resp.json().get('roles', [])
        auth_role = next((r for r in roles if r['type'] == 'authenticated'), None)
        
        if auth_role:
            role_id = auth_role['id']
            
            # 3. Tentar diferentes endpoints para atualizar permissões
            print(f"\n3️⃣ Tentando habilitar CREATE para role ID {role_id}...")
            
            update_endpoints = [
                # Endpoint 1: Atualizar role diretamente
                {
                    "method": "PUT",
                    "url": f"{STRAPI_URL}/api/users-permissions/roles/{role_id}",
                    "data": {
                        "role": {
                            "permissions": {
                                "api::post.post": {
                                    "controllers": {
                                        "post": {
                                            "find": True,
                                            "findOne": True,
                                            "create": True,
                                            "update": True
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                # Endpoint 2: Via admin API
                {
                    "method": "PUT", 
                    "url": f"{STRAPI_URL}/admin/api/users-permissions/roles/{role_id}",
                    "data": {
                        "permissions": {
                            "api::post.post": {
                                "controllers": {
                                    "post": {
                                        "find": {"enabled": True},
                                        "findOne": {"enabled": True},
                                        "create": {"enabled": True}
                                    }
                                }
                            }
                        }
                    }
                },
                # Endpoint 3: Permissions direto
                {
                    "method": "POST",
                    "url": f"{STRAPI_URL}/api/users-permissions/permissions",
                    "data": {
                        "permissions": {
                            "api::post.post": {
                                "enabled": True,
                                "policy": "",
                                "controller": "post",
                                "action": "create",
                                "roleId": role_id
                            }
                        }
                    }
                }
            ]
            
            for i, endpoint in enumerate(update_endpoints):
                print(f"\n   Tentativa {i+1}: {endpoint['url']}")
                try:
                    if endpoint['method'] == 'PUT':
                        resp = requests.put(endpoint['url'], headers=headers, json=endpoint['data'])
                    else:
                        resp = requests.post(endpoint['url'], headers=headers, json=endpoint['data'])
                        
                    print(f"   Status: {resp.status_code}")
                    if resp.status_code in [200, 201]:
                        print("   ✅ Sucesso!")
                        break
                    else:
                        print(f"   Response: {resp.text[:150]}...")
                except Exception as e:
                    print(f"   Erro: {str(e)}")

except Exception as e:
    print(f"Erro: {e}")

# 4. Testar se funcionou
print("\n4️⃣ Testando se CREATE está habilitado...")

# Teste 1: OPTIONS
try:
    resp = requests.options(f"{STRAPI_URL}/api/posts")
    allow_header = resp.headers.get('Allow', '')
    print(f"Métodos permitidos: {allow_header}")
    
    if 'POST' in allow_header:
        print("✅ POST está permitido!")
    else:
        print("❌ POST ainda não está permitido")
except:
    pass

# Teste 2: POST direto
print("\nTestando POST...")
test_data = {
    "data": {
        "title": "Teste de Permissão"
    }
}

try:
    resp = requests.post(f"{STRAPI_URL}/api/posts", headers=headers, json=test_data)
    print(f"POST /api/posts: {resp.status_code}")
    
    if resp.status_code in [200, 201]:
        print("✅ CREATE funcionando! Deletando teste...")
        data = resp.json()
        if 'data' in data and 'id' in data['data']:
            del_resp = requests.delete(f"{STRAPI_URL}/api/posts/{data['data']['id']}", headers=headers)
            print(f"Delete: {del_resp.status_code}")
    elif resp.status_code == 400:
        print("✅ POST aceito! Erro 400 significa campos obrigatórios")
        print(f"Response: {resp.text[:200]}")
    else:
        print(f"❌ Ainda não funciona: {resp.text[:200]}")
        
except Exception as e:
    print(f"Erro: {e}")

print("\n📋 Se ainda não funcionar:")
print("O token Full Access pode precisar de configuração específica no painel:")
print("1. Settings → API Tokens")
print("2. Edite o token")
print("3. Verifique se 'Type: Full access' está selecionado")
print("4. Se houver seção de permissões, marque tudo para 'Post'")