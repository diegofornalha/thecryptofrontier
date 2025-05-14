// Script para corrigir posts do Sanity com schema incorreto
const fs = require('fs');
const path = require('path');

// Diretório onde estão os arquivos JSON
const diretorioPublicados = path.join(__dirname, 'posts_publicados');
const diretorioBackup = path.join(__dirname, 'posts_publicados_backup');

// Função para criar backup dos arquivos originais
function criarBackup() {
  console.log('Criando backup dos arquivos originais...');
  
  // Verificar se o diretório de backup já existe
  if (fs.existsSync(diretorioBackup)) {
    console.log('Diretório de backup já existe. Pulando criação de backup.');
    return true;
  }
  
  try {
    // Criar diretório de backup
    fs.mkdirSync(diretorioBackup, { recursive: true });
    
    // Copiar todos os arquivos para o backup
    const arquivos = fs.readdirSync(diretorioPublicados)
      .filter(arquivo => arquivo.endsWith('.json'));
    
    for (const arquivo of arquivos) {
      const origem = path.join(diretorioPublicados, arquivo);
      const destino = path.join(diretorioBackup, arquivo);
      fs.copyFileSync(origem, destino);
    }
    
    console.log(`Backup criado com sucesso em: ${diretorioBackup}`);
    return true;
  } catch (erro) {
    console.error('Erro ao criar backup:', erro);
    return false;
  }
}

// Função para criar uma referência temporária a uma tag
function criarReferenciaTag(tagName) {
  // Cria um slug básico a partir do nome da tag
  const slug = tagName.toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  
  return {
    _type: 'reference',
    _key: `tag-${Math.random().toString(36).substring(2, 10)}`,
    _ref: `tag-${slug}`
  };
}

// Função para corrigir um arquivo JSON
function corrigirArquivo(caminhoArquivo) {
  try {
    console.log(`\nProcessando: ${path.basename(caminhoArquivo)}`);
    
    // Ler o arquivo JSON
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
    let post;
    
    try {
      post = JSON.parse(conteudo);
    } catch (erroJSON) {
      console.error(`Erro ao analisar JSON:`, erroJSON);
      return false;
    }
    
    // Clone o objeto para não modificar o original diretamente
    const postCorrigido = { ...post };
    let modificacoes = [];
    
    // 1. Corrigir campos de SEO - mover meta_title e meta_description para o objeto seo
    if (post.meta_title || post.meta_description) {
      // Criar ou atualizar o objeto seo
      postCorrigido.seo = postCorrigido.seo || {};
      
      if (post.meta_title) {
        postCorrigido.seo.metaTitle = post.meta_title;
        delete postCorrigido.meta_title;
        modificacoes.push('Movido meta_title para seo.metaTitle');
      }
      
      if (post.meta_description) {
        postCorrigido.seo.metaDescription = post.meta_description;
        delete postCorrigido.meta_description;
        modificacoes.push('Movido meta_description para seo.metaDescription');
      }
    }
    
    // 2. Corrigir o campo body -> content (se body existir e content não existir)
    if (post.body && !post.content) {
      postCorrigido.content = post.body;
      delete postCorrigido.body;
      modificacoes.push('Renomeado campo body para content');
    }
    
    // 3. Corrigir formato das tags se estiverem em formato incorreto
    if (Array.isArray(post.tags)) {
      // Verificar se as tags não estão no formato correto (objetos com _type, _ref, _key)
      const precisaCorrigir = post.tags.some(tag => 
        typeof tag !== 'object' || !tag._type || !tag._ref
      );
      
      if (precisaCorrigir) {
        // Converter tags para o formato correto
        postCorrigido.tags = post.tags.map(tag => {
          // Se já for um objeto de referência correta, manter
          if (typeof tag === 'object' && tag._type === 'reference' && tag._ref) {
            return tag;
          }
          
          // Caso contrário, criar referência (string -> referência)
          const tagName = typeof tag === 'string' ? tag : String(tag);
          return criarReferenciaTag(tagName);
        });
        
        modificacoes.push('Corrigido formato das tags para referências');
      }
    }
    
    // Se nenhuma modificação foi feita, pular a gravação
    if (modificacoes.length === 0) {
      console.log(`Nenhuma alteração necessária`);
      return true;
    }
    
    // Salvar o arquivo corrigido
    fs.writeFileSync(caminhoArquivo, JSON.stringify(postCorrigido, null, 2));
    
    // Exibir modificações feitas
    console.log(`Modificações realizadas:`);
    modificacoes.forEach(mod => console.log(`- ${mod}`));
    
    return true;
  } catch (erro) {
    console.error(`Erro ao processar arquivo:`, erro);
    return false;
  }
}

// Processar todos os arquivos no diretório
function processarDiretorio() {
  console.log(`\n==== CORREÇÃO DE SCHEMA PARA POSTS DO SANITY ====`);
  
  // Verificar se o diretório existe
  if (!fs.existsSync(diretorioPublicados)) {
    console.error(`Diretório ${diretorioPublicados} não encontrado.`);
    return;
  }
  
  // Criar backup antes de prosseguir
  if (!criarBackup()) {
    console.error('Falha ao criar backup. Abortando operação por segurança.');
    return;
  }
  
  // Listar todos os arquivos JSON no diretório
  const arquivos = fs.readdirSync(diretorioPublicados)
    .filter(arquivo => arquivo.endsWith('.json'));
  
  console.log(`\nEncontrados ${arquivos.length} arquivos para verificar.`);
  
  if (arquivos.length === 0) {
    console.log(`Nenhum arquivo JSON encontrado em ${diretorioPublicados}`);
    return;
  }
  
  let corrigidos = 0;
  let falhas = 0;
  
  for (const arquivo of arquivos) {
    const caminhoArquivo = path.join(diretorioPublicados, arquivo);
    const resultado = corrigirArquivo(caminhoArquivo);
    
    if (resultado) {
      corrigidos++;
    } else {
      falhas++;
    }
  }
  
  console.log(`\n==== RESUMO DA OPERAÇÃO ====`);
  console.log(`- Arquivos verificados: ${arquivos.length}`);
  console.log(`- Arquivos corrigidos: ${corrigidos}`);
  console.log(`- Falhas: ${falhas}`);
  console.log(`\nBackup dos arquivos originais disponível em: ${diretorioBackup}`);
}

// Executar o script
processarDiretorio(); 