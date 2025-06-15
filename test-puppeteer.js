const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('Testando Puppeteer...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--single-process'
      ]
    });
    
    console.log('Browser iniciado!');
    
    const page = await browser.newPage();
    console.log('Nova página criada!');
    
    await page.goto('https://thecryptofrontier.agentesintegrados.com/', { 
      waitUntil: 'networkidle2' 
    });
    console.log('Navegou para o site!');
    
    const title = await page.title();
    console.log('Título da página:', title);
    
    const isWorking = await page.evaluate(() => {
      return document.body.innerText.length > 0;
    });
    
    console.log('Site funcionando:', isWorking ? 'SIM' : 'NÃO');
    
    await browser.close();
    console.log('Browser fechado!');
    
  } catch (error) {
    console.error('Erro no Puppeteer:', error.message);
  }
}

testPuppeteer();