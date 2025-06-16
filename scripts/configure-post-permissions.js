#!/usr/bin/env node

/**
 * Script para configurar permissões dos content-types Post e Article
 */

const axios = require('axios');
require('dotenv').config();

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb';

async function main() {
  console.log('🔧 Configurando permissões para Post e Article...\n');
  
  try {
    // Primeiro, vamos obter o ID da role Authenticated
    const rolesResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const authenticatedRole = rolesResponse.data.roles.find(role => role.type === 'authenticated');
    
    if (!authenticatedRole) {
      console.error('❌ Role "authenticated" não encontrada');
      return;
    }
    
    console.log(`✅ Role "authenticated" encontrada (ID: ${authenticatedRole.id})`);
    
    // Obter permissões atuais
    const roleDetailResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/roles/${authenticatedRole.id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const currentPermissions = roleDetailResponse.data.role.permissions || {};
    
    // Adicionar permissões para Post e Article
    const newPermissions = {
      ...currentPermissions,
      'api::post.post': {
        controllers: {
          post: {
            find: { enabled: true },
            findOne: { enabled: true },
            create: { enabled: true },
            update: { enabled: true },
            delete: { enabled: true }
          }
        }
      },
      'api::article.article': {
        controllers: {
          article: {
            find: { enabled: true },
            findOne: { enabled: true },
            create: { enabled: true },
            update: { enabled: true },
            delete: { enabled: true }
          }
        }
      }
    };
    
    // Atualizar role com as novas permissões
    await axios.put(
      `${STRAPI_URL}/api/users-permissions/roles/${authenticatedRole.id}`,
      {
        permissions: newPermissions
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Permissões configuradas com sucesso!');
    
    // Testar os endpoints
    console.log('\n🧪 Testando endpoints...\n');
    
    // Testar endpoint de posts
    try {
      const postsResponse = await axios.get(`${STRAPI_URL}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      console.log(`✅ /api/posts funcionando - ${postsResponse.data.data ? postsResponse.data.data.length : 0} posts encontrados`);
    } catch (error) {
      console.log(`❌ /api/posts - Erro: ${error.response?.status} ${error.response?.statusText}`);
    }
    
    // Testar endpoint de articles
    try {
      const articlesResponse = await axios.get(`${STRAPI_URL}/api/articles`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      console.log(`✅ /api/articles funcionando - ${articlesResponse.data.data ? articlesResponse.data.data.length : 0} articles encontrados`);
    } catch (error) {
      console.log(`❌ /api/articles - Erro: ${error.response?.status} ${error.response?.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao configurar permissões:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  main();
}