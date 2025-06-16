# Webhooks no Strapi v5 - Documentação Oficial + Integração CrewAI

## 📌 O que são Webhooks

Webhook é um construtor usado por uma aplicação para notificar outras aplicações que um evento ocorreu. Mais precisamente, é um callback HTTP definido pelo usuário. Webhooks funcionam entregando informações para aplicações receptoras através de requisições HTTP (tipicamente requisições POST).

> **⚠️ Nota Importante**: Para prevenir o envio não intencional de informações de usuários, Webhooks **não funcionam** para o content-type `User`. Se você precisar notificar sobre mudanças na coleção Users, use Lifecycle hooks em `./src/index.js`.

## 🔧 Configuração no Strapi v5

### Arquivo de Configuração

Configure webhooks no arquivo `./config/server.js`:

```javascript
// ./config/server.js
module.exports = {
  webhooks: {
    defaultHeaders: {
      "Custom-Header": "my-custom-header",
    },
  },
};
```

### Configuração de Segurança

Para proteger seus webhooks, configure headers de autenticação globalmente:

```javascript
// ./config/server.js
module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: "Bearer my-very-secured-token",
    },
  },
};
```

Ou usando variáveis de ambiente:

```javascript
// ./config/server.js
module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: `Bearer ${process.env.WEBHOOK_AUTH_TOKEN}`,
    },
  },
};
```

## 📋 Eventos Disponíveis

| Nome | Descrição |
|------|-----------|
| `entry.create` | Disparado quando uma entrada de Content Type é criada |
| `entry.update` | Disparado quando uma entrada de Content Type é atualizada |
| `entry.delete` | Disparado quando uma entrada de Content Type é deletada |
| `entry.publish` | Disparado quando uma entrada é publicada* |
| `entry.unpublish` | Disparado quando uma entrada é despublicada* |
| `media.create` | Disparado quando uma mídia é criada |
| `media.update` | Disparado quando uma mídia é atualizada |
| `media.delete` | Disparado quando uma mídia é deletada |
| `review-workflows.updateEntryStage` | Disparado quando conteúdo é movido entre estágios de revisão (Enterprise) |
| `releases.publish` | Disparado quando um Release é publicado (Growth/Enterprise) |

*Apenas quando `draftAndPublish` está habilitado no Content Type

## 📦 Estrutura dos Payloads

### Headers
Quando um payload é entregue, contém o header:
- `X-Strapi-Event`: Nome do tipo de evento disparado

### Payload entry.create
```json
{
  "event": "entry.create",
  "createdAt": "2020-01-10T08:47:36.649Z",
  "model": "address",
  "entry": {
    "id": 1,
    "city": "Paris",
    "postal_code": null,
    "full_name": "Paris",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:47:36.264Z"
  }
}
```

### Payload entry.publish
```json
{
  "event": "entry.publish",
  "createdAt": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "city": "Paris",
    "publishedAt": "2020-08-29T14:20:12.134Z",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:58:26.210Z"
  }
}
```

### Payload media.create
```json
{
  "event": "media.create",
  "createdAt": "2020-01-10T10:58:41.115Z",
  "media": {
    "id": 1,
    "name": "image.png",
    "hash": "353fc98a19e44da9acf61d71b11895f9",
    "ext": ".png",
    "mime": "image/png",
    "size": 228.19,
    "url": "/uploads/353fc98a19e44da9acf61d71b11895f9.png",
    "provider": "local"
  }
}
```

> **Nota**: Campos privados e relações não são enviados no payload.

## 🚀 Integração com CrewAI

### 1. Configurar Segurança no Strapi

```javascript
// /home/strapi/thecryptofrontier/strapi-v5-fresh/config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    defaultHeaders: {
      'Authorization': `Bearer ${env('WEBHOOK_SECRET', 'crew-ai-secret-key')}`,
      'X-CrewAI-Version': '1.0',
    },
  },
});
```

### 2. Receiver para CrewAI

```python
# framework_crewai/blog_crew/webhook_server.py
from fastapi import FastAPI, Request, HTTPException, Header
from typing import Optional
import os
from datetime import datetime
import json

app = FastAPI()

WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'crew-ai-secret-key')

@app.post("/webhook/strapi")
async def handle_webhook(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_strapi_event: Optional[str] = Header(None)
):
    """Handler principal para webhooks do Strapi v5"""
    
    # Validar autorização
    if not authorization or authorization != f"Bearer {WEBHOOK_SECRET}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Parse do payload
    payload = await request.json()
    
    # Log do evento
    print(f"[{datetime.now()}] Evento recebido: {x_strapi_event}")
    print(f"Model: {payload.get('model')}")
    
    # Processar baseado no evento
    event_handlers = {
        'entry.create': handle_entry_create,
        'entry.update': handle_entry_update,
        'entry.publish': handle_entry_publish,
        'entry.unpublish': handle_entry_unpublish,
        'media.create': handle_media_create,
    }
    
    handler = event_handlers.get(x_strapi_event)
    if handler:
        await handler(payload)
    
    return {"status": "success", "event": x_strapi_event}

async def handle_entry_create(payload: dict):
    """Processa criação de entrada"""
    model = payload['model']
    entry = payload['entry']
    
    if model == 'post':
        # Acionar pipeline de enriquecimento
        from crews.blog_crew import BlogCrew
        crew = BlogCrew()
        
        enriched = await crew.enrich_new_post({
            'id': entry['id'],
            'title': entry.get('title'),
            'content': entry.get('content')
        })
        
        # Atualizar post com conteúdo enriquecido
        await update_strapi_entry('post', entry['id'], enriched)

async def handle_entry_publish(payload: dict):
    """Processa publicação de entrada"""
    model = payload['model']
    entry = payload['entry']
    
    # Distribuir conteúdo publicado
    tasks = []
    
    if model == 'post':
        tasks.extend([
            notify_subscribers(entry),
            update_search_index(entry),
            trigger_static_build(),
            post_to_social_media(entry)
        ])
    
    await asyncio.gather(*tasks)

async def handle_media_create(payload: dict):
    """Processa upload de mídia"""
    media = payload['media']
    
    # Otimizar imagem se necessário
    if media['mime'].startswith('image/'):
        await optimize_image(media)
```

