// Script para verificar posts publicados no Sanity CMS
const sanityConfig = require('./sanity.config');
const { createClient } = require('@sanity/client');

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

// Cabeçalho
console.log(`${colors.magenta}${colors.bold}===========================================${colors.reset}`);
console.log(`${colors.magenta}${colors.bold}      POSTS PUBLICADOS NO SANITY CMS      ${colors.reset}`);
console.log(`${colors.magenta}${colors.bold}===========================================${colors.reset}\n`);

// Configuração do cliente Sanity
const sanityClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: false,
  token: sanityConfig.token
});

// Função para formatar a data em formato legível
function formatarData(dataIso) {
  try {
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dataIso || 'Data desconhecida';
  }
}

// Função para listar posts
async function listarPosts() {
  try {
    console.log(`${colors.blue}[INFO] Conectando ao Sanity CMS...${colors.reset}`);
    
    // Buscar posts ordenados pelo mais recente
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      content,
      categories[]->
    }`;
    
    const posts = await sanityClient.fetch(query);
    
    console.log(`${colors.green}✓ Encontrados ${posts.length} posts publicados${colors.reset}\n`);
    
    // Exibir informações dos posts
    posts.forEach((post, i) => {
      console.log(`${colors.cyan}${colors.bold}Post #${i+1}${colors.reset}`);
      console.log(`${colors.cyan}ID: ${post._id}${colors.reset}`);
      console.log(`${colors.cyan}Título: ${post.title}${colors.reset}`);
      console.log(`${colors.cyan}Slug: ${post.slug?.current || 'N/A'}${colors.reset}`);
      console.log(`${colors.cyan}Publicado em: ${formatarData(post.publishedAt)}${colors.reset}`);
      console.log(`${colors.cyan}Resumo: ${(post.excerpt || 'Sem resumo').substring(0, 100)}...${colors.reset}`);
      
      // Mostrar categorias se disponíveis
      if (post.categories && post.categories.length > 0) {
        const categorias = post.categories.map(cat => cat.title || 'Sem título').join(', ');
        console.log(`${colors.cyan}Categorias: ${categorias}${colors.reset}`);
      } else {
        console.log(`${colors.cyan}Categorias: Nenhuma${colors.reset}`);
      }
      
      // Verificar se tem conteúdo
      if (post.content) {
        console.log(`${colors.cyan}Conteúdo: ${(typeof post.content === 'string' ? post.content : JSON.stringify(post.content)).substring(0, 50)}...${colors.reset}`);
      } else {
        console.log(`${colors.cyan}Conteúdo: Não disponível${colors.reset}`);
      }
      
      console.log(`${colors.cyan}URL: https://${sanityConfig.projectId}.sanity.studio/desk/post;${post._id}${colors.reset}`);
      console.log(''); // Linha em branco entre posts
    });
    
    console.log(`${colors.magenta}${colors.bold}=== FIM DA LISTAGEM ===${colors.reset}`);
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao buscar posts: ${erro.message}${colors.reset}`);
  }
}

// Executar
(async () => {
  try {
    await listarPosts();
  } catch (erro) {
    console.error(`${colors.red}✗ Erro fatal: ${erro.message}${colors.reset}`);
    process.exit(1);
  }
})(); 