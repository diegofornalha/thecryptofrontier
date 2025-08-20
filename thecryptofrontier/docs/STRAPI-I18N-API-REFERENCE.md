# 🌍 Strapi v5 - API i18n Reference Guide

## 📋 Visão Geral

Este documento fornece um guia completo para usar as APIs REST, GraphQL e Document Service com internacionalização (i18n) no Strapi v5, seguindo rigorosamente a documentação oficial.

## 🔧 Configuração

### Plugin i18n
```javascript
// config/plugins.js
module.exports = {
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'en',
      locales: [
        { code: 'en', name: 'English (en)', isDefault: true },
        { code: 'pt-BR', name: 'Portuguese (Brazil) (pt-BR)' },
        { code: 'es', name: 'Spanish (es)' }
      ]
    }
  }
};
```

### Content Types com i18n
```json
{
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  }
}
```

## 📡 REST API

### GET - Buscar documentos por locale

#### Buscar todos os documentos de um locale específico
```http
GET /api/posts?locale=pt-BR
```

#### Buscar todos os documentos de todos os locales
```http
GET /api/posts?locale=all
```

#### Buscar documento específico por documentId e locale
```http
GET /api/posts/{documentId}?locale=pt-BR
```

### POST - Criar documentos com locale

#### Criar documento no locale padrão (en)
```http
POST /api/posts
Content-Type: application/json

{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "title": "My English Post",
    "content": "Content in English"
  }
}
```

#### Criar documento em locale específico
```http
POST /api/posts
Content-Type: application/json

{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "title": "Meu Post em Português",
    "content": "Conteúdo em português",
    "locale": "pt-BR"
  }
}
```

### PUT - Criar localizações para documentos existentes

#### Collection Type - Criar nova localização
```http
PUT /api/posts/{documentId}?locale=pt-BR
Content-Type: application/json

{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "title": "Título em Português",
    "content": "Conteúdo localizado"
  }
}
```

#### Single Type - Criar nova localização
```http
PUT /api/homepage?locale=pt-BR
Content-Type: application/json

{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "title": "Página Inicial"
  }
}
```

### DELETE - Deletar locale específico

#### Collection Type
```http
DELETE /api/posts/{documentId}?locale=pt-BR
```

#### Single Type
```http
DELETE /api/homepage?locale=pt-BR
```

## 🔗 GraphQL API

### Queries

#### Buscar documentos por locale
```graphql
{
  posts(locale: "pt-BR") {
    documentId
    title
    content
    locale
  }
}
```

#### Buscar documento específico por documentId e locale
```graphql
query Post($documentId: ID!, $locale: I18NLocaleCode) {
  post(documentId: "a1b2c3d4e5d6f7g8h9i0jkl", locale: "pt-BR") {
    documentId
    title
    content
    locale
  }
}
```

#### Query com conexão (Relay-style)
```graphql
{
  posts_connection(locale: "pt-BR") {
    nodes {
      documentId
      title
      locale
    }
    pageInfo {
      page
      pageSize
      pageCount
      total
    }
  }
}
```

### Mutations

#### Criar documento com locale
```graphql
mutation CreatePost($/var/lib/docker/volumes/thecryptofrontier-data: PostInput!, $locale: I18NLocaleCode) {
  createPost(
    /var/lib/docker/volumes/thecryptofrontier-data: {
      title: "Título em Português",
      content: "Conteúdo em português"
    },
    locale: "pt-BR"
  ) {
    documentId
    title
    content
    locale
  }
}
```

#### Atualizar documento em locale específico
```graphql
mutation UpdatePost($documentId: ID!, $/var/lib/docker/volumes/thecryptofrontier-data: PostInput!, $locale: I18NLocaleCode) {
  updatePost(
    documentId: "a1b2c3d4e5d6f7g8h9i0jkl"
    /var/lib/docker/volumes/thecryptofrontier-data: {
      content: "Novo conteúdo em português"
    },
    locale: "pt-BR"
  ) {
    documentId
    title
    content
    locale
  }
}
```

