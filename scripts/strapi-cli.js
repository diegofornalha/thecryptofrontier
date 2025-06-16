#!/usr/bin/env node

/**
 * CLI para gerenciar conteúdo do Strapi via API REST
 * Permite criar, atualizar, listar e deletar conteúdo sem usar o CMS
 */

const { program } = require('commander');
const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
require('dotenv').config();

// Configuração do cliente API
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const api = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  }
});

// Helpers
const log = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
};

// Função para criar um novo post
async function createPost(options) {
  try {
    const postData = {
      data: {
        title: options.title,
        content: options.content || '',
        slug: options.slug || options.title.toLowerCase().replace(/\s+/g, '-'),
        excerpt: options.excerpt || '',
        publishedAt: options.publish ? new Date() : null,
        seo: {
          metaTitle: options.metaTitle || options.title,
          metaDescription: options.metaDescription || options.excerpt || ''
        }
      }
    };

    const response = await api.post('/api/posts', postData);
    
    log.success(`Post criado com sucesso! ID: ${response.data.data.id}`);
    if (options.json) {
      console.log(JSON.stringify(response.data.data, null, 2));
    }
    
    return response.data.data;
  } catch (error) {
    log.error(`Erro ao criar post: ${error.response?.data?.error?.message || error.message}`);
    process.exit(1);
  }
}

// Função para listar posts
async function listPosts(options) {
  try {
    const params = {
      'pagination[page]': options.page || 1,
      'pagination[pageSize]': options.limit || 10,
      'sort': options.sort || 'publishedAt:desc',
      'populate': options.populate || 'author'
    };

    if (options.search) {
      params['filters[title][$containsi]'] = options.search;
    }

    const response = await api.get('/api/posts', { params });
    const { data, meta } = response.data;

    if (options.json) {
      console.log(JSON.stringify({ data, meta }, null, 2));
      return;
    }

    log.info(`Total de posts: ${meta.pagination.total}`);
    console.log(chalk.gray('─'.repeat(80)));

    data.forEach(post => {
      console.log(chalk.bold(`${post.id}. ${post.attributes.title}`));
      console.log(chalk.gray(`   Slug: ${post.attributes.slug}`));
      console.log(chalk.gray(`   Publicado: ${post.attributes.publishedAt || 'Rascunho'}`));
      console.log(chalk.gray('─'.repeat(80)));
    });

    if (meta.pagination.pageCount > 1) {
      log.info(`Página ${meta.pagination.page} de ${meta.pagination.pageCount}`);
    }
  } catch (error) {
    log.error(`Erro ao listar posts: ${error.response?.data?.error?.message || error.message}`);
    process.exit(1);
  }
}

// Função para atualizar um post
async function updatePost(id, options) {
  try {
    const updateData = { data: {} };

    if (options.title) updateData.data.title = options.title;
    if (options.content) updateData.data.content = options.content;
    if (options.slug) updateData.data.slug = options.slug;
    if (options.excerpt) updateData.data.excerpt = options.excerpt;
    if (options.publish !== undefined) {
      updateData.data.publishedAt = options.publish ? new Date() : null;
    }

    const response = await api.put(`/api/posts/${id}`, updateData);
    
    log.success(`Post ${id} atualizado com sucesso!`);
    if (options.json) {
      console.log(JSON.stringify(response.data.data, null, 2));
    }
  } catch (error) {
    log.error(`Erro ao atualizar post: ${error.response?.data?.error?.message || error.message}`);
    process.exit(1);
  }
}

