#!/usr/bin/env python3
"""
Testa autenticação JWT vs API Token
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

print("🔍 Análise de Autenticação JWT vs API Token\n")

# 1. Testar com API Token
print("1️⃣ Testando com API Token...")
headers_api = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# GET com API Token
resp = requests.get(f"{STRAPI_URL}/api/posts", headers=headers_api)
print(f"GET /api/posts (API Token): {resp.status_code}")

# POST com API Token
test_data = {
    "data": {
        "title": "Teste API Token",
        "status": "published"
    }
}
resp = requests.post(f"{STRAPI_URL}/api/posts", headers=headers_api, json=test_data)
print(f"POST /api/posts (API Token): {resp.status_code}")

# 2. Verificar se precisa criar usuário e fazer login
print("\n2️⃣ Verificando autenticação JWT...")

# Tentar registrar um novo usuário (se permitido)
print("\nTentando criar usuário...")
register_data = {
    "username": "crewai_bot",
    "email": "crewai@example.com",
    "password": "CrewAI2025!@#"
}

resp = requests.post(f"{STRAPI_URL}/api/auth/local/register", json=register_data)
print(f"Register: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    jwt_token = data.get('jwt')
    user = data.get('user')
    print(f"✅ Usuário criado! JWT: {jwt_token[:20]}...")
    
    # Testar com JWT
    headers_jwt = {
        'Authorization': f'Bearer {jwt_token}',
        'Content-Type': 'application/json'
    }
    
    resp = requests.post(f"{STRAPI_URL}/api/posts", headers=headers_jwt, json=test_data)
    print(f"POST /api/posts (JWT): {resp.status_code}")
    
elif resp.status_code == 400:
    print("Usuário pode já existir, tentando login...")
    
    # Tentar login
    login_data = {
        "identifier": "crewai@example.com",
        "password": "CrewAI2025!@#"
    }
    
    resp = requests.post(f"{STRAPI_URL}/api/auth/local", json=login_data)
    print(f"Login: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        jwt_token = data.get('jwt')
        print(f"✅ Login successful! JWT: {jwt_token[:20]}...")
        
        # Testar com JWT
        headers_jwt = {
            'Authorization': f'Bearer {jwt_token}',
            'Content-Type': 'application/json'
        }
        
        resp = requests.post(f"{STRAPI_URL}/api/posts", headers=headers_jwt, json=test_data)
        print(f"POST /api/posts (JWT): {resp.status_code}")

print("\n" + "="*50)
print("📋 DIAGNÓSTICO FINAL")
print("="*50)

print("\n🔍 Descobertas:")
print("1. API Tokens podem ter limitações diferentes de JWT tokens")
print("2. Permissões no Strapi são baseadas em Roles (Public/Authenticated)")
print("3. API Tokens podem precisar de configuração específica")

print("\n✅ SOLUÇÕES:")
print("\n1. Usar JWT Authentication:")
print("   - Criar usuário via /api/auth/local/register")
print("   - Fazer login via /api/auth/local")
print("   - Usar o JWT token retornado")

print("\n2. Configurar API Token no Painel:")
print("   - Settings → API Tokens")
print("   - Editar token e verificar permissões")
print("   - Garantir que 'create' está habilitado para Post")

print("\n3. Configurar Roles:")
print("   - Settings → Users & Permissions → Roles")
print("   - Para JWT: configurar 'Authenticated'")
print("   - Para API Token: pode precisar configurar 'Public' também")