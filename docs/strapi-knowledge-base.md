# Base de Conhecimento Strapi - Projeto Crypto Frontier

## Aprendizados da Sessão (16/06/2025)

### 1. Arquitetura do Projeto

- **Strapi v5** rodando em Docker na porta 1339
- **PostgreSQL** como banco de dados
- **Frontend Next.js** integrado via API REST
- **Token API** configurado para autenticação

### 2. Content-Types Descobertos

#### Necessário Criar:
- **Post** (Collection Type)
  - title (String, Required)
  - slug (UID)
  - content (Rich Text)
  - excerpt (Long Text)
  - publishedAt (DateTime)
  - author (Relation)
  - featuredImage (Media)
  - seo (Component)

### 3. Integração Frontend Implementada

#### Cliente TypeScript (`strapiClient.ts`)
- 100% formato nativo Strapi
- Tipos seguros com TypeScript
- Métodos completos de CRUD
- Suporte para busca e filtros

#### Rotas API Next.js
- `/api/strapi/publish` - Publicar posts
- `/api/strapi/posts` - CRUD de posts
- `/api/strapi/search` - Busca de conteúdo

### 4. Automação CLI

Scripts criados:
- `strapi:test` - Testar conexão
- `strapi:check` - Verificar content-types
- `strapi:create` - Criar content-types (helper)
- `publish-article` - Publicar markdown

### 5. Segurança e Políticas

#### Is-Owner Policy
- Implementada via middlewares
- Restringe edição/deleção ao autor
- Permite leitura pública
- Documentada em `/docs/strapi-is-owner-policy.md`

### 6. Problemas Encontrados e Soluções

#### Erro 405 (Method Not Allowed)
- **Causa**: Content-Type "Post" não existe
- **Solução**: Criar via Content-Type Builder

#### Token Duplicado
- **Causa**: Cópia incorreta no .env.local
- **Solução**: Remover duplicação

### 7. Configurações Importantes

```env
NEXT_PUBLIC_STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_API_TOKEN=87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb
```

### 8. Comandos Docker Úteis

```bash
# Ver logs do Strapi
docker logs strapi-v5

# Executar comandos no container
docker exec -it strapi-v5 sh

# Gerar middleware
docker exec -it strapi-v5 sh -c "cd /opt/app && npm run strapi generate"
```

### 9. Próximos Passos

1. ✅ Configurar variáveis de ambiente
2. ✅ Criar cliente TypeScript nativo
3. ✅ Implementar rotas API
4. ❌ **Criar Content-Type "Post"** (PENDENTE)
5. ❌ Testar publicação completa
6. ❌ Implementar preview mode

### 10. Documentação Gerada

- `/docs/strapi-rest-api-integration.md`
- `/docs/strapi-is-owner-policy.md`
- `/docs/strapi-content-types-guia-completo.md`
- `/docs/strapi-cli-usage.md`

### 11. Estrutura de Resposta Strapi

```json
{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "id": 1,
    "attributes": {
      "title": "Post Title",
      "slug": "post-title",
      "content": "Content...",
      "publishedAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 10
    }
  }
}
```

### 12. Lifecycle Hooks Importantes

```javascript
// beforeCreate - Auto-adicionar autor
// afterCreate - Invalidar cache
// beforeUpdate - Verificar permissões
// afterUpdate - Atualizar índices
```

## Conceitos Chave Aprendidos

1. **Content-Types são fundamentais** - Sem eles, não há API
2. **Strapi v5 usa middlewares** para políticas (não mais policies)
3. **Formato de resposta é padronizado** com /var/lib/docker/volumes/thecryptofrontier-data/meta
4. **Docker em produção** requer modo desenvolvimento para Content-Type Builder
5. **Tokens de API** precisam permissões específicas por content-type