// Função para deletar um post
async function deletePost(id, options) {
  try {
    if (!options.force) {
      const answers = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Tem certeza que deseja deletar o post ${id}?`,
        default: false
      }]);

      if (!answers.confirm) {
        log.warn('Operação cancelada');
        return;
      }
    }

    await api.delete(`/api/posts/${id}`);
    log.success(`Post ${id} deletado com sucesso!`);
  } catch (error) {
    log.error(`Erro ao deletar post: ${error.response?.data?.error?.message || error.message}`);
    process.exit(1);
  }
}

// Função para importar posts de um arquivo
async function importPosts(filePath) {
  try {
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
    const posts = JSON.parse(fileContent);

    if (!Array.isArray(posts)) {
      log.error('O arquivo deve conter um array de posts');
      process.exit(1);
    }

    log.info(`Importando ${posts.length} posts...`);

    for (const post of posts) {
      try {
        await createPost({
          title: post.title,
          content: post.content,
          slug: post.slug,
          excerpt: post.excerpt,
          publish: post.publish !== false,
          metaTitle: post.seo?.metaTitle,
          metaDescription: post.seo?.metaDescription
        });
      } catch (error) {
        log.error(`Erro ao importar post "${post.title}": ${error.message}`);
      }
    }

    log.success('Importação concluída!');
  } catch (error) {
    log.error(`Erro ao importar posts: ${error.message}`);
    process.exit(1);
  }
}

// Função para publicar o artigo do arquivo markdown
async function publishArticle(filePath, options) {
  try {
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
    
    // Parse do arquivo markdown
    const titleMatch = fileContent.match(/^## Título:\s*(.+)$/m);
    const slugMatch = fileContent.match(/^## Slug:\s*(.+)$/m);
    const resumoMatch = fileContent.match(/^## Resumo:\s*(.+)$/m);
    const tagsMatch = fileContent.match(/^## Tags:\s*(.+)$/m);
    const seoTitleMatch = fileContent.match(/Meta Título:\s*(.+)$/m);
    const seoDescMatch = fileContent.match(/Meta Descrição:\s*(.+)$/m);
    
    // Extrai o conteúdo após "## CONTEÚDO COMPLETO:"
    const contentMatch = fileContent.match(/## CONTEÚDO COMPLETO:\s*([\s\S]+)$/);
    
    if (!titleMatch || !contentMatch) {
      log.error('Arquivo inválido. Certifique-se de que contém Título e Conteúdo.');
      process.exit(1);
    }

    const postData = {
      title: titleMatch[1],
      slug: slugMatch ? slugMatch[1] : titleMatch[1].toLowerCase().replace(/\s+/g, '-'),
      content: contentMatch[1].trim(),
      excerpt: resumoMatch ? resumoMatch[1] : '',
      publish: !options.draft,
      metaTitle: seoTitleMatch ? seoTitleMatch[1] : titleMatch[1],
      metaDescription: seoDescMatch ? seoDescMatch[1] : (resumoMatch ? resumoMatch[1] : '')
    };

    log.info(`Publicando artigo: ${postData.title}`);
    
    const result = await createPost(postData);
    
    log.success(`Artigo publicado com sucesso!`);
    log.info(`URL: ${STRAPI_URL}/blog/${postData.slug}`);
    
  } catch (error) {
    log.error(`Erro ao publicar artigo: ${error.message}`);
    process.exit(1);
  }
}

// Configuração do CLI
program
  .name('strapi-cli')
  .description('CLI para gerenciar conteúdo do Strapi via API REST')
  .version('1.0.0');

// Comando: criar post
program
  .command('create')
  .description('Criar um novo post')
  .requiredOption('-t, --title <title>', 'Título do post')
  .option('-c, --content <content>', 'Conteúdo do post')
  .option('-s, --slug <slug>', 'Slug do post')
  .option('-e, --excerpt <excerpt>', 'Resumo do post')
  .option('-p, --publish', 'Publicar imediatamente', false)
  .option('--meta-title <title>', 'SEO meta title')
  .option('--meta-description <desc>', 'SEO meta description')
  .option('--json', 'Retornar resultado em JSON')
  .action(createPost);

// Comando: listar posts
program
  .command('list')
  .description('Listar posts')
  .option('-p, --page <page>', 'Número da página', '1')
  .option('-l, --limit <limit>', 'Posts por página', '10')
  .option('-s, --search <search>', 'Buscar por título')
  .option('--sort <sort>', 'Ordenação (ex: publishedAt:desc)')
  .option('--populate <fields>', 'Campos para popular')
  .option('--json', 'Retornar resultado em JSON')
  .action(listPosts);

// Comando: atualizar post
program
  .command('update <id>')
  .description('Atualizar um post existente')
  .option('-t, --title <title>', 'Novo título')
  .option('-c, --content <content>', 'Novo conteúdo')
  .option('-s, --slug <slug>', 'Novo slug')
  .option('-e, --excerpt <excerpt>', 'Novo resumo')
  .option('-p, --publish', 'Publicar o post')
  .option('-u, --unpublish', 'Despublicar o post')
  .option('--json', 'Retornar resultado em JSON')
  .action((id, options) => {
    if (options.unpublish) options.publish = false;
    updatePost(id, options);
  });

// Comando: deletar post
program
  .command('delete <id>')
  .description('Deletar um post')
  .option('-f, --force', 'Deletar sem confirmação')
  .action(deletePost);

// Comando: importar posts
program
  .command('import <file>')
  .description('Importar posts de um arquivo JSON')
  .action(importPosts);

// Comando: publicar artigo do markdown
program
  .command('publish <file>')
  .description('Publicar artigo de um arquivo markdown')
  .option('-d, --draft', 'Salvar como rascunho')
  .action(publishArticle);

// Comando: configurar token
program
  .command('config')
  .description('Configurar token de API')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'URL do Strapi:',
        default: STRAPI_URL
      },
      {
        type: 'password',
        name: 'token',
        message: 'Token da API:',
        mask: '*'
      }
    ]);

    const envPath = path.resolve('.env.local');
    const envContent = `
NEXT_PUBLIC_STRAPI_URL=${answers.url}
STRAPI_API_TOKEN=${answers.token}
`;

    fs.appendFileSync(envPath, envContent);
    log.success('Configuração salva em .env.local');
  });

program.parse();