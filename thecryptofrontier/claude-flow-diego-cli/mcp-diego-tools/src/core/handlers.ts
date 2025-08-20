/**
 * Tool handlers extracted from main index
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import {
  NavigateParams,
  ScreenshotParams,
  ClickParams,
  TypeParams,
  ServerState,
  MCPError,
  ErrorCode
} from './types.js';
import { withTimeout, successResponse } from '../utils.js';

// ==================== Configuration ====================

const CONFIG = {
  puppeteer: {
    headless: true,
    defaultTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 800
  },
  cache: {
    ttl: 300000 // 5 minutes
  }
} as const;

// ==================== State ====================

export const state: ServerState = {
  browser: undefined,
  page: undefined,
  octokit: undefined,
  lastActivity: Date.now(),
  requestCount: 0
};


// ==================== Helper Functions ====================

export async function ensureBrowser(): Promise<{ browser: Browser; page: Page }> {
  try {
    if (!state.browser || !state.browser.isConnected()) {
      state.browser = await puppeteer.launch({
        headless: CONFIG.puppeteer.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--single-process'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
      state.page = await state.browser.newPage();
      
      await state.page.setViewport({
        width: CONFIG.puppeteer.viewportWidth,
        height: CONFIG.puppeteer.viewportHeight
      });
      
      state.page.setDefaultTimeout(CONFIG.puppeteer.defaultTimeout);
    }
    
    if (!state.page || state.page.isClosed()) {
      state.page = await state.browser.newPage();
    }
    
    state.lastActivity = Date.now();
    return { browser: state.browser, page: state.page };
  } catch (error) {
    throw new MCPError(
      ErrorCode.BROWSER_NOT_INITIALIZED,
      'Failed to initialize browser',
      error
    );
  }
}

// ==================== Puppeteer Handlers ====================

export async function handleNavigate(params: NavigateParams) {
  const { page } = await ensureBrowser();
  
  await withTimeout(
    async () => {
      await page.goto(params.url, { waitUntil: 'networkidle2' });
    },
    CONFIG.puppeteer.defaultTimeout,
    `Navigation to ${params.url} timed out`
  );
  
  return successResponse(null, `Navigated to ${params.url}`);
}

export async function handleScreenshot(params: ScreenshotParams) {
  const { page } = await ensureBrowser();
  
  let path = params.path;
  if (!path.match(/\.(png|jpg|jpeg|webp)$/i)) {
    path = `${path}.png`;
  }
  
  await page.screenshot({
    path: path as any,
    fullPage: params.fullPage
  });
  
  return successResponse({ path }, `Screenshot saved to ${path}`);
}

export async function handleClick(params: ClickParams) {
  const { page } = await ensureBrowser();
  
  await withTimeout(
    async () => {
      await page.waitForSelector(params.selector, { visible: true });
      await page.click(params.selector);
    },
    5000,
    `Element ${params.selector} not found or not clickable`
  );
  
  return successResponse(null, `Clicked on element: ${params.selector}`);
}

export async function handleType(params: TypeParams) {
  const { page } = await ensureBrowser();
  
  await withTimeout(
    async () => {
      await page.waitForSelector(params.selector, { visible: true });
      await page.type(params.selector, params.text);
    },
    5000,
    `Element ${params.selector} not found`
  );
  
  return successResponse(null, `Typed text into element: ${params.selector}`);
}

export async function handleGetContent() {
  const { page } = await ensureBrowser();
  const content = await page.content();
  return successResponse(content);
}

