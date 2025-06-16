#!/usr/bin/env python3
import requests
import json
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

print("🧪 Testando criação pública após modificações...\n")

# Dados de teste
test_data = {
    "data": {
        "title": f"Teste Público Após Config - {datetime.now().strftime('%H:%M:%S')}",
        "content": "Post criado publicamente após modificar configurações",
        "slug": f"teste-publico-{datetime.now().strftime('%H%M%S')}",
        "status": "published"
    }
}

# Sem autenticação
headers = {'Content-Type': 'application/json'}

resp = requests.post(
    f"{STRAPI_URL}/api/posts",
    headers=headers,
    json=test_data,
    timeout=10
)

print(f"Status: {resp.status_code}")
if resp.status_code in [200, 201]:
    print("✅ SUCESSO! Criação pública funcionando!")
    print(f"Post ID: {resp.json().get('data', {}).get('id')}")
else:
    print(f"❌ Ainda não funciona: {resp.text[:200]}")
