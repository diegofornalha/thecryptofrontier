# Webhooks no Strapi v5 - Guia de Integração

## 🎯 Webhooks no Strapi v5

No Strapi v5, webhooks continuam sendo uma forma poderosa de integrar com serviços externos, mas com melhorias significativas na API e configuração.

## 📋 Configuração de Webhooks

### Via Admin Panel

1. Navegue para **Settings** → **Global Settings** → **Webhooks**
2. Clique em **+ Create new webhook**
3. Configure os campos:
   - **Name**: Nome identificador do webhook
   - **URL**: Endpoint que receberá as requisições POST
   - **Headers**: Headers customizados (ex: `Authorization: Bearer TOKEN`)
   - **Events**: Selecione os eventos que dispararão o webhook

### Eventos Disponíveis no Strapi v5

```javascript
// Content-Type Events
'entry.create'      // Quando entrada é criada
'entry.update'      // Quando entrada é atualizada  
'entry.delete'      // Quando entrada é deletada
'entry.publish'     // Quando entrada é publicada
'entry.unpublish'   // Quando entrada é despublicada

// Media Events
'media.create'      // Upload de mídia
'media.update'      // Atualização de mídia
'media.delete'      // Deleção de mídia
```

## 🔄 Payload do Webhook v5

### Estrutura do Payload

```json
{
  "event": "entry.create",
  "created_at": "2025-06-16T12:00:00.000Z",
  "model": "api::post.post",
  "uid": "api::post.post",
  "entry": {
    "id": 1,
    "documentId": "abc123xyz",
    "title": "Meu Post",
    "slug": "meu-post",
    "content": "Conteúdo...",
    "publishedAt": "2025-06-16T12:00:00.000Z",
    "createdAt": "2025-06-16T12:00:00.000Z",
    "updatedAt": "2025-06-16T12:00:00.000Z",
    "locale": "pt-BR"
  }
}
```

## 🚀 Integração com CrewAI

### 1. Receiver Endpoint para CrewAI

```python
# framework_crewai/blog_crew/strapi_webhook_handler.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import os
from datetime import datetime
import json
import asyncio
from typing import Dict, Any

app = FastAPI()

# Segredo para validação
WEBHOOK_SECRET = os.getenv('STRAPI_WEBHOOK_SECRET', 'default-secret')

@app.post("/webhook/strapi-v5")
async def handle_strapi_v5_webhook(request: Request):
    """Handler para webhooks do Strapi v5"""
    
    # Validar autenticação
    auth_header = request.headers.get('authorization')
    if not auth_header or auth_header != f'Bearer {WEBHOOK_SECRET}':
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Parse do payload
    payload = await request.json()
    
    # Extrair informações
    event = payload.get('event')
    model = payload.get('model')
    entry = payload.get('entry')
    
    # Log do evento
    print(f"[{datetime.now()}] Webhook recebido: {event} - {model}")
    
    # Processar baseado no evento
    if event == 'entry.create' and model == 'api::post.post':
        await process_new_post(entry)
    elif event == 'entry.update' and model == 'api::post.post':
        await process_post_update(entry)
    elif event == 'entry.publish':
        await trigger_content_distribution(entry, model)
    
    return JSONResponse(content={"status": "success"})

async def process_new_post(post_data: Dict[str, Any]):
    """Processa novo post criado no Strapi"""
    
    # Acionar agentes CrewAI para enriquecimento
    from crews.blog_crew import BlogCrew
    
    crew = BlogCrew()
    enriched_content = await crew.enrich_post({
        'title': post_data.get('title'),
        'content': post_data.get('content'),
        'documentId': post_data.get('documentId')
    })
    
    # Atualizar post no Strapi com conteúdo enriquecido
    await update_strapi_post(post_data['documentId'], enriched_content)

async def update_strapi_post(document_id: str, updates: Dict):
    """Atualiza post no Strapi via API"""
    import httpx
    
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{os.getenv('STRAPI_URL')}/api/posts/{document_id}",
            headers={
                'Authorization': f'Bearer {os.getenv("STRAPI_API_TOKEN")}',
                'Content-Type': 'application/json'
            },
            json={'/var/lib/docker/volumes/thecryptofrontier-data': updates}
        )
        return response.json()
```

