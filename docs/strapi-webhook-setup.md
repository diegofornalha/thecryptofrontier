# Configuração de Webhook Strapi v5 para CrewAI

## 📌 Visão Geral

Este documento descreve como configurar um webhook no Strapi v5 para integração com o CrewAI. O webhook enviará notificações automáticas quando conteúdo for criado, atualizado ou deletado.

**URL do Webhook**: `https://webhook-crewai.agentesintegrados.com/webhook/strapi`

## 🚀 Métodos de Configuração

### Método 1: Script Python Automatizado

```bash
cd /home/strapi/thecryptofrontier
python3 scripts/setup-strapi-webhook.py
```

Este script tentará:
1. Verificar conexão com Strapi
2. Listar webhooks existentes
3. Criar novo webhook via API
4. Testar o webhook

### Método 2: Script Bash Alternativo

```bash
cd /home/strapi/thecryptofrontier
./scripts/setup-webhook-alternative.sh
```

Este script oferece múltiplas alternativas caso o método principal falhe.

### Método 3: Configuração via Node.js

```bash
cd /home/strapi/thecryptofrontier
node scripts/configure-strapi-webhook.js
```

Este script:
1. Atualiza a configuração do servidor Strapi
2. Cria lifecycle hooks
3. Gera script SQL para inserção direta

### Método 4: Configuração Manual via Painel Admin

1. Acesse o painel admin: `http://localhost:1338/admin`
2. Navegue para: **Settings** → **Webhooks**
3. Clique em **"Create new webhook"**
4. Configure com os seguintes dados:

```json
{
  "name": "CrewAI Integration",
  "url": "https://webhook-crewai.agentesintegrados.com/webhook/strapi",
  "headers": {
    "Authorization": "Bearer crew-ai-webhook-secret-2025",
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
  ]
}
```

5. Marque **"Enabled"**
6. Clique em **"Save"**

### Método 5: Inserção Direta no Banco de Dados

Se nenhum método anterior funcionar, use SQL direto:

```bash
# Executar o script SQL gerado
docker exec -i strapi-postgres psql -U strapi strapi < scripts/insert-webhook.sql
```

Ou execute manualmente:

```sql
INSERT INTO webhooks (
  name, url, headers, events, enabled, created_at, updated_at
) VALUES (
  'CrewAI Integration',
  'https://webhook-crewai.agentesintegrados.com/webhook/strapi',
  '{"Authorization": "Bearer crew-ai-webhook-secret-2025", "Content-Type": "application/json", "X-CrewAI-Version": "1.0"}',
  '["entry.create", "entry.update", "entry.delete", "entry.publish", "entry.unpublish", "media.create", "media.update", "media.delete"]',
  true,
  NOW(),
  NOW()
);
```

## 🔧 Configuração do Servidor Strapi

Adicione ao arquivo `/strapi-v5-fresh/config/server.js`:

```javascript
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    defaultHeaders: {
      'Authorization': 'Bearer crew-ai-webhook-secret-2025',
      'X-CrewAI-Version': '1.0',
    },
  },
});
```

## 🧪 Testando o Webhook

### 1. Verificar se o servidor está rodando:

```bash
docker ps | grep crewai-webhook-server
```

### 2. Executar teste completo:

```bash
cd /home/strapi/thecryptofrontier/scripts/docker
./test-webhook.sh
```

### 3. Teste manual com curl:

```bash
# Teste básico
curl https://webhook-crewai.agentesintegrados.com/health

# Simular webhook do Strapi
curl -X POST https://webhook-crewai.agentesintegrados.com/webhook/strapi \
  -H "Authorization: Bearer crew-ai-webhook-secret-2025" \
  -H "Content-Type: application/json" \
  -H "X-Strapi-Event: entry.create" \
  -d '{
    "event": "entry.create",
    "model": "post",
    "entry": {
      "id": 1,
      "title": "Teste de Webhook"
    }
  }'
```

### 4. Monitorar logs:

```bash
# Logs do webhook server
docker logs -f crewai-webhook-server

# Ver eventos recebidos
curl https://webhook-crewai.agentesintegrados.com/webhook/events
```

## 📊 Eventos Suportados

| Evento | Descrição | Modelo |
|--------|-----------|--------|
| `entry.create` | Novo conteúdo criado | post, author, page |
| `entry.update` | Conteúdo atualizado | post, author, page |
| `entry.delete` | Conteúdo deletado | post, author, page |
| `entry.publish` | Conteúdo publicado | post |
| `entry.unpublish` | Conteúdo despublicado | post |
| `media.create` | Mídia enviada | - |
| `media.update` | Mídia atualizada | - |
| `media.delete` | Mídia deletada | - |

## 🔐 Segurança

- **Token**: `crew-ai-webhook-secret-2025`
- **Header**: `Authorization: Bearer <token>`
- **HTTPS**: Sempre use HTTPS em produção

## 🐛 Troubleshooting

### Webhook não aparece no painel admin:

1. Verifique se o Strapi foi reiniciado após mudanças de configuração
2. Confirme que o usuário tem permissões de admin
3. Tente inserir diretamente no banco de dados

### Webhook não está sendo disparado:

1. Verifique se está marcado como "Enabled"
2. Confirme que os eventos corretos estão selecionados
3. Verifique os logs do Strapi: `docker logs strapi-v5`

### Erro de autorização:

1. Confirme que o token está correto em ambos os lados
2. Verifique se o header Authorization está sendo enviado
3. Teste com curl para isolar o problema

## 📚 Referências

- [Documentação Oficial Strapi v5 - Webhooks](https://docs.strapi.io/dev-docs/backend-customization/webhooks)
- [Arquivo de configuração do webhook server](../framework_crewai/blog_crew/webhook_server.py)
- [Script de teste](../scripts/docker/test-webhook.sh)

## 🎯 Próximos Passos

Após configurar o webhook:

1. **Integrar com CrewAI**: Implementar handlers para processar eventos
2. **Adicionar filas**: Usar Redis/RabbitMQ para processar eventos assincronamente
3. **Monitoramento**: Configurar alertas para falhas de webhook
4. **Retry Logic**: Implementar reenvio automático em caso de falha

---

*Última atualização: Junho 2025*