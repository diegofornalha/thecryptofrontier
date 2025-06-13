# Plano de Migração Sanity → Strapi

## 📋 Status da Migração

### ✅ Concluído
1. **Análise de Referências ao Sanity**
   - Identificados todos os arquivos e dependências
   - Mapeados componentes React que usam Sanity
   - Listados scripts Python do framework CrewAI

2. **Configuração Inicial do Strapi**
   - Criado diretório `/strapi`
   - Configurado Docker Compose
   - Criado arquivo `.env` com credenciais
   - Preparado Dockerfile para build

3. **Scripts de Migração**
   - Criado `/scripts/migration/migrate-sanity-to-strapi.js`
   - Implementadas funções para migrar:
     - Autores
     - Posts
     - Páginas

4. **Cliente Strapi**
   - Criado `/src/lib/strapiClient.js`
   - Implementadas funções equivalentes ao Sanity:
     - getPosts()
     - getPostBySlug()
     - getPages()
     - getPageBySlug()
     - getAuthors()
   - Função transformStrapiPost() para compatibilidade

## 🚧 Em Progresso

### Configuração do Strapi
Para completar a configuração, execute:

```bash
# 1. Iniciar o Strapi com Docker
cd strapi
docker-compose up -d

# 2. Acessar admin panel
# URL: http://localhost:1337/admin
# Criar conta de admin na primeira vez

# 3. Criar Content-Types via Admin Panel:
# - Post (com campos: title, slug, content, excerpt, etc)
# - Page (com campos: title, slug, content, seo)
# - Author (com campos: name, slug, bio, avatar)

# 4. Gerar API Token no Strapi Admin
# Settings > API Tokens > Create new API Token
# Copiar token e adicionar ao .env como STRAPI_API_TOKEN
```

### Migração de Dados
Após configurar o Strapi:

```bash
# Executar script de migração
node scripts/migration/migrate-sanity-to-strapi.js
```

## 📝 Próximos Passos

### 1. Atualizar Componentes React
Arquivos que precisam ser atualizados:

- `/src/components/sections/home/BreakingNewsTicker.tsx`
- `/src/components/sections/home/Featured.tsx`
- `/src/components/sections/home/FeaturedBanner.tsx`
- `/src/components/sections/home/LatestNews.tsx`
- `/src/app/post/[slug]/page.tsx`

Mudanças necessárias:
```javascript
// De:
import client from '@/lib/sanityClient';

// Para:
import { getPosts, transformStrapiPost } from '@/lib/strapiClient';
```

### 2. Atualizar Queries
Substituir queries GROQ por chamadas ao Strapi:

```javascript
// Antes (Sanity):
const posts = await client.fetch(groq`*[_type == "post"]`);

// Depois (Strapi):
const posts = await getPosts();
const transformedPosts = posts.map(transformStrapiPost);
```

### 3. Atualizar Framework CrewAI
Arquivos Python que precisam migração:
- `/framework_crewai/blog_crew/src/config/sanity_config.py`
- `/framework_crewai/blog_crew/src/tools/sanity_tools.py`
- Scripts de publicação em `/framework_crewai/blog_crew/scripts/actions/publish/`

### 4. Remover Dependências Sanity
Após tudo funcionando com Strapi:

```bash
# Remover pacotes Sanity do package.json
npm uninstall @sanity/client @sanity/image-url sanity next-sanity

# Remover arquivos Sanity
rm -rf src/sanity
rm sanity.config.ts sanity.cli.ts
```

### 5. Atualizar Variáveis de Ambiente
Remover do `.env`:
- NEXT_PUBLIC_SANITY_PROJECT_ID
- NEXT_PUBLIC_SANITY_DATASET
- NEXT_PUBLIC_SANITY_API_VERSION
- SANITY_API_TOKEN
- SANITY_DEPLOY_TOKEN

## 🔧 Comandos Úteis

```bash
# Verificar status do Strapi
docker ps | grep strapi

# Logs do Strapi
docker logs strapi-cms -f

# Reiniciar Strapi
docker-compose restart strapi

# Parar tudo
docker-compose down

# Limpar volumes (cuidado!)
docker-compose down -v
```

## ⚠️ Pontos de Atenção

1. **Imagens**: Strapi gerencia uploads diferente do Sanity
2. **Rich Text**: Conteúdo precisa ser convertido de Portable Text para HTML
3. **Relações**: Verificar se autores/categorias estão linkados corretamente
4. **SEO**: Garantir que metadados sejam preservados
5. **URLs**: Atualizar todas as referências de API

## 📊 Checklist Final

- [ ] Strapi rodando com Docker
- [ ] Content-Types criados no Strapi
- [ ] API Token gerado e configurado
- [ ] Dados migrados do Sanity
- [ ] Componentes React atualizados
- [ ] Framework CrewAI atualizado
- [ ] Testes realizados
- [ ] Dependências Sanity removidas
- [ ] Deploy em produção