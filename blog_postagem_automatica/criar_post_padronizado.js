/**
 * Script para padronizar posts traduzidos de acordo com o schema do Sanity CMS
 * 
 * Este script:
 * 1. Lê arquivos markdown traduzidos
 * 2. Extrai e padroniza o conteúdo
 * 3. Gera um novo arquivo em conformidade com o schema
 * 4. Prepara os dados para publicação no Sanity CMS
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('./utils/slugify');
const { JSDOM } = require('jsdom');

// Diretórios
const DIR_POSTS_TRADUZIDOS = './posts_traduzidos';
const DIR_POSTS_PADRONIZADOS = './posts_padronizados';

// Categorias de criptomoedas
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

// Cripto símbolos comuns para detecção automática
const CRIPTO_SIMBOLOS = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'cardano': 'ADA',
  'solana': 'SOL',
  'binance coin': 'BNB',
  'xrp': 'XRP',
  'polkadot': 'DOT',
  'dogecoin': 'DOGE',
  'tether': 'USDT',
  'usd coin': 'USDC',
  'aave': 'AAVE',
  'chainlink': 'LINK',
  'litecoin': 'LTC',
  'polygon': 'MATIC',
  'avalanche': 'AVAX'
};

// Criar diretório de saída se não existir
if (!fs.existsSync(DIR_POSTS_PADRONIZADOS)) {
  fs.mkdirSync(DIR_POSTS_PADRONIZADOS, { recursive: true });
  console.log(`Diretório '${DIR_POSTS_PADRONIZADOS}' criado.`);
}

/**
 * Extrai tags relevantes do conteúdo
 */
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

/**
 * Determina a categoria principal com base no conteúdo
 */
function determinarCategoria(conteudo, titulo) {
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
  
  return CATEGORIAS_CRIPTO[categoriaPrincipal] || 'Mercado';
}

/**
 * Detecta informações de criptomoeda no conteúdo
 */
function detectarCryptoMeta(conteudo, titulo) {
  const conteudoCompleto = (titulo + ' ' + conteudo).toLowerCase();
  let coinName = null;
  let coinSymbol = null;
  
  // Detectar moeda principal
  for (const [moeda, simbolo] of Object.entries(CRIPTO_SIMBOLOS)) {
    if (conteudoCompleto.includes(moeda.toLowerCase())) {
      coinName = moeda.charAt(0).toUpperCase() + moeda.slice(1);
      coinSymbol = simbolo;
      break;
    }
    
    // Tentar encontrar pelo símbolo
    if (conteudoCompleto.includes(simbolo.toLowerCase())) {
      coinName = moeda.charAt(0).toUpperCase() + moeda.slice(1);
      coinSymbol = simbolo;
      break;
    }
  }
  
  // Se não encontrou, verifica se fala de DeFi
  if (!coinName && conteudoCompleto.includes('defi')) {
    coinName = 'DeFi';
    coinSymbol = 'DEFI';
  }
  
  return {
    coinName,
    coinSymbol,
    currentPrice: null,
    priceChange24h: null
  };
}

/**
 * Extrai a imagem principal do HTML
 */
function extrairImagemPrincipal(htmlContent) {
  try {
    const dom = new JSDOM(htmlContent);
    const imgTag = dom.window.document.querySelector('img');
    
    if (imgTag && imgTag.src) {
      return {
        url: imgTag.src,
        alt: imgTag.alt || ''
      };
    }
    
    return null;
  } catch (erro) {
    console.error(`Erro ao extrair imagem: ${erro.message}`);
    return null;
  }
}

/**
 * Converte HTML para estrutura portable text do Sanity
 */
function htmlParaPortableText(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const body = dom.window.document.body;
  const portableText = [];
  
  // Processa cada elemento filho do body
  Array.from(body.childNodes).forEach(node => {
    // Ignorar nós de texto vazios
    if (node.nodeType === 3 && node.textContent.trim() === '') {
      return;
    }
    
    // Processar elementos de acordo com o tipo
    if (node.nodeType === 1) { // Element node
      const tagName = node.tagName.toLowerCase();
      
      // Imagens
      if (tagName === 'img') {
        portableText.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            url: node.src
          },
          alt: node.alt || '',
          caption: ''
        });
      } 
      // Headings
      else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        portableText.push({
          _type: 'block',
          style: tagName,
          children: [{
            _type: 'span',
            text: node.textContent
          }]
        });
      }
      // Links
      else if (tagName === 'a') {
        portableText.push({
          _type: 'block',
          style: 'normal',
          children: [{
            _type: 'span',
            text: node.textContent,
            marks: ['link'],
            markDefs: [{
              _type: 'link',
              href: node.href
            }]
          }]
        });
      }
      // Parágrafos e outros elementos de texto
      else {
        portableText.push({
          _type: 'block',
          style: tagName === 'blockquote' ? 'blockquote' : 'normal',
          children: [{
            _type: 'span',
            text: node.textContent
          }]
        });
      }
    }
    // Nós de texto diretos
    else if (node.nodeType === 3 && node.textContent.trim() !== '') {
      portableText.push({
        _type: 'block',
        style: 'normal',
        children: [{
          _type: 'span',
          text: node.textContent
        }]
      });
    }
  });
  
  return portableText;
}

