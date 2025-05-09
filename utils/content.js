/**
 * Este arquivo existe para manter compatibilidade com a regra 02-roteamento.
 * Reexporta as funções de src/utils/local-content.ts
 */

// Importar o módulo principal de processamento de conteúdo
const { allContent } = require('../src/utils/local-content');

/**
 * Exportar as funções para processamento de conteúdo Markdown
 */
module.exports = {
  allContent,
  // Outras funções podem ser adicionadas conforme necessário
}; 