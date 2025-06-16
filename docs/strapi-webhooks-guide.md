# Guia de Webhooks no Strapi v5

## 📌 O que são Webhooks?

Webhooks são mensagens automatizadas enviadas quando um evento específico acontece. Funcionam como notificações push entre aplicações - quando algo acontece no Strapi, ele automaticamente envia dados para uma URL configurada.

### Como funcionam:
- Usam requisições HTTP POST
- Enviam dados em formato JSON
- São acionados por eventos (criar, atualizar, deletar)
- Executam automaticamente sem intervenção manual

## 🔧 Configurando Webhooks no Strapi v5

### 1. Via Painel Admin

1. Acesse **Settings** → **Webhooks**
2. Clique em **Create new webhook**
3. Configure:
   - **Name**: Nome descritivo
   - **URL**: Endpoint que receberá os dados
   - **Headers**: Cabeçalhos necessários (ex: Authorization)
   - **Events**: Selecione os eventos que acionarão o webhook

### 2. Eventos Disponíveis

- `entry.create` - Quando novo conteúdo é criado
- `entry.update` - Quando conteúdo é atualizado
- `entry.delete` - Quando conteúdo é deletado
- `entry.publish` - Quando conteúdo é publicado
- `entry.unpublish` - Quando conteúdo é despublicado
- `media.create` - Quando mídia é enviada
- `media.update` - Quando mídia é atualizada
- `media.delete` - Quando mídia é deletada

### 3. Formato dos Dados Enviados

```json
{
  "event": "entry.create",
  "created_at": "2025-06-16T10:30:00.000Z",
  "model": "post",
  "uid": "api::post.post",
  "entry": {
    "id": 1,
    "documentId": "abc123",
    "title": "Novo Post",
    "slug": "novo-post",
    "content": "Conteúdo do post...",
    "author": {
      "id": 1,
      "name": "João Silva"
    },
    "publishedAt": "2025-06-16T10:30:00.000Z"
  }
}
```

## 🔄 Lifecycle Hooks no Strapi v5

Além de webhooks, você pode usar lifecycle hooks para executar código customizado:

### Localização no Strapi v5:
`/src/api/[content-type]/content-types/[content-type]/lifecycles.js`

### Exemplo Prático:

```javascript
// src/api/post/content-types/post/lifecycles.js
module.exports = {
  async afterCreate(event) {
    const { result, params } = event;
    
    // Enviar notificação quando post é criado
    await strapi.service('api::notification.notification').send({
      title: `Novo post: ${result.title}`,
      message: 'Um novo post foi publicado!'
    });
  },

  async beforeUpdate(event) {
    const { params } = event;
    
    // Adicionar timestamp de modificação
    params.data.lastModified = new Date();
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Limpar cache relacionado
    await strapi.service('api::cache.cache').clear(`post-${result.id}`);
  }
};
```

## 🚀 Integração com Framework CrewAI

### 1. Webhook Receiver para CrewAI

```python
# framework_crewai/blog_crew/webhook_receiver.py
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'your-secret-key')

@app.route('/webhook/strapi', methods=['POST'])
def handle_strapi_webhook():
    # Verificar autenticação
    auth_header = request.headers.get('Authorization')
    if auth_header != f'Bearer {WEBHOOK_SECRET}':
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Processar dados do webhook
    data = request.json
    event = data.get('event')
    model = data.get('model')
    entry = data.get('entry')
    
    # Ações baseadas no evento
    if event == 'entry.create' and model == 'post':
        # Acionar pipeline de enriquecimento de conteúdo
        trigger_content_enrichment(entry)
    
    elif event == 'entry.update' and model == 'post':
        # Atualizar índice de busca
        update_search_index(entry)
    
    elif event == 'entry.delete':
        # Remover de sistemas externos
        cleanup_external_systems(entry)
    
    return jsonify({'status': 'success'}), 200

def trigger_content_enrichment(post_data):
    """Aciona CrewAI para enriquecer o conteúdo"""
    # Implementar lógica para acionar agentes
    pass

if __name__ == '__main__':
    app.run(port=5000)
```

### 2. Configurar Webhook no Strapi

```javascript
// Configuração via código
const webhook = await strapi.service('admin::webhook').create({
  name: 'CrewAI Integration',
  url: 'http://localhost:5000/webhook/strapi',
  headers: {
    'Authorization': 'Bearer your-secret-key',
    'Content-Type': 'application/json'
  },
  events: [
    'entry.create',
    'entry.update',
    'entry.delete',
    'entry.publish',
    'entry.unpublish'
  ],
  enabled: true
});
```

## 📋 Casos de Uso Avançados

### 1. Deploy Automático
```javascript
// Webhook para trigger de build no Netlify/Vercel
{
  url: 'https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK_ID',
  events: ['entry.publish', 'entry.unpublish']
}
```

### 2. Notificações em Tempo Real
```javascript
// Integração com Slack
{
  url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
  headers: {
    'Content-Type': 'application/json'
  },
  events: ['entry.create']
}
```

### 3. Sincronização com CRM
```javascript
// Atualizar Salesforce quando autor é criado
{
  url: 'https://your-integration.com/salesforce/sync',
  events: ['entry.create', 'entry.update'],
  // Filtrar apenas model 'author'
}
```

### 4. Pipeline de IA
```javascript
// Acionar análise de sentimento em novos posts
{
  url: 'http://localhost:5000/ai/analyze',
  events: ['entry.create'],
  headers: {
    'X-AI-Model': 'sentiment-analysis'
  }
}
```

## 🛠️ Debugging e Testes

### 1. Testar Webhooks Localmente

Use o ngrok para expor localhost:
```bash
ngrok http 5000
```

### 2. Ferramenta de Debug

```python
# debug_webhook.py
from flask import Flask, request
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/debug', methods=['POST'])
def debug_webhook():
    print(f"\n{'='*50}")
    print(f"Webhook recebido: {datetime.now()}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Body: {json.dumps(request.json, indent=2)}")
    print(f"{'='*50}\n")
    return '', 200

if __name__ == '__main__':
    app.run(port=5555, debug=True)
```

## 🔐 Segurança

### 1. Validar Origem
```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### 2. Rate Limiting
```python
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/webhook')
@limiter.limit("10 per minute")
def webhook():
    # Processar webhook
    pass
```

## 📚 Referências

- [Documentação Oficial Strapi v5 - Webhooks](https://docs.strapi.io/dev-docs/backend-customization/webhooks)
- [Lifecycle Hooks](https://docs.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks)
- [API Reference](https://docs.strapi.io/dev-docs/api/rest)

## 💡 Dicas Importantes

1. **Sempre use HTTPS** em produção para webhooks
2. **Implemente retry logic** para falhas de rede
3. **Use filas** (Redis, RabbitMQ) para processar webhooks assincronamente
4. **Monitore** webhooks com ferramentas como Datadog ou New Relic
5. **Documente** todos os webhooks configurados no projeto

---

*Última atualização: Junho 2025 - Strapi v5.15.1*