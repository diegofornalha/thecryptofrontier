#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Aplicando patch para resolver problema do preloadModule...');

// Função para modificar os arquivos que possam ter problema com preloadModule
function applyPatchToFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Verifica se o arquivo contém a importação problemática
  if (content.includes(`import { preloadModule } from 'react-dom'`)) {
    console.log(`Aplicando patch em: ${filePath}`);
    
    // Substitui a importação problemática com nosso fallback
    content = content.replace(
      `import { preloadModule } from 'react-dom'`,
      `// import { preloadModule } from 'react-dom'
// Usando fallback para preloadModule
const preloadModule = (mod) => {
  console.warn('Usando fallback para preloadModule');
  return mod;
};`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Patch aplicado com sucesso em: ${filePath}`);
  }
}

// Procurando em arquivos relevantes no diretório .next
const nextDir = path.join(__dirname, '.next');
const serverDir = path.join(nextDir, 'server');

// Aplicar patch em arquivos específicos
if (fs.existsSync(serverDir)) {
  // Procura por arquivos relacionados ao studio.js no diretório server
  fs.readdirSync(serverDir, { recursive: true }).forEach(file => {
    if (file.includes('studio') && file.endsWith('.js')) {
      applyPatchToFile(path.join(serverDir, file));
    }
  });
}

console.log('Processo de patch concluído.'); 