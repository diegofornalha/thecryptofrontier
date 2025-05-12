// Importar bibliotecas necessárias
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { createClient } = require('@sanity/client');
const colors = require('./utils/colors');
const slugify = require('./utils/slugify');

// Diretórios de trabalho
const DIR_POSTS_TRADUZIDOS = './posts_traduzidos';
const DIR_POSTS_PUBLICADOS = './posts_publicados';

// Categorias padrão para criptomoedas
const CATEGORIAS_CRIPTO = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum', 
  altcoins: 'Altcoins',
  defi: 'DeFi',
  nft: 'NFTs',
  metaverso: 'Metaverso',
  regulacao: 'Regulação',
  blockchain: 'Blockchain',
  mercado: 'Mercado',
  tecnologia: 'Tecnologia'
};

// Inicialização
console.log(`${colors.magenta}${colors.bold}    PUBLICAÇÃO DE POSTS NO SANITY CMS     ${colors.reset}`);
console.log(`${colors.blue}---------------------------------------------${colors.reset}`);

// Verificar diretórios
if (!fs.existsSync(DIR_POSTS_PUBLICADOS)) {
  fs.mkdirSync(DIR_POSTS_PUBLICADOS, { recursive: true });
  console.log(`${colors.yellow}[AVISO] Diretório '${DIR_POSTS_PUBLICADOS}' não existia e foi criado.${colors.reset}`);
}

// Configuração direta do cliente Sanity
const config = {
  projectId: 'brby2yrg',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: 'sk0MzzutKkZoELcQnRSwhz7hqSMXlwMuQCwna9Mp90nqUU1OLb0WdouiGhXa1xWdWcNPFlLoCkrxCuq8xNVeDzJPKQOtlh22xjLsNduo7WIR138cCAiZe40cwque00dbHAx0ylF0ntLM5GinO8GKX69aF5JZw7Q5Bpq1GPGRihGhbM0cNGAm',
  useCdn: false
};

console.log(`${colors.blue}[INFO] Configuração do Sanity:${colors.reset}`);
console.log(`${colors.blue}  - Project ID: ${config.projectId}${colors.reset}`);
console.log(`${colors.blue}  - Dataset: ${config.dataset}${colors.reset}`);
console.log(`${colors.blue}  - API Version: ${config.apiVersion}${colors.reset}`);

// Configuração do cliente Sanity
const sanityClient = createClient(config);

// Converte HTML para Portable Text do Sanity
function htmlToPortableText(html) {
  return [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: html
        }
      ]
    }
  ];
}

// Extrai tags relevantes do conteúdo do post
function extrairTags(conteudo, titulo) {
  const tagsComuns = [
    'bitcoin', 'ethereum', 'criptomoedas', 'blockchain', 'defi', 
    'nft', 'altcoins', 'investimentos', 'regulação', 'mercado'
  ];
  
  const palavrasChave = new Set();
  
  // Adiciona palavras do título
  titulo.toLowerCase().split(/\s+/).forEach(palavra => {
    if (palavra.length > 3 && tagsComuns.includes(palavra)) {
      palavrasChave.add(palavra);
    }
  });
  
  // Procura tags no conteúdo
  tagsComuns.forEach(tag => {
    if (conteudo.toLowerCase().includes(tag)) {
      palavrasChave.add(tag);
    }
  });
  
  return Array.from(palavrasChave);
}

