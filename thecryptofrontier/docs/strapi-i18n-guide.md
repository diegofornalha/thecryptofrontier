# Guia Completo de Internacionalização (i18n) no Strapi

## 📌 Visão Geral

A internacionalização (i18n) no Strapi permite criar e gerenciar conteúdo em múltiplos idiomas. Este guia detalha todo o processo de configuração e uso.

## 🚀 Configuração Inicial

### 1. Habilitar o Plugin i18n

1. Acesse o painel administrativo do Strapi
2. Navegue para **Settings** → **Global Settings** → **Internationalization**
3. Adicione os locales desejados:
   - Mais de 500 locales pré-definidos disponíveis
   - **Importante**: Não é possível criar locales customizados
   - Exemplos comuns: `en` (Inglês), `pt` (Português), `es` (Espanhol), `fr` (Francês)

### 2. Habilitar i18n em Content-Types

Para cada Content-Type que precisa suportar múltiplos idiomas:

1. Acesse o **Content-Type Builder**
2. Selecione o Content-Type desejado
3. Clique em **Advanced Settings**
4. Marque a opção **Enable localization for this Content-Type**
5. Salve as alterações

## 📝 Criando Conteúdo Multilíngue

### Via Interface Admin

1. Ao criar/editar conteúdo, use o seletor de idioma no topo
2. Cada idioma é tratado como um documento separado
3. Preencha os campos para cada idioma individualmente

### Via API REST

#### Criar conteúdo no idioma padrão
```bash
POST /api/restaurants
{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "name": "Oplato",
    "description": "Restaurante italiano"
  }
}
```

#### Criar conteúdo em idioma específico
```bash
POST /api/restaurants
{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "name": "Restaurante Exemplo",
    "description": "Descrição em português",
    "locale": "pt"
  }
}
```

#### Atualizar versão em outro idioma
```bash
PUT /api/restaurants/{documentId}?locale=fr
{
  "/var/lib/docker/volumes/thecryptofrontier-data": {
    "name": "Nom en Français",
    "description": "Description en français"
  }
}
```

## 🌍 Consultando Conteúdo por Idioma

### Buscar conteúdo em idioma específico
```bash
GET /api/restaurants?locale=pt
```

### Buscar conteúdo em todos os idiomas
```bash
GET /api/restaurants?locale=all
```

### Buscar com populate de relações localizadas
```bash
GET /api/restaurants?locale=pt&populate=*
```

## 📤 Publicação por Idioma

Com o sistema Draft & Publish ativo, cada versão de idioma precisa ser publicada separadamente:

### Via código JavaScript/TypeScript
```javascript
// Publicar versão em português
await strapi.documents('api::restaurant.restaurant').publish({
  documentId: 'abc123',
  locale: 'pt'
});

// Publicar versão em francês
await strapi.documents('api::restaurant.restaurant').publish({
  documentId: 'abc123',
  locale: 'fr'
});

// Publicar todas as versões de idioma
await strapi.documents('api::restaurant.restaurant').publish({
  documentId: 'abc123',
  locale: '*'
});
```

### Via API REST
```bash
# Publicar versão específica
PUT /api/restaurants/{documentId}/publish?locale=pt

# Publicar todas as versões
PUT /api/restaurants/{documentId}/publish?locale=*
```

## 🔧 Configuração Avançada

### Definir idioma padrão
Em `config/plugins.js`:
```javascript
module.exports = {
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'pt',
      locales: ['pt', 'en', 'es', 'fr']
    }
  }
};
```

### Middleware para detecção automática de idioma
```javascript
// config/middlewares.js
module.exports = [
  // ... outros middlewares
  {
    name: 'strapi::i18n',
    config: {
      defaultLocale: 'pt',
      modes: ['query', 'cookie', 'header'],
      cookieName: 'strapi-locale'
    }
  }
];
```

## ⚠️ Pontos Importantes

1. **Documentos Separados**: Cada versão de idioma é um documento independente
2. **IDs Diferentes**: Cada tradução tem seu próprio ID de documento
3. **Publicação Individual**: Publique cada idioma separadamente com Draft & Publish
4. **Relações**: Relações também podem ser localizadas se o Content-Type relacionado tiver i18n habilitado
5. **Campos Únicos**: Campos únicos são únicos por idioma, não globalmente

## 🔍 Exemplos Práticos

### Cenário: Blog Multilíngue

```javascript
// Criar post em português
const postPT = await strapi.entityService.create('api::post.post', {
  /var/lib/docker/volumes/thecryptofrontier-data: {
    title: 'Introdução ao Strapi',
    content: 'Conteúdo em português...',
    locale: 'pt'
  }
});

// Criar versão em inglês do mesmo post
const postEN = await strapi.entityService.create('api::post.post', {
  /var/lib/docker/volumes/thecryptofrontier-data: {
    title: 'Introduction to Strapi',
    content: 'English content...',
    locale: 'en',
    localizations: [postPT.id] // Conecta as traduções
  }
});

// Publicar ambas versões
await strapi.documents('api::post.post').publish({
  documentId: postPT.documentId,
  locale: '*'
});
```

### Buscar com fallback para idioma padrão
```javascript
async function getContentWithFallback(slug, locale) {
  // Tenta buscar no idioma solicitado
  let content = await strapi.entityService.findMany('api::post.post', {
    filters: { slug, locale },
    limit: 1
  });

  // Se não encontrar, busca no idioma padrão
  if (!content.length) {
    content = await strapi.entityService.findMany('api::post.post', {
      filters: { slug, locale: 'pt' },
      limit: 1
    });
  }

  return content[0];
}
```

## 📚 Referências

- [Documentação oficial i18n Strapi](https://docs.strapi.io/dev-docs/plugins/i18n)
- [API REST com i18n](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication)
- [GraphQL com i18n](https://docs.strapi.io/dev-docs/api/graphql#internationalization)

---

**Última atualização**: 16/06/2025