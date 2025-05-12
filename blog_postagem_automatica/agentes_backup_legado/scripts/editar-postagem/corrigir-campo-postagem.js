// Script para corrigir o campo da postagem
require('dotenv').config();
const { createClient } = require('@sanity/client');

// Configuração do cliente Sanity
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN // Necessário token com permissão de escrita
});

// Função para corrigir uma postagem
async function corrigirPostagem(postId) {
  try {
    console.log(`Corrigindo postagem com ID: ${postId}`);
    
    // Buscar a postagem atual
    const post = await sanityClient.getDocument(postId);
    
    if (!post) {
      console.log(`Postagem com ID ${postId} não encontrada.`);
      return false;
    }
    
    // Criar uma nova versão da postagem sem os campos problemáticos
    const postCorrigido = {
      _id: post._id,
      _type: post._type,
      _rev: post._rev, // Importante para atualização
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      publishedAt: post.publishedAt
    };
    
    // Atualizar a postagem
    const resultado = await sanityClient.createOrReplace(postCorrigido);
    
    console.log(`✅ Postagem corrigida com sucesso!`);
    console.log(`ID: ${resultado._id}`);
    return true;
  } catch (erro) {
    console.error(`❌ Erro ao corrigir postagem:`, erro);
    return false;
  }
}

// Função para listar e corrigir todas as postagens
async function corrigirTodasPostagens() {
  try {
    // Buscar todas as postagens
    const query = `*[_type == "post"]{ _id, title }`;
    const postagens = await sanityClient.fetch(query);
    
    console.log(`Encontradas ${postagens.length} postagens para corrigir.`);
    
    let sucessos = 0;
    let falhas = 0;
    
    for (const post of postagens) {
      const resultado = await corrigirPostagem(post._id);
      if (resultado) {
        sucessos++;
      } else {
        falhas++;
      }
    }
    
    console.log('\n=== RESUMO ===');
    console.log(`Total de postagens: ${postagens.length}`);
    console.log(`Corrigidas com sucesso: ${sucessos}`);
    console.log(`Falhas: ${falhas}`);
    
  } catch (erro) {
    console.error('❌ Erro ao buscar postagens:', erro);
  }
}

// Se passarmos um ID específico como argumento
if (process.argv.length > 2) {
  const postId = process.argv[2];
  corrigirPostagem(postId)
    .then(() => console.log('Processamento concluído!'));
} else {
  // Caso contrário, corrigir todas as postagens
  corrigirTodasPostagens()
    .then(() => console.log('Processamento concluído!'));
} 