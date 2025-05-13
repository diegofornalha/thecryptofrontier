// Script para alterar autor padrão
const fs = require('fs');
const path = require('path');
const colors = require('./colors');
const config = require('./config');

console.log(`${colors.magenta}${colors.bold} ALTERAÇÃO DE AUTOR PADRÃO ${colors.reset}`);
console.log(`${colors.blue}---------------------------------------------${colors.reset}\n`);

// Verificar argumentos
const authorId = process.argv[2];
const authorName = process.argv[3];

if (!authorId || !authorName) {
  console.log(`${colors.red}Uso correto: node utils/alterar-autor.js <ID_DO_AUTOR> "<NOME_DO_AUTOR>"${colors.reset}`);
  console.log(`\n${colors.cyan}Exemplo:${colors.reset}`);
  console.log(`node utils/alterar-autor.js ca38a3d5-cba1-47a0-aa29-4af17a15e17c "Alexandre Bianchi"`);
  console.log(`node utils/alterar-autor.js 8pYdfL3aL47Vbm89ptixRC "The Crypto Frontier"`);
  
  console.log(`\n${colors.cyan}${colors.bold}=== Autor Atual ===${colors.reset}`);
  console.log(`${colors.blue}ID: ${colors.reset}${config.autor.id}`);
  console.log(`${colors.blue}Nome: ${colors.reset}${config.autor.nome}`);
  
  console.log(`\n${colors.cyan}Dica:${colors.reset} Execute ${colors.yellow}node utils/listar-autores.js${colors.reset} para ver os autores disponíveis.`);
  process.exit(1);
}

// Caminho para o arquivo de configuração
const configPath = path.join(__dirname, 'config.js');

// Ler o conteúdo atual do arquivo
let configContent = fs.readFileSync(configPath, 'utf8');

// Criar regex para substituir os valores
const idRegex = /(id:\s*['"])([^'"]+)(['"])/;
const nomeRegex = /(nome:\s*['"])([^'"]+)(['"])/;

// Substituir os valores
configContent = configContent.replace(idRegex, `$1${authorId}$3`);
configContent = configContent.replace(nomeRegex, `$1${authorName}$3`);

// Escrever o arquivo atualizado
fs.writeFileSync(configPath, configContent, 'utf8');

console.log(`${colors.green}✓ Autor padrão alterado com sucesso!${colors.reset}`);
console.log(`\n${colors.cyan}${colors.bold}=== Novo Autor Padrão ===${colors.reset}`);
console.log(`${colors.blue}ID: ${colors.reset}${authorId}`);
console.log(`${colors.blue}Nome: ${colors.reset}${authorName}`);

console.log(`\n${colors.cyan}Dica:${colors.reset} Execute ${colors.yellow}node utils/mostrar-config.js${colors.reset} para conferir a configuração completa.`); 