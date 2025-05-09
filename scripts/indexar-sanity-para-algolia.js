// Script para indexar conteúdo do Sanity para o Algolia
require('dotenv').config();
const { createClient } = require('@sanity/client');
const algoliasearch = require('algoliasearch');

// Cliente Sanity
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN
});

// Cliente Algolia
const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

// Índice do Algolia
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'development_mcpx_content';
const index = algoliaClient.initIndex(indexName);

// Função para truncar conteúdo muito longo
function truncateContent(content, maxLength = 5000) {
  if (content && content.length > maxLength) {
    return content.substring(0, maxLength) + '...';
  }
  return content;
}

// Função para extrair texto do conteúdo do portableText
function extractTextFromPortableText(blocks) {
  if (!Array.isArray(blocks)) return '';
  
  let text = '';
  
  blocks.forEach(block => {
    if (block._type === 'block' && Array.isArray(block.children)) {
      block.children.forEach(child => {
        if (child._type === 'span' && typeof child.text === 'string') {
          text += child.text + ' ';
        }
      });
      text += '\n';
    }
  });
  
  return text;
}

// Consulta GROQ para buscar todos os posts com seus autores
const query = `*[_type == "post"] {
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  excerpt,
  publishedAt,
  categories,
  isFeatured,
  content,
  "author": author->{
    _id,
    name,
    slug,
    role
  },
  "featuredImageUrl": featuredImage.asset->url
}`;

async function indexarSanityParaAlgolia() {
  try {
    console.log('🔄 Iniciando indexação de posts do Sanity para o Algolia...');
    
    // Configurar os settings do índice
    await index.setSettings({
      searchableAttributes: [
        'title',
        'content',
        'excerpt',
        'categories',
        'authorName'
      ],
      attributesForFaceting: [
        'categories',
        'authorName'
      ],
      customRanking: [
        'desc(date)',
        'desc(isFeatured)'
      ]
    });
    
    console.log('✅ Configurações do índice atualizadas');
    
    // Buscar todos os posts do Sanity
    const posts = await sanityClient.fetch(query);
    
    if (!posts || posts.length === 0) {
      console.log('⚠️ Nenhum post encontrado no Sanity');
      return;
    }
    
    console.log(`📄 Encontrados ${posts.length} posts para indexar`);
    
    // Preparar objetos para indexação no Algolia
    const objectsToIndex = posts.map(post => {
      // Extrair texto do conteúdo
      const textContent = extractTextFromPortableText(post.content);
      
      // Calcular tempo de leitura (baseado em 200 palavras por minuto)
      const wordCount = textContent.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      
      return {
        objectID: post._id,
        title: post.title || '',
        content: truncateContent(textContent),
        excerpt: post.excerpt || truncateContent(textContent, 160),
        date: post.publishedAt ? new Date(post.publishedAt).getTime() : null,
        categories: post.categories || [],
        permalink: post.slug ? `/post/${post.slug.current}/` : '/',
        fullPath: post.slug ? `/post/${post.slug.current}/` : '/',
        featuredImage: post.featuredImageUrl || null,
        authorName: post.author ? post.author.name : 'Desconhecido',
        authorRole: post.author ? post.author.role : null,
        timeToRead: readingTime,
        isFeatured: post.isFeatured || false,
        _createdAt: post._createdAt,
        _updatedAt: post._updatedAt,
        _type: 'post'
      };
    });
    
    // Indexar no Algolia
    if (objectsToIndex.length > 0) {
      const { objectIDs } = await index.saveObjects(objectsToIndex);
      console.log(`✅ Indexados ${objectIDs.length} posts no Algolia`);
      
      // Listar os primeiros 5 posts indexados
      console.log('\n📄 Primeiros posts indexados:');
      objectsToIndex.slice(0, 5).forEach((obj, i) => {
        console.log(`${i + 1}. ${obj.title}`);
        console.log(`   URL: ${obj.permalink}`);
        console.log(`   Autor: ${obj.authorName}`);
        console.log(`   Categorias: ${obj.categories.join(', ') || 'Nenhuma'}`);
        console.log(`   Tempo de leitura: ${obj.timeToRead} min`);
        console.log('---');
      });
      
      if (objectsToIndex.length > 5) {
        console.log(`... e mais ${objectsToIndex.length - 5} posts indexados`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao indexar posts do Sanity para o Algolia:', error);
    console.error('Detalhes do erro:', error.message);
  }
}

// Executar a indexação
indexarSanityParaAlgolia(); 