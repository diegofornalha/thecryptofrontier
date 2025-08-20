/**
 * Puppeteer Tools Module
 * 
 * Ferramentas de automação web usando Puppeteer
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { 
  successResponse 
} from '../../utils.js';
import {
  NavigateParams,
  ScreenshotParams,
  ClickParams,
  TypeParams,
  MCPError,
  ErrorCode
} from '../../types.js';

const execAsync = promisify(exec);

// Schemas de validação
export const NavigateSchema = z.object({
  url: z.string().url('URL inválida fornecida')
});

export const ScreenshotSchema = z.object({
  path: z.string().min(1, 'Caminho do arquivo é obrigatório'),
  fullPage: z.boolean().optional().default(false)
});

export const ClickSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório')
});

export const TypeSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
  text: z.string()
});

export const OpenBrowserSchema = z.object({
  url: z.string().url('URL inválida fornecida')
});

// Estado do browser
let browser: Browser | null = null;
let page: Page | null = null;
let lastActivity = Date.now();

// Configurações
const BROWSER_TIMEOUT = 30 * 60 * 1000; // 30 minutos (aumentado de 5)
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };
const PAGE_TIMEOUT = 30000; // 30 segundos para carregamento de página

// Configurações do browser - melhoradas para persistência
const BROWSER_CONFIG = {
  headless: false,
  defaultViewport: DEFAULT_VIEWPORT,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
};

/**
 * Garante que o browser está inicializado
 */
async function ensureBrowser(): Promise<void> {
  console.log(`🔍 Verificando estado do browser... (browser: ${!!browser}, connected: ${browser?.isConnected()}, page: ${!!page}, closed: ${page?.isClosed()})`);
  
  if (!browser || !browser.isConnected()) {
    console.log('🚀 Iniciando novo browser Puppeteer...');
    
    // Usa configuração melhorada
    browser = await puppeteer.launch(BROWSER_CONFIG);
    
    // Adiciona listener para fechar gracefully
    browser.on('disconnected', () => {
      console.log('❌ Browser desconectado');
      browser = null;
      page = null;
    });
    
    console.log('✅ Browser iniciado com sucesso');
  } else {
    console.log('♻️ Reutilizando browser existente');
  }
  
  if (!page || page.isClosed()) {
    console.log('📄 Criando nova página...');
    const pages = await browser.pages();
    
    if (pages.length > 0) {
      page = pages[0] || null;
      console.log('📄 Reutilizando página existente');
    } else {
      page = await browser.newPage();
      console.log('📄 Nova página criada');
    }
    
    // Configurar viewport e timeouts apenas se page não for null
    if (page) {
      await page.setViewport(DEFAULT_VIEWPORT);
      page.setDefaultTimeout(PAGE_TIMEOUT);
      page.setDefaultNavigationTimeout(PAGE_TIMEOUT);
      
      console.log('⚙️ Página configurada com viewport e timeouts');
    }
  } else {
    console.log('♻️ Reutilizando página existente');
  }
  
  lastActivity = Date.now();
  console.log(`⏰ Última atividade atualizada: ${new Date(lastActivity).toLocaleTimeString()}`);
}

/**
 * Fecha o browser após inatividade
 */
export function startBrowserCleanup() {
  setInterval(async () => {
    if (browser && Date.now() - lastActivity > BROWSER_TIMEOUT) {
      console.log('⏰ Fechando browser por inatividade...');
      await browser.close();
      browser = null;
      page = null;
    }
  }, 60000); // Verifica a cada minuto
}

