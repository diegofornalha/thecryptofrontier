#!/usr/bin/env python3
"""
Verifica versão e estrutura do Strapi
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = 'ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Verificando estrutura do Strapi...\n")

# 1. Tentar endpoints de configuração
print("1️⃣ Verificando endpoints de configuração...")
config_endpoints = [
    '/api/config',
    '/api/settings',
    '/api/admin/settings',
    '/api/admin/roles',
    '/api/admin/permissions',
    '/api/users-permissions/roles',
    '/api/users-permissions/permissions',
    '/admin/api/admin/information',
    '/admin/api/settings',
    '/api/content-manager/settings'
]

for endpoint in config_endpoints:
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        if resp.status_code != 404:
            print(f"✅ {endpoint}: {resp.status_code}")
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    print(f"   Response preview: {str(data)[:100]}...")
                except:
                    pass
    except Exception as e:
        pass

# 2. Verificar informações do sistema
print("\n2️⃣ Verificando informações do sistema...")
system_endpoints = [
    '/_health',
    '/api/system',
    '/api/version',
    '/admin/api/information',
    '/api/admin/information'
]

for endpoint in system_endpoints:
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        if resp.status_code in [200, 204]:
            print(f"✅ {endpoint}: {resp.status_code}")
    except:
        pass

# 3. Verificar estrutura de permissões via content-type-builder
print("\n3️⃣ Analisando estrutura via Content-Type Builder...")
try:
    resp = requests.get(
        f"{STRAPI_URL}/api/content-type-builder/content-types",
        headers=headers,
        timeout=5
    )
    if resp.status_code == 200:
        data = resp.json()
        
        # Procurar por roles/permissions
        for item in data.get('data', []):
            uid = item.get('uid', '')
            if 'role' in uid.lower() or 'permission' in uid.lower():
                print(f"   Found: {uid}")
except Exception as e:
    print(f"   Erro: {str(e)}")

print("\n📋 Possíveis localizações das permissões:")
print("\n1. Se você tem Strapi v5 Community:")
print("   - Settings → Roles (sem 'Users & Permissions')")
print("   - Settings → API Tokens → Edit token → Configure permissions")
print("\n2. Se você tem Strapi v5 com plugin customizado:")
print("   - Settings → [Nome do plugin de permissões]")
print("\n3. Se as permissões estão no próprio API Token:")
print("   - Settings → API Tokens")
print("   - Editar o token existente")
print("   - Configurar permissões diretamente no token")
print("\n💡 Alternativa: Configurar permissões diretamente no API Token:")
print("1. Settings → API Tokens")
print("2. Encontre o token que termina em ...753cd")
print("3. Clique para editar")
print("4. Configure as permissões para 'Post'")
print("5. Salve")