// Determina a categoria principal com base no conteúdo
async function determinarCategoria(conteudo, titulo) {
  const conteudoCompleto = (titulo + ' ' + conteudo).toLowerCase();
  let categoriaPrincipal = 'mercado'; // Padrão
  
  const PALAVRAS_CHAVE = {
    bitcoin: ['bitcoin', 'btc', 'satoshi'],
    ethereum: ['ethereum', 'eth', 'vitalik', 'buterin', 'ether'],
    defi: ['defi', 'finanças descentralizadas', 'yield farming', 'staking', 'empréstimo crypto'],
    nft: ['nft', 'token não fungível', 'colecionáveis digitais', 'arte digital'],
    regulacao: ['regulação', 'regulamentação', 'sec', 'cvm', 'banco central', 'legislação'],
    blockchain: ['blockchain', 'consenso', 'descentralização', 'smart contract'],
    altcoins: ['altcoin', 'cardano', 'solana', 'polkadot', 'dogecoin', 'shiba'],
    metaverso: ['metaverso', 'realidade virtual', 'sandbox', 'descentraland', 'mundos virtuais'],
    tecnologia: ['tecnologia', 'desenvolvimento', 'atualização', 'fork', 'protocolo']
  };
  
  // Pontuação para cada categoria
  const pontuacao = {};
  Object.keys(PALAVRAS_CHAVE).forEach(categoria => {
    pontuacao[categoria] = 0;
    PALAVRAS_CHAVE[categoria].forEach(palavraChave => {
      const regex = new RegExp(palavraChave, 'gi');
      const ocorrencias = (conteudoCompleto.match(regex) || []).length;
      pontuacao[categoria] += ocorrencias;
    });
  });
  
  // Encontra a categoria com maior pontuação
  let maiorPontuacao = 0;
  Object.keys(pontuacao).forEach(categoria => {
    if (pontuacao[categoria] > maiorPontuacao) {
      maiorPontuacao = pontuacao[categoria];
      categoriaPrincipal = categoria;
    }
  });
  
  // Busca o ID da categoria no Sanity
  try {
    const nomeCategoria = CATEGORIAS_CRIPTO[categoriaPrincipal];
    let categoria = await sanityClient.fetch(
      `*[_type == "category" && title == $title][0]`,
      { title: nomeCategoria }
    );
    
    // Se a categoria não existir, cria-a
    if (!categoria) {
      categoria = await sanityClient.create({
        _type: 'category',
        title: nomeCategoria,
        slug: {
          _type: 'slug',
          current: slugify(nomeCategoria)
        }
      });
      console.log(`${colors.green}✓ Categoria '${nomeCategoria}' criada no Sanity${colors.reset}`);
    }
    
    return categoria._id;
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao buscar/criar categoria: ${erro.message}${colors.reset}`);
    return null;
  }
}

// Criar ou obter IDs para tags
async function processarTags(tags) {
  const tagsIds = [];
  
  for (const tagNome of tags) {
    try {
      let tag = await sanityClient.fetch(
        `*[_type == "tag" && title == $title][0]`,
        { title: tagNome }
      );
      
      if (!tag) {
        tag = await sanityClient.create({
          _type: 'tag',
          title: tagNome,
          slug: {
            _type: 'slug',
            current: slugify(tagNome)
          }
        });
        console.log(`${colors.green}✓ Tag '${tagNome}' criada no Sanity${colors.reset}`);
      }
      
      tagsIds.push({
        _type: 'reference',
        _ref: tag._id
      });
    } catch (erro) {
      console.error(`${colors.red}✗ Erro ao processar tag '${tagNome}': ${erro.message}${colors.reset}`);
    }
  }
  
  return tagsIds;
}

// Obter ou criar um autor padrão
async function obterAutorPadrao() {
  try {
    let autor = await sanityClient.fetch(
      `*[_type == "author" && name == $name][0]`,
      { name: "The Crypto Frontier" }
    );
    
    if (!autor) {
      autor = await sanityClient.create({
        _type: 'author',
        name: "The Crypto Frontier",
        slug: {
          _type: 'slug',
          current: "the-crypto-frontier"
        },
        bio: [{
          _type: 'block',
          children: [{
            _type: 'span',
            text: "Portal de notícias sobre criptomoedas e blockchain."
          }]
        }]
      });
      console.log(`${colors.green}✓ Autor padrão criado no Sanity${colors.reset}`);
    }
    
    return autor._id;
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao obter/criar autor padrão: ${erro.message}${colors.reset}`);
    return null;
  }
}

