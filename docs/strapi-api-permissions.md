# Configuração de Permissões da API Strapi

## Verificação de Content-Type para Publicação

### 1. Verificar Campos do Content-Type "post"

**Caminho**: Content-type Builder → post

Verificar se os seguintes campos existem:
- title (String) - obrigatório
- slug (String) - único
- content (Rich Text)
- excerpt (Text)
- metaTitle (String)
- metaDescription (String)
- publishedAt (DateTime)

**Configurações importantes**:
- Campos obrigatórios devem estar marcados como "Required"
- Slug deve ser único
- Valores padrão podem ser configurados

### 2. Habilitar API para Criação via Token

**Caminho**: Settings → Users & Permissions Plugin → Roles

#### Para acesso via API Token:
1. O token com "Full access" já tem todas as permissões
2. Token atual: `ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd`
3. Tipo: Full Access
4. Status: Ativo

#### Para configurar Role Public (se necessário):
1. Selecionar Role: **Public**
2. Em Permissions, localizar "post"
3. Marcar as permissões:
   - ✅ create (criar)
   - ✅ find (listar)
   - ✅ findOne (buscar individualmente)
   - ✅ update (atualizar)
4. Salvar alterações

### 3. Endpoint Correto da API

Para content-type "post", o endpoint padrão é:
- GET: `https://ale-blog.agentesintegrados.com/api/posts`
- POST: `https://ale-blog.agentesintegrados.com/api/posts`
- GET by ID: `https://ale-blog.agentesintegrados.com/api/posts/{id}`
- PUT: `https://ale-blog.agentesintegrados.com/api/posts/{id}`

### 4. Formato de Dados para POST

```json
{
  "data": {
    "title": "Título do Post",
    "slug": "titulo-do-post",
    "content": "Conteúdo em Rich Text/Markdown",
    "excerpt": "Resumo do post",
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description",
    "publishedAt": "2025-06-16T10:00:00.000Z"
  }
}
```

### 5. Headers Necessários

```
Authorization: Bearer {API_TOKEN}
Content-Type: application/json
```

## Troubleshooting

### Erro 404 - Not Found
- Verificar se o content-type está publicado
- Confirmar nome correto do endpoint (posts vs post)

### Erro 403 - Forbidden
- Verificar permissões do Role
- Confirmar que o token está correto

### Erro 400 - Bad Request
- Verificar campos obrigatórios
- Validar formato dos dados

### Erro 405 - Method Not Allowed
- Verificar se o método HTTP está correto (POST para criar)
- Confirmar que as permissões de "create" estão habilitadas