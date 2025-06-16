#!/usr/bin/env python3
"""
Publicar artigo usando seu usuário atual do Strapi
"""
import requests
import json
from pathlib import Path
from datetime import datetime

print("🔐 Publicação com Usuário Existente")
print("="*60)

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

# Solicitar credenciais do usuário atual
print("\nDigite suas credenciais do Strapi:")
print("(Use o mesmo email/senha que usa para acessar o admin)")

email_or_username = input("Email ou Username: ").strip()
password = input("Password: ").strip()

if not email_or_username or not password:
    print("❌ Credenciais são obrigatórias!")
    exit(1)

print("\n🔄 Fazendo login...")

# Fazer login
login_data = {
    "identifier": email_or_username,  # Funciona com email ou username
    "password": password
}

try:
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
        print(f"   Usuário: {user_info.get('username', user_info.get('email'))}")
        print(f"   ID: {user_info.get('id')}")
        print(f"   Role: {user_info.get('role', {}).get('name', 'N/A')}")
        
        # Salvar JWT temporariamente
        with open('.current_user_jwt', 'w') as f:
            f.write(jwt_token)
        print(f"💾 JWT salvo temporariamente")
        
        print("\n📤 Publicando artigo sobre DeFi...")
        
        # Carregar artigo
        article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
        if article_file.exists():
            with open(article_file, 'r') as f:
                article = json.load(f)
            
            # Preparar dados - tentar tanto para 'post' quanto 'blog'
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
            
            # Headers com JWT
            headers = {
                'Authorization': f'Bearer {jwt_token}',
                'Content-Type': 'application/json'
            }
            
            # Tentar diferentes endpoints
            endpoints = ['/api/posts', '/api/blogs', '/api/articles']
            success = False
            
            for endpoint in endpoints:
                print(f"\n🔍 Tentando {endpoint}...")
                
                try:
                    post_resp = requests.post(
                        f"{STRAPI_URL}{endpoint}",
                        headers=headers,
                        json=post_data,
                        timeout=30
                    )
                    
                    print(f"   Status: {post_resp.status_code}")
                    
                    if post_resp.status_code in [200, 201]:
                        print("   ✅ SUCESSO!")
                        result = post_resp.json()
                        post_id = result.get('data', {}).get('id')
                        
                        print(f"\n🎉 ARTIGO PUBLICADO!")
                        print(f"   ID: {post_id}")
                        print(f"   API: {STRAPI_URL}{endpoint}/{post_id}")
                        print(f"   Admin: {STRAPI_URL}/admin/content-manager/collection-types/api::{endpoint[5:]}.{endpoint[5:].rstrip('s')}/{post_id}")
                        
                        # Se tiver um blog preview configurado
                        print(f"   Preview: https://ale-blog-preview.agentesintegrados.com/blog/{article['slug']}")
                        
                        success = True
                        break
                        
                    elif post_resp.status_code == 403:
                        print("   ❌ Sem permissão")
                    elif post_resp.status_code == 404:
                        print("   ❌ Endpoint não existe")
                    elif post_resp.status_code == 400:
                        print(f"   ❌ Dados inválidos: {post_resp.text[:100]}")
                        
                except Exception as e:
                    print(f"   ❌ Erro: {str(e)[:50]}")
            
            if not success:
                print("\n😞 Não foi possível publicar em nenhum endpoint")
                print("\n💡 Possíveis soluções:")
                print("1. Verifique se seu usuário tem permissão de criar posts")
                print("2. No admin, vá em Settings → Roles → [Seu Role]")
                print("3. Marque as permissões de 'create' para Post/Blog")
                
        else:
            print("❌ Arquivo do artigo não encontrado!")
            
    else:
        print(f"❌ Erro no login: {login_resp.status_code}")
        
        if login_resp.status_code == 400:
            error_data = login_resp.json()
            print(f"Mensagem: {error_data.get('error', {}).get('message', 'Credenciais inválidas')}")
            
            print("\n💡 Verifique:")
            print("1. Email/username e senha estão corretos")
            print("2. Usuário está confirmado (confirmed: true)")
            print("3. Usuário não está bloqueado")
            
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*60)
print("📋 RESUMO")
print("="*60)

print("\nSe a publicação falhou, verifique:")
print("1. Suas credenciais estão corretas")
print("2. Seu usuário tem permissões de criar posts")
print("3. O content-type correto (post, blog, ou article)")

print("\nPara automatizar futuramente:")
print("1. Use o JWT salvo em .current_user_jwt")
print("2. Ou configure variáveis de ambiente com suas credenciais")
print("3. Integre com o pipeline de geração")

# Limpar senha da memória
password = None