// Função para publicar um post no Sanity
async function publicarPost(arquivo) {
  try {
    const caminhoArquivo = path.join(DIR_POSTS_TRADUZIDOS, arquivo);
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // Parsear o frontmatter do arquivo markdown
    const { data, content } = matter(conteudoArquivo);
    
    // Converter o conteúdo de markdown para HTML
    const htmlContent = marked(content);
    
    // Verificar dados mínimos necessários
    if (!data.title) {
      throw new Error("Título não encontrado no frontmatter");
    }
    
    // Tratar os dados
    const slug = data.slug || slugify(data.title);
    const dataPublicacao = data.date ? new Date(data.date) : new Date();
    const imagemPrincipal = data.image || data.featuredImage || data.thumbnail;
    
    // Obter autor padrão
    const autorId = await obterAutorPadrao();
    
    // Extrair tags e determinar categoria
    const tags = extrairTags(content, data.title);
    const categoriaId = await determinarCategoria(content, data.title);
    const tagsIds = await processarTags(tags);
    
    // Preparar documento para Sanity de acordo com o schema
    const documento = {
      _type: 'post',
      title: data.title,
      slug: {
        _type: 'slug',
        current: slug
      },
      publishedAt: dataPublicacao.toISOString(),
      excerpt: data.excerpt || content.substring(0, 300).replace(/[#*]/g, '') + '...',
      body: htmlToPortableText(htmlContent),
      author: autorId ? {
        _type: 'reference',
        _ref: autorId
      } : undefined,
      categories: categoriaId ? [{
        _type: 'reference',
        _ref: categoriaId
      }] : [],
      tags: tagsIds,
      seo: {
        metaTitle: data.title,
        metaDescription: data.excerpt || content.substring(0, 160).replace(/[#*]/g, '') + '...',
        keywords: tags
      },
      originalSource: {
        url: data.original_link || "",
        name: data.source || "",
        publishedAt: data.date || new Date().toISOString()
      }
    };
    
    // Se tiver imagem, adicionar
    if (imagemPrincipal) {
      documento.mainImage = {
        _type: 'mainImage',
        alt: data.title,
        asset: {
          _type: 'reference',
          _ref: imagemPrincipal.startsWith('image-') ? imagemPrincipal : undefined
        }
      };
    }
    
    // Publicar no Sanity
    console.log(`${colors.blue}[INFO] Publicando post: ${data.title}${colors.reset}`);
    
    const resultado = await sanityClient.create(documento);
    
    console.log(`${colors.green}✓ Post publicado com sucesso! ID: ${resultado._id}${colors.reset}`);
    
    // Mover arquivo para a pasta de publicados
    const arquivoPublicado = path.join(DIR_POSTS_PUBLICADOS, arquivo.replace("traduzido_", "publicado_"));
    
    // Atualizar o frontmatter
    data.status = "publicado";
    data.published_date = new Date().toISOString();
    data.sanity_id = resultado._id;
    
    // Gravar o arquivo atualizado
    fs.writeFileSync(
      arquivoPublicado,
      matter.stringify(content, data),
      'utf8'
    );
    
    // Remover o arquivo da pasta de traduzidos
    fs.unlinkSync(caminhoArquivo);
    
    console.log(`${colors.green}✓ Arquivo movido para: ${arquivoPublicado}${colors.reset}`);
    
    return resultado._id;
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao publicar post '${arquivo}': ${erro.message}${colors.reset}`);
    console.error(erro.stack);
    return null;
  }
}

// Função principal
async function executar() {
  console.log(`${colors.blue}[INFO] Iniciando publicação de posts no Sanity...${colors.reset}`);
  
  // Verificar arquivos markdown na pasta
  let arquivos;
  try {
    arquivos = fs.readdirSync(DIR_POSTS_TRADUZIDOS);
    arquivos = arquivos.filter(arquivo => arquivo.endsWith('.md'));
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao ler diretório: ${erro.message}${colors.reset}`);
    arquivos = [];
  }
  
  if (arquivos.length === 0) {
    console.log(`${colors.yellow}[AVISO] Nenhum arquivo markdown encontrado em '${DIR_POSTS_TRADUZIDOS}'${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}[INFO] Encontrados ${arquivos.length} arquivos para publicar:${colors.reset}`);
  arquivos.forEach((arquivo, i) => {
    console.log(`${colors.blue}  ${i+1}. ${arquivo}${colors.reset}`);
  });
  
  // Publicar cada arquivo
  let sucesso = 0;
  let falha = 0;
  
  for (const arquivo of arquivos) {
    const resultado = await publicarPost(arquivo);
    
    if (resultado) {
      sucesso++;
    } else {
      falha++;
    }
  }
  
  // Resumo
  console.log(`${colors.blue}---------------------------------------------${colors.reset}`);
  console.log(`${colors.blue}[RESUMO] Processo de publicação finalizado:${colors.reset}`);
  console.log(`${colors.green}  ✓ ${sucesso} posts publicados com sucesso${colors.reset}`);
  
  if (falha > 0) {
    console.log(`${colors.red}  ✗ ${falha} posts com erro na publicação${colors.reset}`);
  }
}

// Executar função principal
executar(); 