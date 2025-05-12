require('dotenv').config();
const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('front-matter');

// Importar a função buildIndexName para garantir consistência com o componente de busca
const { buildIndexName } = require('../src/utils/indexer/consts');

// Log das variáveis de ambiente
console.log('Variáveis de ambiente:');
console.log('NEXT_PUBLIC_ALGOLIA_APP_ID:', process.env.NEXT_PUBLIC_ALGOLIA_APP_ID);
console.log('ALGOLIA_ADMIN_API_KEY:', process.env.ALGOLIA_ADMIN_API_KEY);

// Inicializar cliente Algolia
const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

// Usar a função buildIndexName que agora sempre retorna "development_mcpx_content"
const indexName = buildIndexName();
console.log(`🔍 Usando índice Algolia: ${indexName}`);
const index = client.initIndex(indexName);

// Diretório base para conteúdo
const CONTENT_BASE_DIR = 'content/pages';
// Diretório específico para artigos MCPX conforme regra 06
const MCPX_DIR = 'mcpx';

const MAX_CONTENT_LENGTH = 5000; // Limite seguro para o conteúdo

function truncateContent(content) {
  if (content.length > MAX_CONTENT_LENGTH) {
    return content.substring(0, MAX_CONTENT_LENGTH) + '...';
  }
  return content;
}

async function indexarConteudo() {
  try {
    // Configurar os atributos conforme especificado na regra 06-algolia
    await index.setSettings({
      // Atributos pesquisáveis conforme regra 06
      searchableAttributes: [
        'title',
        'content',
        'excerpt',
        'categories'
      ],
      // Atributos para faceting conforme regra 06
      attributesForFaceting: [
        'categories'
      ],
      // Ordenação personalizada conforme regra 06
      customRanking: [
        'desc(date)'
      ]
    });

    const objects = [];
    const baseDirPath = path.join(process.cwd(), CONTENT_BASE_DIR);
    const mcpxDirPath = path.join(baseDirPath, MCPX_DIR);

    if (!fs.existsSync(mcpxDirPath)) {
      console.log(`❌ Diretório MCPX ${MCPX_DIR} não encontrado em ${CONTENT_BASE_DIR}`);
      return;
    }

    console.log(`📁 Indexando artigos do diretório: ${MCPX_DIR}`);

    // Processar apenas os arquivos da pasta mcpx conforme regra 06
    const files = fs.readdirSync(mcpxDirPath);

    files.forEach(file => {
      // Ignorar arquivos index.md
      if (file === 'index.md') {
        return;
      }

      const filePath = path.join(mcpxDirPath, file);
      const stat = fs.statSync(filePath);

      if (!stat.isDirectory() && file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { attributes, body } = matter(content);
        
        // Gerar slug e permalink
        const slug = attributes.slug || path.basename(file, '.md');
        
        // Usar o caminho sem o prefixo /content/ para mcpx
        const permalink = `/${MCPX_DIR}/${slug}`;

        // Criar objeto para indexação
        const object = {
          objectID: `${MCPX_DIR}_${slug}`,
          title: attributes.title || '',
          content: truncateContent(body),
          excerpt: attributes.excerpt || body.substring(0, 160) + '...',
          date: attributes.date ? new Date(attributes.date).getTime() : null,
          categories: attributes.categories || [],
          permalink: permalink, // URL sem o prefixo /content/
          fullPath: permalink, // Caminho completo atualizado
          featuredImage: attributes.featuredImage?.url || attributes.media?.url || null,
          author: attributes.author || null,
          timeToRead: Math.ceil(body.split(/\s+/).length / 200)
        };

        objects.push(object);
      }
      // Verificar e processar diretórios (subpastas dentro de mcpx)
      else if (stat.isDirectory()) {
        const subdir = file;
        const subdirPath = path.join(mcpxDirPath, subdir);
        const subdirFiles = fs.readdirSync(subdirPath);
        
        console.log(`📁 Processando subdiretório: ${subdir}`);
        
        subdirFiles.forEach(subdirFile => {
          if (subdirFile === 'index.md') return;
          
          const subdirFilePath = path.join(subdirPath, subdirFile);
          if (fs.statSync(subdirFilePath).isFile() && subdirFile.endsWith('.md')) {
            const content = fs.readFileSync(subdirFilePath, 'utf-8');
            const { attributes, body } = matter(content);
            
            // Gerar slug e permalink para arquivos em subdiretórios
            const slug = attributes.slug || path.basename(subdirFile, '.md');
            
            // Usar o caminho sem o prefixo /content/ para mcpx
            const permalink = `/${MCPX_DIR}/${subdir}/${slug}`;
            
            const object = {
              objectID: `${MCPX_DIR}_${subdir}_${slug}`,
              title: attributes.title || '',
              content: truncateContent(body),
              excerpt: attributes.excerpt || body.substring(0, 160) + '...',
              date: attributes.date ? new Date(attributes.date).getTime() : null,
              categories: attributes.categories || [],
              permalink: permalink,
              fullPath: permalink,
              subdirectory: subdir,
              featuredImage: attributes.featuredImage?.url || attributes.media?.url || null,
              author: attributes.author || null,
              timeToRead: Math.ceil(body.split(/\s+/).length / 200)
            };
            
            objects.push(object);
          }
        });
      }
    });

    // Indexar os objetos no Algolia
    if (objects.length > 0) {
      const { objectIDs } = await index.saveObjects(objects);
      console.log(`✅ Indexados ${objectIDs.length} documentos no Algolia`);
      console.log('📄 Documentos indexados:');
      objects.forEach(obj => {
        console.log(`- ${obj.title}`);
        console.log(`  URL: ${obj.permalink}`);
        console.log(`  Categorias: ${obj.categories.join(', ')}`);
        console.log('---');
      });
    } else {
      console.log('⚠️ Nenhum conteúdo encontrado para indexar');
    }

  } catch (error) {
    console.error('❌ Erro ao indexar conteúdo:', error);
    console.error('Detalhes do erro:', error.message);
  }
}

// Executar a indexação
indexarConteudo(); 