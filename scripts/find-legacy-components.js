const glob = require('glob');
const fs = require('fs');
const path = require('path');

// Padrões para identificar componentes legados (com classes sb-*)
const LEGACY_PATTERNS = [
  /sb-component/,
  /sb-[a-z-]+/,
  /className={classNames\(/
];

// Buscar arquivos
const files = glob.sync('src/**/*.{jsx,tsx}');

// Resultados
const legacyComponents = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const matches = lines.filter(line => 
    LEGACY_PATTERNS.some(pattern => pattern.test(line))
  );
  
  if (matches.length > 0) {
    legacyComponents[file] = matches.length;
  }
});

console.log('Componentes legados encontrados:');
console.log(legacyComponents);
console.log(`Total: ${Object.keys(legacyComponents).length} arquivos`); 