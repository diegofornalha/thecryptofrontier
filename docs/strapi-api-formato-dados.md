# Formato de Dados para API do Strapi v5

## Estrutura Geral

Todos os dados enviados para o Strapi devem seguir esta estrutura:

```json
{
  "data": {
    // seus campos aqui
  }
}
```

## Content-Type: Post

### Campos Obrigatórios
- `title` (string, max 255 caracteres)
- `content` (richtext)

### Campos Opcionais
- `slug` (uid, gerado automaticamente se não fornecido)
- `excerpt` (text, max 500 caracteres)
- `featuredImage` (media, apenas imagens)
- `author` (string)
- `tags` (json array)
- `categories` (json array)
- `publishedAt` (datetime ISO 8601)
- `seo` (json object)
- `readingTime` (integer, min 1)
- `featured` (boolean, default false)

### Exemplo Completo

```json
{
  "data": {
    "title": "Como o Bitcoin está revolucionando as finanças",
    "content": "## Introdução\n\nO Bitcoin tem transformado...",
    "excerpt": "Uma análise profunda sobre Bitcoin",
    "author": "João Silva",
    "tags": ["bitcoin", "criptomoedas", "blockchain"],
    "categories": ["Criptomoedas", "Tecnologia"],
    "readingTime": 8,
    "featured": true,
    "seo": {
      "metaTitle": "Bitcoin: A Revolução Financeira",
      "metaDescription": "Descubra como o Bitcoin está transformando",
      "keywords": ["bitcoin", "crypto", "blockchain"]
    }
  }
}
```

## Content-Type: Article

### Campos Obrigatórios
- `title` (string, max 255 caracteres)
- `content` (richtext)

### Campos Opcionais
- `slug` (uid, gerado automaticamente se não fornecido)
- `summary` (text, max 500 caracteres)
- `coverImage` (media, apenas imagens)
- `author` (string)
- `category` (string)
- `tags` (json array)
- `publishDate` (datetime ISO 8601)
- `metaDescription` (text, max 160 caracteres)
- `metaKeywords` (string)
- `readTime` (integer, min 1)
- `isHighlighted` (boolean, default false)
- `viewCount` (integer, min 0, default 0)

### Exemplo Completo

```json
{
  "data": {
    "title": "Ethereum 2.0: O Futuro dos Smart Contracts",
    "content": "## O que é Ethereum 2.0?\n\nEthereum 2.0...",
    "summary": "Uma visão completa sobre Ethereum 2.0",
    "author": "Maria Santos",
    "category": "Smart Contracts",
    "tags": ["ethereum", "smart contracts", "defi"],
    "publishDate": "2024-01-15T10:00:00Z",
    "metaDescription": "Entenda as mudanças do Ethereum 2.0",
    "metaKeywords": "ethereum, eth 2.0, smart contracts",
    "readTime": 12,
    "isHighlighted": true,
    "viewCount": 0
  }
}
```

## Erros Comuns

### 1. Estrutura Incorreta
❌ **Errado:**
```json
{
  "title": "Meu Post",
  "content": "Conteúdo"
}
```

✅ **Correto:**
```json
{
  "data": {
    "title": "Meu Post",
    "content": "Conteúdo"
  }
}
```

### 2. Tipos de Dados Incorretos
❌ **Errado:**
```json
{
  "data": {
    "title": "Post",
    "content": "Conteúdo",
    "readingTime": "5 minutos", // deve ser número
    "featured": "sim" // deve ser boolean
  }
}
```

✅ **Correto:**
```json
{
  "data": {
    "title": "Post",
    "content": "Conteúdo",
    "readingTime": 5,
    "featured": true
  }
}
```

### 3. Campos Obrigatórios Faltando
❌ **Errado:**
```json
{
  "data": {
    "excerpt": "Apenas um resumo"
    // falta title e content
  }
}
```

### 4. Validações Não Atendidas
❌ **Errado:**
```json
{
  "data": {
    "title": "T".repeat(300), // excede max 255
    "content": "OK",
    "readingTime": 0, // menor que min 1
    "excerpt": "a".repeat(501) // excede max 500
  }
}
```

## Headers Necessários

Sempre inclua estes headers nas requisições:

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer SEU_TOKEN_AQUI'
}
```

## Endpoints

- **Posts:** 
  - GET `/api/posts` - Listar todos
  - GET `/api/posts/:id` - Buscar um
  - POST `/api/posts` - Criar novo
  - PUT `/api/posts/:id` - Atualizar
  - DELETE `/api/posts/:id` - Deletar

- **Articles:**
  - GET `/api/articles` - Listar todos
  - GET `/api/articles/:id` - Buscar um
  - POST `/api/articles` - Criar novo
  - PUT `/api/articles/:id` - Atualizar
  - DELETE `/api/articles/:id` - Deletar

## Populando Relações

Para incluir dados relacionados nas respostas:

```
GET /api/posts?populate=*
GET /api/posts?populate[author]=true&populate[categories]=true
```

## Filtrando Resultados

```
GET /api/posts?filters[featured][$eq]=true
GET /api/posts?filters[title][$contains]=Bitcoin
GET /api/posts?sort=publishedAt:desc
GET /api/posts?pagination[page]=1&pagination[pageSize]=10
```

## Testando

Use o script de teste para validar seus dados:

```bash
node scripts/test-strapi-content-format.js
```