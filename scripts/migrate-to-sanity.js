// Script para migrar dados do sistema de arquivos para o Sanity
require('dotenv').config();
const { migrateAllData } = require('../lib/sanity/migrate');

// Função principal para executar a migração
async function main() {
  try {
    console.log('=========================');
    console.log('Migrando dados para Sanity');
    console.log('=========================');

    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      console.error('ERRO: NEXT_PUBLIC_SANITY_PROJECT_ID não definido. Por favor, configure seu .env');
      process.exit(1);
    }

    if (!process.env.SANITY_DEV_TOKEN) {
      console.error('ERRO: SANITY_DEV_TOKEN não definido. Por favor, configure seu .env');
      process.exit(1);
    }

    // Executar migração
    await migrateAllData();

    console.log('=========================');
    console.log('Migração concluída!');
    console.log('=========================');
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  }
}

// Executar função principal
main(); 