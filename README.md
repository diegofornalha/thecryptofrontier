# 🌍 The Crypto Frontier - Strapi v5 Backend

Backend do The Crypto Frontier usando Strapi v5 com suporte completo à internacionalização (i18n).

## 🚀 Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- NPM ou Yarn

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações
npm run strapi build

# Iniciar em modo desenvolvimento
npm run develop
```

## 🌐 Internacionalização (i18n)

Este projeto está configurado com suporte completo a i18n seguindo a documentação oficial do Strapi v5.

### Locales Configurados
- **English (en)** - Idioma padrão
- **Português (Brasil) (pt-BR)** - Português brasileiro
- **Español (es)** - Espanhol

### APIs Suportadas

#### 📡 REST API
```bash
# Buscar posts em português
GET /api/posts?locale=pt-BR

# Buscar posts em todos os idiomas
GET /api/posts?locale=all

# Criar post em espanhol
POST /api/posts
{
  "data": {
    "title": "Título en Español",
    "locale": "es"
  }
}
```

#### 🔗 GraphQL API
```graphql
# Query posts por locale
{
  posts(locale: "pt-BR") {
    documentId
    title
    locale
  }
}

# Mutation para criar post
mutation {
  createPost(
    data: { title: "Novo Post" }
    locale: "pt-BR"
  ) {
    documentId
    title
    locale
  }
}
```

#### ⚙️ Document Service API
```javascript
// Buscar documentos por locale
const posts = await strapi.documents('api::post.post').findMany({
  locale: 'pt-BR'
});

// Criar documento em locale específico
const post = await strapi.documents('api::post.post').create({
  locale: 'pt-BR',
  data: { title: 'Título em Português' }
});
```

## 📋 Content Types

### Post
- **Localizado**: ✅ Sim
- **Draft & Publish**: ✅ Ativo
- **Campos**: title, slug, content, excerpt, featuredImage, author, tags, etc.

### Article  
- **Localizado**: ✅ Sim
- **Draft & Publish**: ✅ Ativo
- **Campos**: title, slug, content, summary, coverImage, author, category, etc.

## 🧪 Teste da Configuração

Execute o script de teste para validar a configuração:

```bash
# Definir token de API (opcional)
export STRAPI_API_TOKEN="seu_token_aqui"

# Executar testes
node scripts/test-i18n-setup.js
```

## 📖 Documentação

- **[API i18n Reference](docs/STRAPI-I18N-API-REFERENCE.md)** - Guia completo das APIs
- **[Exemplos Práticos](examples/strapi-i18n-examples.js)** - Códigos de exemplo
- **[Documentação Oficial](https://docs.strapi.io/cms/api/)** - Strapi v5 APIs

## 🔧 Configuração Avançada

### Middleware de Detecção de Locale
O projeto inclui middleware para detectar automaticamente o locale baseado em:
- Query parameter `?locale=pt-BR`
- Path `/pt-BR/api/posts`
- Header `Accept-Language`

### Publicação por Locale
Cada locale pode ser publicado/despublicado independentemente:

```javascript
// Publicar apenas em português
await strapi.documents('api::post.post').publish({
  documentId: 'abc123',
  locale: 'pt-BR'
});

// Publicar em todos os locales
await strapi.documents('api::post.post').publish({
  documentId: 'abc123',
  locale: '*'
});
```

## 🚦 Status da Configuração

- ✅ Plugin i18n instalado e configurado
- ✅ Locales configurados (en, pt-BR, es)
- ✅ Content Types habilitados para i18n
- ✅ REST API suporta parâmetro locale
- ✅ GraphQL API suporta I18NLocaleCode
- ✅ Document Service API configurado
- ✅ Middleware de detecção de locale
- ✅ Scripts de teste implementados

## 🎯 Endpoints Principais

### Posts
- `GET /api/posts?locale={locale}` - Listar posts por locale
- `GET /api/posts/{id}?locale={locale}` - Buscar post específico
- `POST /api/posts` - Criar post (inclua locale no body)
- `PUT /api/posts/{id}?locale={locale}` - Criar localização
- `DELETE /api/posts/{id}?locale={locale}` - Deletar locale

### Articles
- `GET /api/articles?locale={locale}` - Listar artigos por locale
- `GET /api/articles/{id}?locale={locale}` - Buscar artigo específico
- `POST /api/articles` - Criar artigo (inclua locale no body)
- `PUT /api/articles/{id}?locale={locale}` - Criar localização
- `DELETE /api/articles/{id}?locale={locale}` - Deletar locale

### GraphQL
- `POST /graphql` - Endpoint GraphQL com suporte a i18n
- Playground disponível em `/graphql` (desenvolvimento)

## 🔐 Autenticação

Configure tokens de API no admin panel:
1. Settings → API Tokens → Create new API Token
2. Configure as permissões necessárias
3. Use o token no header: `Authorization: Bearer YOUR_TOKEN`

## 🛠️ Desenvolvimento

```bash
# Modo desenvolvimento com watch
npm run develop

# Build para produção
npm run build

# Iniciar em produção
npm run start
```

## 📝 Notas Importantes

1. **Locale Padrão**: Se não especificado, usa 'en' como padrão
2. **Wildcard (*)**: Suportado para operações em todos os locales
3. **Campos Únicos**: São únicos por locale, não globalmente
4. **Relations**: Podem ser localizadas ou compartilhadas
5. **Draft & Publish**: Cada locale tem status independente

---

**Configuração baseada na documentação oficial do Strapi v5:**
- [GraphQL API](https://docs.strapi.io/cms/api/graphql#locale)
- [REST API](https://docs.strapi.io/cms/api/rest/locale) 
- [Document Service API](https://docs.strapi.io/cms/api/document-service/locale) 