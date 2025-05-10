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

// Lista de IDs de posts a excluir
const POST_IDS = [
  'post-20250509224548122', // excluir1
  'post-20250509224658975', // excluir0
  'post-b3-20250509222940', // excluir
  'post-b3-20250509223030', // excluir2
  'post-b3-20250509223341'  // excluir3
];

async function excluirPostsPorIds() {
  try {
    console.log(`Iniciando exclusão de ${POST_IDS.length} posts...`);
    
    // Excluir cada post pelo ID
    let excluidos = 0;
    for (const postId of POST_IDS) {
      console.log(`Excluindo post ID: ${postId}...`);
      
      try {
        // Excluir a postagem usando o ID
        await client.delete(postId);
        excluidos++;
        
        console.log(`✅ Post ${postId} excluído com sucesso!`);
      } catch (err) {
        console.error(`❌ Erro ao excluir post ${postId}:`, err.message);
      }
    }
    
    console.log(`\n✅ Processo concluído: ${excluidos} de ${POST_IDS.length} posts foram excluídos.`);
    console.log(`👉 Esta operação também acionará o webhook que removerá os posts do Algolia automaticamente.`);
  } catch (error) {
    console.error('❌ Erro geral no processo de exclusão:', error);
    console.error('Detalhes do erro:', error.message);
  }
}

// Executar a função
excluirPostsPorIds(); 