#!/usr/bin/env python3
"""
Testa o novo endpoint create-post do webhook
"""
import requests
import json
from datetime import datetime
from pathlib import Path

WEBHOOK_URL = 'https://webhook-crewai.agentesintegrados.com/webhook/create-post'
WEBHOOK_TOKEN = 'crew-ai-webhook-secret-2025'

print("🚀 Testando endpoint create-post do webhook...\n")

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

# 2. Enviar para o webhook create-post
print("\n2️⃣ Enviando para webhook create-post...")

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {WEBHOOK_TOKEN}'
}

# Enviar apenas os dados do artigo
payload = {
    "data": article
}

try:
    resp = requests.post(
        WEBHOOK_URL,
        headers=headers,
        json=payload,
        timeout=30
    )
    
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 201:
        print("✅ Post criado com sucesso!")
        result = resp.json()
        print(f"\nDetalhes:")
        print(f"- ID: {result.get('post_id')}")
        print(f"- URL: {result.get('url')}")
        print(f"- Título: {result.get('title')}")
        
    elif resp.status_code == 202:
        print("⏳ Post salvo na fila para processamento posterior")
        result = resp.json()
        print(f"\nDetalhes:")
        print(f"- Status: {result.get('status')}")
        print(f"- Mensagem: {result.get('message')}")
        print(f"- Arquivo: {result.get('filename')}")
        print(f"- Erro: {result.get('error')}")
        
    elif resp.status_code == 401:
        print("❌ Não autorizado - verificar token")
    elif resp.status_code == 400:
        print(f"❌ Bad Request: {resp.text}")
    else:
        print(f"❌ Erro: {resp.text}")
        
except Exception as e:
    print(f"❌ Erro ao enviar: {e}")

print("\n" + "="*50)
print("📋 RESUMO")
print("="*50)

print("\nO webhook agora tem dois endpoints:")
print("1. /webhook/strapi - Para receber eventos do Strapi")
print("2. /webhook/create-post - Para criar posts diretamente")

print("\nFluxo atual:")
print("1. Pipeline gera artigo")
print("2. Envia para webhook/create-post")
print("3. Webhook tenta criar no Strapi via API")
print("4. Se falhar, salva em fila local")

print("\nPróximos passos se ainda falhar:")
print("1. Verificar logs do webhook")
print("2. Tentar acesso direto ao banco")
print("3. Usar admin API do Strapi")