### 2. Configuração de Webhook para CrewAI

```python
# setup_crewai_webhook.py
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def setup_crewai_webhook():
    """Configura webhook no Strapi para integração com CrewAI"""
    
    webhook_config = {
        "name": "CrewAI Blog Pipeline",
        "url": "http://localhost:8000/webhook/strapi-v5",
        "headers": {
            "Authorization": f"Bearer {os.getenv('STRAPI_WEBHOOK_SECRET')}",
            "Content-Type": "application/json"
        },
        "events": [
            "entry.create",
            "entry.update", 
            "entry.publish",
            "entry.unpublish"
        ],
        "enabled": True
    }
    
    # Criar webhook via API Admin
    response = requests.post(
        f"{os.getenv('STRAPI_URL')}/admin/webhooks",
        headers={
            "Authorization": f"Bearer {os.getenv('STRAPI_ADMIN_TOKEN')}",
            "Content-Type": "application/json"
        },
        json=webhook_config
    )
    
    if response.status_code == 201:
        print("✅ Webhook criado com sucesso!")
        print(f"ID: {response.json()['/var/lib/docker/volumes/thecryptofrontier-data']['id']}")
    else:
        print(f"❌ Erro ao criar webhook: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    setup_crewai_webhook()
```

## 🔧 Lifecycle Hooks no Strapi v5

### Localização e Estrutura

```javascript
// src/api/post/content-types/post/lifecycles.js
module.exports = {
  async beforeCreate(event) {
    const { /var/lib/docker/volumes/thecryptofrontier-data } = event.params;
    
    // Adicionar slug automaticamente
    if (!/var/lib/docker/volumes/thecryptofrontier-data.slug && /var/lib/docker/volumes/thecryptofrontier-data.title) {
      const { slugify } = strapi.service('api::utils.utils');
      /var/lib/docker/volumes/thecryptofrontier-data.slug = await slugify(/var/lib/docker/volumes/thecryptofrontier-data.title);
    }
  },

  async afterCreate(event) {
    const { result } = event;
    
    // Notificar sistema externo
    await strapi.service('api::webhook.webhook').trigger({
      event: 'custom.post.created',
      /var/lib/docker/volumes/thecryptofrontier-data: result
    });
  },

  async beforeUpdate(event) {
    const { /var/lib/docker/volumes/thecryptofrontier-data, where } = event.params;
    
    // Registrar modificação
    /var/lib/docker/volumes/thecryptofrontier-data.lastModifiedAt = new Date();
    /var/lib/docker/volumes/thecryptofrontier-data.modifiedBy = event.state.user?.id;
  },

  async afterUpdate(event) {
    const { result, params } = event;
    
    // Invalidar cache
    await strapi.service('api::cache.cache').invalidate(`post:${result.id}`);
  },

  async beforeDelete(event) {
    const { where } = event.params;
    
    // Fazer backup antes de deletar
    const post = await strapi.entityService.findOne('api::post.post', where.id);
    await strapi.service('api::backup.backup').create({
      type: 'post',
      /var/lib/docker/volumes/thecryptofrontier-data: post
    });
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Limpar recursos relacionados
    await strapi.service('api::media.media').cleanupOrphaned(result.id);
  }
};
```

## 📡 Casos de Uso com CrewAI

### 1. Pipeline de Conteúdo Automatizado

```python
# Quando post é criado no Strapi:
# 1. Webhook dispara para CrewAI
# 2. Agentes processam o conteúdo
# 3. Resultado é enviado de volta ao Strapi

async def content_pipeline_webhook(event_data):
    """Pipeline completo de processamento de conteúdo"""
    
    if event_data['event'] == 'entry.create':
        # Fase 1: Análise de conteúdo
        analysis = await analyze_content(event_data['entry'])
        
        # Fase 2: Enriquecimento via IA
        enriched = await ai_enrichment(analysis)
        
        # Fase 3: Otimização SEO
        seo_optimized = await optimize_seo(enriched)
        
        # Fase 4: Geração de imagens
        if event_data['entry'].get('generateImages'):
            images = await generate_ai_images(seo_optimized)
            seo_optimized['images'] = images
        
        # Fase 5: Atualizar no Strapi
        await update_strapi_content(
            event_data['entry']['documentId'],
            seo_optimized
        )
```

