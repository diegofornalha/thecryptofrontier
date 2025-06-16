/**
 * 🌍 Exemplos Práticos de APIs i18n no Strapi v5
 * Baseado na documentação oficial: https://docs.strapi.io/cms/api/
 */

// ========================================
// 🔗 REST API EXAMPLES
// ========================================

/**
 * Fetch posts em português via REST API
 */
async function fetchPostsInPortuguese() {
  try {
    const response = await fetch('/api/posts?locale=pt-BR&populate=*');
    const data = await response.json();
    
    console.log('Posts em português:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
  }
}

/**
 * Fetch posts em todos os idiomas
 */
async function fetchPostsAllLocales() {
  try {
    const response = await fetch('/api/posts?locale=all&populate=*');
    const data = await response.json();
    
    console.log('Posts em todos os idiomas:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
  }
}

/**
 * Criar post em português via REST API
 */
async function createPostInPortuguese() {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        data: {
          title: 'Título em Português',
          content: 'Conteúdo do post em português',
          excerpt: 'Resumo em português',
          locale: 'pt-BR'
        }
      })
    });
    
    const data = await response.json();
    console.log('Post criado em português:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar post:', error);
  }
}

/**
 * Criar localização para post existente
 */
async function createLocalizationForPost(documentId) {
  try {
    const response = await fetch(`/api/posts/${documentId}?locale=es`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        data: {
          title: 'Título en Español',
          content: 'Contenido en español'
        }
      })
    });
    
    const data = await response.json();
    console.log('Localização criada:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar localização:', error);
  }
}

// ========================================
// 🔗 GRAPHQL API EXAMPLES
// ========================================

/**
 * GraphQL Query para buscar posts em português
 */
const GET_POSTS_PT_BR = `
  query GetPostsPortuguese {
    posts(locale: "pt-BR") {
      documentId
      title
      content
      excerpt
      locale
      publishedAt
      featuredImage {
        url
        alternativeText
      }
    }
  }
`;

/**
 * GraphQL Query com conexão (Relay-style)
 */
const GET_POSTS_CONNECTION = `
  query GetPostsConnection($locale: I18NLocaleCode!, $page: Int, $pageSize: Int) {
    posts_connection(
      locale: $locale
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      nodes {
        documentId
        title
        content
        locale
        publishedAt
      }
      pageInfo {
        page
        pageSize
        pageCount
        total
      }
    }
  }
`;

/**
 * GraphQL Mutation para criar post
 */
const CREATE_POST_MUTATION = `
  mutation CreatePost($data: PostInput!, $locale: I18NLocaleCode!) {
    createPost(data: $data, locale: $locale) {
      documentId
      title
      content
      locale
      publishedAt
    }
  }
`;

/**
 * GraphQL Mutation para atualizar post
 */
const UPDATE_POST_MUTATION = `
  mutation UpdatePost($documentId: ID!, $data: PostInput!, $locale: I18NLocaleCode!) {
    updatePost(documentId: $documentId, data: $data, locale: $locale) {
      documentId
      title
      content
      locale
      updatedAt
    }
  }
`;

/**
 * Executar query GraphQL
 */
async function executeGraphQLQuery(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    const data = await response.json();
    console.log('GraphQL Response:', data);
    return data;
  } catch (error) {
    console.error('Erro GraphQL:', error);
  }
}

// ========================================
// ⚙️ DOCUMENT SERVICE API EXAMPLES
// ========================================

/**
 * Exemplos de uso do Document Service API
 * (Para uso dentro do Strapi - controllers, services, etc.)
 */

// Buscar posts em português
async function findPostsInPortuguese() {
  const posts = await strapi.documents('api::post.post').findMany({
    locale: 'pt-BR',
    status: 'published'
  });
  
  return posts;
}

// Buscar post específico por documentId e locale
async function findPostByIdAndLocale(documentId, locale) {
  const post = await strapi.documents('api::post.post').findOne({
    documentId,
    locale
  });
  
  return post;
}

// Criar post em português
async function createPostInPortugueseService(data) {
  const post = await strapi.documents('api::post.post').create({
    locale: 'pt-BR',
    data: {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt
    }
  });
  
  return post;
}

// Atualizar post em locale específico
async function updatePostInLocale(documentId, locale, data) {
  const post = await strapi.documents('api::post.post').update({
    documentId,
    locale,
    data
  });
  
  return post;
}

