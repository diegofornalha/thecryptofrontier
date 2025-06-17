# Integração Completa: Strapi + Frontend + Agentes

## Visão Geral

Este documento explica como todos os componentes se conectam:

1. **Strapi v5** - Backend CMS com content-types Post e Article
2. **Frontend Next.js** - Interface em `/src` 
3. **CrewAI** - Agentes automatizados para criar conteúdo
4. **Guardian** - Supervisor dos agentes e processos

## Arquitetura

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   CrewAI/Agent  │────▶│ Strapi v5    │◀────│  Frontend   │
│   (Python)      │     │ (API REST)   │     │ (Next.js)   │
└────────┬────────┘     └──────────────┘     └─────────────┘
         │                      ▲
         │                      │
         └──────────┬───────────┘
                    │
              ┌─────▼─────-┐
              │ Guardian   │
              │(Supervisor)│
              └──────────-─┘
```

## Content-Types Alinhados

### Post (Blog)
```json
{
  "title": "string (obrigatório, max 255)",
  "content": "richtext (obrigatório)",
  "slug": "uid",
  "excerpt": "text (max 500)",
  "author": "string",
  "tags": "json array",
  "categories": "json array",
  "readingTime": "integer (min 1)",
  "featured": "boolean",
  "seo": "json object"
}
```

### Article 
```json
{
  "title": "string (obrigatório, max 255)",
  "content": "richtext (obrigatório)",
  "slug": "uid",
  "summary": "text (max 500)",
  "author": "string",
  "category": "string",
  "tags": "json array",
  "readTime": "integer (min 1)",
  "isHighlighted": "boolean",
  "metaDescription": "text (max 160)"
}
```

## Fluxo de Integração

### 1. Agente Cria Conteúdo

O CrewAI gera um post:
```python
post_data = {
    'title': 'Bitcoin atinge nova máxima',
    'content': '## Análise do mercado...',
    'tags': ['bitcoin', 'crypto'],
    'author': 'AI Analyst'
}
```

### 2. Adaptador Formata Dados

O `strapi_integration.py` formata para o Strapi:
```python
formatted = {
    '/var/lib/docker/volumes/thecryptofrontier-data': {
        'title': post_data['title'],
        'content': post_data['content'],
        'slug': 'bitcoin-atinge-nova-maxima',
        'tags': post_data['tags'],
        # ... outros campos
    }
}
```

### 3. Envio para API

```python
POST https://strapi-url/api/posts
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "title": "Bitcoin atinge nova máxima",
    "content": "## Análise do mercado...",
    // ...
  }
}
```

### 4. Frontend Consome

O `strapiClient.ts` busca os posts:
```typescript
const posts = await strapiClient.getPosts({
  page: 1,
  pageSize: 10,
  status: 'published'
});
```

## Scripts Disponíveis

### JavaScript (Node.js)

#### `/scripts/strapi-post-manager.js`
Gerenciador completo de posts com validação:
```bash
# Testar criação
node scripts/strapi-post-manager.js test

# Importar de arquivo
node scripts/strapi-post-manager.js import posts.json

# Servidor webhook para agentes
node scripts/strapi-post-manager.js webhook-server --port 3001
```

### Python (CrewAI)

#### `/framework_crewai/blog_crew/strapi_integration.py`
Integração Python com supervisão do Guardian:
```python
from strapi_integration import CrewAIAdapter

adapter = CrewAIAdapter()
results = adapter.process_crew_output(crew_output)
```

## Configuração de Ambiente

### `.env` (Strapi local)
```env
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp//var/lib/docker/volumes/thecryptofrontier-data.db
```

### `.env.local` (Frontend)
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=seu-token-aqui
```

## Guardian - Supervisão

O Guardian monitora todo o processo:

1. **Início de tarefa**: Registra quando um agente começa
2. **Progresso**: Acompanha quantos posts foram criados
3. **Erros**: Registra e analisa falhas
4. **Estatísticas**: Fornece métricas de sucesso

### Eventos do Guardian
```python
# Notificar início
guardian.notify_start('import_posts', total=10)

# Notificar progresso
guardian.notify_progress('import_posts', current=5, total=10)

# Notificar conclusão
guardian.notify_complete('import_posts', stats={
    'created': 8,
    'failed': 2
})
```

## Webhook para Agentes

Configure um webhook para receber posts automaticamente:

```bash
# Iniciar servidor webhook
node scripts/strapi-post-manager.js webhook-server --port 3001
```

Agentes podem enviar para: `http://localhost:3001/webhook/posts`

### Formato Webhook
```json
{
  "source": "crew_ai_agent",
  "posts": [
    {
      "title": "Novo artigo sobre DeFi",
      "content": "Conteúdo do artigo...",
      "tags": ["defi", "blockchain"],
      "author": "DeFi Agent"
    }
  ]
}
```

## Testando a Integração

### 1. Teste Manual
```bash
# JavaScript
node scripts/test-strapi-content-format.js

# Python
python framework_crewai/blog_crew/strapi_integration.py test
```

### 2. Teste com Arquivo
```bash
# Criar arquivo de teste
cat > test-posts.json << EOF
[
  {
    "title": "Post de Teste 1",
    "content": "Conteúdo do primeiro post",
    "tags": ["teste"],
    "featured": true
  },
  {
    "title": "Post de Teste 2", 
    "content": "Conteúdo do segundo post",
    "categories": ["Tutorial"]
  }
]
EOF

# Importar via JavaScript
node scripts/strapi-post-manager.js import test-posts.json

# Ou via Python
python framework_crewai/blog_crew/strapi_integration.py import test-posts.json
```

## Próximos Passos

1. **Configurar permissões** no Strapi Admin
2. **Criar token de API** com permissões adequadas
3. **Testar integração** end-to-end
4. **Configurar Guardian** para monitoramento
5. **Deploy em produção** com Docker

## Troubleshooting

### Erro 403 Forbidden
- Verifique o token de API
- Configure permissões no Strapi Admin

### Erro 400 Bad Request
- Verifique formato dos dados
- Use scripts de validação

### Posts não aparecem no frontend
- Verifique se estão publicados (`publishedAt` não nulo)
- Limpe cache do Next.js