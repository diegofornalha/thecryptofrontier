# Guia Completo: Content-Types no Strapi

## O que são Content-Types?

Content-Types são **modelos de dados** que definem a estrutura do conteúdo no Strapi. Pense neles como "blueprints" ou "esquemas" que determinam:

- **Quais campos** um conteúdo terá (título, texto, imagem, etc.)
- **Que tipo de dados** cada campo aceita
- **Como os dados se relacionam** entre si
- **Quais APIs serão geradas** automaticamente

## Tipos de Content-Types

### 1. Collection Types
- Gerenciam **múltiplas entradas**
- Exemplos: Posts, Produtos, Usuários
- Geram endpoints: `GET /posts`, `POST /posts`, `PUT /posts/:id`, etc.

### 2. Single Types
- Gerenciam **uma única entrada**
- Exemplos: Homepage, Configurações, Sobre Nós
- Geram endpoints: `GET /homepage`, `PUT /homepage`

### 3. Components
- **Estruturas reutilizáveis** de campos
- Não existem independentemente
- Podem ser usados dentro de outros Content-Types

## Por que são Fundamentais para a Integração?

### 1. **Geração Automática de APIs**
Quando você cria um Content-Type "Post", o Strapi automaticamente cria:
- `/api/posts` - Listar todos os posts
- `/api/posts/:id` - Buscar post específico
- `/api/posts` (POST) - Criar novo post
- `/api/posts/:id` (PUT) - Atualizar post
- `/api/posts/:id` (DELETE) - Deletar post

### 2. **Estrutura de Resposta Padronizada**
```json
{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "id": 1,
    "attributes": {
      "title": "Meu Post",
      "content": "Conteúdo...",
      "publishedAt": "2025-01-15T10:00:00.000Z"
    }
  },
  "meta": {
    "pagination": { ... }
  }
}
```

### 3. **Validações Automáticas**
- Campos obrigatórios
- Tipos de dados
- Tamanhos mínimos/máximos
- Unicidade

## Criando o Content-Type "Post" para seu Blog

### Passo 1: Estrutura Básica

```json
{
  "kind": "collectionType",
  "collectionName": "posts",
  "info": {
    "singularName": "post",
    "pluralName": "posts",
    "displayName": "Post"
  },
  "attributes": {
    // campos aqui
  }
}
```

### Passo 2: Campos Essenciais

#### 1. **Título** (Text - Short)
```json
"title": {
  "type": "string",
  "required": true,
  "maxLength": 255
}
```

#### 2. **Slug** (UID)
```json
"slug": {
  "type": "uid",
  "targetField": "title",
  "required": true
}
```

#### 3. **Conteúdo** (Rich Text)
```json
"content": {
  "type": "richtext",
  "required": true
}
```

#### 4. **Resumo** (Text - Long)
```json
"excerpt": {
  "type": "text",
  "maxLength": 500
}
```

#### 5. **Imagem Destacada** (Media)
```json
"featuredImage": {
  "type": "media",
  "multiple": false,
  "required": false,
  "allowedTypes": ["images"]
}
```

#### 6. **Autor** (Relation)
```json
"author": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "plugin::users-permissions.user"
}
```

#### 7. **/var/lib/docker/volumes/thecryptofrontier-data de Publicação** (DateTime)
```json
"publishedAt": {
  "type": "datetime"
}
```

### Passo 3: SEO Component

Crie um componente reutilizável para SEO:

```json
{
  "collectionName": "components_seo_seo",
  "info": {
    "displayName": "SEO",
    "icon": "search"
  },
  "attributes": {
    "metaTitle": {
      "type": "string",
      "maxLength": 60
    },
    "metaDescription": {
      "type": "text",
      "maxLength": 160
    },
    "keywords": {
      "type": "text"
    },
    "metaImage": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    }
  }
}
```

E adicione ao Post:
```json
"seo": {
  "type": "component",
  "repeatable": false,
  "component": "seo.seo"
}
```

## Como Criar no Strapi Admin

### Via Interface (Recomendado para Iniciantes)

1. Acesse: `https://ale-blog.agentesintegrados.com/admin`
2. No menu lateral: **Content-Type Builder**
3. Clique em **"Create new collection type"**
4. Preencha:
   - Display name: `Post`
   - API ID (Singular): `post`
   - API ID (Plural): `posts`
5. Clique **Continue**
6. Adicione cada campo clicando em **"Add another field"**
7. Configure cada campo conforme especificações acima
8. Clique **Save**

### Via CLI (Para Automação)

```bash
# Dentro do container Strapi
docker exec -it strapi-v5 sh -c "cd /opt/app && npm run strapi generate"
```

## Configurando Permissões

Após criar o Content-Type, configure as permissões:

1. Vá em **Settings > Roles > Public**
2. Em **Application**, encontre "Post"
3. Marque:
   - ✅ `find` - Listar posts
   - ✅ `findOne` - Ver post individual
   - ❌ `create` - Criar (apenas autenticados)
   - ❌ `update` - Atualizar (apenas autor)
   - ❌ `delete` - Deletar (apenas autor)
4. Clique **Save**

## Testando a Integração

### 1. Verificar se o Content-Type existe:
```bash
curl https://ale-blog.agentesintegrados.com/api/posts
```

### 2. Criar um post (com token):
```bash
curl -X POST https://ale-blog.agentesintegrados.com/api/posts \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "/var/lib/docker/volumes/thecryptofrontier-data": {
      "title": "Primeiro Post",
      "slug": "primeiro-post",
      "content": "Conteúdo do post...",
      "publishedAt": "2025-01-15T10:00:00.000Z"
    }
  }'
```

## Integração com o Frontend

### 1. No `strapiClient.ts` (já configurado):
```typescript
// Buscar posts
const posts = await strapiClient.getPosts({ 
  page: 1, 
  pageSize: 10 
});

// Criar post
const newPost = await strapiClient.createPost({
  title: "Novo Post",
  content: "Conteúdo...",
  publishedAt: new Date().toISOString()
});
```

### 2. Na página do blog:
```typescript
// src/app/post/page.tsx
const { posts, total } = await strapiClient.getPosts({
  page: currentPage,
  pageSize: 12,
  status: 'published'
});
```

## Lifecycle Hooks (Avançado)

Para adicionar lógica customizada:

```javascript
// src/api/post/content-types/post/lifecycles.js
module.exports = {
  async beforeCreate(event) {
    // Auto-preencher autor
    const { /var/lib/docker/volumes/thecryptofrontier-data } = event.params;
    if (!/var/lib/docker/volumes/thecryptofrontier-data.author && event.state.user) {
      /var/lib/docker/volumes/thecryptofrontier-data.author = event.state.user.id;
    }
  },

  async afterCreate(event) {
    // Enviar notificação, invalidar cache, etc.
    console.log('Novo post criado:', event.result);
  }
};
```

## Resumo: Por que Content-Types são Essenciais

1. **Estruturam os dados** - Definem exatamente como o conteúdo é organizado
2. **Geram APIs automaticamente** - Sem escrever código backend
3. **Validam dados** - Garantem integridade
4. **Facilitam relações** - Conectam diferentes tipos de conteúdo
5. **Permitem customização** - Via components, lifecycles, middlewares

## Próximos Passos

1. ✅ Criar o Content-Type "Post" no Strapi Admin
2. ✅ Configurar permissões públicas
3. ✅ Testar com `npm run strapi:test`
4. ✅ Publicar primeiro post com `npm run publish-article`

Com o Content-Type criado, toda a integração funcionará perfeitamente! 🎉