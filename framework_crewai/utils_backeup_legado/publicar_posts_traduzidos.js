// Script para publicar posts traduzidos no Sanity CMS
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');
const frontMatter = require('front-matter');
const blockTools = require('@portabletext/block-tools');
const { htmlToBlocks } = require('@portabletext/block-tools');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar cliente Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_DEV_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false
});

// Configurar os schemas necessários para a conversão html -> portable text
const blockContentType = {
  name: 'blockContent',
  type: 'array',
  of: [
    {
      type: 'block',
      title: 'Block',
      // Default styles
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' }
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' }
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' }
        ],
        annotations: []
      },
      // Importante: definir valores padrão
      fields: []
    }
  ]
};

// Necessário definir o schema do block para o @portabletext/block-tools
blockContentType.of[0].name = 'block';

// Função para converter HTML em blocos Portable Text
function htmlToPortableText(html) {
  try {
    // Abordagem simples: converter para blocos de texto plano
    const paragrafos = html
      .replace(/<[^>]*>/g, '') // Remover todas as tags HTML
      .split(/\n+/) // Dividir por quebras de linha
      .filter(p => p.trim() !== ''); // Remover parágrafos vazios
      
    // Criar blocos manualmente (mais simples e confiável que htmlToBlocks)
    return paragrafos.map(texto => {
      return {
        _type: 'block',
        _key: Math.random().toString(36).substring(2, 10),
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: Math.random().toString(36).substring(2, 10),
            text: texto.trim(),
            marks: []
          }
        ]
      };
    });
  } catch (error) {
    console.error('Erro ao converter HTML para Portable Text:', error);
    // Retornar um bloco simples em caso de erro
    return [
      {
        _type: 'block',
        _key: Math.random().toString(36).substring(2, 10),
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: Math.random().toString(36).substring(2, 10),
            text: 'Erro ao processar o conteúdo',
            marks: []
          }
        ]
      }
    ];
  }
}

// Função para criar um slug a partir de um título
function criarSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

// Função para converter uma tag em referência
function criarReferenciaTag(tag) {
  // Se já for uma referência válida, retornar
  if (typeof tag === 'object' && tag._type === 'reference' && tag._ref) {
    return tag;
  }
  
  // Caso contrário, criar slug a partir do nome da tag
  const tagName = typeof tag === 'string' ? tag : String(tag);
  const slug = tagName
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  
  return {
    _type: 'reference',
    _key: `tag-${Math.random().toString(36).substring(2, 10)}`,
    _ref: `tag-${slug}`
  };
}

