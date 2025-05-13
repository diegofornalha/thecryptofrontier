// Script para listar autores do Sanity
require('dotenv').config();
const { createClient } = require('@sanity/client');
const colors = require('./colors');

console.log(`${colors.magenta}${colors.bold} AUTORES CADASTRADOS NO SANITY CMS ${colors.reset}`);
console.log(`${colors.blue}---------------------------------------------${colors.reset}`);

// Configuração direta do cliente Sanity
const configSanity = {
  projectId: 'brby2yrg',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: 'sk0MzzutKkZoELcQnRSwhz7hqSMXlwMuQCwna9Mp90nqUU1OLb0WdouiGhXa1xWdWcNPFlLoCkrxCuq8xNVeDzJPKQOtlh22xjLsNduo7WIR138cCAiZe40cwque00dbHAx0ylF0ntLM5GinO8GKX69aF5JZw7Q5Bpq1GPGRihGhbM0cNGAm'
};

// Criar cliente Sanity
const sanityClient = createClient(configSanity);

// Consulta GROQ para buscar todos os autores
const query = `*[_type == "author"] | order(name asc) {
  _id,
  name,
  slug,
  role,
  "imageUrl": image.asset->url
}`;

async function listarAutores() {
  try {
    console.log(`${colors.blue}[INFO] Buscando autores...${colors.reset}`);
    const autores = await sanityClient.fetch(query);
    
    console.log(`\n${colors.cyan}${colors.bold}=== Lista de Autores ===${colors.reset}\n`);
    if (autores.length === 0) {
      console.log(`${colors.yellow}Nenhum autor encontrado.${colors.reset}`);
    } else {
      autores.forEach((autor, index) => {
        console.log(`${colors.green}${index + 1}. ${colors.bold}${autor.name}${colors.reset}${autor.role ? ` (${autor.role})` : ''}`);
        console.log(`   ${colors.blue}ID: ${colors.reset}${autor._id}`);
        if (autor.slug && autor.slug.current) {
          console.log(`   ${colors.blue}Slug: ${colors.reset}${autor.slug.current}`);
        }
        console.log('');
      });
      console.log(`${colors.blue}Total: ${colors.reset}${autores.length} autor(es)`);
    }
    
    console.log(`\n${colors.cyan}${colors.bold}=== Como usar na configuração ===${colors.reset}`);
    console.log(`Para configurar um autor como padrão, edite o arquivo ${colors.yellow}utils/config.js${colors.reset}:`);
    console.log(`
${colors.green}autor: {
  id: '${colors.yellow}<ID_DO_AUTOR>${colors.green}',
  nome: '${colors.yellow}<NOME_DO_AUTOR>${colors.green}'
}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Erro ao buscar autores: ${error.message}${colors.reset}`);
  }
}

// Executar a função
listarAutores(); 