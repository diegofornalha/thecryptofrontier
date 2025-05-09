// Script para excluir uma postagem do Sanity
require('dotenv').config();
const { createClient } = require('@sanity/client');

// Configuração do cliente Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN // Necessário token com permissão de escrita
});

// Título da postagem a ser excluída (ou slug)
const TITULO_POSTAGEM = 'Nova Postagem';

async function excluirPostagem() {
  try {
    console.log(`Buscando postagem com título "${TITULO_POSTAGEM}"...`);
    
    // Primeiro, encontrar o ID da postagem pelo título
    const query = `*[_type == "post" && title == $titulo][0]._id`;
    const postId = await client.fetch(query, { titulo: TITULO_POSTAGEM });
    
    if (!postId) {
      console.log(`❌ Nenhuma postagem encontrada com o título "${TITULO_POSTAGEM}"`);
      return;
    }
    
    console.log(`Encontrada postagem com ID: ${postId}`);
    console.log(`Excluindo postagem...`);
    
    // Excluir a postagem usando o ID
    await client.delete(postId);
    
    console.log(`✅ Postagem "${TITULO_POSTAGEM}" excluída com sucesso!`);
    console.log(`👉 Esta operação também acionará o webhook que removerá a postagem do Algolia automaticamente.`);
  } catch (error) {
    console.error('❌ Erro ao excluir postagem:', error);
    console.error('Detalhes do erro:', error.message);
  }
}

// Executar a função
excluirPostagem(); 