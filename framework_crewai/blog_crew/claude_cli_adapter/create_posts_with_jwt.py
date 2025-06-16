#!/usr/bin/env python3
"""
Cria posts usando autenticação JWT de usuário
Solução alternativa ao problema de permissões públicas
"""
import requests
import json
from datetime import datetime
from pathlib import Path

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

print("🔐 Criando posts com autenticação JWT...\n")

# PASSO 1: Login com usuário existente
print("1️⃣ Fazendo login...")

# Credenciais - você precisa criar este usuário no Strapi
login_data = {
    "identifier": "diegofornalha",  # email ou username
    "password": "SuaSenhaAqui"  # substitua pela senha real
}

try:
    # Fazer login
    login_resp = requests.post(
        f"{STRAPI_URL}/api/auth/local",
        json=login_data,
        timeout=10
    )
    
    if login_resp.status_code == 200:
        auth_data = login_resp.json()
        jwt_token = auth_data.get('jwt')
        user_info = auth_data.get('user', {})
        
        print(f"✅ Login bem-sucedido!")
        print(f"   Usuário: {user_info.get('username', 'N/A')}")
        print(f"   Email: {user_info.get('email', 'N/A')}")
        print(f"   JWT Token: {jwt_token[:20]}...")
        
        # PASSO 2: Criar post com JWT
        print("\n2️⃣ Criando post com JWT...")
        
        # Headers com JWT
        headers = {
            'Authorization': f'Bearer {jwt_token}',
            'Content-Type': 'application/json'
        }
        
        # Carregar artigo
        writer_output_file = Path("outputs/writer_20250616_034704_output.json")
        with open(writer_output_file, 'r') as f:
            writer_data = json.load(f)
        
        article = writer_data['result']
        
        # Dados do post
        post_data = {
            "data": {
                "title": article['title'],
                "slug": article['slug'],
                "content": article['content'],
                "excerpt": article['excerpt'],
                "status": "published",
                "seo": article['seo'],
                "tags": article['tags'],
                "categories": article['categories'],
                "publishedAt": datetime.now().isoformat()
            }
        }
        
        # Criar post
        post_resp = requests.post(
            f"{STRAPI_URL}/api/posts",
            headers=headers,
            json=post_data,
            timeout=30
        )
        
        print(f"Status: {post_resp.status_code}")
        
        if post_resp.status_code in [200, 201]:
            print("✅ POST CRIADO COM SUCESSO!")
            result = post_resp.json()
            post_id = result.get('data', {}).get('id')
            print(f"\nDetalhes:")
            print(f"- ID: {post_id}")
            print(f"- URL: {STRAPI_URL}/api/posts/{post_id}")
            print(f"- Admin: {STRAPI_URL}/admin/content-manager/collection-types/api::post.post/{post_id}")
            
            # Salvar JWT para uso futuro
            with open('.jwt_token', 'w') as f:
                f.write(jwt_token)
            print("\n💾 JWT salvo em .jwt_token para uso futuro")
            
        else:
            print(f"❌ Erro ao criar post: {post_resp.text[:200]}")
            
    else:
        print(f"❌ Erro no login: {login_resp.status_code}")
        print(f"Resposta: {login_resp.text[:200]}")
        
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*60)
print("📋 INSTRUÇÕES")
print("="*60)

print("\n1. CRIAR USUÁRIO NO STRAPI:")
print("   a) Vá em: Content Manager → User")
print("   b) Crie um novo usuário com:")
print("      - Username: blog-bot")
print("      - Email: bot@blog.com")
print("      - Password: uma senha segura")
print("      - Role: Authenticated")
print("      - Confirmed: true")

print("\n2. CONFIGURAR PERMISSÕES:")
print("   a) Settings → Roles → Authenticated")
print("   b) Marque para Post:")
print("      ✅ find")
print("      ✅ findOne")
print("      ✅ create")
print("      ✅ update (próprios posts)")

print("\n3. ATUALIZAR ESTE SCRIPT:")
print("   - Substitua 'identifier' e 'password' com as credenciais")
print("   - Execute novamente")

print("\n4. AUTOMATIZAR COM JWT SALVO:")
print("   - O JWT será salvo em .jwt_token")
print("   - Use em scripts futuros sem precisar fazer login")