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

// Função para listar os posts
async function listarPosts() {
  try {
    console.log('Consultando posts no Sanity...');
    
    // Buscar todos os posts com títulos que comecem com "excluir"
    const query = `*[_type == "post" && title match "excluir*"] {_id, title}`;
    const posts = await client.fetch(query);
    
    console.log(`\nEncontrados ${posts.length} posts com título começando com "excluir":`);
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ID: ${post._id}, Título: ${post.title}`);
    });
  } catch (error) {
    console.error('Erro ao listar posts:', error);
  }
}

// Executar a função
listarPosts(); 