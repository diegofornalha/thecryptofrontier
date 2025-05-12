// Importar configuração do Sanity
const sanityConfig = require('./sanity.config');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@sanity/client');

// Diretórios de trabalho
const POSTS_TRADUZIDOS_DIR = path.join(__dirname, 'posts_traduzidos');
const POSTS_PUBLICADOS_DIR = path.join(__dirname, 'posts_publicados');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Imprimir cabeçalho
console.log(`${colors.magenta}${colors.bold}===========================================${colors.reset}`);
console.log(`${colors.magenta}${colors.bold}    PUBLICAÇÃO DE POSTS NO SANITY CMS     ${colors.reset}`);
console.log(`${colors.magenta}${colors.bold}===========================================${colors.reset}\n`);

// Verificar e criar diretórios necessários
if (!fs.existsSync(POSTS_PUBLICADOS_DIR)) {
  fs.mkdirSync(POSTS_PUBLICADOS_DIR, { recursive: true });
  console.log(`${colors.green}✓ Diretório de posts publicados criado${colors.reset}`);
}

// Mostrar informações da configuração
console.log(`${colors.blue}[INFO] Configuração do Sanity:${colors.reset}`);
console.log(`${colors.blue}  - Project ID: ${sanityConfig.projectId}${colors.reset}`);
console.log(`${colors.blue}  - Dataset: ${sanityConfig.dataset}${colors.reset}`);
console.log(`${colors.blue}  - API Version: ${sanityConfig.apiVersion}${colors.reset}`);

// Configuração do cliente Sanity
const sanityClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: false,
  token: sanityConfig.token
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

// Processa conteúdo HTML para formato Portable Text do Sanity
function processarConteudoHtml(htmlContent) {
  // Esta é uma versão simplificada que trata o HTML como um único bloco
  // Em um ambiente de produção, você deveria usar um parser HTML adequado
  const blocks = [];
  
  // Criar um bloco de texto para o conteúdo HTML
  blocks.push({
    _type: 'block',
    _key: uuidv4().replace(/-/g, ''),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: uuidv4().replace(/-/g, ''),
        text: htmlContent,
        marks: []
      }
    ],
    markDefs: []
  });
  
  return blocks;
}

