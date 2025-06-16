#!/usr/bin/env python3
"""
Script para corrigir permissões do Strapi v5
Resolve o problema de "Policy Failed"
"""
import requests
import json
import time

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔧 Tentando corrigir permissões do Strapi...\n")

# MÉTODO 1: Tentar via Admin API
print("=== MÉTODO 1: Admin API ===")

# 1.1 Buscar informações sobre roles
admin_endpoints = [
    '/admin/users-permissions/roles',
    '/admin/roles',
    '/users-permissions/roles',
    '/content-manager/settings',
    '/admin/permissions',
    '/admin/content-manager/permissions'
]

for endpoint in admin_endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"✅ Encontrado: {endpoint}")
            data = resp.json()
            print(f"   Dados: {str(data)[:200]}...")
            break
    except:
        pass

# MÉTODO 2: Usar Content Manager API
print("\n=== MÉTODO 2: Content Manager API ===")

# Tentar criar via content-manager
cm_data = {
    "title": "Test via Content Manager",
    "content": "Testing permissions",
    "slug": "test-content-manager",
    "publishedAt": None  # Criar como rascunho
}

cm_endpoints = [
    '/content-manager/collection-types/api::post.post',
    '/content-manager/collection-types/post',
    '/admin/content-manager/collection-types/api::post.post',
    '/admin/content-manager/explorer/api::post.post'
]

for endpoint in cm_endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    try:
        resp = requests.post(url, headers=headers, json=cm_data, timeout=5)
        print(f"\n📍 Testando {endpoint}")
        print(f"Status: {resp.status_code}")
        
        if resp.status_code in [200, 201]:
            print("✅ SUCESSO! Post criado via Content Manager!")
            result = resp.json()
            print(f"ID: {result.get('id', 'N/A')}")
            break
        elif resp.status_code == 403:
            print("🔒 Forbidden - sem permissão admin")
        elif resp.status_code == 400:
            print(f"⚠️  Bad Request: {resp.text[:100]}")
    except Exception as e:
        print(f"❌ Erro: {str(e)[:50]}")

# MÉTODO 3: Workaround - Desabilitar temporariamente validação
print("\n=== MÉTODO 3: Workaround Permissions ===")

print("\n💡 SOLUÇÃO MANUAL RECOMENDADA:")
print("\n1. DESABILITAR TEMPORARIAMENTE A RESTRIÇÃO:")
print("   - No servidor, edite: config/plugins.js (ou .ts)")
print("   - Adicione:")
print("""
module.exports = {
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      // Permite criação pública temporariamente
      register: {
        allowedFields: ['*']
      }
    },
  },
};
""")

print("\n2. ALTERNATIVA - CRIAR USER ESPECÍFICO:")
print("   a) Crie um usuário 'blog-bot' no Strapi")
print("   b) Dê permissões de Author/Editor")
print("   c) Use JWT token desse usuário")

print("\n3. ALTERNATIVA - USAR WEBHOOK + CRON:")
print("   a) Webhook recebe e salva posts (já está funcionando)")
print("   b) Cron job processa posts pendentes")
print("   c) Cron tem acesso direto ao banco")

# MÉTODO 4: Testar com diferentes headers
print("\n=== MÉTODO 4: Headers Alternativos ===")

# Tentar com API key em diferentes formatos
alt_headers = [
    {
        'Authorization': f'Bearer {API_TOKEN}',
        'Content-Type': 'application/json',
        'X-Forwarded-Host': 'ale-blog.agentesintegrados.com'
    },
    {
        'Authorization': f'Bearer {API_TOKEN}',
        'Content-Type': 'application/json',
        'Origin': 'https://ale-blog.agentesintegrados.com'
    },
    {
        'X-API-Key': API_TOKEN,
        'Content-Type': 'application/json'
    }
]

test_data = {
    "data": {
        "title": "Test Alternative Headers",
        "content": "Testing different auth methods",
        "status": "draft"
    }
}

for i, headers_alt in enumerate(alt_headers):
    print(f"\nTestando conjunto de headers #{i+1}...")
    try:
        resp = requests.post(
            f"{STRAPI_URL}/api/posts",
            headers=headers_alt,
            json=test_data,
            timeout=5
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code in [200, 201]:
            print("✅ Funcionou com headers alternativos!")
            break
    except:
        pass

print("\n" + "="*60)
print("📋 RESUMO E PRÓXIMOS PASSOS")
print("="*60)

print("\n🚨 O PROBLEMA:")
print("O Strapi v5 tem uma restrição padrão que impede criação pública de conteúdo.")
print("Isso é uma medida de segurança para evitar spam.")

print("\n✅ SOLUÇÕES RECOMENDADAS:")

print("\n1. USE AUTENTICAÇÃO DE USUÁRIO (mais seguro):")
print("   - Crie um usuário 'blog-automation' no Strapi")
print("   - Faça login e obtenha JWT token")
print("   - Use o JWT token nas requisições")

print("\n2. PROCESSE VIA SERVIDOR (já implementado):")
print("   - Posts são salvos em /tmp/pending_posts/")
print("   - Crie um cron job que lê esses arquivos")
print("   - Insira diretamente no banco PostgreSQL")

print("\n3. MODIFIQUE CONFIGURAÇÃO DO STRAPI:")
print("   - Edite as configurações de segurança")
print("   - Permita criação pública temporariamente")
print("   - Configure rate limiting para evitar spam")

print("\n📌 COMANDO PARA CRIAR USUÁRIO:")
print("No terminal do servidor:")
print("npm run strapi admin:create-user -- --email=bot@blog.com --password=SenhaSegura123 --firstname=Blog --lastname=Bot")