#### Deletar locale específico
```graphql
mutation DeletePost($documentId: ID!, $locale: I18NLocaleCode) {
  deletePost(documentId: "a1b2c3d4e5d6f7g8h9i0jkl", locale: "pt-BR") {
    documentId
  }
}
```

## ⚙️ Document Service API

### findOne() com locale
```javascript
// Buscar versão específica de um locale
const document = await strapi.documents('api::post.post').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'pt-BR',
});
```

### findFirst() com locale
```javascript
const document = await strapi.documents('api::post.post').findFirst({
  locale: 'pt-BR',
});
```

### findMany() com locale
```javascript
// Buscar todos os documentos de um locale específico
const documents = await strapi.documents('api::post.post').findMany({ 
  locale: 'pt-BR' 
});
```

### create() com locale
```javascript
// Criar documento em locale específico
const document = await strapi.documents('api::post.post').create({
  locale: 'pt-BR',
  /var/lib/docker/volumes/thecryptofrontier-data: { 
    title: 'Título em Português',
    content: 'Conteúdo em português'
  }
});
```

### update() com locale
```javascript
// Atualizar locale específico
const document = await strapi.documents('api::post.post').update({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'pt-BR',
  /var/lib/docker/volumes/thecryptofrontier-data: { title: 'Novo título em português' },
});
```

### delete() com locale
```javascript
// Deletar locale específico
await strapi.documents('api::post.post').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'pt-BR',
});

// Deletar todos os locales
await strapi.documents('api::post.post').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: '*',
});
```

### publish() com locale
```javascript
// Publicar locale específico
await strapi.documents('api::post.post').publish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'pt-BR',
});

// Publicar todos os locales
await strapi.documents('api::post.post').publish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: '*',
});
```

### unpublish() com locale
```javascript
// Despublicar locale específico
await strapi.documents('api::post.post').unpublish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'pt-BR',
});

// Despublicar todos os locales
await strapi.documents('api::post.post').unpublish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: '*',
});
```

### discardDraft() com locale
```javascript
// Descartar rascunho de locale específico
await strapi.documents('api::post.post').discardDraft({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'pt-BR',
});

// Descartar rascunhos de todos os locales
await strapi.documents('api::post.post').discardDraft({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: '*',
});
```

### count() com locale
```javascript
// Contar documentos por locale
const count = await strapi.documents('api::post.post').count({ 
  locale: 'pt-BR' 
});
```

## 🔍 Exemplos Práticos

### Frontend Integration

#### Fetch posts em português via REST
```javascript
const response = await fetch('/api/posts?locale=pt-BR&populate=*');
const posts = await response.json();
```

#### GraphQL query para múltiplos locales
```javascript
const query = `
  query {
    posts(locale: "all") {
      documentId
      title
      locale
    }
  }
`;
```

#### Criar post via REST API
```javascript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    /var/lib/docker/volumes/thecryptofrontier-data: {
      title: 'Título em Português',
      content: 'Conteúdo',
      locale: 'pt-BR'
    }
  })
});
```

## ⚠️ Notas Importantes

1. **Locale Padrão**: Se não especificado, usa o locale padrão definido em `config/plugins.js`
2. **Wildcard (*)**: Suportado para operações em todos os locales simultaneamente
3. **Draft & Publish**: Cada locale pode ter status de publicação independente
4. **Relations**: Relações podem ser localizadas ou compartilhadas entre locales
5. **Unique Fields**: Campos únicos são únicos por locale
6. **GraphQL Playground**: Disponível em `/graphql` com documentação automática

## 🏷️ Tipos GraphQL Gerados

### Enum de Locales
```graphql
enum I18NLocaleCode {
  en
  pt_BR
  es
}
```

### Input Types
```graphql
input PostInput {
  title: String
  content: String
  locale: I18NLocaleCode
}
```

Esta documentação segue exatamente as especificações da documentação oficial do Strapi v5 para i18n. 