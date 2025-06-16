# Strapi v5 - Is Owner Policy (Política de Proprietário)

## Visão Geral

No Strapi v5, a implementação de uma "is-owner policy" (política que restringe edição/deleção apenas ao autor do conteúdo) é feita através de **middlewares customizados**. Isso substitui o antigo sistema de policies das versões anteriores.

## Por que isso é importante?

- **Segurança**: Garante que apenas o autor pode editar/deletar seu próprio conteúdo
- **Multi-tenancy**: Essencial para aplicações com múltiplos usuários
- **Conformidade**: Atende requisitos de privacidade e controle de acesso

## Implementação Passo a Passo

### 1. Gerar o Middleware

Execute dentro do container do Strapi:

```bash
docker exec -it strapi-v5 sh -c "cd /opt/app && npm run strapi generate"
```

Siga as opções:
- Selecione `middleware`
- Nome: `isOwner`
- Escolha `Add middleware to an existing API`
- Selecione a API (ex: `post`)

### 2. Implementar a Lógica do Middleware

Edite o arquivo gerado em `src/api/[your-api-name]/middlewares/isOwner.js`:

```javascript
"use strict";

/**
 * `isOwner` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    const entryId = ctx.params.id ? ctx.params.id : undefined;
    let entry = {};

    /** 
     * Gets all information about a given entry,
     * populating every relations to ensure 
     * the response includes author-related information
     */
    if (entryId) {
      entry = await strapi.documents('api::post.post').findOne(
        entryId,
        { populate: "*" }
      );
    }

    /**
     * Compares user id and entry author id
     * to decide whether the request can be fulfilled
     */
    if (user.id !== entry.author.id) {
      return ctx.unauthorized("This action is unauthorized.");
    } else {
      return next();
    }
  };
};
```

### 3. Configurar as Rotas

Edite `src/api/[your-api-name]/routes/[your-content-type].js`:

```javascript
/**
 * post router
 */
  
const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::post.post", {
  config: {
    // GET e POST continuam públicos
    update: {
      middlewares: ["api::post.is-owner"], // Apenas autor pode atualizar
    },
    delete: {
      middlewares: ["api::post.is-owner"], // Apenas autor pode deletar
    },
  },
});
```

## Exemplo Prático: Blog com Múltiplos Autores

Para um sistema de blog onde:
- Qualquer usuário autenticado pode criar posts
- Apenas o autor pode editar/deletar seus próprios posts
- Leitura é pública

### 1. Estrutura do Content-Type Post

```json
{
  "attributes": {
    "title": { "type": "string", "required": true },
    "content": { "type": "richtext" },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    }
  }
}
```

### 2. Middleware Aprimorado

```javascript
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    
    // Se não há usuário autenticado
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }
    
    const entryId = ctx.params.id;
    
    // Para criação, sempre permite (se autenticado)
    if (!entryId && ctx.request.method === 'POST') {
      // Injeta o autor automaticamente
      ctx.request.body.data.author = user.id;
      return next();
    }
    
    // Para update/delete, verifica ownership
    if (entryId) {
      try {
        const entry = await strapi.documents('api::post.post').findOne(
          entryId,
          { populate: ['author'] }
        );
        
        if (!entry) {
          return ctx.notFound('Post not found');
        }
        
        // Verifica se é o dono
        if (entry.author?.id !== user.id) {
          return ctx.forbidden('You can only modify your own posts');
        }
      } catch (error) {
        return ctx.badRequest('Invalid request');
      }
    }
    
    return next();
  };
};
```

### 3. Configuração de Rotas Completa

```javascript
const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::post.post", {
  config: {
    find: {
      // Público - qualquer um pode listar
    },
    findOne: {
      // Público - qualquer um pode ver
    },
    create: {
      middlewares: ["api::post.is-owner"], // Requer autenticação
    },
    update: {
      middlewares: ["api::post.is-owner"], // Apenas autor
    },
    delete: {
      middlewares: ["api::post.is-owner"], // Apenas autor
    },
  },
});
```

## Testando a Implementação

### 1. Criar um Post (como usuário autenticado)

```bash
curl -X POST https://api.example.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "Meu Post",
      "content": "Conteúdo..."
    }
  }'
```

### 2. Tentar Editar Post de Outro Usuário

```bash
curl -X PUT https://api.example.com/api/posts/123 \
  -H "Authorization: Bearer ANOTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "Tentando editar"
    }
  }'

# Resposta esperada: 403 Forbidden
```

## Variações e Casos de Uso

### 1. Permitir Admins

```javascript
// No middleware
if (user.role?.type === 'admin' || entry.author?.id === user.id) {
  return next();
}
```

### 2. Compartilhamento/Colaboração

```javascript
// Adicionar campo "collaborators" ao content-type
const isCollaborator = entry.collaborators?.some(
  collab => collab.id === user.id
);

if (entry.author?.id === user.id || isCollaborator) {
  return next();
}
```

### 3. Soft Delete com Ownership

```javascript
// Em vez de deletar, marca como "deleted"
if (ctx.request.method === 'DELETE') {
  ctx.request.method = 'PUT';
  ctx.request.body = {
    data: {
      deletedAt: new Date(),
      deletedBy: user.id
    }
  };
}
```

## Integração com o Frontend

### No Cliente TypeScript

```typescript
// Adicionar ao strapiClient.ts

async createMyPost(data: CreatePostData): Promise<StrapiSingleResponse<StrapiPost>> {
  // O middleware automaticamente adiciona o autor
  return this.createPost(data);
}

async updateMyPost(
  id: number,
  data: Partial<CreatePostData>
): Promise<StrapiSingleResponse<StrapiPost>> {
  // Só funcionará se o usuário for o autor
  return this.updatePost(id, data);
}

async deleteMyPost(id: number): Promise<void> {
  // Só funcionará se o usuário for o autor
  return this.deletePost(id);
}
```

### Tratamento de Erros no Frontend

```typescript
try {
  await strapiClient.updatePost(postId, updatedData);
} catch (error) {
  if (error.message.includes('403')) {
    alert('Você só pode editar seus próprios posts!');
  } else if (error.message.includes('401')) {
    alert('Faça login para continuar');
    router.push('/login');
  }
}
```

## Melhores Práticas

1. **Sempre valide no backend**: Nunca confie apenas em validações do frontend
2. **Use TypeScript**: Garante tipos seguros em toda aplicação
3. **Logs de auditoria**: Registre tentativas de acesso não autorizado
4. **Cache consciente**: Invalide cache quando permissões mudam
5. **Testes automatizados**: Teste casos de borda e tentativas de bypass

## Referências

- [Documentação Oficial Strapi - Middlewares](https://docs.strapi.io/cms/backend-customization/middlewares)
- [Strapi v5 Migration Guide](https://docs.strapi.io/dev-docs/migration/v4-to-v5)