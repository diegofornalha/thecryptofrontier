# 📝 Esclarecimento sobre Autenticação no Strapi

## 🔑 Tipos de Tokens no Strapi

### 1. API Tokens (O que estamos usando)
- **Token**: `ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd`
- **Uso**: `Authorization: Bearer {API_TOKEN}`
- **Configuração**: Settings → API Tokens
- **Associação**: Não precisa associar a usuário, tem permissões próprias

### 2. JWT Tokens (Para usuários finais)
- **Gerado via**: Login endpoint (`/api/auth/local`)
- **Uso**: `Authorization: Bearer {JWT_TOKEN}`
- **Usuário**: Automaticamente identificado pelo token
- **Contexto**: `ctx.state.user` nas requisições

### 3. Webhook Tokens (Segurança do webhook)
- **Token**: `crew-ai-webhook-secret-2025`
- **Uso**: Header customizado no webhook
- **Propósito**: Validar que requisições vêm do Strapi

## ❌ Confusão Comum

**Webhook token NÃO é para autenticação da API!**

```bash
# ❌ ERRADO - Webhook token como Bearer
Authorization: Bearer crew-ai-webhook-secret-2025

# ✅ CORRETO - API Token como Bearer
Authorization: Bearer ab8697c0e78c05e854a8c9015eb8d014...
```

## 🎯 Para o Pipeline CrewAI

### Publicar Posts (API Token)
```python
headers = {
    'Authorization': f'Bearer {STRAPI_API_TOKEN}',  # Token longo
    'Content-Type': 'application/json'
}
```

### Receber Webhooks (Webhook Token)
```python
# No webhook_server.py
webhook_token = request.headers.get('x-webhook-token')
if webhook_token != 'crew-ai-webhook-secret-2025':
    return {"error": "Unauthorized"}, 401
```

## 📊 Resumo

1. **API Token** (o longo) = Para fazer requisições à API do Strapi
2. **Webhook Token** (crew-ai-webhook-secret-2025) = Para validar webhooks recebidos
3. **JWT Token** = Para usuários finais (não usado no nosso caso)

## ✅ Status Atual

- **API Token**: Configurado e funcionando ✅
- **Webhook Server**: Rodando e validando token ✅
- **Pendente**: Habilitar permissões no Strapi Admin para o API Token poder criar posts

## 🔧 Próximo Passo

No Strapi Admin:
```
Settings → Users & Permissions → Roles → Authenticated
→ Marcar permissões para Post: find, create
→ Salvar
```

Depois disso, o pipeline publicará automaticamente!