#!/usr/bin/env python3
"""
Publicar via webhook server
"""
import requests
import json
from pathlib import Path
from datetime import datetime

print("🚀 PUBLICANDO VIA WEBHOOK")
print("="*60)

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
if article_file.exists():
    with open(article_file, 'r') as f:
        article = json.load(f)
    print("✅ Artigo carregado")
else:
    print("❌ Arquivo não encontrado")
    exit(1)

# Preparar dados para o webhook
webhook_data = {
    "type": "create_post",
    "data": {
        "title": article['title'],
        "slug": article['slug'],
        "content": article['content'],
        "excerpt": article.get('excerpt', ''),
        "seo": article.get('seo', {}),
        "tags": article.get('tags', []),
        "categories": article.get('categories', []),
        "publishedAt": datetime.now().isoformat()
    },
    "metadata": {
        "source": "claude_cli_adapter",
        "timestamp": datetime.now().isoformat()
    }
}

# Enviar para webhook
WEBHOOK_URL = "https://webhook-crewai.agentesintegrados.com/webhook/strapi"

print(f"\n📤 Enviando para: {WEBHOOK_URL}")

try:
    resp = requests.post(
        WEBHOOK_URL,
        json=webhook_data,
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        print("✅ ENVIADO COM SUCESSO!")
        print(f"Resposta: {resp.json()}")
        
        print("\n📋 PRÓXIMOS PASSOS:")
        print("1. O webhook recebeu os dados")
        print("2. Agora precisa processar e enviar para o Strapi")
        print("3. Verifique os logs do webhook server")
        print("4. Ou publique manualmente no admin")
    else:
        print(f"❌ Erro: {resp.text}")
        
except Exception as e:
    print(f"❌ Erro ao enviar: {e}")

print("\n" + "="*60)
print("Artigo disponível em:")
print(f"staging_posts/{article['slug']}.json")