// Função para publicar um post no Sanity
async function publicarPost(arquivoMarkdown) {
  console.log(`\n${colors.blue}[INFO] Processando: ${arquivoMarkdown}${colors.reset}`);
  
  try {
    const caminhoArquivo = path.join(POSTS_TRADUZIDOS_DIR, arquivoMarkdown);
    
    // Ler conteúdo do arquivo
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // Analisar o front matter
    const { data, content } = matter(conteudoArquivo);
    
    // Verificar título
    if (!data.title) {
      console.error(`${colors.red}✗ Erro: Arquivo sem título no front matter${colors.reset}`);
      return false;
    }
    
    // Criar slug para o post
    const slug = criarSlug(data.title);
    
    // Extrair categorias (anteriormente tags)
    const categorias = Array.isArray(data.tags) ? data.tags : (
      typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()) : []
    );
    
    // Criar um resumo a partir do conteúdo
    let resumo = '';
    try {
      // Tenta extrair o primeiro parágrafo sem tags HTML
      const textoSemHTML = content.replace(/<\/?[^>]+(>|$)/g, " ");
      resumo = textoSemHTML.substring(0, 200).trim() + '...';
    } catch (e) {
      resumo = `${data.title} - Artigo sobre criptomoedas`;
    }
    
    // Gerar ID único
    const docId = `post-${uuidv4().replace(/-/g, '')}`;
    
    // Preparar documento para Sanity de acordo com o schema
    const documento = {
      _type: 'post',
      _id: docId,
      title: data.title,
      slug: {
        _type: 'slug',
        current: slug
      },
      publishedAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      excerpt: resumo,
      content: content  // Campo correto para o conteúdo
    };
    
    // Adicionar tags como array de strings simples
    if (categorias && categorias.length > 0) {
      documento.tags = categorias;
    }
    
    // Tentar adicionar referência para imagem principal se disponível
    if (data.image) {
      documento.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: data.image
        }
      };
    }
    
    // Criar o post no Sanity
    console.log(`${colors.blue}[INFO] Enviando para o Sanity: "${data.title}"${colors.reset}`);
    
    try {
      // Verificar se já existe um post com este slug
      const postsExistentes = await sanityClient.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        { slug }
      );
      
      let resultado;
      
      if (postsExistentes) {
        console.log(`${colors.yellow}⚠ Post com slug "${slug}" já existe. Atualizando...${colors.reset}`);
        resultado = await sanityClient.patch(postsExistentes._id)
          .set(documento)
          .commit();
      } else {
        resultado = await sanityClient.create(documento);
      }
      
      console.log(`${colors.green}✓ Post publicado com sucesso no Sanity!${colors.reset}`);
      console.log(`${colors.green}  ID: ${resultado._id}${colors.reset}`);
      console.log(`${colors.green}  Slug: ${slug}${colors.reset}`);
      
      // Mover o arquivo para pasta de publicados
      const arquivoDestino = path.join(POSTS_PUBLICADOS_DIR, 
        arquivoMarkdown.replace('traduzido_', 'publicado_'));
      
      fs.renameSync(caminhoArquivo, arquivoDestino);
      console.log(`${colors.green}✓ Arquivo movido para: ${path.basename(arquivoDestino)}${colors.reset}`);
      
      return {
        id: resultado._id,
        title: data.title,
        slug: slug
      };
    } catch (erroSanity) {
      console.error(`${colors.red}✗ Erro de comunicação com Sanity: ${erroSanity.message}${colors.reset}`);
      return false;
    }
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao processar arquivo: ${erro.message}${colors.reset}`);
    return false;
  }
}

// Função principal para processar todos os arquivos
async function processarTodosArquivos() {
  try {
    // Verificar se diretório existe
    if (!fs.existsSync(POSTS_TRADUZIDOS_DIR)) {
      console.log(`${colors.yellow}⚠ Diretório de posts traduzidos não encontrado: ${POSTS_TRADUZIDOS_DIR}${colors.reset}`);
      return [];
    }
    
    // Listar arquivos markdown na pasta de traduzidos
    const arquivos = fs.readdirSync(POSTS_TRADUZIDOS_DIR)
      .filter(arquivo => arquivo.endsWith('.md'))
      .sort((a, b) => a.localeCompare(b));
    
    if (arquivos.length === 0) {
      console.log(`${colors.yellow}⚠ Nenhum arquivo encontrado para publicar em: ${POSTS_TRADUZIDOS_DIR}${colors.reset}`);
      return [];
    }
    
    console.log(`${colors.blue}[INFO] Encontrados ${arquivos.length} arquivos para processar${colors.reset}`);
    
    const sucessos = [];
    const falhas = [];
    
    // Processar cada arquivo
    for (const arquivo of arquivos) {
      const resultado = await publicarPost(arquivo);
      if (resultado) {
        sucessos.push(resultado);
      } else {
        falhas.push(arquivo);
      }
    }
    
    // Resumo
    console.log(`\n${colors.magenta}${colors.bold}=== RESUMO ===${colors.reset}`);
    console.log(`${colors.blue}Total de arquivos: ${arquivos.length}${colors.reset}`);
    console.log(`${colors.green}Posts publicados: ${sucessos.length}${colors.reset}`);
    
    if (falhas.length > 0) {
      console.log(`${colors.red}Falhas: ${falhas.length}${colors.reset}`);
      console.log(`${colors.red}Arquivos com erro:${colors.reset}`);
      falhas.forEach(arquivo => {
        console.log(`${colors.red}  - ${arquivo}${colors.reset}`);
      });
    } else {
      console.log(`${colors.green}Nenhuma falha! Todos os arquivos foram processados.${colors.reset}`);
    }
    
    return sucessos;
  } catch (erro) {
    console.error(`${colors.red}✗ Erro geral: ${erro.message}${colors.reset}`);
    return [];
  }
}

// Executar
(async () => {
  console.log(`${colors.blue}[INFO] Iniciando publicação de posts no Sanity...${colors.reset}`);
  
  try {
    const resultados = await processarTodosArquivos();
    
    if (resultados.length > 0) {
      console.log(`\n${colors.green}${colors.bold}Posts publicados com sucesso:${colors.reset}`);
      resultados.forEach((post, index) => {
        console.log(`${colors.green}${index + 1}. "${post.title}" (ID: ${post.id})${colors.reset}`);
      });
    }
    console.log(`\n${colors.magenta}${colors.bold}Processo concluído!${colors.reset}`);
  } catch (erro) {
    console.error(`${colors.red}✗ Erro fatal: ${erro.message}${colors.reset}`);
    process.exit(1);
  }
})(); 