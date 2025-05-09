// Script para buscar a postagem e seu autor
require('dotenv').config()
const { createClient } = require('@sanity/client')

// Configuração do cliente Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN
})

// Slug da postagem que criamos
const POST_SLUG = 'introducao-as-criptomoedas'

// Consulta GROQ avançada com JOIN para buscar a postagem e o autor
const query = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  categories,
  isFeatured,
  "authorDetails": author->{
    _id,
    name,
    slug,
    role,
    "imageUrl": image.asset->url
  },
  "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180)
}`

async function buscarPostagem() {
  try {
    console.log(`Buscando postagem com slug "${POST_SLUG}"...`)
    const postagem = await client.fetch(query, { slug: POST_SLUG })
    
    if (!postagem) {
      console.log('\nPostagem não encontrada.')
      return
    }
    
    console.log('\n=== Detalhes da Postagem ===\n')
    console.log(`ID: ${postagem._id}`)
    console.log(`Título: ${postagem.title}`)
    console.log(`Slug: ${postagem.slug.current}`)
    console.log(`Publicada em: ${new Date(postagem.publishedAt).toLocaleString('pt-BR')}`)
    console.log(`Categorias: ${postagem.categories.join(', ')}`)
    console.log(`Destacada: ${postagem.isFeatured ? 'Sim' : 'Não'}`)
    console.log(`Tempo de leitura estimado: ${postagem.estimatedReadingTime || 1} min`)
    console.log('\n--- Autor ---\n')
    console.log(`Nome: ${postagem.authorDetails.name}`)
    console.log(`Cargo: ${postagem.authorDetails.role || 'Não especificado'}`)
    console.log(`Slug: ${postagem.authorDetails.slug.current}`)
    if (postagem.authorDetails.imageUrl) {
      console.log(`Imagem: ${postagem.authorDetails.imageUrl}`)
    }
    
    console.log('\n--- Resumo ---\n')
    console.log(postagem.excerpt)
  } catch (error) {
    console.error('Erro ao buscar postagem:', error)
  }
}

// Executar a função
buscarPostagem() 