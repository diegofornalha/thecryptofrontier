#!/usr/bin/env node

/**
 * Script simplificado para publicar artigos no Strapi
 * Uso: node publish-article.js <arquivo.md>
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const contentManager = require('./strapi-content-manager').default;

async function publishArticle(filePath) {
  console.log(chalk.blue('📝 Publicando artigo no Strapi...'));
  
  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.error(chalk.red('❌ Arquivo não encontrado:', filePath));
      process.exit(1);
    }

    // Publica o artigo
    const result = await contentManager.publishArticleFromMarkdown(filePath, {
      draft: false,
      createCategory: true, // Cria categoria automaticamente se não existir
      authorId: 1 // ID padrão do autor (ajuste conforme necessário)
    });

    console.log(chalk.green('✅ Artigo publicado com sucesso!'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.bold('ID:'), result.post.id);
    console.log(chalk.bold('Título:'), result.post.attributes.title);
    console.log(chalk.bold('Slug:'), result.post.attributes.slug);
    console.log(chalk.bold('URL:'), chalk.cyan(result.url));
    console.log(chalk.gray('─'.repeat(60)));

  } catch (error) {
    console.error(chalk.red('❌ Erro ao publicar artigo:'), error.message);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log(chalk.yellow('Uso: node publish-article.js <arquivo.md>'));
    console.log(chalk.gray('Exemplo: node publish-article.js artigo.md'));
    process.exit(1);
  }

  publishArticle(filePath);
}

module.exports = publishArticle;