### 3. Configurar Webhook via API

```python
# setup_webhook.py
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def create_strapi_webhook():
    """Cria webhook no Strapi para integração CrewAI"""
    
    # Configuração do webhook
    webhook_data = {
        "name": "CrewAI Integration",
        "url": "http://localhost:8000/webhook/strapi",
        "headers": {
            # Headers adicionais além dos defaultHeaders
            "X-Webhook-ID": "crewai-blog-pipeline"
        },
        "events": [
            "entry.create",
            "entry.update",
            "entry.delete",
            "entry.publish",
            "entry.unpublish",
            "media.create"
        ],
        "enabled": True
    }
    
    # Criar via Admin API
    response = requests.post(
        f"{os.getenv('STRAPI_URL')}/api/webhooks",
        headers={
            "Authorization": f"Bearer {os.getenv('STRAPI_API_TOKEN')}",
            "Content-Type": "application/json"
        },
        json=webhook_data
    )
    
    if response.status_code in [200, 201]:
        print(f"✅ Webhook criado: {response.json()}")
    else:
        print(f"❌ Erro: {response.text}")

if __name__ == "__main__":
    create_strapi_webhook()
```

### 4. Lifecycle Hooks para User Content-Type

Como webhooks não funcionam para User, use lifecycle hooks:

```javascript
// /home/strapi/thecryptofrontier/strapi-v5-fresh/src/index.js
module.exports = {
  register({ strapi }) {
    // Lifecycle hooks para User
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      
      async afterCreate(event) {
        const { result } = event;
        
        // Notificar sistema externo sobre novo usuário
        await fetch('http://localhost:8000/webhook/user-created', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`
          },
          body: JSON.stringify({
            event: 'user.create',
            user: {
              id: result.id,
              email: result.email,
              username: result.username,
              createdAt: result.createdAt
            }
          })
        });
      },
      
      async afterUpdate(event) {
        // Similar para update
      }
    });
  },
};
```

## 🛡️ Melhores Práticas (Oficial)

1. **Validar requisições** verificando headers e assinaturas de payload
2. **Implementar retries** para requisições falhadas
3. **Logar eventos** de webhook para debug e monitoramento
4. **Usar endpoints HTTPS** seguros para receber webhooks
5. **Configurar rate limiting** para evitar sobrecarga

### Implementação de Retry com Backoff

```python
import asyncio
from typing import Callable
import aiohttp

async def send_webhook_with_retry(
    url: str,
    payload: dict,
    headers: dict,
    max_retries: int = 3,
    backoff_factor: float = 2.0
):
    """Envia webhook com retry exponencial"""
    
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, 
                    json=payload, 
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status < 500:
                        return await response.json()
                    
        except Exception as e:
            print(f"Tentativa {attempt + 1} falhou: {e}")
        
        if attempt < max_retries - 1:
            wait_time = backoff_factor ** attempt
            await asyncio.sleep(wait_time)
    
    raise Exception(f"Webhook falhou após {max_retries} tentativas")
```

### Validação de Assinatura HMAC

```python
import hmac
import hashlib
from fastapi import Request, HTTPException

async def validate_webhook_signature(request: Request):
    """Valida assinatura HMAC do webhook"""
    
    body = await request.body()
    signature = request.headers.get('X-Webhook-Signature')
    
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")
    
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    return body
```

## 📊 Monitoramento e Debug

```python
# webhook_monitor.py
from datetime import datetime
import json
from collections import defaultdict
import asyncio

class WebhookMonitor:
    def __init__(self):
        self.events = defaultdict(list)
        self.errors = []
    
    async def log_event(self, event_type: str, payload: dict):
        """Registra evento recebido"""
        self.events[event_type].append({
            'timestamp': datetime.now().isoformat(),
            'payload': payload
        })
        
        # Limpar eventos antigos (manter últimos 100)
        if len(self.events[event_type]) > 100:
            self.events[event_type] = self.events[event_type][-100:]
    
    async def log_error(self, event_type: str, error: Exception):
        """Registra erro de processamento"""
        self.errors.append({
            'timestamp': datetime.now().isoformat(),
            'event': event_type,
            'error': str(error)
        })
    
    def get_stats(self):
        """Retorna estatísticas dos webhooks"""
        return {
            'total_events': sum(len(events) for events in self.events.values()),
            'events_by_type': {k: len(v) for k, v in self.events.items()},
            'total_errors': len(self.errors),
            'last_error': self.errors[-1] if self.errors else None
        }

# Instância global
monitor = WebhookMonitor()
```

## 🔗 Referências

- [Documentação Oficial - Webhooks](https://docs.strapi.io/dev-docs/backend-customization/webhooks)
- [Lifecycle Hooks](https://docs.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks)
- [Admin API](https://docs.strapi.io/dev-docs/api/admin-panel-api)

---

*Documentação baseada na versão oficial do Strapi v5 + Integração CrewAI*