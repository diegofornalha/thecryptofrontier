// Script para mostrar a configuração atual
const config = require('./config');
const colors = require('./colors');

console.log(`${colors.magenta}${colors.bold} CONFIGURAÇÃO ATUAL DO SISTEMA ${colors.reset}`);
console.log(`${colors.blue}---------------------------------------------${colors.reset}\n`);

// Mostrar configuração do autor
console.log(`${colors.cyan}${colors.bold}=== Autor Padrão ===${colors.reset}`);
console.log(`${colors.blue}ID: ${colors.reset}${config.autor.id}`);
console.log(`${colors.blue}Nome: ${colors.reset}${config.autor.nome}\n`);

// Mostrar diretórios
console.log(`${colors.cyan}${colors.bold}=== Diretórios ===${colors.reset}`);
Object.entries(config.diretorios).forEach(([chave, valor]) => {
  console.log(`${colors.blue}${chave}: ${colors.reset}${valor}`);
});
console.log();

// Mostrar categorias
console.log(`${colors.cyan}${colors.bold}=== Categorias ===${colors.reset}`);
Object.entries(config.categorias).forEach(([chave, valor]) => {
  console.log(`${colors.blue}${chave}: ${colors.reset}${valor}`);
});

console.log(`\n${colors.blue}---------------------------------------------${colors.reset}`);
console.log(`${colors.green}Para alterar esta configuração, edite o arquivo: ${colors.reset}utils/config.js`);
console.log(`${colors.green}Para listar autores disponíveis, execute: ${colors.reset}node utils/listar-autores.js`); 