// Script para listar todas as postagens
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

// Texto a procurar
const textoBusca = 'gYzQNnDTRIiJTwt4WUFWDx';

async function listarPostagens() {
  try {
    console.log('Buscando todas as postagens...');
    
    // Consulta para encontrar todos os posts
    const query = '*[_type == "post"] { _id, _type, title, slug }';
    const posts = await client.fetch(query);
    
    console.log(`\nTotal de postagens encontradas: ${posts.length}`);
    
    // Verificar se algum post contém o texto de busca no ID
    const postsEncontrados = posts.filter(post => 
      post._id.includes(textoBusca) || 
      (post.title && post.title.includes(textoBusca)) || 
      (post.slug && post.slug.current && post.slug.current.includes(textoBusca))
    );
    
    if (postsEncontrados.length > 0) {
      console.log(`\n===== POSTS ENCONTRADOS COM "${textoBusca}" =====`);
      postsEncontrados.forEach(post => {
        console.log(JSON.stringify(post, null, 2));
      });
    } else {
      console.log(`\nNenhum post encontrado contendo "${textoBusca}" no ID, título ou slug.`);
    }
    
    // Listar os primeiros 20 posts
    console.log('\n===== PRIMEIROS 20 POSTS =====');
    posts.slice(0, 20).forEach(post => {
      console.log(`ID: ${post._id}, Título: ${post.title || 'Sem título'}, Slug: ${post.slug?.current || 'Sem slug'}`);
    });
    
  } catch (error) {
    console.error('Erro ao listar postagens:', error);
  }
}

// Executar a função
listarPostagens(); 