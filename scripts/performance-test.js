const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse('http://localhost:3000/component-lab', options);
  const reportHtml = runnerResult.report;
  
  fs.writeFileSync('performance-report.html', reportHtml);
  
  console.log('Relatório gerado:', runnerResult.lhr.categories.performance.score * 100);
  
  await chrome.kill();
}

runLighthouse(); 