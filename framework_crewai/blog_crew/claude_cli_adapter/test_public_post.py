#!/usr/bin/env python3
"""
Testa criação de post SEM autenticação (público)
"""
import requests
import json
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

print("🔓 Testando criação PÚBLICA de posts...\n")

# Dados do post
post_data = {
    "data": {
        "title": f"Post Público - {datetime.now().strftime('%H:%M:%S')}",
        "content": "Este post foi criado sem autenticação!",
        "slug": f"post-publico-{datetime.now().strftime('%H%M%S')}",
        "status": "published",
        "publishedAt": datetime.now().isoformat()
    }
}

# Headers sem autenticação
headers = {
    'Content-Type': 'application/json'
}

# Tentar diferentes endpoints
endpoints = [
    '/api/posts',
    '/api/post',
    '/api/articles',
    '/api/article',
    '/api/blogs',
    '/api/blog'
]

for endpoint in endpoints:
    url = f"{STRAPI_URL}{endpoint}"
    print(f"\n📍 Testando {endpoint}...")
    
    try:
        # POST sem token
        resp = requests.post(url, headers=headers, json=post_data, timeout=10)
        
        print(f"Status: {resp.status_code}")
        
        if resp.status_code in [200, 201]:
            print("✅ SUCESSO! Post criado publicamente!")
            result = resp.json()
            print(json.dumps(result, indent=2))
            break
        elif resp.status_code == 400:
            print(f"⚠️  Bad Request: {resp.text[:200]}")
        elif resp.status_code == 401:
            print("🔒 Unauthorized - precisa de autenticação")
        elif resp.status_code == 403:
            print("🚫 Forbidden - sem permissão")
        elif resp.status_code == 405:
            print("❌ Method Not Allowed - POST não permitido")
            
            # Verificar se o role Public foi configurado
            print("\n💡 Verifique no Strapi admin:")
            print("1. Settings → Users & Permissions → Roles → Public")
            print("2. Marque 'create' para o content-type correto")
            print("3. O nome que você colocou foi 'Publico'")
            print("4. Certifique-se de clicar em SAVE")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

print("\n" + "="*50)
print("📋 DIAGNÓSTICO")
print("="*50)

print("\nSe todos retornaram 405:")
print("1. As permissões públicas não foram salvas")
print("2. Pode haver uma policy customizada bloqueando")
print("3. O content-type pode ter outro nome")

print("\nPara verificar o nome correto do content-type:")
print("1. No admin, vá em Content-Type Builder")
print("2. Veja o nome exato do seu tipo de conteúdo")
print("3. O endpoint será /api/{nome-no-plural}")

print("\nExemplo:")
print("- Se o tipo é 'Article' → /api/articles")
print("- Se o tipo é 'BlogPost' → /api/blog-posts")
print("- Se o tipo é 'Post' → /api/posts")