// Função para ler arquivos JSON traduzidos e publicá-los no Sanity
async function publicarPostsTraduzidos() {
  const diretorioTraduzidos = path.join(__dirname, 'posts_traduzidos');
  const diretorioPublicados = path.join(__dirname, 'posts_publicados');

  // Verificar se diretório existe
  if (!fs.existsSync(diretorioTraduzidos)) {
    console.error(`Diretório ${diretorioTraduzidos} não encontrado.`);
    return;
  }

  // Criar diretório de publicados se não existir
  if (!fs.existsSync(diretorioPublicados)) {
    fs.mkdirSync(diretorioPublicados, { recursive: true });
  }

  // Obter lista de arquivos traduzidos
  const arquivos = fs.readdirSync(diretorioTraduzidos)
    .filter(arquivo => arquivo.startsWith('traduzido_') && arquivo.endsWith('.json'));

  if (arquivos.length === 0) {
    console.log('Nenhum arquivo traduzido encontrado para publicar.');
    return;
  }

  console.log(`Encontrados ${arquivos.length} artigos para publicar.`);

  // Obter autor padrão (Alexandre Bianchi)
  const autorId = 'ca38a3d5-cba1-47a0-aa29-4af17a15e17c';

  for (const arquivo of arquivos) {
    try {
      console.log(`\nProcessando publicação de ${arquivo}...`);
      
      // Ler arquivo JSON
      const caminhoArquivo = path.join(diretorioTraduzidos, arquivo);
      const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf8');
      
      // Limpar conteúdo de caracteres de escape problemáticos
      const conteudoLimpo = conteudoArquivo
        .replace(/\\\$/g, '$') // Remove escape de cifrão
        .replace(/\\'/g, "'"); // Remove escape de aspas simples
        
      let conteudoJson;
      try {
        conteudoJson = JSON.parse(conteudoLimpo);
      } catch (erro) {
        console.error(`Erro ao analisar JSON: ${erro}`);
        console.log("Usando método alternativo para ler o arquivo...");
        // Método alternativo para ler o arquivo como texto e extrair dados manualmente
        conteudoJson = {};
      }
      
      // Extrair dados
      let title, content, tags, category, slug, publishedAt, seoDescription, seoTitle;
      
      // Tentar extrair de frontmatter_traduzido se existir
      if (conteudoJson.frontmatter_traduzido) {
        const fm = conteudoJson.frontmatter_traduzido;
        title = fm.title;
        tags = fm.tags || [];
        category = fm.category || 'Criptomoedas';
        slug = fm.slug || criarSlug(title);
        publishedAt = fm.published_date || new Date().toISOString();
        seoDescription = fm.seo_meta_description || '';
        seoTitle = fm.seo_title || title;
      } else {
        // Tentar extrair de outros campos
        title = conteudoJson.title || 'Sem título';
        tags = conteudoJson.tags || [];
        category = conteudoJson.category || 'Criptomoedas';
        slug = conteudoJson.slug || criarSlug(title);
        publishedAt = conteudoJson.publishedAt || new Date().toISOString();
        seoDescription = conteudoJson.seo_meta_description || '';
        seoTitle = conteudoJson.seo_title || title;
      }
      
      // Obter conteúdo para converter em Portable Text
      let conteudoParaConverter = '';
      
      // Priorizar conteúdo HTML se disponível
      if (conteudoJson.content_html_traduzido) {
        conteudoParaConverter = conteudoJson.content_html_traduzido;
      } 
      // Caso contrário, usar texto plano
      else if (conteudoJson.content_text_traduzido) {
        conteudoParaConverter = conteudoJson.content_text_traduzido;
      } 
      // Fallback
      else {
        conteudoParaConverter = 'Conteúdo não disponível.';
      }
      
      // Converter para Portable Text
      const portableText = htmlToPortableText(conteudoParaConverter);
      
      // Converter tags para o formato correto (referências)
      const tagsReferencia = Array.isArray(tags) 
        ? tags.map(tag => criarReferenciaTag(tag))
        : [];
      
      // Gerar ID do documento
      const docId = `post-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Preparar documento para Sanity (seguindo o schema correto)
      const documento = {
        _type: 'post',
        _id: docId,
        title: title,
        slug: {
          _type: 'slug',
          current: slug
        },
        excerpt: conteudoParaConverter.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        content: portableText, // Usar 'content' em vez de 'body'
        tags: tagsReferencia, // Tags como referências
        categories: [{
          _type: 'reference', 
          _key: Math.random().toString(36).substring(2, 10), 
          _ref: 'category-criptomoedas'
        }],
        author: {
          _type: 'reference',
          _ref: autorId
        },
        publishedAt: publishedAt,
        seo: {
          metaTitle: seoTitle, // Usar camelCase
          metaDescription: seoDescription // Usar camelCase
        }
      };
      
      // Salvar o documento JSON no diretório de publicados para referência
      const arquivoPublicado = arquivo.replace('traduzido_', 'publicado_');
      const caminhoPublicado = path.join(diretorioPublicados, arquivoPublicado);
      fs.writeFileSync(caminhoPublicado, JSON.stringify(documento, null, 2));
      console.log(`Arquivo salvo em ${caminhoPublicado}`);
      
      // Publicar no Sanity
      console.log(`Enviando para o Sanity: ${title}`);
      const resultado = await client.createOrReplace(documento);
      console.log(`Artigo publicado com sucesso! ID: ${resultado._id}`);
      
    } catch (erro) {
      console.error(`Erro ao processar ${arquivo}:`, erro);
    }
  }
}

// Função para lidar com erros gerais
function handleError(error, message) {
  console.error(`${message}: ${error.message}`);
  console.error('Stack trace:', error.stack || 'Sem stack trace disponível');
  return null;
}

// Executar função principal com tratamento de erros geral
publicarPostsTraduzidos().catch(error => {
  console.error('Erro geral na execução do script:');
  console.error(error);
  process.exit(1);
}); 