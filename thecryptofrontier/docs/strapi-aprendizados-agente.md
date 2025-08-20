# Aprendizados Registrados - Agente Strapi

## 📚 Base de Conhecimento Atualizada

O agente Strapi está aprendendo continuamente sobre a integração. Aqui estão os principais aprendizados registrados:

### 1. Criação de API Token no Strapi v5

**Passo a passo:**
1. Acessar `http://localhost:1339/admin`
2. Navegar para **Settings > API Tokens**
3. Clicar em **"Create new API Token"**
4. Configurar:
   - **Name**: Nome descritivo (ex: "Frontend Next.js Token")
   - **Token type**: Full-access (para desenvolvimento)
   - **Duration**: Unlimited (para desenvolvimento)
5. Salvar e copiar o token gerado
6. Usar no header: `Authorization: Bearer SEU_TOKEN`

### 2. Configuração de Permissões para Content-Types

**Para Post e Article:**
1. No Admin Panel, ir em **Settings > Roles**
2. Escolher a role apropriada:
   - **Public**: Para acesso sem autenticação
   - **Authenticated**: Para usuários logados
3. Marcar permissões necessárias:
   - `find` e `findOne`: Para leitura
   - `create`, `update`, `delete`: Para escrita
4. Para API tokens:
   - Ir em **Settings > API Tokens**
   - Definir permissões específicas por content-type
5. Salvar configurações

**Endpoints disponíveis:**
- `/api/posts`
- `/api/articles`

### 3. Integração Completa: Strapi + Frontend + Agentes

**Arquitetura:**
- **Content-types**: Post e Article com estrutura definida
- **Frontend Next.js**: Usa `strapiClient.ts` para consumir API
- **Agentes (CrewAI)**: Enviam posts via `strapi_integration.py`
- **Guardian**: Supervisiona todo o processo
- **Formato de dados**: Sempre enviar dentro de `{/var/lib/docker/volumes/thecryptofrontier-data: {...}}`

**Scripts disponíveis:**
- `strapi-post-manager.js`: Interface Node.js
- `strapi_integration.py`: Interface Python
- Webhook server para receber posts em tempo real

### 4. Estrutura dos Content-Types

**Post:**
```json
{
  "title": "string (obrigatório)",
  "content": "richtext (obrigatório)",
  "slug": "uid",
  "excerpt": "text",
  "author": "string",
  "tags": "json array",
  "categories": "json array",
  "readingTime": "integer",
  "featured": "boolean",
  "seo": "json object"
}
```

**Article:**
```json
{
  "title": "string (obrigatório)",
  "content": "richtext (obrigatório)",
  "slug": "uid",
  "summary": "text",
  "author": "string",
  "category": "string",
  "tags": "json array",
  "readTime": "integer",
  "isHighlighted": "boolean",
  "metaDescription": "text"
}
```

### 5. Exemplos de Uso da API

**Buscar posts:**
```javascript
const response = await fetch('http://localhost:1337/api/posts', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

**Criar post:**
```javascript
const create = await fetch('http://localhost:1337/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    /var/lib/docker/volumes/thecryptofrontier-data: {
      title: 'Novo Post',
      content: 'Conteúdo do post'
    }
  })
});
```

## 🤖 Como o Agente Aprende

O agente Strapi está configurado para:
- Processar perguntas sobre Strapi
- Salvar memórias persistentes
- Aprender com cada interação
- Fornecer respostas contextualizadas

**Para adicionar novos aprendizados:**
```bash
curl -X POST http://localhost:3007/process \
  -H "Content-Type: application/json" \
  -d '{"content": "APRENDIZADO: [seu novo conhecimento aqui]"}'
```

## 📊 Status do Sistema de Memória

- ✅ Memórias sendo salvas em `//var/lib/docker/volumes/thecryptofrontier-data/memory/memory-store.json`
- ✅ Agente respondendo com informações relevantes
- ✅ Base de conhecimento crescendo continuamente
- ✅ Guardian pode acessar essas memórias para coordenação

## 🚀 Próximos Passos

1. Continuar alimentando o agente com novos aprendizados
2. Integrar com o pipeline do CrewAI
3. Configurar Guardian para usar o conhecimento do agente
4. Automatizar criação de conteúdo baseado nesse conhecimento