/**
 * Processa um arquivo markdown e gera a versão padronizada
 */
function processarArquivo(arquivo) {
  try {
    const caminhoArquivo = path.join(DIR_POSTS_TRADUZIDOS, arquivo);
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // Parsear frontmatter e conteúdo
    const { data, content } = matter(conteudoArquivo);
    
    // Converter markdown para HTML para processamento
    const htmlContent = marked(content);
    
    // Verificar dados mínimos necessários
    if (!data.title) {
      throw new Error("Título não encontrado no frontmatter");
    }
    
    // Gerar campos adicionais
    const slug = slugify(data.title);
    const tags = extrairTags(content, data.title);
    const categoria = determinarCategoria(content, data.title);
    const excerpt = data.excerpt || content.substring(0, 250).replace(/[#*]/g, '').trim() + '...';
    const imagemPrincipal = extrairImagemPrincipal(htmlContent);
    const cryptoMeta = detectarCryptoMeta(content, data.title);
    
    // Preparar objeto Sanity-compatível
    const sanityDocument = {
      _type: 'post',
      title: data.title,
      slug: {
        _type: 'slug',
        current: slug
      },
      publishedAt: data.date || new Date().toISOString(),
      excerpt: excerpt,
      content: htmlParaPortableText(htmlContent),
      mainImage: imagemPrincipal ? {
        alt: imagemPrincipal.alt || data.title,
        caption: '',
        asset: {
          _type: 'reference',
          url: imagemPrincipal.url
        }
      } : undefined,
      categories: [{
        _type: 'reference',
        _ref: 'categoria-' + slugify(categoria)
      }],
      tags: tags.map(tag => ({
        _type: 'reference',
        _ref: 'tag-' + slugify(tag)
      })),
      author: {
        _type: 'reference',
        _ref: 'author-crypto-frontier'
      },
      cryptoMeta: cryptoMeta.coinName ? cryptoMeta : undefined,
      seo: {
        metaTitle: data.title,
        metaDescription: excerpt,
        keywords: tags
      },
      originalSource: {
        url: data.original_link || "",
        title: data.source || "",
        site: data.source || ""
      }
    };
    
    // Preparar novos metadados para o frontmatter
    const novosFrontmatterData = {
      ...data,
      slug: slug,
      excerpt: excerpt,
      categories: [categoria],
      tags: tags,
      status: "padronizado",
      padronizado_date: new Date().toISOString()
    };
    
    // Nome do arquivo padronizado
    const nomeArquivoPadronizado = arquivo.replace("traduzido_", "padronizado_");
    const caminhoArquivoPadronizado = path.join(DIR_POSTS_PADRONIZADOS, nomeArquivoPadronizado);
    
    // Salvar arquivo padronizado com frontmatter atualizado
    fs.writeFileSync(
      caminhoArquivoPadronizado,
      matter.stringify(content, novosFrontmatterData),
      'utf8'
    );
    
    // Salvar objeto Sanity como JSON para referência
    fs.writeFileSync(
      path.join(DIR_POSTS_PADRONIZADOS, `${path.parse(nomeArquivoPadronizado).name}.json`),
      JSON.stringify(sanityDocument, null, 2),
      'utf8'
    );
    
    console.log(`✓ Arquivo padronizado: ${nomeArquivoPadronizado}`);
    return true;
  } catch (erro) {
    console.error(`✗ Erro ao processar '${arquivo}': ${erro.message}`);
    return false;
  }
}

/**
 * Função principal
 */
function executar() {
  console.log(`Iniciando padronização de posts...`);
  
  // Listar arquivos markdown
  let arquivos;
  try {
    arquivos = fs.readdirSync(DIR_POSTS_TRADUZIDOS);
    arquivos = arquivos.filter(arquivo => arquivo.endsWith('.md'));
  } catch (erro) {
    console.error(`Erro ao ler diretório: ${erro.message}`);
    arquivos = [];
  }
  
  if (arquivos.length === 0) {
    console.log(`Nenhum arquivo markdown encontrado em '${DIR_POSTS_TRADUZIDOS}'`);
    return;
  }
  
  console.log(`Encontrados ${arquivos.length} arquivos para padronizar:`);
  arquivos.forEach((arquivo, i) => {
    console.log(`  ${i+1}. ${arquivo}`);
  });
  
  // Processar cada arquivo
  let sucesso = 0;
  let falha = 0;
  
  for (const arquivo of arquivos) {
    const resultado = processarArquivo(arquivo);
    
    if (resultado) {
      sucesso++;
    } else {
      falha++;
    }
  }
  
  // Resumo
  console.log(`\nProcesso de padronização finalizado:`);
  console.log(`  ✓ ${sucesso} posts padronizados com sucesso`);
  
  if (falha > 0) {
    console.log(`  ✗ ${falha} posts com erro na padronização`);
  }
  
  console.log(`\nArquivos padronizados estão em: ${DIR_POSTS_PADRONIZADOS}`);
  console.log(`Os arquivos originais permanecem em: ${DIR_POSTS_TRADUZIDOS}`);
  console.log(`\nExecute agora 'node publicar_posts_markdown.js' para publicar no Sanity.`);
}

// Iniciar processamento
executar(); 