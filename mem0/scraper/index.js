const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const TurndownService = require('turndown');
const axios = require('axios');
const PQueue = require('p-queue').default;

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Configuration
const DOCS_URL = process.env.DOCS_URL || 'https://docs.mem0.ai';
const CACHE_DIR = process.env.CACHE_DIR || '/app/docs-cache';
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || '0 */6 * * *'; // Every 6 hours
const DATABASE_URL = process.env.DATABASE_URL;
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

// Database connection
async function getDbClient() {
  const client = new Client({
    connectionString: DATABASE_URL
  });
  await client.connect();
  return client;
}

// Initialize database schema
async function initDatabase() {
  const client = await getDbClient();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS documentation_pages (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        title TEXT,
        content TEXT,
        markdown TEXT,
        hash TEXT,
        last_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documentation_pages_url ON documentation_pages(url);
      CREATE INDEX IF NOT EXISTS idx_documentation_pages_hash ON documentation_pages(hash);
    `);
    
    console.log('Database initialized');
  } finally {
    await client.end();
  }
}

// Get content hash
function getContentHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Scrape a single page
async function scrapePage(browser, url) {
  const page = await browser.newPage();
  
  try {
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for main content to load
    await page.waitForSelector('main', { timeout: 10000 });
    
    // Get page content
    const pageData = await page.evaluate(() => {
      const title = document.querySelector('h1')?.textContent || document.title;
      const main = document.querySelector('main');
      const content = main ? main.innerHTML : document.body.innerHTML;
      
      // Get all links for crawling
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href.startsWith(window.location.origin));
      
      return {
        title,
        content,
        links
      };
    });
    
    // Convert HTML to Markdown
    const markdown = turndownService.turndown(pageData.content);
    
    return {
      url,
      title: pageData.title,
      content: pageData.content,
      markdown,
      links: pageData.links
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  } finally {
    await page.close();
  }
}

// Save page to database
async function savePage(client, pageData) {
  const hash = getContentHash(pageData.content);
  
  try {
    await client.query(`
      INSERT INTO documentation_pages (url, title, content, markdown, hash, last_scraped)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (url) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        markdown = EXCLUDED.markdown,
        hash = EXCLUDED.hash,
        last_scraped = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE documentation_pages.hash != EXCLUDED.hash
    `, [pageData.url, pageData.title, pageData.content, pageData.markdown, hash]);
    
    console.log(`Saved: ${pageData.url}`);
  } catch (error) {
    console.error(`Error saving page ${pageData.url}:`, error);
  }
}

// Save to local cache
async function saveToCache(pageData) {
  const urlHash = crypto.createHash('md5').update(pageData.url).digest('hex');
  const filePath = path.join(CACHE_DIR, `${urlHash}.json`);
  
  const cacheData = {
    url: pageData.url,
    title: pageData.title,
    markdown: pageData.markdown,
    scraped_at: new Date().toISOString()
  };
  
  await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
}

// Update vector store with embeddings
async function updateVectorStore(pageData) {
  try {
    // Create chunks from the markdown content
    const chunks = createChunks(pageData.markdown, 1000);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${crypto.createHash('md5').update(pageData.url).digest('hex')}_${i}`;
      
      // Call Mem0 API to create memory from documentation
      await axios.post(`${QDRANT_URL}/collections/documentation/points`, {
        points: [{
          id: chunkId,
          payload: {
            url: pageData.url,
            title: pageData.title,
            content: chunk,
            chunk_index: i,
            total_chunks: chunks.length,
            source: 'documentation',
            created_at: new Date().toISOString()
          }
        }]
      });
    }
    
    console.log(`Updated vector store for: ${pageData.url}`);
  } catch (error) {
    console.error(`Error updating vector store for ${pageData.url}:`, error);
  }
}

// Create text chunks
function createChunks(text, maxLength) {
  const chunks = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '.';
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Main scraping function
async function scrapeDocumentation() {
  console.log('Starting documentation scrape...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  const client = await getDbClient();
  const queue = new PQueue({ concurrency: 3 });
  
  try {
    const visited = new Set();
    const toVisit = [DOCS_URL];
    
    while (toVisit.length > 0) {
      const url = toVisit.pop();
      
      if (visited.has(url)) continue;
      visited.add(url);
      
      queue.add(async () => {
        console.log(`Scraping: ${url}`);
        const pageData = await scrapePage(browser, url);
        
        if (pageData) {
          // Save to database
          await savePage(client, pageData);
          
          // Save to cache
          await saveToCache(pageData);
          
          // Update vector store
          await updateVectorStore(pageData);
          
          // Add new links to visit
          pageData.links.forEach(link => {
            if (!visited.has(link) && link.startsWith(DOCS_URL)) {
              toVisit.push(link);
            }
          });
        }
      });
      
      // Limit queue size
      if (queue.size > 50) {
        await queue.onEmpty();
      }
    }
    
    await queue.onIdle();
    console.log('Documentation scrape completed');
    
  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
    await client.end();
  }
}

// Export scraped data for API access
async function exportScrapedData() {
  const client = await getDbClient();
  
  try {
    const result = await client.query(`
      SELECT url, title, markdown, last_scraped
      FROM documentation_pages
      ORDER BY last_scraped DESC
    `);
    
    const exportPath = path.join(CACHE_DIR, 'documentation_export.json');
    await fs.writeFile(exportPath, JSON.stringify(result.rows, null, 2));
    
    console.log(`Exported ${result.rows.length} documentation pages`);
  } finally {
    await client.end();
  }
}

// Main function
async function main() {
  await ensureCacheDir();
  await initDatabase();
  
  // Run initial scrape
  await scrapeDocumentation();
  await exportScrapedData();
  
  // Schedule periodic updates
  if (UPDATE_INTERVAL !== 'once') {
    console.log(`Scheduling documentation updates: ${UPDATE_INTERVAL}`);
    cron.schedule(UPDATE_INTERVAL, async () => {
      console.log('Running scheduled documentation update...');
      await scrapeDocumentation();
      await exportScrapedData();
    });
  }
}

// Start the scraper
main().catch(console.error);