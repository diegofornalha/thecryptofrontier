// Script para criar uma nova postagem no Sanity
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

// ID do autor Alexandre Bianchi que encontramos
const AUTOR_ID = 'ca38a3d5-cba1-47a0-aa29-4af17a15e17c'

// Dados da nova postagem
const novaPostagem = {
  _type: 'post',
  title: 'Introdução às Criptomoedas',
  slug: {
    _type: 'slug',
    current: 'introducao-as-criptomoedas'
  },
  author: {
    _type: 'reference',
    _ref: AUTOR_ID
  },
  excerpt: 'Um guia introdutório sobre o mundo das criptomoedas e como elas estão revolucionando o sistema financeiro global.',
  publishedAt: new Date().toISOString(),
  categories: ['Blockchain', 'Criptomoedas', 'Tecnologia'],
  isFeatured: true,
  isDraft: false,
  content: [
    {
      _type: 'block',
      style: 'normal',
      _key: 'intro',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'intro-span',
          text: 'Criptomoedas são moedas digitais descentralizadas que utilizam criptografia para garantir a segurança das transações. Diferente das moedas tradicionais, as criptomoedas não são controladas por governos ou instituições financeiras.',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      style: 'h2',
      _key: 'heading-1',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'heading-1-span',
          text: 'O Que é Blockchain?',
          marks: []
        }
      ]
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'paragraph-1',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'paragraph-1-span',
          text: 'Blockchain é a tecnologia que permite o funcionamento das criptomoedas. Trata-se de um livro-razão distribuído que registra todas as transações de forma transparente e imutável.',
          marks: []
        }
      ]
    }
  ]
}

async function criarPostagem() {
  try {
    console.log('Criando nova postagem...')
    const resultado = await client.create(novaPostagem)
    
    console.log('\n=== Postagem Criada com Sucesso ===\n')
    console.log(`ID: ${resultado._id}`)
    console.log(`Título: ${resultado.title}`)
    console.log(`Slug: ${resultado.slug.current}`)
    console.log(`Autor ID: ${resultado.author._ref}`)
    console.log(`Criado em: ${new Date(resultado._createdAt).toLocaleString('pt-BR')}`)
    
    console.log('\nVerifique a postagem no Sanity Studio')
  } catch (error) {
    console.error('Erro ao criar postagem:', error)
  }
}

// Executar a função
criarPostagem() 