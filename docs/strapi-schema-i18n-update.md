# 🌍 Atualização dos Schemas do Strapi para i18n

## Article Schema com i18n

Para habilitar internacionalização no Collection Type `article`, atualize o arquivo `/strapi-cms/src/api/article/content-types/article/schema.json`:

```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": {
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article",
    "description": "Artigos multilíngue"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "content": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "excerpt": {
      "type": "text",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "publishedAt": {
      "type": "datetime"
    },
    "featuredImage": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"],
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "admin::user",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tag.tag",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    }
  }
}
```

## Post Schema com i18n

Se você também tem um Collection Type `post`, aqui está o schema atualizado:

```json
{
  "kind": "collectionType",
  "collectionName": "posts",
  "info": {
    "singularName": "post",
    "pluralName": "posts",
    "displayName": "Post",
    "description": "Posts multilíngue do blog"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "content": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "excerpt": {
      "type": "text",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "publishedAt": {
      "type": "datetime"
    },
    "featuredImage": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"],
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "categories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::category.category",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tag.tag",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    }
  }
}
```

## 🔧 Como aplicar as mudanças

1. **Faça backup dos schemas atuais**
2. **Atualize os arquivos schema.json**
3. **Reinicie o Strapi**:
   ```bash
   npm run build
   npm run develop
   ```

## 📝 Notas Importantes

### Campos Localizados vs Não-Localizados

- **Localizados** (`localized: true`):
  - `title`: Cada idioma tem seu próprio título
  - `content`: Conteúdo traduzido
  - `slug`: URLs diferentes para cada idioma
  - `excerpt`: Resumo traduzido
  - `seo`: Meta tags específicas por idioma

- **Não-Localizados** (`localized: false`):
  - `featuredImage`: Mesma imagem para todos os idiomas
  - `author`: Mesmo autor
  - `category/tags`: Compartilhados entre idiomas
  - `publishedAt`: Mesma /var/lib/docker/volumes/thecryptofrontier-data de publicação

### Após habilitar i18n

1. **No Admin do Strapi**:
   - Vá para Settings → Internationalization
   - Adicione os locales: `pt-BR` e `es`
   - Mantenha `en` como padrão

2. **Criar conteúdo multilíngue**:
   - Crie primeiro no idioma padrão (English)
   - Use o seletor de idioma no topo do editor
   - Clique em "Create new locale entry"
   - Traduza o conteúdo

3. **Testar as APIs**:
   ```bash
   # Buscar articles em português
   GET /api/articles?locale=pt-BR
   
   # Buscar article específico em espanhol
   GET /api/articles/1?locale=es
   ```

## 🚀 Próximos Passos

1. Atualizar os schemas no Strapi
2. Reiniciar o servidor Strapi
3. Configurar os locales no admin
4. Criar conteúdo de teste em múltiplos idiomas
5. Testar a integração com o frontend

## 🔗 Integração com Frontend

O frontend já está preparado para consumir conteúdo multilíngue:

- Strapi Client atualizado com suporte a locale
- Páginas de blog e post usando o locale correto
- Language Switcher funcionando
- URLs com prefixo de idioma configuradas

Agora é só configurar o Strapi e criar o conteúdo!