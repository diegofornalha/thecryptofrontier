# Integração com a API REST do Strapi

## Visão Geral

O Strapi fornece uma API REST completa automaticamente para cada tipo de conteúdo criado. Este documento explica como integrar o frontend Next.js com a API REST do Strapi.

## Configuração Atual

### 1. Cliente Strapi (`/src/lib/strapiClient.js`)

O projeto já possui um cliente configurado que gerencia as requisições à API:

```javascript
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';
```

### 2. Estrutura de Endpoints

O Strapi segue um padrão consistente para endpoints:

- **Collection Types**: `/api/:pluralApiId`
  - GET `/api/posts` - Listar todos os posts
  - GET `/api/posts/:id` - Buscar um post específico
  - POST `/api/posts` - Criar novo post
  - PUT `/api/posts/:id` - Atualizar post
  - DELETE `/api/posts/:id` - Deletar post

- **Single Types**: `/api/:singularApiId`
  - GET `/api/homepage` - Buscar conteúdo único
  - PUT `/api/homepage` - Atualizar conteúdo único

## Autenticação

### 1. API Token

Configure um token no painel admin do Strapi:
1. Vá para Settings > API Tokens
2. Crie um novo token com as permissões necessárias
3. Adicione ao `.env.local`:

```env
NEXT_PUBLIC_STRAPI_API_TOKEN=seu_token_aqui
```

### 2. Headers de Autenticação

O cliente já adiciona automaticamente o header de autorização:

```javascript
headers['Authorization'] = `Bearer ${this.apiToken}`;
```

## Parâmetros de Query

### 1. Populate (Incluir Relacionamentos)

```javascript
// Incluir todos os campos relacionados
?populate=*

// Incluir campos específicos
?populate[author][populate]=avatar
?populate[featuredImage]=*
```

### 2. Filtros

```javascript
// Filtro por campo exato
?filters[slug][$eq]=meu-post

// Filtro com contains (busca)
?filters[title][$containsi]=crypto

// Filtros OR
?filters[$or][0][title][$containsi]=bitcoin
?filters[$or][1][content][$containsi]=bitcoin
```

### 3. Paginação

```javascript
// Paginação com start/limit
?pagination[start]=0&pagination[limit]=10

// Paginação com página
?pagination[page]=1&pagination[pageSize]=10
```

### 4. Ordenação

```javascript
// Ordem decrescente por data de publicação
?sort=publishedAt:desc

// Múltiplas ordenações
?sort=publishedAt:desc,title:asc
```

## Exemplos de Uso

### 1. Buscar Posts com Paginação

```javascript
async function fetchPosts(page = 1, pageSize = 10) {
  const response = await strapiClient.getPosts({
    start: (page - 1) * pageSize,
    limit: pageSize,
    sort: 'publishedAt:desc',
    populate: '*'
  });
  
  return {
    posts: response.data,
    total: response.meta.pagination.total
  };
}
```

### 2. Buscar Post por Slug

```javascript
async function getPostBySlug(slug) {
  const post = await strapiClient.getPostBySlug(slug);
  
  if (!post) {
    throw new Error('Post não encontrado');
  }
  
  return post;
}
```

### 3. Busca de Texto

```javascript
async function searchPosts(searchTerm) {
  const response = await strapiClient.searchPosts(searchTerm, {
    start: 0,
    limit: 20
  });
  
  return response.data;
}
```

### 4. Criar Novo Post (Autenticado)

```javascript
async function createPost(postData) {
  const response = await strapiClient.fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        title: postData.title,
        content: postData.content,
        slug: postData.slug,
        author: postData.authorId,
        publishedAt: new Date()
      }
    })
  });
  
  return response.data;
}
```

## Estrutura de Resposta

### Resposta de Sucesso

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Meu Post",
        "content": "Conteúdo...",
        "slug": "meu-post",
        "publishedAt": "2024-01-15T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 50
    }
  }
}
```

### Resposta de Erro

```json
{
  "data": null,
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not Found",
    "details": {}
  }
}
```

## Boas Práticas

### 1. Cache e Revalidação

Use as opções do Next.js para cache:

```javascript
// Cache por 5 minutos
const data = await fetch(url, {
  next: { revalidate: 300 }
});
```

### 2. Tratamento de Erros

Sempre trate erros nas requisições:

```javascript
try {
  const data = await strapiClient.getPosts();
  return data;
} catch (error) {
  console.error('Erro ao buscar posts:', error);
  return { data: [], meta: { pagination: { total: 0 } } };
}
```

### 3. Otimização de Queries

- Use `populate` seletivamente para evitar over-fetching
- Implemente paginação para grandes conjuntos de dados
- Use filtros para reduzir o payload

## Endpoints Disponíveis no Projeto

### Posts
- `GET /api/posts` - Listar posts
- `GET /api/posts?filters[slug][$eq]=:slug` - Post por slug
- `GET /api/posts?filters[title][$containsi]=:search` - Buscar posts

### Authors
- `GET /api/authors` - Listar autores
- `GET /api/authors?filters[slug][$eq]=:slug` - Autor por slug

### Pages
- `GET /api/pages` - Listar páginas
- `GET /api/pages?filters[slug][$eq]=:slug` - Página por slug

## Próximos Passos

1. Configurar webhooks para invalidação de cache
2. Implementar preview mode para conteúdo draft
3. Adicionar rate limiting e cache headers
4. Configurar CORS adequadamente para produção