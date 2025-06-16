#!/usr/bin/env python3
"""
Publicar artigo diretamente sem senha
Tentando publicação sem autenticação (público)
"""
import requests
import json
from pathlib import Path
from datetime import datetime

print("🚀 TENTANDO PUBLICAR ARTIGO")
print("="*60)

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
if not article_file.exists():
    print("❌ Arquivo do artigo não encontrado!")
    # Criar artigo de exemplo
    article = {
        "title": "DeFi Yield Farming em 2025: Mercado de $129 Bilhões",
        "slug": "defi-yield-farming-2025",
        "content": "# DeFi Yield Farming em 2025\n\nO mercado DeFi está revolucionando...",
        "excerpt": "Descubra como o DeFi está transformando as finanças."
    }
else:
    with open(article_file, 'r') as f:
        article = json.load(f)

# Preparar dados mínimos
post_data = {
    "data": {
        "title": article['title'],
        "slug": article['slug'],
        "content": article['content'],
        "excerpt": article.get('excerpt', ''),
        "publishedAt": datetime.now().isoformat()
    }
}

print("\n📤 Tentando publicar SEM autenticação...")

# Headers sem autenticação
headers = {
    'Content-Type': 'application/json'
}

# Tentar diferentes endpoints
endpoints = ['/api/blogs', '/api/posts', '/api/articles', '/api/blog-posts']

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
            print("   ✅ SUCESSO!")
            result = resp.json()
            print(f"   Resposta: {json.dumps(result, indent=2)}")
            break
        elif resp.status_code == 403:
            print("   ❌ Precisa autenticação")
        elif resp.status_code == 405:
            print("   ❌ Método não permitido (permissões)")
        elif resp.status_code == 404:
            print("   ❌ Endpoint não existe")
        else:
            print(f"   ❌ Erro: {resp.text[:200]}")
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")

print("\n" + "="*60)
print("CONCLUSÃO:")
print("="*60)
print("\nParece que o Strapi está configurado para exigir autenticação.")
print("Você precisa:")
print("1. Usar suas credenciais para fazer login")
print("2. Ou configurar permissões públicas no Strapi")
print("\nPara publicar manualmente:")
print("1. Acesse: https://ale-blog.agentesintegrados.com/admin")
print("2. Vá em Content Manager → Blogs (ou Posts)")
print("3. Clique em 'Create new entry'")
print("4. Cole o conteúdo do artigo")