#!/usr/bin/env python3
"""
Script para publicar AGORA - Configure suas credenciais abaixo
"""
import requests
import json
from pathlib import Path
from datetime import datetime
import os

print("🚀 PUBLICANDO ARTIGO AGORA!")
print("="*60)

# ⚠️ CONFIGURE AQUI SUAS CREDENCIAIS ⚠️
# Substitua com seu email/username e senha do Strapi
EMAIL_OR_USERNAME = "diegofornalha"  # Usando seu username
PASSWORD = os.getenv('STRAPI_PASS', "SUA_SENHA_AQUI")  # Por segurança, use variável de ambiente

# Ou use variáveis de ambiente para maior segurança
EMAIL_OR_USERNAME = os.getenv('STRAPI_USER', EMAIL_OR_USERNAME)
PASSWORD = os.getenv('STRAPI_PASS', PASSWORD)

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

if EMAIL_OR_USERNAME == "SEU_EMAIL_OU_USERNAME_AQUI":
    print("\n⚠️  ATENÇÃO: Configure suas credenciais no arquivo!")
    print("   Edite as linhas 15 e 16 com seu email/username e senha")
    print("\n   Ou defina variáveis de ambiente:")
    print("   export STRAPI_USER='seu_email'")
    print("   export STRAPI_PASS='sua_senha'")
    print("   python3 publish_now.py")
    exit(1)

print(f"\n🔄 Fazendo login como: {EMAIL_OR_USERNAME}")

# Fazer login
login_data = {
    "identifier": EMAIL_OR_USERNAME,
    "password": PASSWORD
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
        
        # Carregar artigo
        article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
        
        if not article_file.exists():
            print(f"\n❌ Arquivo não encontrado: {article_file}")
            print("   Gerando artigo de exemplo...")
            
            # Artigo de exemplo se não existir
            article = {
                "title": "DeFi Yield Farming em 2025: Como o Mercado de $129 Bilhões Está Revolucionando as Finanças",
                "slug": "defi-yield-farming-2025-mercado-129-bilhoes",
                "content": "# DeFi Yield Farming em 2025\n\nO mercado de DeFi alcançou impressionantes $129 bilhões em TVL...",
                "excerpt": "Descubra como o mercado de DeFi alcançou $129 bilhões em TVL com crescimento de 137% ano a ano.",
                "seo": {
                    "metaTitle": "DeFi Yield Farming 2025",
                    "metaDescription": "Guia completo sobre DeFi yield farming em 2025",
                    "keywords": ["defi", "yield farming", "crypto", "2025"]
                },
                "tags": ["defi", "yield-farming", "crypto"],
                "categories": ["DeFi", "Investimentos"]
            }
        else:
            with open(article_file, 'r') as f:
                article = json.load(f)
        
        # Preparar dados
        post_data = {
            "data": {
                "title": article['title'],
                "slug": article['slug'],
                "content": article['content'],
                "excerpt": article.get('excerpt', ''),
                "status": "published",
                "publishedAt": datetime.now().isoformat()
            }
        }
        
        # Adicionar campos opcionais se existirem
        if 'seo' in article:
            post_data['data']['seo'] = article['seo']
        if 'tags' in article:
            post_data['data']['tags'] = article['tags']
        if 'categories' in article:
            post_data['data']['categories'] = article['categories']
        
        headers = {
            'Authorization': f'Bearer {jwt_token}',
            'Content-Type': 'application/json'
        }
        
        # Tentar publicar
        print("\n📤 Publicando artigo...")
        
        # Tentar diferentes endpoints
        endpoints = ['/api/posts', '/api/blogs', '/api/articles', '/api/blog-posts']
        
        for endpoint in endpoints:
            print(f"\n🔍 Tentando {endpoint}...")
            
            try:
                resp = requests.post(
                    f"{STRAPI_URL}{endpoint}",
                    headers=headers,
                    json=post_data,
                    timeout=30
                )
                
                print(f"   Status: {resp.status_code}")
                
                if resp.status_code in [200, 201]:
                    result = resp.json()
                    post_id = result.get('data', {}).get('id')
                    
                    print("\n" + "🎉"*10)
                    print("✅ ARTIGO PUBLICADO COM SUCESSO!")
                    print("🎉"*10)
                    
                    print(f"\n📊 Detalhes:")
                    print(f"   ID: {post_id}")
                    print(f"   Título: {article['title'][:50]}...")
                    print(f"   Endpoint: {endpoint}")
                    
                    print(f"\n🔗 Links:")
                    print(f"   API: {STRAPI_URL}{endpoint}/{post_id}")
                    print(f"   Admin: {STRAPI_URL}/admin/content-manager/")
                    print(f"   Preview: https://ale-blog-preview.agentesintegrados.com/")
                    
                    # Salvar sucesso
                    with open('last_publish_success.json', 'w') as f:
                        json.dump({
                            'post_id': post_id,
                            'endpoint': endpoint,
                            'timestamp': datetime.now().isoformat(),
                            'title': article['title']
                        }, f, indent=2)
                    
                    break
                    
                elif resp.status_code == 400:
                    print(f"   ❌ Erro 400: {resp.json().get('error', {}).get('message', 'Dados inválidos')}")
                elif resp.status_code == 403:
                    print(f"   ❌ Erro 403: Sem permissão")
                elif resp.status_code == 404:
                    print(f"   ❌ Erro 404: Endpoint não existe")
                    
            except Exception as e:
                print(f"   ❌ Erro: {str(e)[:100]}")
                
    else:
        print(f"❌ Erro no login: {login_resp.status_code}")
        error_msg = login_resp.json().get('error', {}).get('message', 'Erro desconhecido')
        print(f"   Mensagem: {error_msg}")
        
except Exception as e:
    print(f"❌ Erro geral: {e}")

print("\n" + "="*60)
print("FIM DA EXECUÇÃO")
print("="*60)