// Handlers das ferramentas
export async function handleNavigate(params: NavigateParams) {
  const validated = NavigateSchema.parse(params);
  
  console.log(`🌐 Navegando para: ${validated.url}`);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  try {
    // Navegar com timeout mais longo e aguardar carregamento completo
    await page.goto(validated.url, { 
      waitUntil: 'networkidle2', // Aguarda até não haver requisições por 500ms
      timeout: PAGE_TIMEOUT 
    });
    
    console.log(`✅ Navegação concluída para: ${validated.url}`);
    
    // Aguardar mais tempo para JavaScript carregar completamente
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log(`🎯 Página carregada e pronta para interação`);
    
    return successResponse(
      { url: validated.url },
      `Navegado para ${validated.url}`
    );
  } catch (error) {
    console.error(`❌ Erro na navegação:`, error);
    throw new MCPError(
      ErrorCode.PAGE_LOAD_FAILED, 
      `Falha ao navegar para ${validated.url}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

export async function handleScreenshot(params: ScreenshotParams) {
  const validated = ScreenshotSchema.parse(params);
  
  console.log(`📸 Iniciando captura de screenshot: ${validated.path}`);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  // Debug: verificar URL atual
  const currentUrl = await page.url();
  console.log(`🌐 URL atual da página: ${currentUrl}`);
  
  // Debug: verificar se página está carregada
  const title = await page.title();
  console.log(`📄 Título da página: ${title}`);
  
  let path = validated.path;
  if (!path.match(/\.(png|jpg|jpeg)$/i)) {
    path += '.png';
  }
  
  console.log(`💾 Salvando screenshot em: ${path}`);
  
  await page.screenshot({
    path: path as any, // Type assertion para resolver conflito de tipos
    fullPage: validated.fullPage
  });
  
  console.log(`✅ Screenshot salvo com sucesso!`);
  
  return successResponse(
    { path, currentUrl, title },
    `Screenshot salvo em ${path} (URL: ${currentUrl})`
  );
}

export async function handleClick(params: ClickParams) {
  const validated = ClickSchema.parse(params);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  await page.click(validated.selector);
  
  return successResponse(
    { selector: validated.selector },
    `Clicado no elemento: ${validated.selector}`
  );
}

export async function handleType(params: TypeParams) {
  const validated = TypeSchema.parse(params);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  await page.type(validated.selector, validated.text);
  
  return successResponse(
    { selector: validated.selector, text: validated.text },
    `Texto digitado no elemento: ${validated.selector}`
  );
}

export async function handleGetContent() {
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  const content = await page.content();
  
  return successResponse(
    { content },
    'Conteúdo HTML obtido com sucesso'
  );
}

// Nova função para abrir URL em nova aba
export async function handleNewTab(params: NavigateParams) {
  const validated = NavigateSchema.parse(params);
  
  await ensureBrowser();
  if (!browser) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Browser não inicializado');
  
  // Cria nova aba
  const newPage = await browser.newPage();
  await newPage.setViewport(DEFAULT_VIEWPORT);
  await newPage.goto(validated.url, { waitUntil: 'networkidle2' });
  
  // Foca na nova aba
  await newPage.bringToFront();
  
  return successResponse(
    { url: validated.url },
    `Nova aba aberta com ${validated.url}`
  );
}

// Função para abrir URL no navegador padrão do sistema
export async function handleOpenBrowser(params: { url: string }) {
  const validated = OpenBrowserSchema.parse(params);
  
  try {
    // Usa o comando 'open' do macOS para abrir a URL no navegador padrão
    await execAsync(`open "${validated.url}"`);
    
    return successResponse(
      { url: validated.url },
      `URL ${validated.url} aberta no navegador padrão do sistema`
    );
  } catch (error) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Falha ao abrir navegador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// Nova função que combina navegação + screenshot
export async function handleNavigateAndScreenshot(params: { url: string, path: string, fullPage?: boolean }) {
  console.log(`🚀 Iniciando navegação + screenshot para: ${params.url}`);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  try {
    // Navegar
    console.log(`🌐 Navegando para: ${params.url}`);
    await page.goto(params.url, { 
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT 
    });
    
    console.log(`✅ Navegação concluída`);
    
    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se página carregou
    const title = await page.title();
    console.log(`📄 Página carregada: ${title}`);
    
    // Capturar screenshot
    let path = params.path;
    if (!path.match(/\.(png|jpg|jpeg)$/i)) {
      path += '.png';
    }
    
    console.log(`📸 Capturando screenshot...`);
    await page.screenshot({
      path: path as any,
      fullPage: params.fullPage || false
    });
    
    console.log(`✅ Screenshot capturado com sucesso!`);
    
    return successResponse(
      { url: params.url, path, title },
      `Navegado para ${params.url} e screenshot salvo em ${path}`
    );
  } catch (error) {
    console.error(`❌ Erro na operação:`, error);
    throw new MCPError(
      ErrorCode.PAGE_LOAD_FAILED, 
      `Falha na operação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// STRAPI: Login no Strapi CMS
export async function handleStrapiLogin(params: {
  email?: string,
  password?: string,
  screenshotPath?: string
}) {
  console.log(`🔐 Fazendo login no Strapi CMS`);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  try {
    // Navegar para o admin do Strapi
    console.log(`🌐 Navegando para Strapi Admin...`);
    await page.goto('https://ale-blog.agentesintegrados.com/admin', { 
      waitUntil: 'networkidle2',
      timeout: PAGE_TIMEOUT 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Se credenciais foram fornecidas, fazer login
    if (params.email && params.password) {
      await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
      await page.type('input[name="email"], input[type="email"]', params.email);
      await page.type('input[name="password"], input[type="password"]', params.password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    }
    
    // Capturar screenshot se solicitado
    if (params.screenshotPath) {
      await page.screenshot({ path: params.screenshotPath as any, fullPage: true });
    }
    
    const currentUrl = await page.url();
    const title = await page.title();
    
    console.log(`✅ Login no Strapi realizado com sucesso!`);
    
    return successResponse({
      currentUrl,
      title,
      screenshotPath: params.screenshotPath,
      loginAttempted: !!(params.email && params.password)
    }, `Login no Strapi realizado com sucesso! URL atual: ${currentUrl}`);
    
  } catch (error) {
    console.error(`❌ Erro no login do Strapi:`, error);
    throw new MCPError(
      ErrorCode.PAGE_LOAD_FAILED, 
      `Falha no login do Strapi: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// STRAPI: Criar novo post no Strapi
export async function handleStrapiCreatePost(params: {
  title: string,
  content: string,
  category?: string,
  tags?: string[],
  screenshotPath?: string
}) {
  console.log(`📝 Criando novo post no Strapi: ${params.title}`);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  try {
    // Navegar para criação de posts
    console.log(`🌐 Navegando para criação de posts...`);
    await page.goto('https://ale-blog.agentesintegrados.com/admin/content-manager/collection-types/api::blog.blog', { 
      waitUntil: 'networkidle2',
      timeout: PAGE_TIMEOUT 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clicar em "Criar nova entrada"
    try {
      await page.click('button:contains("Create new entry"), [data-testid="create-entry-link"], .sc-button-primary');
    } catch {
      console.log(`🔍 Procurando botão de criação...`);
      await page.click('button, a[href*="create"]');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Preencher título
    await page.waitForSelector('input[name="title"], input[placeholder*="title"], input[placeholder*="título"]', { timeout: 10000 });
    await page.type('input[name="title"], input[placeholder*="title"], input[placeholder*="título"]', params.title);
    
    // Preencher conteúdo
    const contentSelectors = [
      'textarea[name="content"]',
      'textarea[name="description"]', 
      '.rich-text-editor textarea',
      'div[contenteditable="true"]'
    ];
    
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        if (selector.includes('contenteditable')) {
          await page.click(selector);
          await page.keyboard.type(params.content);
        } else {
          await page.type(selector, params.content);
        }
        break;
      } catch {
        continue;
      }
    }
    
    // Adicionar categoria se fornecida
    if (params.category) {
      try {
        await page.type('input[name="category"], select[name="category"]', params.category);
      } catch {
        console.log(`⚠️ Campo categoria não encontrado`);
      }
    }
    
    // Capturar screenshot antes de salvar
    if (params.screenshotPath) {
      await page.screenshot({ path: `${params.screenshotPath}-antes-salvar.png` as any, fullPage: true });
    }
    
    // Salvar o post
    await page.click('button:contains("Save"), button:contains("Salvar"), button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Capturar screenshot final
    if (params.screenshotPath) {
      await page.screenshot({ path: params.screenshotPath as any, fullPage: true });
    }
    
    const currentUrl = await page.url();
    const title = await page.title();
    
    console.log(`✅ Post criado com sucesso no Strapi!`);
    
    return successResponse({
      postTitle: params.title,
      currentUrl,
      title,
      screenshotPath: params.screenshotPath,
      category: params.category,
      tags: params.tags
    }, `Post "${params.title}" criado com sucesso no Strapi!`);
    
  } catch (error) {
    console.error(`❌ Erro ao criar post no Strapi:`, error);
    throw new MCPError(
      ErrorCode.PAGE_LOAD_FAILED, 
      `Falha ao criar post no Strapi: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// THECRYPTOFRONTIER: Navegar e explorar o blog
export async function handleCryptoFrontierExplore(params: {
  section?: 'home' | 'posts' | 'categories' | 'search',
  searchTerm?: string,
  screenshotPath?: string
}) {
  console.log(`🔍 Explorando TheCryptoFrontier - Seção: ${params.section || 'home'}`);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  try {
    let targetUrl = 'https://thecryptofrontier.agentesintegrados.com/';
    
    // Definir URL baseada na seção
    switch (params.section) {
      case 'posts':
        targetUrl += 'posts';
        break;
      case 'categories':
        targetUrl += 'categories';
        break;
      case 'search':
        if (params.searchTerm) {
          targetUrl += `search?q=${encodeURIComponent(params.searchTerm)}`;
        }
        break;
      default:
        // Home page
        break;
    }
    
    console.log(`🌐 Navegando para: ${targetUrl}`);
    await page.goto(targetUrl, { 
      waitUntil: 'networkidle2',
      timeout: PAGE_TIMEOUT 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extrair informações da página
    const pageInfo = await page.evaluate(() => {
      const title = document.title;
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(h => h.textContent?.trim())
        .filter(text => text && text.length > 0)
        .slice(0, 10);
      
      const posts = Array.from(document.querySelectorAll('[class*="post"], article, .blog-post'))
        .map(post => {
          const titleEl = post.querySelector('h1, h2, h3, .title');
          const contentEl = post.querySelector('p, .excerpt, .content');
          return {
            title: titleEl?.textContent?.trim() || '',
            excerpt: contentEl?.textContent?.trim().substring(0, 200) || ''
          };
        })
        .filter(post => post.title)
        .slice(0, 5);
      
      return { title, headings, posts };
    });
    
    // Realizar busca se solicitado
    if (params.section === 'search' && params.searchTerm) {
      try {
        const searchSelectors = [
          'input[type="search"]',
          'input[placeholder*="search"]',
          'input[placeholder*="buscar"]',
          '.search-input',
          '#search'
        ];
        
        for (const selector of searchSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            await page.type(selector, params.searchTerm);
            await page.keyboard.press('Enter');
            await new Promise(resolve => setTimeout(resolve, 2000));
            break;
          } catch {
            continue;
          }
        }
      } catch {
        console.log(`⚠️ Campo de busca não encontrado`);
      }
    }
    
    // Capturar screenshot
    if (params.screenshotPath) {
      await page.screenshot({ path: params.screenshotPath as any, fullPage: true });
    }
    
    const currentUrl = await page.url();
    
    console.log(`✅ TheCryptoFrontier explorado com sucesso!`);
    
    return successResponse({
      section: params.section || 'home',
      currentUrl,
      pageInfo,
      searchTerm: params.searchTerm,
      screenshotPath: params.screenshotPath
    }, `TheCryptoFrontier seção "${params.section || 'home'}" explorada com sucesso!`);
    
  } catch (error) {
    console.error(`❌ Erro ao explorar TheCryptoFrontier:`, error);
    throw new MCPError(
      ErrorCode.PAGE_LOAD_FAILED, 
      `Falha ao explorar TheCryptoFrontier: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// STRAPI: Listar posts existentes no Strapi
export async function handleStrapiListPosts(params: {
  screenshotPath?: string,
  limit?: number
}) {
  console.log(`📋 Listando posts do Strapi`);
  
  await ensureBrowser();
  if (!page) throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');
  
  try {
    // Navegar para lista de posts
    console.log(`🌐 Navegando para lista de posts...`);
    await page.goto('https://ale-blog.agentesintegrados.com/admin/content-manager/collection-types/api::blog.blog', { 
      waitUntil: 'networkidle2',
      timeout: PAGE_TIMEOUT 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extrair informações dos posts
    const posts = await page.evaluate((limit = 10) => {
      const postElements = Array.from(document.querySelectorAll('tr, .list-item, [data-testid*="entry"]'));
      const extractedPosts = [];
      
      for (let i = 0; i < Math.min(postElements.length, limit); i++) {
        const element = postElements[i];
        if (!element) continue;
        
        const titleEl = element.querySelector('td:first-child, .title, h3, h2');
        const statusEl = element.querySelector('.status, [data-testid*="status"]');
        const dateEl = element.querySelector('.date, [data-testid*="date"]');
        
        if (titleEl) {
          extractedPosts.push({
            index: i + 1,
            title: titleEl.textContent?.trim() || '',
            status: statusEl?.textContent?.trim() || 'Desconhecido',
            date: dateEl?.textContent?.trim() || '',
            element: element.tagName
          });
        }
      }
      
      return extractedPosts;
    }, params.limit);
    
    // Capturar screenshot
    if (params.screenshotPath) {
      await page.screenshot({ path: params.screenshotPath as any, fullPage: true });
    }
    
    const currentUrl = await page.url();
    const title = await page.title();
    
    console.log(`✅ ${posts.length} posts encontrados no Strapi!`);
    
    return successResponse({
      totalPosts: posts.length,
      posts,
      currentUrl,
      title,
      screenshotPath: params.screenshotPath
    }, `${posts.length} posts listados com sucesso do Strapi!`);
    
  } catch (error) {
    console.error(`❌ Erro ao listar posts do Strapi:`, error);
    throw new MCPError(
      ErrorCode.PAGE_LOAD_FAILED, 
      `Falha ao listar posts do Strapi: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// Metadados das ferramentas Puppeteer
export const puppeteerTools = [
  {
    name: 'puppeteer_navigate',
    description: 'Navigate to a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' }
      },
      required: ['url']
    }
  },
  {
    name: 'puppeteer_screenshot',
    description: 'Take a screenshot of the current page',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to save the screenshot' },
        fullPage: { type: 'boolean', description: 'Capture full page', default: false }
      },
      required: ['path']
    }
  },
  {
    name: 'puppeteer_click',
    description: 'Click on an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element to click' }
      },
      required: ['selector']
    }
  },
  {
    name: 'puppeteer_type',
    description: 'Type text into an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element' },
        text: { type: 'string', description: 'Text to type' }
      },
      required: ['selector', 'text']
    }
  },
  {
    name: 'puppeteer_get_content',
    description: 'Get the HTML content of the current page',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'puppeteer_new_tab',
    description: 'Open URL in a new browser tab',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open in new tab' }
      },
      required: ['url']
    }
  },
  {
    name: 'open_browser',
    description: 'Open URL in the system default browser',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open in default browser' }
      },
      required: ['url']
    }
  },
  {
    name: 'puppeteer_navigate_and_screenshot',
    description: 'Navigate to URL and take screenshot in single operation',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
        path: { type: 'string', description: 'Path to save the screenshot' },
        fullPage: { type: 'boolean', description: 'Capture full page', default: false }
      },
      required: ['url', 'path']
    }
  },
  {
    name: 'strapi_login',
    description: 'Login to Strapi CMS admin panel',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email for login (optional)' },
        password: { type: 'string', description: 'Password for login (optional)' },
        screenshotPath: { type: 'string', description: 'Path to save screenshot (optional)' }
      },
      required: []
    }
  },
  {
    name: 'strapi_create_post',
    description: 'Create a new post in Strapi CMS',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Post title' },
        content: { type: 'string', description: 'Post content' },
        category: { type: 'string', description: 'Post category (optional)' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Post tags (optional)' },
        screenshotPath: { type: 'string', description: 'Path to save screenshot (optional)' }
      },
      required: ['title', 'content']
    }
  },
  {
    name: 'strapi_list_posts',
    description: 'List existing posts from Strapi CMS',
    inputSchema: {
      type: 'object',
      properties: {
        screenshotPath: { type: 'string', description: 'Path to save screenshot (optional)' },
        limit: { type: 'number', description: 'Maximum number of posts to list', default: 10 }
      },
      required: []
    }
  },
  {
    name: 'cryptofrontier_explore',
    description: 'Explore and navigate TheCryptoFrontier blog',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'string', description: 'Section to explore', enum: ['home', 'posts', 'categories', 'search'] },
        searchTerm: { type: 'string', description: 'Search term (required if section is search)' },
        screenshotPath: { type: 'string', description: 'Path to save screenshot (optional)' }
      },
      required: []
    }
  }
];