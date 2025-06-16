#!/usr/bin/env python3
"""
Script para configurar webhook no Strapi v5 programaticamente
Configura o webhook para a URL https://webhook-crewai.agentesintegrados.com/webhook/strapi
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv
from datetime import datetime

# Adicionar o diretório pai ao PATH para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
STRAPI_URL = os.getenv('STRAPI_URL', 'http://localhost:1338')
STRAPI_API_TOKEN = os.getenv('STRAPI_API_TOKEN')
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'crew-ai-webhook-secret-2025')
WEBHOOK_URL = 'https://webhook-crewai.agentesintegrados.com/webhook/strapi'

def check_strapi_connection():
    """Verifica se o Strapi está acessível"""
    try:
        response = requests.get(f"{STRAPI_URL}/api/posts", headers={
            'Authorization': f'Bearer {STRAPI_API_TOKEN}'
        }, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro ao conectar com Strapi: {e}")
        return False

def get_existing_webhooks():
    """Lista webhooks existentes no Strapi"""
    try:
        # Tentar acessar a API de admin para webhooks
        admin_token = STRAPI_API_TOKEN  # Por padrão, usar o mesmo token
        
        response = requests.get(
            f"{STRAPI_URL}/admin/webhooks",
            headers={
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  Não foi possível listar webhooks existentes (Status: {response.status_code})")
            return None
    except Exception as e:
        print(f"⚠️  Erro ao buscar webhooks existentes: {e}")
        return None

def create_webhook():
    """Cria um novo webhook no Strapi"""
    webhook_data = {
        "name": "CrewAI Integration",
        "url": WEBHOOK_URL,
        "headers": {
            "Authorization": f"Bearer {WEBHOOK_SECRET}",
            "Content-Type": "application/json",
            "X-CrewAI-Version": "1.0"
        },
        "events": [
            "entry.create",
            "entry.update",
            "entry.delete",
            "entry.publish",
            "entry.unpublish",
            "media.create",
            "media.update",
            "media.delete"
        ],
        "enabled": True
    }
    
    try:
        response = requests.post(
            f"{STRAPI_URL}/admin/webhooks",
            headers={
                'Authorization': f'Bearer {STRAPI_API_TOKEN}',
                'Content-Type': 'application/json'
            },
            json=webhook_data,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"❌ Erro ao criar webhook: Status {response.status_code}")
            print(f"Resposta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erro ao criar webhook: {e}")
        return None

def test_webhook():
    """Testa se o webhook está funcionando"""
    test_payload = {
        "event": "test.webhook",
        "createdAt": datetime.now().isoformat(),
        "model": "test",
        "entry": {
            "id": 999,
            "title": "Teste de Webhook",
            "content": "Este é um teste do webhook configurado programaticamente"
        }
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            headers={
                "Authorization": f"Bearer {WEBHOOK_SECRET}",
                "Content-Type": "application/json",
                "X-Strapi-Event": "test.webhook"
            },
            json=test_payload,
            timeout=10
        )
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro ao testar webhook: {e}")
        return False

def main():
    """Função principal"""
    print("=== Configuração de Webhook Strapi v5 ===")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Strapi URL: {STRAPI_URL}")
    print(f"Webhook URL: {WEBHOOK_URL}")
    print("")
    
    # Verificar token
    if not STRAPI_API_TOKEN:
        print("❌ STRAPI_API_TOKEN não configurado no .env")
        return 1
    
    # Verificar conexão com Strapi
    print("1. Verificando conexão com Strapi...")
    if not check_strapi_connection():
        print("❌ Não foi possível conectar com o Strapi")
        return 1
    print("✅ Strapi está acessível")
    print("")
    
    # Listar webhooks existentes
    print("2. Verificando webhooks existentes...")
    existing = get_existing_webhooks()
    if existing:
        print(f"   Encontrados {len(existing)} webhooks")
        for webhook in existing:
            print(f"   - {webhook.get('name', 'Sem nome')}: {webhook.get('url', 'Sem URL')}")
    print("")
    
    # Criar webhook
    print("3. Criando webhook para CrewAI...")
    result = create_webhook()
    if result:
        print("✅ Webhook criado com sucesso!")
        print(f"   ID: {result.get('id', 'N/A')}")
        print(f"   Nome: {result.get('name', 'N/A')}")
    else:
        print("⚠️  Não foi possível criar o webhook via API")
        print("")
        print("📝 Configuração Manual:")
        print("   1. Acesse o painel admin do Strapi")
        print("   2. Vá em Settings → Webhooks")
        print("   3. Clique em 'Create new webhook'")
        print("   4. Configure com os seguintes dados:")
        print(f"      - Name: CrewAI Integration")
        print(f"      - URL: {WEBHOOK_URL}")
        print(f"      - Headers:")
        print(f"        Authorization: Bearer {WEBHOOK_SECRET}")
        print(f"        Content-Type: application/json")
        print(f"      - Events: Selecione todos os eventos de entry e media")
        print("")
    
    # Testar webhook
    print("4. Testando webhook...")
    if test_webhook():
        print("✅ Webhook está funcionando!")
    else:
        print("⚠️  Não foi possível testar o webhook")
    
    print("")
    print("=== Configuração concluída ===")
    
    # Instruções finais
    print("")
    print("📌 Próximos passos:")
    print("   1. Verifique se o webhook server está rodando:")
    print("      docker ps | grep crewai-webhook-server")
    print("   2. Teste o webhook criando um post no Strapi")
    print("   3. Monitore os logs do webhook server:")
    print("      docker logs -f crewai-webhook-server")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())