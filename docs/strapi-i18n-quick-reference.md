# Referência Rápida - i18n no Strapi

## 🚀 Setup Rápido

### 1. Ativar Plugin
```
Settings → Global Settings → Internationalization → Add Locale
```

### 2. Ativar no Content-Type
```
Content-Type Builder → [Seu Tipo] → Advanced Settings → ✓ Enable localization
```

## 📝 Comandos API Essenciais

### Criar Conteúdo
```bash
# Idioma padrão
POST /api/posts
{ "/var/lib/docker/volumes/thecryptofrontier-data": { "title": "Meu Post" } }

# Idioma específico
POST /api/posts
{ "/var/lib/docker/volumes/thecryptofrontier-data": { "title": "My Post", "locale": "en" } }
```

### Buscar Conteúdo
```bash
# Buscar em português
GET /api/posts?locale=pt

# Buscar todos idiomas
GET /api/posts?locale=all

# Com populate
GET /api/posts?locale=pt&populate=*
```

### Atualizar Tradução
```bash
PUT /api/posts/{documentId}?locale=fr
{ "/var/lib/docker/volumes/thecryptofrontier-data": { "title": "Mon Post" } }
```

## 📤 Publicar (com Draft & Publish)

### Via JavaScript
```javascript
// Publicar versão específica
await strapi.documents('api::post.post').publish({
  documentId: 'abc123',
  locale: 'pt'
});

// Publicar todas versões
await strapi.documents('api::post.post').publish({
  documentId: 'abc123',
  locale: '*'
});
```

### Via API REST
```bash
# Publicar português
PUT /api/posts/{documentId}/publish?locale=pt

# Publicar todas
PUT /api/posts/{documentId}/publish?locale=*
```

## ⚡ Dicas Importantes

1. **Cada tradução = documento separado**
2. **Publique cada idioma individualmente**
3. **Campos únicos são únicos por idioma**
4. **Use `locale: '*'` para operações em massa**
5. **Configure `defaultLocale` em `config/plugins.js`**

## 🔧 Configuração Avançada

```javascript
// config/plugins.js
module.exports = {
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'pt',
      locales: ['pt', 'en', 'es']
    }
  }
};
```

---
Criado para referência rápida do strapi-specialist