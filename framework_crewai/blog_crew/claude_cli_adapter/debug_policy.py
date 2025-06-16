#!/usr/bin/env python3
"""
Debug de Policy Failed
"""
import requests
import json

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'
API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("🔍 Debug: Policy Failed\n")

# 1. Testar com verbose para ver detalhes do erro
print("1️⃣ Testando POST com análise detalhada...")
test_data = {
    "data": {
        "title": "Teste Policy",
        "status": "published"
    }
}

resp = requests.post(
    f"{STRAPI_URL}/api/posts",
    headers=headers,
    json=test_data
)

print(f"Status: {resp.status_code}")
print(f"Headers: {dict(resp.headers)}")
print(f"Response: {resp.text}")

# 2. Verificar se é problema de rate limiting
print("\n2️⃣ Verificando headers de resposta...")
for key, value in resp.headers.items():
    if 'limit' in key.lower() or 'policy' in key.lower():
        print(f"{key}: {value}")

# 3. Testar sem status published
print("\n3️⃣ Testando sem status published...")
test_data_draft = {
    "data": {
        "title": "Teste Draft"
    }
}

resp = requests.post(
    f"{STRAPI_URL}/api/posts",
    headers=headers,
    json=test_data_draft
)
print(f"Status: {resp.status_code}")
if resp.status_code != 405:
    print(f"Response: {resp.text[:200]}")

print("\n" + "="*50)
print("📋 DIAGNÓSTICO: Policy Failed")
print("="*50)

print("\n🔍 Possíveis causas:")
print("1. **Rate Limiting**: Muitas requisições em pouco tempo")
print("2. **IP Blocking**: Seu IP pode estar bloqueado")
print("3. **Custom Policy**: Política customizada no Strapi")
print("4. **CORS Policy**: Problema de CORS (menos provável via API)")

print("\n✅ SOLUÇÕES:")
print("\n1. **Aguarde alguns minutos** e tente novamente")
print("\n2. **No Strapi Admin, verifique:**")
print("   - Settings → Users & Permissions → Advanced Settings")
print("   - Veja se há rate limiting ativo")
print("   - Desative temporariamente para testar")
print("\n3. **Verifique políticas customizadas:**")
print("   - Na pasta do Strapi: src/policies/")
print("   - Veja se há políticas aplicadas ao content-type Post")
print("\n4. **Alternativa - Criar via Admin API:**")
print("   - Use o painel admin para criar um post manualmente")
print("   - Isso confirmará se o problema é só na API REST")

print("\n💡 Se o warning aparece ao salvar no admin:")
print("   - Pode haver um campo obrigatório não marcado")
print("   - Verifique se todos os campos necessários estão nas permissões")
print("   - Tente marcar TODOS os campos do Post nas permissões")