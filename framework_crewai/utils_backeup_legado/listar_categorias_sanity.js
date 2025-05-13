// Script para listar categorias disponíveis no Sanity CMS
const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar cliente Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_DEV_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false
});

// Função para listar categorias
async function listarCategorias() {
  try {
    // Consultar todas as categorias
    const categorias = await client.fetch('*[_type == "category"]');
    
    console.log('Categorias disponíveis no Sanity:');
    console.log('================================');
    
    if (categorias.length === 0) {
      console.log('Nenhuma categoria encontrada.');
    } else {
      categorias.forEach(cat => {
        console.log(`ID: ${cat._id}`);
        console.log(`Título: ${cat.title}`);
        console.log(`Slug: ${cat.slug ? cat.slug.current : 'N/A'}`);
        console.log('--------------------------------');
      });
      
      console.log(`Total: ${categorias.length} categorias`);
    }
    
    // Consultar também os tipos de documento disponíveis
    console.log('\nTipos de documento disponíveis:');
    console.log('================================');
    const types = await client.fetch(`array::unique(*._type)`);
    console.log(types.join(', '));
    
  } catch (erro) {
    console.error('Erro ao listar categorias:', erro);
  }
}

// Executar a função
listarCategorias().catch(console.error); 