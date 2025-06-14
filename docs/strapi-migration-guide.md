# Guia de Migração Strapi para Strapi

## Visão Geral

Este guia descreve o processo de migração do Strapi CMS para o Strapi CMS no projeto The Crypto Frontier.

## Arquivos Criados

### 1. Cliente Strapi (`/src/lib/strapiClient.js`)
- Cliente configurado para conectar com o Strapi
- Métodos equivalentes aos do Strapi Client
- Suporte para autenticação via Bearer Token

### 2. Queries Strapi (`/src/lib/strapiQueries.js`)
- Funções de query equivalentes às queries GROQ
- Retornam dados no formato esperado pelos componentes

### 3. Adaptadores (`/src/lib/strapiAdapters.js`)
- Convertem dados do Strapi para o formato do Strapi
- Facilitam a migração gradual dos componentes
- Mantêm compatibilidade com o código existente

### 4. Componente de Teste (`/src/components/StrapiConnectionTest.tsx`)
- Testa conexão com o Strapi
- Verifica se os endpoints estão funcionando
- Exibe dados de exemplo

### 5. Página de Teste (`/src/app/test-strapi/page.tsx`)
- Acesse em: http://localhost:3000/test-strapi
- Visualize o status da conexão e dados

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.local.example` para `.env.local` e configure:

```bash
# Strapi CMS
NEXT_PUBLIC_STRAPI_URL=https://ale-blog.agentesintegrados.com
NEXT_PUBLIC_STRAPI_API_TOKEN=seu_token_api_aqui
```

### 2. Obter Token de API do Strapi

1. Acesse o painel admin do Strapi
2. Vá em Settings > API Tokens
3. Crie um novo token com permissões de leitura
4. Copie o token para o arquivo `.env.local`

## Processo de Migração

### Fase 1: Preparação (Concluída ✓)
- [x] Criar cliente Strapi
- [x] Criar queries equivalentes
- [x] Criar adaptadores de dados
- [x] Criar componente de teste

### Fase 2: Migração dos Componentes

Para cada componente que usa Strapi:

1. **Identificar o uso do Strapi Client**
   ```javascript
   // Antes
   import client from '@/lib/strapiClient';
   
   // Depois
   import strapiClient from '@/lib/strapiClient';
   ```

2. **Substituir queries GROQ por queries Strapi**
   ```javascript
   // Antes
   const posts = await client.fetch(POSTS_LIST_QUERY, { start, end });
   
   // Depois
   import { getPostsList } from '@/lib/strapiQueries';
   const posts = await getPostsList(start, end);
   ```

3. **Aplicar adaptadores aos dados**
   ```javascript
   import { adaptStrapiPost } from '@/lib/strapiAdapters';
   const adaptedPost = adaptStrapiPost(strapiPost);
   ```

### Componentes a Migrar

#### Alta Prioridade
- [ ] `/src/components/sections/home/LatestNews.tsx`
- [ ] `/src/components/sections/home/Featured.tsx`
- [ ] `/src/components/sections/home/BreakingNewsTicker.tsx`
- [ ] `/src/app/blog/page.tsx`
- [ ] `/src/app/post/[slug]/page.tsx`

#### Média Prioridade
- [ ] `/src/components/widgets/PopularPostsWidget.tsx`
- [ ] `/src/components/RelatedPosts.tsx`
- [ ] `/src/components/SearchComponent.jsx`
- [ ] `/src/app/sitemap.ts`

#### Baixa Prioridade
- [ ] Componentes de administração
- [ ] Scripts de migração de dados
- [ ] Ferramentas de sincronização

## Testando a Migração

### 1. Teste de Conexão
```bash
npm run dev
# Acesse http://localhost:3000/test-strapi
```

### 2. Teste Individual de Componentes
Para cada componente migrado:
1. Crie uma versão de teste (ex: `LatestNews.strapi.tsx`)
2. Compare os resultados com a versão Strapi
3. Verifique se os dados estão sendo exibidos corretamente

### 3. Teste de Performance
- Compare tempo de carregamento
- Verifique cache e CDN
- Analise o tamanho dos payloads

## Rollback

Se necessário reverter para o Strapi:
1. Mantenha os arquivos originais intactos
2. Use feature flags ou variáveis de ambiente
3. Implemente um switch condicional:

```javascript
const useStrapi = process.env.NEXT_PUBLIC_USE_STRAPI === 'true';
const client = useStrapi ? strapiClient : strapiClient;
```

## Considerações Importantes

### 1. Diferenças de Estrutura
- Strapi usa `attributes` para campos
- Relações são tratadas diferentemente
- Imagens têm estrutura própria

### 2. Autenticação
- Strapi requer Bearer Token para APIs privadas
- Configure permissões públicas apropriadas

### 3. Performance
- Implemente cache adequado
- Use populate seletivo para otimizar queries
- Configure CDN se necessário

### 4. SEO e URLs
- Mantenha a estrutura de URLs existente
- Preserve slugs e metadados
- Configure redirects se necessário

## Suporte e Problemas

### Problemas Comuns

1. **Erro 403 Forbidden**
   - Verifique o token de API
   - Configure permissões públicas no Strapi

2. **Dados não aparecem**
   - Verifique os adaptadores
   - Confirme estrutura dos dados no Strapi

3. **Imagens quebradas**
   - Verifique URLs das imagens
   - Configure CORS no Strapi se necessário

### Logs e Debug
- Use o componente de teste para debug
- Verifique Network tab do browser
- Analise logs do servidor Next.js

## Próximos Passos

1. Configure o token de API no `.env.local`
2. Teste a conexão em `/test-strapi`
3. Comece migrando um componente simples
4. Proceda com a migração gradual
5. Remova dependências do Strapi após conclusão