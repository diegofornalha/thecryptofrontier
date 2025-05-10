require('dotenv').config();
const { createClient } = require('@sanity/client');
const algoliasearch = require('algoliasearch');
const { v4: uuidv4 } = require('uuid');
const { buildIndexName } = require('../src/utils/indexer/consts');

// Configuração do cliente Sanity
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN // Necessário token com permissão de escrita
});

// Inicializar cliente Algolia
const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

// Usar a função buildIndexName para consistência com o componente de busca
const indexName = buildIndexName();
console.log(`🔍 Usando índice Algolia: ${indexName}`);
const index = algoliaClient.initIndex(indexName);

// Configurações do post (altere estas informações para cada novo post)
const POST = {
  title: "Exemplo de Post Publicado via Script",
  metaTitle: "Exemplo de Post com SEO Otimizado | The Crypto Frontier",
  metaDescription: "Este é um exemplo de post publicado via script JavaScript com SEO otimizado e automaticamente indexado no Algolia.",
  categories: ["Blockchain", "Tutorial"],
  tags: ["javascript", "sanity", "algolia", "indexação"],
  content: `
Este é um exemplo de post que demonstra como publicar conteúdo no Sanity CMS
e indexá-lo automaticamente no Algolia para busca.

## Como funciona

1. O post é criado no Sanity CMS
2. O conteúdo é formatado e estruturado
3. O post é publicado no Sanity
4. As informações relevantes são enviadas para o Algolia
5. O conteúdo fica disponível para busca instantaneamente

Este fluxo simplifica o processo de publicação e garante que o conteúdo
esteja sempre sincronizado entre o CMS e o sistema de busca.
`
};

// Função para criar um slug a partir do título
function criarSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/--+/g, '-') // Remove hífens duplicados
    .substring(0, 80); // Limita o tamanho
}

// Função para formatar o conteúdo em blocos Portable Text
function formatarConteudoEmBlocos(conteudo) {
  const paragrafos = conteudo.trim().split('\n\n');
  const blocos = [];

  for (const paragrafo of paragrafos) {
    if (!paragrafo.trim()) continue;
    
    // Verificar se é um cabeçalho
    if (paragrafo.trim().startsWith('##')) {
      const texto = paragrafo.trim().replace(/^##\s+/, '');
      blocos.push({
        _type: 'block',
        _key: uuidv4().replace(/-/g, ''),
        style: 'h2',
        children: [
          {
            _type: 'span',
            _key: uuidv4().replace(/-/g, ''),
            text: texto,
            marks: []
          }
        ],
        markDefs: []
      });
    } else {
      blocos.push({
        _type: 'block',
        _key: uuidv4().replace(/-/g, ''),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: uuidv4().replace(/-/g, ''),
            text: paragrafo.trim(),
            marks: []
          }
        ],
        markDefs: []
      });
    }
  }

  return blocos;
}

// Função para publicar post no Sanity
async function publicarPost() {
  console.log(`Preparando para publicar post: ${POST.title}`);
  
  try {
    // Criar slug
    const slug = criarSlug(POST.title);
    
    // Formatar conteúdo em blocos
    const blocos = formatarConteudoEmBlocos(POST.content);
    
    // Gerar ID único para o post
    const docId = `post-${new Date().toISOString().replace(/[-:.TZ]/g, '')}`;
    
    // Preparar o documento para o Sanity
    const documento = {
      _type: 'post',
      _id: docId,
      title: POST.title,
      slug: {
        _type: 'slug',
        current: slug
      },
      excerpt: POST.content.split('\n\n')[0].trim(),
      content: blocos,
      publishedAt: new Date().toISOString(),
      categories: POST.categories,
      isFeatured: true,
      isDraft: false,
      seo: {
        _type: 'seo',
        metaTitle: POST.metaTitle,
        metaDescription: POST.metaDescription
      }
    };
    
    // Se tivermos o ID do autor nas variáveis de ambiente
    if (process.env.SANITY_AUTHOR_ID) {
      documento.author = {
        _type: 'reference',
        _ref: process.env.SANITY_AUTHOR_ID
      };
    } else {
      // ID do autor Alexandre Bianchi
      documento.author = {
        _type: 'reference',
        _ref: 'ca38a3d5-cba1-47a0-aa29-4af17a15e17c'
      };
    }
    
    // Criar o post no Sanity
    console.log('Enviando post para o Sanity...');
    const resultado = await sanityClient.create(documento);
    
    console.log(`✅ Post criado com sucesso no Sanity!`);
    console.log(`ID: ${resultado._id}`);
    console.log(`Slug: ${slug}`);
    
    return {
      id: resultado._id,
      title: POST.title,
      slug: slug,
      categories: POST.categories,
      tags: POST.tags,
      excerpt: POST.content.split('\n\n')[0].trim(),
      content: POST.content,
      date: new Date().getTime()
    };
  } catch (erro) {
    console.error('❌ Erro ao publicar post no Sanity:', erro);
    throw erro;
  }
}

// Função para indexar o post no Algolia
async function indexarNoAlgolia(post) {
  console.log(`Preparando para indexar post no Algolia: ${post.title}`);
  
  try {
    // Configurar os atributos do índice
    await index.setSettings({
      searchableAttributes: [
        'title',
        'content',
        'excerpt',
        'categories',
        'tags'
      ],
      attributesForFaceting: [
        'categories',
        'tags'
      ],
      customRanking: [
        'desc(date)'
      ]
    });
    
    // Preparar o objeto para indexação
    const objeto = {
      objectID: post.id,
      title: post.title,
      content: post.content.length > 5000 ? post.content.substring(0, 5000) + '...' : post.content,
      excerpt: post.excerpt,
      categories: post.categories,
      tags: post.tags,
      date: post.date,
      permalink: `/post/${post.slug}`,
      fullPath: `/post/${post.slug}`,
      timeToRead: Math.ceil(post.content.split(/\s+/).length / 200)
    };
    
    // Indexar no Algolia
    console.log('Enviando post para indexação no Algolia...');
    await index.saveObject(objeto);
    
    console.log(`✅ Post indexado com sucesso no Algolia!`);
    console.log(`URL: ${objeto.permalink}`);
    
    return true;
  } catch (erro) {
    console.error('❌ Erro ao indexar post no Algolia:', erro);
    throw erro;
  }
}

// Função principal que executa todo o processo
async function publicarEIndexar() {
  console.log('=== Publicação e Indexação de Post ===\n');
  
  try {
    // Passo 1: Publicar no Sanity
    console.log('Etapa 1: Publicação no Sanity CMS');
    const post = await publicarPost();
    
    // Passo 2: Indexar no Algolia
    console.log('\nEtapa 2: Indexação no Algolia');
    await indexarNoAlgolia(post);
    
    console.log('\n✅ Processo completo! Post publicado e indexado com sucesso.');
  } catch (erro) {
    console.error('\n❌ Erro durante o processo:', erro.message);
  }
}

// Executar o processo completo
publicarEIndexar(); 