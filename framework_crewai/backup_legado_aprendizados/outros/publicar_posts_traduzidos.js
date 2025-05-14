// Script para publicar posts traduzidos no Sanity CMS
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');
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

// Função para converter HTML em blocos Portable Text
function htmlToPortableText(html) {
  try {
    // Abordagem simples: converter para blocos de texto plano
    const paragrafos = html
      .replace(/<p>/g, '') // Remover tags de parágrafo de abertura
      .replace(/<\/p>/g, '\n\n') // Substituir tags de fechamento por quebras duplas de linha
      .replace(/<[^>]*>/g, '') // Remover todas as outras tags HTML
      .split(/\n\n+/) // Dividir por quebras duplas de linha
      .filter(p => p.trim() !== ''); // Remover parágrafos vazios
      
    // Criar blocos manualmente (mais simples e confiável)
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

// Função para verificar se categoria existe e criar se necessário
async function verificarECriarCategoria(categoria) {
  // Normalizar categoria para criar slug
  const categoriaSlug = categoria
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  
  const categoriaId = `category-${categoriaSlug}`;
  
  try {
    // Verificar se a categoria já existe
    const categoriaExistente = await client.fetch(
      `*[_type == "category" && _id == $id][0]`,
      { id: categoriaId }
    );
    
    if (categoriaExistente) {
      console.log(`Categoria "${categoria}" já existe.`);
      return categoriaId;
    }
    
    // Criar categoria
    console.log(`Criando categoria "${categoria}"...`);
    await client.createIfNotExists({
      _type: 'category',
      _id: categoriaId,
      title: categoria,
      slug: {
        _type: 'slug',
        current: categoriaSlug
      }
    });
    
    return categoriaId;
  } catch (error) {
    console.error(`Erro ao verificar/criar categoria "${categoria}":`, error);
    return categoriaId;  // Retorna ID mesmo assim para não quebrar o fluxo
  }
}

// Função para verificar se tag existe e criar se necessário
async function verificarECriarTag(tag) {
  // Normalizar tag para criar slug
  const tagSlug = tag
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  
  const tagId = `tag-${tagSlug}`;
  
  try {
    // Verificar se a tag já existe
    const tagExistente = await client.fetch(
      `*[_type == "tag" && _id == $id][0]`,
      { id: tagId }
    );
    
    if (tagExistente) {
      console.log(`Tag "${tag}" já existe.`);
      return tagId;
    }
    
    // Criar tag
    console.log(`Criando tag "${tag}"...`);
    await client.createIfNotExists({
      _type: 'tag',
      _id: tagId,
      name: tag,
      slug: {
        _type: 'slug',
        current: tagSlug
      }
    });
    
    return tagId;
  } catch (error) {
    console.error(`Erro ao verificar/criar tag "${tag}":`, error);
    return tagId;  // Retorna ID mesmo assim para não quebrar o fluxo
  }
}

// Função principal para publicar posts traduzidos
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
        
      const conteudoJson = JSON.parse(conteudoLimpo);
      
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
        title = conteudoJson.title_traduzido || 'Sem título';
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
      
      // Criar/verificar categoria
      const categoriaId = await verificarECriarCategoria(category);
      
      // Criar/verificar tags
      const tagsPromises = tags.map(tag => verificarECriarTag(tag));
      const tagsIds = await Promise.all(tagsPromises);
      
      // Converter tags para o formato correto (referências)
      const tagsReferencia = tagsIds.map(tagId => ({
        _type: 'reference',
        _key: `tag-${Math.random().toString(36).substring(2, 10)}`,
        _ref: tagId
      }));
      
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
        excerpt: conteudoJson.resumo_traduzido || title,
        content: portableText,
        categories: [
          {
            _type: 'reference',
            _key: `category-${Math.random().toString(36).substring(2, 10)}`,
            _ref: categoriaId
          }
        ],
        tags: tagsReferencia,
        author: {
          _type: 'reference',
          _ref: autorId
        },
        publishedAt: publishedAt,
        seo: {
          metaTitle: seoTitle || title,
          metaDescription: seoDescription || title
        }
      };
      
      // Publicar no Sanity
      console.log(`Publicando post "${title}"...`);
      const resultado = await client.createOrReplace(documento);
      
      console.log(`Post publicado com sucesso! ID: ${resultado._id}`);
      
      // Mover arquivo para pasta de publicados
      const caminhoPublicado = path.join(diretorioPublicados, arquivo);
      fs.renameSync(caminhoArquivo, caminhoPublicado);
      console.log(`Arquivo ${arquivo} movido para pasta de publicados.`);
      
    } catch (error) {
      console.error(`Erro ao publicar post ${arquivo}:`, error);
    }
  }
  
  console.log('\nProcessamento de publicação concluído!');
}

// Executar função principal
publicarPostsTraduzidos().catch(error => {
  console.error('Erro durante a execução:', error);
}); 