#!/usr/bin/env node

/**
 * Script para criar automaticamente o content-type "Post" no Strapi
 * Baseado na documentação oficial do Strapi
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Carrega variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

console.log('🚀 Criando Content-Type "Post" no Strapi\n');
console.log('URL:', STRAPI_URL);
console.log('Token:', STRAPI_API_TOKEN ? '✅ Configurado' : '❌ Não configurado');
console.log('-'.repeat(60));

/**
 * Schema do content-type Post seguindo padrão Strapi
 */
const postContentType = {
  kind: 'collectionType',
  collectionName: 'posts',
  info: {
    singularName: 'post',
    pluralName: 'posts',
    displayName: 'Post',
    description: 'Blog posts para o site'
  },
  options: {
    draftAndPublish: true,
    timestamps: true
  },
  pluginOptions: {},
  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 255
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true
    },
    content: {
      type: 'richtext',
      required: true
    },
    excerpt: {
      type: 'text',
      maxLength: 500
    },
    featuredImage: {
      type: 'media',
      multiple: false,
      required: false,
      allowedTypes: ['images']
    },
    author: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'posts'
    },
    category: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::category.category',
      inversedBy: 'posts'
    },
    tags: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::tag.tag',
      mappedBy: 'posts'
    },
    seo: {
      type: 'component',
      repeatable: false,
      component: 'shared.seo'
    },
    viewCount: {
      type: 'integer',
      default: 0,
      min: 0
    },
    featured: {
      type: 'boolean',
      default: false
    }
  }
};

/**
 * Schema do componente SEO
 */
const seoComponent = {
  collectionName: 'components_shared_seos',
  info: {
    displayName: 'SEO',
    description: 'Componente para metadados SEO'
  },
  options: {},
  attributes: {
    metaTitle: {
      type: 'string',
      maxLength: 60
    },
    metaDescription: {
      type: 'text',
      maxLength: 160
    },
    keywords: {
      type: 'string'
    },
    metaImage: {
      type: 'media',
      multiple: false,
      allowedTypes: ['images']
    },
    canonicalURL: {
      type: 'string'
    }
  }
};

/**
 * Schema do content-type Category
 */
const categoryContentType = {
  kind: 'collectionType',
  collectionName: 'categories',
  info: {
    singularName: 'category',
    pluralName: 'categories',
    displayName: 'Category',
    description: 'Categorias para posts'
  },
  options: {
    draftAndPublish: false
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    slug: {
      type: 'uid',
      targetField: 'name',
      required: true
    },
    description: {
      type: 'text'
    },
    posts: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::post.post',
      mappedBy: 'category'
    }
  }
};

/**
 * Schema do content-type Tag
 */
const tagContentType = {
  kind: 'collectionType',
  collectionName: 'tags',
  info: {
    singularName: 'tag',
    pluralName: 'tags',
    displayName: 'Tag',
    description: 'Tags para posts'
  },
  options: {
    draftAndPublish: false
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    slug: {
      type: 'uid',
      targetField: 'name',
      required: true
    },
    posts: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::post.post',
      inversedBy: 'tags'
    }
  }
};

async function createContentTypes() {
  if (!STRAPI_API_TOKEN) {
    console.log('❌ Token de API não configurado!');
    console.log('\n💡 Para criar um token:');
    console.log('1. Acesse:', STRAPI_URL + '/admin');
    console.log('2. Vá em Settings > API Tokens');
    console.log('3. Crie um token com "Full access"');
    console.log('4. Adicione ao .env.local: STRAPI_API_TOKEN=seu_token');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  };

  try {
    console.log('\n📝 Criando componente SEO...');
    
    // Primeiro, cria o componente SEO
    try {
      await axios.post(`${STRAPI_URL}/content-type-builder/components`, {
        component: {
          category: 'shared',
          ...seoComponent
        }
      }, { headers });
      console.log('✅ Componente SEO criado!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️  Componente SEO já existe');
      } else {
        throw error;
      }
    }

    console.log('\n📝 Criando content-type Category...');
    
    // Cria Category
    try {
      await axios.post(`${STRAPI_URL}/content-type-builder/content-types`, {
        contentType: categoryContentType
      }, { headers });
      console.log('✅ Content-type Category criado!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️  Content-type Category já existe');
      } else {
        throw error;
      }
    }

    console.log('\n📝 Criando content-type Tag...');
    
    // Cria Tag
    try {
      await axios.post(`${STRAPI_URL}/content-type-builder/content-types`, {
        contentType: tagContentType
      }, { headers });
      console.log('✅ Content-type Tag criado!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️  Content-type Tag já existe');
      } else {
        throw error;
      }
    }

    console.log('\n📝 Criando content-type Post...');
    
    // Finalmente, cria Post
    const response = await axios.post(`${STRAPI_URL}/content-type-builder/content-types`, {
      contentType: postContentType
    }, { headers });

    console.log('✅ Content-type Post criado com sucesso!');
    
    console.log('\n🔄 Reiniciando servidor Strapi...');
    // O Strapi precisa reiniciar após criar content-types
    await axios.post(`${STRAPI_URL}/admin/restart`, {}, { headers });
    
    console.log('\n⏳ Aguardando reinicialização (30 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\n🔐 Configurando permissões públicas...');
    await configurePermissions();
    
    console.log('\n🎉 Content-types criados com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Teste a criação de posts: npm run strapi:test');
    console.log('2. Acesse o painel admin:', STRAPI_URL + '/admin');
    console.log('3. Vá em Content Manager > Posts para criar conteúdo');

  } catch (error) {
    console.error('\n❌ Erro ao criar content-types:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
    
    console.log('\n💡 Possíveis soluções:');
    console.log('1. Verifique se o token tem permissões administrativas');
    console.log('2. Confirme se o Strapi está em modo desenvolvimento');
    console.log('3. Tente criar manualmente pelo painel admin');
  }
}

async function configurePermissions() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  };

  try {
    // Configura permissões públicas para Posts
    const permissions = {
      permissions: {
        'api::post.post': {
          controllers: {
            post: {
              find: { enabled: true },
              findOne: { enabled: true }
            }
          }
        },
        'api::category.category': {
          controllers: {
            category: {
              find: { enabled: true },
              findOne: { enabled: true }
            }
          }
        },
        'api::tag.tag': {
          controllers: {
            tag: {
              find: { enabled: true },
              findOne: { enabled: true }
            }
          }
        }
      }
    };

    await axios.put(`${STRAPI_URL}/users-permissions/roles/1`, permissions, { headers });
    console.log('✅ Permissões públicas configuradas!');
    
  } catch (error) {
    console.log('⚠️  Erro ao configurar permissões automaticamente');
    console.log('Configure manualmente em Settings > Roles > Public');
  }
}

// Executa
createContentTypes().catch(console.error); 