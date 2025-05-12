// Script para corrigir o campo da postagem
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

// ID da postagem a ser corrigida
const POST_ID = 'gYzQNnDTRIiJTwt4WUFWDx';

async function corrigirCampoPostagem() {
  try {
    console.log(`Buscando postagem com ID: ${POST_ID}...`);
    
    // Buscar detalhes da postagem
    const post = await client.getDocument(POST_ID);
    
    if (!post) {
      console.log(`❌ Postagem com ID ${POST_ID} não encontrada.`);
      return;
    }
    
    console.log(`Encontrada postagem: "${post.title}"`);
    
    // Verificar se a postagem tem o campo content
    if (!post.content || !Array.isArray(post.content) || post.content.length === 0) {
      console.log(`❌ A postagem não possui o campo 'content' ou está vazio.`);
      return;
    }
    
    console.log(`Postagem tem ${post.content.length} blocos de conteúdo no campo 'content'.`);
    
    // Criar uma cópia do conteúdo para o campo body
    const updateOperation = {
      body: post.content
    };
    
    console.log('Atualizando postagem...');
    
    // Atualizar a postagem no Sanity
    const result = await client
      .patch(POST_ID)
      .set(updateOperation)
      .commit();
    
    console.log('✅ Postagem atualizada com sucesso!');
    console.log(`Título: ${result.title}`);
    console.log(`Agora tem o campo 'body' com ${result.body ? result.body.length : 0} blocos de conteúdo.`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir postagem:', error);
    console.error('Detalhes do erro:', error.message);
  }
}

// Executar a função
corrigirCampoPostagem(); 