### 2. Sincronização Multi-Canal

```python
# Distribuir conteúdo quando publicado
@app.post("/webhook/publish-distribution")
async def distribute_content(request: Request):
    /var/lib/docker/volumes/thecryptofrontier-data = await request.json()
    
    if /var/lib/docker/volumes/thecryptofrontier-data['event'] == 'entry.publish':
        tasks = [
            publish_to_social_media(/var/lib/docker/volumes/thecryptofrontier-data['entry']),
            update_search_index(/var/lib/docker/volumes/thecryptofrontier-data['entry']),
            notify_subscribers(/var/lib/docker/volumes/thecryptofrontier-data['entry']),
            trigger_static_build()
        ]
        
        await asyncio.gather(*tasks)
    
    return {"status": "distributed"}
```

## 🛡️ Segurança e Boas Práticas

### 1. Validação de Assinatura

```python
import hmac
import hashlib

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verifica assinatura HMAC do webhook"""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected, signature)

@app.middleware("http")
async def validate_webhook(request: Request, call_next):
    if request.url.path.startswith("/webhook/"):
        body = await request.body()
        signature = request.headers.get("x-strapi-signature")
        
        if not verify_webhook_signature(body, signature, WEBHOOK_SECRET):
            return JSONResponse(
                status_code=401,
                content={"error": "Invalid signature"}
            )
    
    response = await call_next(request)
    return response
```

### 2. Rate Limiting e Queue

```python
from collections import deque
from datetime import datetime, timedelta

# Sistema simples de rate limiting
webhook_queue = deque(maxlen=100)
last_processed = {}

async def process_webhook_with_limit(webhook_id: str, /var/lib/docker/volumes/thecryptofrontier-data: dict):
    """Processa webhook com rate limiting"""
    
    # Verificar rate limit (1 webhook por segundo por ID)
    if webhook_id in last_processed:
        time_diff = datetime.now() - last_processed[webhook_id]
        if time_diff < timedelta(seconds=1):
            # Adicionar à fila
            webhook_queue.append((webhook_id, /var/lib/docker/volumes/thecryptofrontier-data))
            return {"status": "queued"}
    
    # Processar webhook
    last_processed[webhook_id] = datetime.now()
    await process_webhook(/var/lib/docker/volumes/thecryptofrontier-data)
    
    return {"status": "processed"}
```

## 📊 Monitoramento e Debug

### Logger de Webhooks

```python
# webhook_logger.py
import logging
from datetime import datetime
import json

class WebhookLogger:
    def __init__(self, log_file="webhooks.log"):
        self.logger = logging.getLogger("strapi_webhooks")
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_webhook(self, event: str, model: str, /var/lib/docker/volumes/thecryptofrontier-data: dict):
        """Registra webhook recebido"""
        self.logger.info(f"Webhook: {event} - {model}")
        self.logger.debug(f"/var/lib/docker/volumes/thecryptofrontier-data: {json.dumps(/var/lib/docker/volumes/thecryptofrontier-data, indent=2)}")
    
    def log_error(self, error: Exception, context: dict):
        """Registra erros de processamento"""
        self.logger.error(f"Error: {str(error)}")
        self.logger.error(f"Context: {json.dumps(context, indent=2)}")
```

## 🔗 Referência Rápida

### URLs Importantes
- Documentação: https://docs.strapi.io/dev-docs/backend-customization/webhooks
- API Reference: https://docs.strapi.io/dev-docs/api/rest
- Lifecycle Hooks: https://docs.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks

### Variáveis de Ambiente
```bash
# .env
STRAPI_URL=http://localhost:1338
STRAPI_API_TOKEN=your-api-token
STRAPI_WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_ENDPOINT=http://localhost:8000/webhook/strapi-v5
```

---

*Documentação específica para Strapi v5.15.1 e integração com CrewAI*