require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');
const { v4: uuidv4 } = require('uuid');
const matter = require('gray-matter');

// Diretório dos posts traduzidos
const POSTS_DIR = path.join(__dirname, '..', 'posts_traduzidos');
// Diretório para mover os posts após publicação
const POSTS_PUBLICADOS_DIR = path.join(__dirname, '..', 'posts_publicados');

// Verificar e criar diretório de posts publicados se não existir
if (!fs.existsSync(POSTS_PUBLICADOS_DIR)) {
  fs.mkdirSync(POSTS_PUBLICADOS_DIR, { recursive: true });
  console.log(`Diretório criado: ${POSTS_PUBLICADOS_DIR}`);
}

// Configuração do cliente Sanity
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_DEV_TOKEN // Necessário token com permissão de escrita
});

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

// Função para formatar o conteúdo Markdown em blocos Portable Text
function formatarMarkdownEmBlocos(conteudo) {
  const paragrafos = conteudo.split('\n\n');
  const blocos = [];

  for (const paragrafo of paragrafos) {
    if (!paragrafo.trim()) continue;
    
    // Verificar se é um cabeçalho
    if (paragrafo.trim().startsWith('# ')) {
      const texto = paragrafo.trim().replace(/^# /, '');
      blocos.push({
        _type: 'block',
        _key: uuidv4().replace(/-/g, ''),
        style: 'h1',
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
    } else if (paragrafo.trim().startsWith('## ')) {
      const texto = paragrafo.trim().replace(/^## /, '');
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
    } else if (paragrafo.trim().startsWith('![')) {
      // Tentar extrair a imagem (formato: ![alt](url))
      const match = paragrafo.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, alt, url] = match;
        blocos.push({
          _type: 'image',
          _key: uuidv4().replace(/-/g, ''),
          asset: {
            _type: 'reference',
            _ref: url // Idealmente, a imagem deveria ser carregada no Sanity primeiro
          },
          alt: alt || 'Imagem'
        });
      }
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

// Função para publicar um post no Sanity
async function publicarPost(arquivoMarkdown) {
  console.log(`\nProcessando arquivo: ${arquivoMarkdown}`);
  
  try {
    // Ler conteúdo do arquivo
    const conteudoArquivo = fs.readFileSync(
      path.join(POSTS_DIR, arquivoMarkdown), 
      'utf8'
    );
    
    // Analisar o front matter
    const { data, content } = matter(conteudoArquivo);
    
    // Verificar se temos um título
    if (!data.title) {
      console.error('❌ Erro: Arquivo sem título no front matter');
      return false;
    }
    
    // Criar slug
    const slug = criarSlug(data.title);
    
    // Extrair tags
    const tags = data.tags ? 
      (typeof data.tags === 'string' ? 
        data.tags.split(',').map(tag => tag.trim()) : 
        data.tags) : 
      [];
    
    // Formatar conteúdo em blocos
    const blocos = formatarMarkdownEmBlocos(content);
    
    // Gerar ID único para o post
    const docId = `post-${new Date().toISOString().replace(/[-:.TZ]/g, '')}`;
    
    // Preparar o documento para o Sanity
    const documento = {
      _type: 'post',
      _id: docId,
      title: data.title,
      slug: {
        _type: 'slug',
        current: slug
      },
      excerpt: content.split('\n\n')[0].trim(),
      content: blocos,
      publishedAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
    };
    
    // Criar o post no Sanity
    console.log(`Enviando post para o Sanity: "${data.title}"`);
    const resultado = await sanityClient.create(documento);
    
    console.log(`✅ Post criado com sucesso no Sanity!`);
    console.log(`ID: ${resultado._id}`);
    console.log(`Slug: ${slug}`);
    
    // Mover o arquivo para a pasta de posts publicados
    const arquivoOrigem = path.join(POSTS_DIR, arquivoMarkdown);
    const arquivoDestino = path.join(POSTS_PUBLICADOS_DIR, arquivoMarkdown);
    
    fs.renameSync(arquivoOrigem, arquivoDestino);
    console.log(`✅ Arquivo movido para: ${arquivoDestino}`);
    
    return {
      id: resultado._id,
      title: data.title,
      slug: slug,
      date: new Date().getTime()
    };
  } catch (erro) {
    console.error(`❌ Erro ao publicar post "${arquivoMarkdown}" no Sanity:`, erro);
    return false;
  }
}

// Função principal para processar todos os arquivos
async function processarTodosArquivos() {
  try {
    // Listar todos os arquivos .json na pasta
    const arquivos = fs.readdirSync(POSTS_DIR)
      .filter(arquivo => arquivo.endsWith('.json'))
      .sort(); // Ordenar por nome (geralmente relacionado à data de criação)
    
    if (arquivos.length === 0) {
      console.log('Nenhum arquivo markdown encontrado para publicar.');
      return [];
    }
    
    console.log(`Encontrados ${arquivos.length} arquivos markdown para processar.`);
    
    const resultados = [];
    const falhas = [];
    
    // Processar cada arquivo
    for (const arquivo of arquivos) {
      const resultado = await publicarPost(arquivo);
      if (resultado) {
        resultados.push(resultado);
      } else {
        falhas.push(arquivo);
      }
    }
    
    // Resumo
    console.log('\n=== RESUMO ===');
    console.log(`Total de arquivos: ${arquivos.length}`);
    console.log(`Posts publicados com sucesso: ${resultados.length}`);
    console.log(`Falhas: ${falhas.length}`);
    
    if (falhas.length > 0) {
      console.log('Arquivos com falha:');
      falhas.forEach(arquivo => console.log(`- ${arquivo}`));
    }
    
    return resultados;
  } catch (erro) {
    console.error('❌ Erro ao processar arquivos:', erro);
    return [];
  }
}

// Executar o processamento
(async () => {
  console.log('Iniciando publicação de posts markdown no Sanity...');
  const postsPublicados = await processarTodosArquivos();
  
  if (postsPublicados.length > 0) {
    console.log('\nPosts publicados no Sanity:');
    postsPublicados.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}" (ID: ${post.id})`);
    });
    
    // Indexar no Algolia
    console.log('\nPara indexar estes posts no Algolia, execute:');
    console.log('node scripts/indexar-sanity-para-algolia.js');
  }
  
  console.log('\nProcessamento concluído!');
})();

 