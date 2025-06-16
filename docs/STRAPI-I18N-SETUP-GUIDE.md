# 🌍 Guia Completo de Configuração i18n - Strapi v5

## 📋 Status Atual

✅ **Configuração Completa Realizada:**
- Package.json configurado com Strapi v5.0.5
- Plugin i18n configurado em `config/plugins.js`
- Content types (Post e Article) habilitados para i18n
- Middlewares configurados
- Documentação da API criada

## 🚀 Próximos Passos para Ativar o i18n

### 1. **Iniciar o Strapi em Modo de Desenvolvimento**

```bash
cd strapi-v5-fresh
npm run develop
```

**⚠️ IMPORTANTE:** O Strapi deve estar em modo de desenvolvimento para:
- Editar content types
- Configurar plugins
- Acessar o Content-Type Builder

### 2. **Acessar o Admin Panel**

1. Abra o navegador em: `http://localhost:1337/admin`
2. Crie uma conta de administrador (se for a primeira vez)
3. Faça login no painel administrativo

### 3. **Verificar se o Plugin i18n está Ativo**

1. No painel admin, vá em **Settings** → **Plugins**
2. Verifique se o plugin **Internationalization (i18n)** está listado e ativo
3. Se não estiver ativo, clique para ativá-lo

### 4. **Configurar os Locales**

1. Vá em **Settings** → **Internationalization**
2. Você deve ver o locale padrão **English (en)**
3. Adicione os novos locales:

   **Português (Brasil):**
   - Locale: `pt-BR`
   - Display name: `Portuguese (Brazil)`
   
   **Español:**
   - Locale: `es`
   - Display name: `Spanish`

### 5. **Habilitar i18n nos Content Types**

#### Para o Content Type "Post":
1. Vá em **Content-Type Builder**
2. Clique em **Post** (Collection Type)
3. Clique no botão **Edit**
4. Na aba **Settings**, marque a opção **Enable localization for this Content-Type**
5. Clique em **Save**

#### Para o Content Type "Article":
1. Repita o mesmo processo para **Article**
2. Habilite a localização
3. Salve as alterações

### 6. **Verificar a Configuração**

Após salvar, o Strapi irá reiniciar automaticamente. Quando voltar:

1. Vá em **Content Manager**
2. Você deve ver um seletor de idioma no topo da página
3. Ao criar/editar conteúdo, você verá opções para diferentes locales

## 🔧 Configurações Já Implementadas

### Plugin i18n (`config/plugins.js`)
```javascript
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
```

### Content Types Configurados
- ✅ **Post** - i18n habilitado no schema
- ✅ **Article** - i18n habilitado no schema

## 📡 Como Usar as APIs com i18n

### REST API Examples

```bash
# Buscar posts em português
GET /api/posts?locale=pt-BR&populate=*

# Buscar posts em espanhol
GET /api/posts?locale=es&populate=*

# Buscar posts em todos os idiomas
GET /api/posts?locale=all&populate=*

# Criar post em português
POST /api/posts
{
  "data": {
    "title": "Título em Português",
    "content": "Conteúdo em português...",
    "locale": "pt-BR"
  }
}
```

### GraphQL Examples

```graphql
# Buscar posts em português
query {
  posts(locale: "pt-BR") {
    data {
      id
      attributes {
        title
        content
        locale
        localizations {
          data {
            attributes {
              locale
            }
          }
        }
      }
    }
  }
}
```

## 🐛 Troubleshooting

### Problema: "Editing content types is disabled"
**Solução:** Certifique-se de que o Strapi está rodando em modo de desenvolvimento:
```bash
npm run develop  # NÃO npm start
```

### Problema: Plugin i18n não aparece
**Solução:** 
1. Verifique se o arquivo `config/plugins.js` está correto
2. Reinicie o servidor
3. Limpe o cache: `npm run build`

### Problema: Locales não aparecem
**Solução:**
1. Vá em Settings → Internationalization
2. Adicione manualmente os locales
3. Reinicie o servidor

## 📚 Documentação Adicional

- **API Reference:** `docs/STRAPI-I18N-API-REFERENCE.md`
- **Examples:** `examples/strapi-i18n-examples.js`
- **Test Script:** `scripts/test-i18n-setup.js`

## ✅ Checklist de Verificação

- [ ] Strapi rodando em modo desenvolvimento (`npm run develop`)
- [ ] Admin panel acessível em `http://localhost:1337/admin`
- [ ] Plugin i18n ativo em Settings → Plugins
- [ ] Locales configurados (en, pt-BR, es)
- [ ] Content types Post e Article com i18n habilitado
- [ ] Seletor de idioma visível no Content Manager
- [ ] APIs funcionando com parâmetro `locale`

---

**🎯 Objetivo:** Ter um sistema completo de internacionalização funcionando para o The Crypto Frontier, permitindo conteúdo em inglês, português e espanhol. 