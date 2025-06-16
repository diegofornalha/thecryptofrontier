# 🌍 Integração i18n: Frontend Next.js + Strapi

## 📋 Visão Geral

Este documento descreve como a internacionalização (i18n) está integrada entre o frontend Next.js e o backend Strapi.

## 🔄 Mapeamento de Locales

### Frontend → Strapi
```typescript
// Frontend locale codes
'en' → 'en'      // English
'br' → 'pt-BR'   // Portuguese (Brazil)
'es' → 'es'      // Spanish
```

### Utility Functions
```typescript
// src/lib/locale-utils.ts
export function toStrapiLocale(frontendLocale: string): string;
export function fromStrapiLocale(strapiLocale: string): string;
```

## 🎯 Implementação no Frontend

### 1. Estrutura de URLs
- **Inglês (padrão)**: `/blog`, `/post/title`
- **Português**: `/br/blog`, `/br/post/titulo`
- **Espanhol**: `/es/blog`, `/es/post/titulo`

### 2. Componentes Atualizados

#### Blog Page (`src/app/[locale]/blog/page.tsx`)
```typescript
// Busca posts no idioma correto
const strapiLocale = toStrapiLocale(locale);
const result = await strapiClient.getPosts({ 
  locale: strapiLocale,
  // ... outros parâmetros
});
```

#### Post Detail Page (`src/app/[locale]/post/[slug]/page.tsx`)
```typescript
// Busca post individual no idioma correto
const strapiLocale = toStrapiLocale(locale);
const post = await strapiClient.getPostBySlug(slug, strapiLocale);
```

#### Popular Posts Widget
```typescript
// Widget agora usa o locale do contexto
const strapiLocale = toStrapiLocale(locale);
const response = await strapiClient.getPosts({
  locale: strapiLocale,
  // ... outros parâmetros
});
```

### 3. Strapi Client (`src/lib/strapiClient.ts`)

Todos os métodos agora suportam o parâmetro `locale`:

```typescript
// Buscar posts
getPosts({ locale: 'pt-BR', ... })

// Buscar post por slug
getPostBySlug(slug, 'pt-BR')

// Buscar post por ID
getPost(id, 'pt-BR')

// Criar post
createPost(data, 'pt-BR')

// Atualizar post
updatePost(id, data, 'pt-BR')

// Buscar posts
searchPosts(query, { locale: 'pt-BR', ... })

// Posts populares
getPopularPosts(limit, 'pt-BR')
```

## 🔧 Configuração no Strapi

### 1. Habilitar i18n no Collection Type

```json
{
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  }
}
```

### 2. Configurar Locales no Admin

1. Acesse Settings → Internationalization
2. Adicione os locales:
   - `en` - English (padrão)
   - `pt-BR` - Portuguese (Brazil)
   - `es` - Spanish

### 3. Criar Conteúdo Multilíngue

1. Crie o conteúdo no idioma padrão (English)
2. Use o seletor de idioma no topo
3. Clique em "Create new locale"
4. Traduza o conteúdo
5. Salve e publique

## 📡 APIs do Strapi com i18n

### REST API
```bash
# Buscar posts em português
GET /api/posts?locale=pt-BR

# Buscar post específico em espanhol
GET /api/posts/123?locale=es

# Criar post em português
POST /api/posts?locale=pt-BR
```

### GraphQL API
```graphql
# Buscar posts em português
query {
  posts(locale: "pt-BR") {
    data {
      attributes {
        title
        content
      }
    }
  }
}

# Criar post em espanhol
mutation {
  createPost(
    data: { title: "Título", content: "Contenido" }
    locale: "es"
  ) {
    data {
      id
    }
  }
}
```

## ✅ Checklist de Implementação

### Frontend
- [x] Language Switcher component
- [x] Locale context provider
- [x] URL routing com prefixo de idioma
- [x] Middleware para redirecionamentos
- [x] Atualização do Strapi Client
- [x] Blog page com suporte a locale
- [x] Post detail page com suporte a locale
- [x] Popular posts widget com suporte a locale
- [x] Utility functions para conversão de locales

### Strapi
- [ ] Habilitar i18n nos Collection Types
- [ ] Configurar locales no admin
- [ ] Criar conteúdo nos diferentes idiomas
- [ ] Testar APIs com parâmetro locale

## 🚀 Próximos Passos

1. **Deploy das Mudanças**
   ```bash
   git add .
   git commit -m "feat: integrate i18n between frontend and Strapi"
   git push origin preview
   ```

2. **Configurar Strapi**
   - Acessar o admin panel
   - Configurar os locales
   - Habilitar i18n nos Collection Types

3. **Criar Conteúdo Multilíngue**
   - Traduzir posts existentes
   - Criar novos posts em múltiplos idiomas

4. **Testar Integração**
   - Verificar se o language switcher muda o conteúdo
   - Testar URLs `/br/` e `/es/`
   - Confirmar que o conteúdo correto aparece

## 🐛 Troubleshooting

### Posts não aparecem no idioma correto
1. Verifique se o locale está configurado no Strapi
2. Confirme que o conteúdo foi criado naquele idioma
3. Verifique o console para erros de API

### Language switcher não funciona
1. Verifique se o LocaleContext está provido
2. Confirme que o middleware está configurado
3. Teste as URLs diretamente

### Erro 404 em páginas traduzidas
1. Verifique se o conteúdo existe no idioma
2. Confirme que o slug está correto
3. Verifique a estrutura de pastas [locale]