// Publicar post em locale específico
async function publishPostInLocale(documentId, locale) {
  const result = await strapi.documents('api::post.post').publish({
    documentId,
    locale
  });
  
  return result;
}

// Publicar post em todos os locales
async function publishPostAllLocales(documentId) {
  const result = await strapi.documents('api::post.post').publish({
    documentId,
    locale: '*'
  });
  
  return result;
}

// Contar posts por locale
async function countPostsByLocale(locale) {
  const count = await strapi.documents('api::post.post').count({
    locale
  });
  
  return count;
}

// ========================================
// 🎯 MIDDLEWARE EXAMPLES
// ========================================

/**
 * Middleware para detectar locale automaticamente
 */
function localeDetectionMiddleware() {
  return async (ctx, next) => {
    // Detectar locale do header Accept-Language
    const acceptLanguage = ctx.request.headers['accept-language'];
    
    // Detectar locale do query parameter
    const queryLocale = ctx.query.locale;
    
    // Detectar locale do path
    const pathLocale = ctx.path.split('/')[1];
    
    // Definir locale padrão
    let locale = 'en';
    
    if (queryLocale && ['en', 'pt-BR', 'es'].includes(queryLocale)) {
      locale = queryLocale;
    } else if (pathLocale && ['en', 'pt-BR', 'es'].includes(pathLocale)) {
      locale = pathLocale;
    } else if (acceptLanguage) {
      // Lógica para detectar do Accept-Language header
      if (acceptLanguage.includes('pt-BR') || acceptLanguage.includes('pt')) {
        locale = 'pt-BR';
      } else if (acceptLanguage.includes('es')) {
        locale = 'es';
      }
    }
    
    // Adicionar locale ao contexto
    ctx.state.locale = locale;
    
    await next();
  };
}

// ========================================
// 🔍 FRONTEND INTEGRATION EXAMPLES
// ========================================

/**
 * Hook React para gerenciar locale
 */
function useLocale() {
  const [locale, setLocale] = useState('en');
  
  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    // Atualizar URL ou localStorage
    localStorage.setItem('locale', newLocale);
  };
  
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && ['en', 'pt-BR', 'es'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);
  
  return { locale, changeLocale };
}

/**
 * Fetch posts com locale dinâmico
 */
async function fetchPostsWithLocale(locale = 'en') {
  const response = await fetch(`/api/posts?locale=${locale}&populate=*`);
  return response.json();
}

/**
 * Componente de seletor de idioma
 */
function LanguageSelector({ currentLocale, onLocaleChange }) {
  const locales = [
    { code: 'en', name: 'English' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'es', name: 'Español' }
  ];
  
  return (
    <select 
      value={currentLocale} 
      onChange={(e) => onLocaleChange(e.target.value)}
    >
      {locales.map(locale => (
        <option key={locale.code} value={locale.code}>
          {locale.name}
        </option>
      ))}
    </select>
  );
}

// ========================================
// 📤 EXPORT EXAMPLES
// ========================================

module.exports = {
  // REST API
  fetchPostsInPortuguese,
  fetchPostsAllLocales,
  createPostInPortuguese,
  createLocalizationForPost,
  
  // GraphQL
  GET_POSTS_PT_BR,
  GET_POSTS_CONNECTION,
  CREATE_POST_MUTATION,
  UPDATE_POST_MUTATION,
  executeGraphQLQuery,
  
  // Document Service
  findPostsInPortuguese,
  findPostByIdAndLocale,
  createPostInPortugueseService,
  updatePostInLocale,
  publishPostInLocale,
  publishPostAllLocales,
  countPostsByLocale,
  
  // Middleware
  localeDetectionMiddleware,
  
  // Frontend
  useLocale,
  fetchPostsWithLocale,
  LanguageSelector
};

/**
 * 📝 NOTAS IMPORTANTES:
 * 
 * 1. Substitua 'YOUR_TOKEN_HERE' por um token JWT válido
 * 2. Ajuste as URLs conforme sua configuração
 * 3. Os exemplos do Document Service devem ser usados dentro do Strapi
 * 4. Teste sempre com dados reais antes de usar em produção
 * 5. Configure CORS adequadamente para requisições frontend
 */ 