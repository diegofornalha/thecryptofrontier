const fs = require('fs');
const path = require('path');

// Caminho para o arquivo problemático
const filePath = path.resolve('./node_modules/@strapi/client/dist/index.cjs');

// Verificar se o arquivo existe
if (!fs.existsSync(filePath)) {
  console.error('Arquivo não encontrado:', filePath);
  process.exit(1);
}

// Ler o conteúdo do arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Substituir o require('nanoid') por uma alternativa mais completa
content = content.replace(
  "nanoid = require(\"nanoid\")",
  `nanoid = {
    nanoid: () => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10),
    customAlphabet: (alphabet, size) => {
      return () => {
        let id = '';
        const alphabetLength = alphabet.length;
        for (let i = 0; i < (size || 21); i++) {
          id += alphabet.charAt(Math.floor(Math.random() * alphabetLength));
        }
        return id;
      };
    }
  }`
);

// Escrever o conteúdo modificado de volta para o arquivo
fs.writeFileSync(filePath, content);

console.log('Patch aplicado com sucesso ao arquivo:', filePath); 