// Script para atualizar a postagem com informações de SEO
require('dotenv').config()
const { createClient } = require('@sanity/client')

// Configuração do cliente Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN // Necessário token com permissão de escrita
})

// Slug da postagem que vamos atualizar
const POST_SLUG = 'introducao-as-criptomoedas'

async function atualizarSeoPostagem() {
  try {
    console.log(`Buscando ID da postagem com slug "${POST_SLUG}"...`)
    
    // Primeiro, precisamos buscar o ID da postagem pelo slug
    const { _id } = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]{_id}`,
      { slug: POST_SLUG }
    )
    
    if (!_id) {
      console.log('Postagem não encontrada!')
      return
    }
    
    // Dados de SEO que vamos adicionar à postagem
    const dadosSEO = {
      seo: {
        metaTitle: 'Introdução às Criptomoedas | The Crypto Frontier',
        metaDescription: 'Aprenda o básico sobre criptomoedas, blockchain e como essa tecnologia está revolucionando o sistema financeiro tradicional. Um guia completo para iniciantes.',
        socialImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-43bd74bda027b8d5777b2267c27dd2c3a5ec676d-160x160-jpg' // Usando a imagem do autor como exemplo
          }
        }
      }
    }
    
    console.log(`Atualizando SEO da postagem (ID: ${_id})...`)
    
    // Atualiza apenas o campo seo do documento
    const resultado = await client
      .patch(_id)
      .set(dadosSEO)
      .commit()
    
    console.log('\n=== SEO Atualizado com Sucesso ===\n')
    console.log(`ID: ${resultado._id}`)
    console.log(`Meta Título: ${resultado.seo?.metaTitle || 'Não definido'}`)
    console.log(`Meta Descrição: ${resultado.seo?.metaDescription || 'Não definida'}`)
    console.log(`Imagem Social: ${resultado.seo?.socialImage ? 'Definida' : 'Não definida'}`)
    console.log(`Atualizado em: ${new Date(resultado._updatedAt).toLocaleString('pt-BR')}`)
    
    console.log('\nVerifique a postagem no Sanity Studio')
  } catch (error) {
    console.error('Erro ao atualizar SEO da postagem:', error)
  }
}

// Executar a função
atualizarSeoPostagem() 