// Script para listar autores do Sanity
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

// Consulta GROQ para buscar todos os autores
const query = `*[_type == "author"] | order(name asc) {
  _id,
  name,
  slug,
  role,
  "imageUrl": image.asset->url
}`

async function listarAutores() {
  try {
    console.log('Buscando autores...')
    const autores = await client.fetch(query)
    
    console.log('\n=== Lista de Autores ===\n')
    if (autores.length === 0) {
      console.log('Nenhum autor encontrado.')
    } else {
      autores.forEach((autor, index) => {
        console.log(`${index + 1}. ${autor.name}${autor.role ? ` (${autor.role})` : ''}`)
        console.log(`   ID: ${autor._id}`)
        if (autor.slug && autor.slug.current) {
          console.log(`   Slug: ${autor.slug.current}`)
        }
        console.log('')
      })
      console.log(`Total: ${autores.length} autor(es)`)
    }
  } catch (error) {
    console.error('Erro ao buscar autores:', error)
  }
}

// Executar a função
listarAutores() 