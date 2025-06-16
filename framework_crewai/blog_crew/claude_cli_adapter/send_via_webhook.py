#!/usr/bin/env python3
"""
Envia o artigo via webhook para o servidor CrewAI
"""
import requests
import json
from datetime import datetime
from pathlib import Path

WEBHOOK_URL = 'https://webhook-crewai.agentesintegrados.com/webhook/strapi'
WEBHOOK_TOKEN = 'crew-ai-webhook-secret-2025'

print("🚀 Enviando artigo via Webhook...\n")

# 1. Carregar o artigo do output
print("1️⃣ Carregando artigo...")
try:
    writer_output_file = Path("outputs/writer_20250616_034704_output.json")
    with open(writer_output_file, 'r') as f:
        writer_data = json.load(f)
    
    article = writer_data['result']
    print(f"✅ Artigo carregado: {article['title']}")
    
except Exception as e:
    print(f"❌ Erro ao carregar artigo: {e}")
    exit(1)

# 2. Preparar payload do webhook
print("\n2️⃣ Preparando dados para webhook...")

# Simular evento do Strapi
webhook_payload = {
    "event": "entry.create",
    "model": "post",
    "entry": {
        "id": None,  # Será preenchido quando criado
        "title": article['title'],
        "slug": article['slug'],
        "content": article['content'],
        "excerpt": article['excerpt'],
        "status": "published",
        "seo": article['seo'],
        "tags": article['tags'],
        "categories": article['categories'],
        "publishedAt": datetime.now().isoformat(),
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    },
    "metadata": {
        "source": "crewai_pipeline",
        "action": "create_post",
        "timestamp": datetime.now().isoformat()
    }
}

# 3. Enviar para o webhook
print("\n3️⃣ Enviando para webhook...")

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {WEBHOOK_TOKEN}',
    'X-Webhook-Token': WEBHOOK_TOKEN,
    'X-Event': 'entry.create'
}

try:
    resp = requests.post(
        WEBHOOK_URL,
        headers=headers,
        json=webhook_payload,
        timeout=30
    )
    
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        print("✅ Webhook recebido com sucesso!")
        result = resp.json()
        print(f"Resposta: {json.dumps(result, indent=2)}")
        
        # Se o webhook processar e criar o post
        if 'post_id' in result:
            print(f"\n🎉 Post criado! ID: {result['post_id']}")
            print(f"URL: https://ale-blog.agentesintegrados.com/api/posts/{result['post_id']}")
            
    elif resp.status_code == 401:
        print("❌ Não autorizado - verificar token")
    elif resp.status_code == 404:
        print("❌ Webhook não encontrado")
    else:
        print(f"❌ Erro: {resp.text}")
        
except Exception as e:
    print(f"❌ Erro ao enviar: {e}")

# 4. Alternativa - Enviar direto para processamento
print("\n4️⃣ Alternativa - Endpoint de processamento direto...")

# Tentar endpoint alternativo
alt_endpoints = [
    '/webhook/process',
    '/api/posts/create',
    '/api/content/create',
    '/process/post'
]

for endpoint in alt_endpoints:
    url = f"https://webhook-crewai.agentesintegrados.com{endpoint}"
    try:
        resp = requests.post(
            url,
            headers=headers,
            json={
                "action": "create_post",
                "data": article
            },
            timeout=5
        )
        
        if resp.status_code != 404:
            print(f"\n✅ Endpoint encontrado: {endpoint}")
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print(f"Resposta: {resp.text[:200]}")
                break
    except:
        pass

print("\n" + "="*50)
print("💡 SUGESTÃO")
print("="*50)

print("\nSe o webhook não criar o post automaticamente:")
print("\n1. Modifique o webhook_server.py para incluir:")
print("   - Endpoint POST /webhook/create-post")
print("   - Lógica para criar post no Strapi")
print("   - Usar admin API ou banco direto")

print("\n2. Ou use o webhook para notificar e processar:")
print("   - Webhook recebe o conteúdo")
print("   - Salva em fila/banco")
print("   - Processo separado cria no Strapi")

print("\n3. Bypass completo via banco:")
print("   - Webhook insere direto no PostgreSQL")
print("   - Pula a API do Strapi completamente")