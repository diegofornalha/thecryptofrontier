// Script para verificar o conteúdo de uma postagem específica
require('dotenv').config();
const { createClient } = require('@sanity/client');

// Configuração do cliente Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN
});

// ID da postagem a ser verificada
const POST_ID = 'gYzQNnDTRIiJTwt4WUFWDx';

async function verificarPostagem() {
  try {
    console.log(`Buscando postagem com ID: ${POST_ID}...`);
    
    // Buscar detalhes da postagem
    const post = await client.getDocument(POST_ID);
    
    if (!post) {
      console.log(`❌ Postagem com ID ${POST_ID} não encontrada.`);
      return;
    }
    
    console.log('\n===== DETALHES DA POSTAGEM =====');
    console.log(`ID: ${post._id}`);
    console.log(`Tipo: ${post._type}`);
    console.log(`Título: ${post.title || 'Sem título'}`);
    
    if (post.slug && post.slug.current) {
      console.log(`Slug: ${post.slug.current}`);
    }
    
    if (post.content) {
      console.log('\n===== CONTEÚDO DA POSTAGEM =====');
      if (Array.isArray(post.content)) {
        post.content.forEach((block, index) => {
          console.log(`\nBloco ${index + 1}:`);
          console.log(JSON.stringify(block, null, 2));
        });
      } else {
        console.log(JSON.stringify(post.content, null, 2));
      }
    } else {
      console.log('\n❌ A postagem não possui conteúdo.');
    }
    
    // Verificar outros campos importantes
    console.log('\n===== CAMPOS ADICIONAIS =====');
    if (post.publishedAt) {
      console.log(`Data de publicação: ${post.publishedAt}`);
    }
    
    if (post.author) {
      console.log(`Autor: ${JSON.stringify(post.author)}`);
    }
    
    if (post.excerpt) {
      console.log(`Resumo: ${post.excerpt}`);
    }
    
    if (post.isDraft !== undefined) {
      console.log(`É rascunho? ${post.isDraft ? 'Sim' : 'Não'}`);
    }
    
    console.log('\n===== DOCUMENTO COMPLETO =====');
    console.log(JSON.stringify(post, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao verificar postagem:', error);
    console.error('Detalhes do erro:', error.message);
  }
}

// Executar a função
verificarPostagem(); 