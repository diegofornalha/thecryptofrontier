#!/usr/bin/env python3
"""
Solução final - Verifica configuração do API Token
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = 'ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Análise Final do Problema\n")

# 1. Verificar tipo de autenticação
print("1️⃣ Verificando tipo de token...")
endpoints_to_check = [
    '/api/users/me',  # JWT token
    '/admin/api/users/me',  # Admin user
    '/api/auth/me',  # Auth endpoint
    '/admin/api/api-tokens/current'  # API token info
]

token_type = None
for endpoint in endpoints_to_check:
    try:
        resp = requests.get(f"{STRAPI_URL}{endpoint}", headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"✅ {endpoint}: Funcionou!")
            token_type = endpoint
            break
        else:
            print(f"❌ {endpoint}: {resp.status_code}")
    except:
        pass

# 2. Verificar se é problema de Public vs Authenticated
print("\n2️⃣ Testando diferentes roles...")

# Testar sem token (Public)
print("\nTestando acesso público (sem token):")
resp = requests.get(f"{STRAPI_URL}/api/posts")
print(f"GET sem token: {resp.status_code}")

# Testar com token
print("\nTestando com token:")
resp = requests.get(f"{STRAPI_URL}/api/posts", headers=headers)
print(f"GET com token: {resp.status_code}")

# 3. Solução baseada no que descobrimos
print("\n" + "="*50)
print("📋 DIAGNÓSTICO FINAL")
print("="*50)

print("\n🔍 O que descobrimos:")
print("- GET /api/posts funciona (não retorna mais 404)")
print("- Mas POST não está permitido (erro 405)")
print("- O token Full Access está válido")

print("\n❌ Problema:")
print("No Strapi v5, tokens Full Access podem ter configurações próprias")
print("que sobrescrevem as permissões dos roles.")

print("\n✅ SOLUÇÃO DEFINITIVA:")
print("\n1. No Painel Admin do Strapi:")
print("   - Vá em Settings → API Tokens")
print("   - Encontre o token que termina em '...753cd'")
print("   - Clique para editar")
print("\n2. Na página do token:")
print("   - Verifique se está como 'Full access'")
print("   - Se houver uma seção 'Content-type permissions':")
print("     • Encontre 'Post'")
print("     • Marque: ✅ find ✅ findOne ✅ create")
print("   - Se não houver, procure um botão 'Configure permissions'")
print("\n3. Salve as alterações")

print("\n💡 ALTERNATIVA:")
print("Se não encontrar as opções acima, crie um NOVO token:")
print("1. Settings → API Tokens → Create new API Token")
print("2. Nome: 'Blog CrewAI'")
print("3. Token type: 'Full access'")
print("4. Na seção de permissões, marque tudo para 'Post'")
print("5. Salve e use o novo token")

print("\n🎯 Após configurar, teste com:")
print("curl -X POST -H 'Authorization: Bearer SEU_TOKEN' \\")
print("     -H 'Content-Type: application/json' \\")
print("     -d '{\"data\":{\"title\":\"Teste\"}}' \\")
print("     https://ale-blog.agentesintegrados.com/api/posts")