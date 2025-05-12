// Script para listar postagens com "excluir" no título ou slug
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

async function listarPostagens() {
  try {
    // Consulta para encontrar posts com "excluir" no título ou slug
    const query = '*[_type == "post" && (title match "*xcluir*" || slug.current match "*xcluir*")] { _id, title, slug }';
    const posts = await client.fetch(query);
    
    console.log(JSON.stringify(posts, null, 2));
    console.log(`\nTotal de postagens encontradas: ${posts.length}`);
  } catch (error) {
    console.error('Erro ao listar postagens:', error);
  }
}

// Executar a função
listarPostagens(); 