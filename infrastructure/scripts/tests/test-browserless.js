const puppeteer = require('puppeteer');

async function testBrowserless() {
  console.log('Testando com Browserless Chrome...');
  
  try {
    // Conectar ao Browserless ao invés de iniciar um browser local
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://localhost:3030'
    });
    
    console.log('Conectado ao Browserless!');
    
    const page = await browser.newPage();
    console.log('Nova página criada!');
    
    // Primeiro testar com uma página simples
    await page.goto('https://example.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('Navegou para example.com!');
    
    const exampleTitle = await page.title();
    console.log('Título do example.com:', exampleTitle);
    
    // Agora testar o site real com timeout maior
    console.log('\nTestando site The Crypto Frontier...');
    await page.goto('https://thecryptofrontier.agentesintegrados.com/', { 
      waitUntil: 'domcontentloaded', // Menos restritivo
      timeout: 60000 // 60 segundos
    });
    console.log('Navegou para o site!');
    
    const title = await page.title();
    console.log('Título da página:', title);
    
    // Capturar screenshot
    await page.screenshot({ path: 'site-screenshot.png', fullPage: true });
    console.log('Screenshot capturado!');
    
    // Verificar se tem conteúdo
    const content = await page.evaluate(() => {
      return {
        hasContent: document.body.innerText.length > 0,
        h1Text: document.querySelector('h1')?.innerText || 'Sem H1',
        linkCount: document.querySelectorAll('a').length
      };
    });
    
    console.log('Análise do site:');
    console.log('- Tem conteúdo:', content.hasContent ? 'SIM' : 'NÃO');
    console.log('- Título H1:', content.h1Text);
    console.log('- Links encontrados:', content.linkCount);
    
    await browser.close();
    console.log('Browser desconectado!');
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testBrowserless();