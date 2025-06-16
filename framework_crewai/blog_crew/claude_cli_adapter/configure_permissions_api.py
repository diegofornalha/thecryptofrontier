#!/usr/bin/env python3
"""
Configura permissões via API do Strapi
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = 'ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔧 Tentando configurar permissões via API...\n")

# 1. Obter ID do role Authenticated
print("1️⃣ Buscando role Authenticated...")
try:
    resp = requests.get(f"{STRAPI_URL}/api/users-permissions/roles", headers=headers)
    if resp.status_code == 200:
        roles = resp.json().get('roles', [])
        auth_role = next((r for r in roles if r['type'] == 'authenticated'), None)
        
        if auth_role:
            role_id = auth_role['id']
            doc_id = auth_role['documentId']
            print(f"✅ Encontrado: ID={role_id}, DocumentID={doc_id}")
            
            # 2. Tentar atualizar permissões
            print("\n2️⃣ Tentando atualizar permissões...")
            
            # Diferentes formatos que o Strapi pode aceitar
            permission_configs = [
                # Formato 1: Via role update
                {
                    "url": f"{STRAPI_URL}/api/users-permissions/roles/{role_id}",
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
                # Formato 2: Via documentId
                {
                    "url": f"{STRAPI_URL}/api/users-permissions/roles/{doc_id}",
                    "data": {
                        "data": {
                            "permissions": {
                                "api::post.post": {
                                    "find": True,
                                    "findOne": True,
                                    "create": True
                                }
                            }
                        }
                    }
                }
            ]
            
            for i, config in enumerate(permission_configs):
                print(f"\n   Tentativa {i+1}...")
                try:
                    update_resp = requests.put(
                        config["url"],
                        headers=headers,
                        json=config["data"],
                        timeout=10
                    )
                    print(f"   Status: {update_resp.status_code}")
                    if update_resp.status_code in [200, 201]:
                        print("   ✅ Permissões atualizadas com sucesso!")
                        break
                    else:
                        print(f"   Response: {update_resp.text[:200]}")
                except Exception as e:
                    print(f"   Erro: {str(e)}")
                    
except Exception as e:
    print(f"❌ Erro: {str(e)}")

# 3. Verificar se funcionou
print("\n3️⃣ Verificando se funcionou...")
try:
    test_resp = requests.get(f"{STRAPI_URL}/api/posts", headers=headers)
    if test_resp.status_code == 200:
        print("✅ Sucesso! O endpoint /api/posts está acessível!")
        print("\n🎉 Agora você pode publicar o artigo com:")
        print("   python3 publish_to_strapi.py")
    else:
        print(f"❌ Ainda não funcionou. Status: {test_resp.status_code}")
        print("\n💡 Configure manualmente no painel admin:")
        print("   1. Procure por Settings → API Tokens")
        print("   2. Edite o token que termina em ...753cd")
        print("   3. Configure permissões para Post: Read, Create")
        print("   4. Salve")
except Exception as e:
    print(f"❌ Erro ao verificar: {str(e)}")