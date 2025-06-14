#!/usr/bin/env node

/**
 * Script de Migração Strapi → Strapi
 * Migra posts, páginas e autores do Strapi CMS para Strapi
 */

const axios = require('axios');
const { createClient } = require('@strapi/client');
require('dotenv').config();

// Configurações
const strapi_PROJECT_ID = process.env.NEXT_PUBLIC_strapi_PROJECT_ID || process.env.strapi_PROJECT_ID;
const strapi_DATASET = process.env.NEXT_PUBLIC_strapi_DATASET || 'production';
const strapi_API_TOKEN = process.env.strapi_API_TOKEN;

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Cliente Strapi
const strapiClient = createClient({
  projectId: strapi_PROJECT_ID,
  dataset: strapi_DATASET,
  token: strapi_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
});

// Helpers
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function convertPortableTextToHTML(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks
    .map(block => {
      if (block._type === 'block') {
        const style = block.style || 'normal';
        const text = block.children
          .map(child => {
            let content = child.text || '';
            if (child.marks && child.marks.length > 0) {
              child.marks.forEach(mark => {
                switch(mark) {
                  case 'strong':
                    content = `<strong>${content}</strong>`;
                    break;
                  case 'em':
                    content = `<em>${content}</em>`;
                    break;
                  case 'code':
                    content = `<code>${content}</code>`;
                    break;
                }
              });
            }
            return content;
          })
          .join('');
        
        switch(style) {
          case 'h1':
            return `<h1>${text}</h1>`;
          case 'h2':
            return `<h2>${text}</h2>`;
          case 'h3':
            return `<h3>${text}</h3>`;
          case 'h4':
            return `<h4>${text}</h4>`;
          case 'blockquote':
            return `<blockquote>${text}</blockquote>`;
          default:
            return `<p>${text}</p>`;
        }
      }
      return '';
    })
    .join('\n');
}// Função principal de migração
async function migrate() {
  console.log('🚀 Iniciando migração Strapi → Strapi...\n');
  
  try {
    // 1. Migrar Autores
    console.log('📥 Migrando autores...');
    await migrateAuthors();
    
    // 2. Migrar Posts
    console.log('\n📥 Migrando posts...');
    await migratePosts();
    
    // 3. Migrar Páginas
    console.log('\n📥 Migrando páginas...');
    await migratePages();
    
    console.log('\n✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro fatal na migração:', error);
    process.exit(1);
  }
}

// Migrar Autores
async function migrateAuthors() {
  const authors = await strapiClient.fetch(`
    *[_type == "author"] {
      _id,
      name,
      slug,
      bio,
      "imageUrl": image.asset->url
    }
  `);
  
  console.log(`Encontrados ${authors.length} autores`);
  
  for (const author of authors) {
    try {
      const strapiData = {
        name: author.name,
        slug: author.slug?.current || generateSlug(author.name),
        bio: author.bio || '',
        strapiId: author._id
      };
      
      // Criar autor no Strapi
      await axios.post(
        `${STRAPI_URL}/api/authors`,
        { data: strapiData },
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Autor migrado: ${author.name}`);
    } catch (error) {
      console.error(`❌ Erro ao migrar autor ${author.name}:`, error.response?.data || error.message);
    }
  }
}// Migrar Posts
async function migratePosts() {
  const posts = await strapiClient.fetch(`
    *[_type == "post"] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      content,
      "imageUrl": mainImage.asset->url,
      "categories": categories[]->title,
      "author": author->name,
      originalSource
    }
  `);
  
  console.log(`Encontrados ${posts.length} posts`);
  
  let migrated = 0;
  let failed = 0;
  
  for (const post of posts) {
    try {
      // Converter conteúdo
      const htmlContent = convertPortableTextToHTML(post.content);
      
      const strapiData = {
        title: post.title,
        slug: post.slug?.current || generateSlug(post.title),
        content: htmlContent,
        excerpt: post.excerpt || '',
        publishedAt: post.publishedAt || new Date().toISOString(),
        status: 'published',
        categories: post.categories || [],
        tags: [],
        originalSource: post.originalSource || {
          site: 'Strapi CMS',
          id: post._id
        },
        strapiId: post._id
      };
      
      // Criar post no Strapi
      const response = await axios.post(
        `${STRAPI_URL}/api/posts`,
        { data: strapiData },
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Post migrado: ${post.title}`);
      migrated++;
      
    } catch (error) {
      console.error(`❌ Erro ao migrar post ${post.title}:`, error.response?.data || error.message);
      failed++;
    }
  }
  
  console.log(`\nResumo: ${migrated} posts migrados, ${failed} falharam`);
}// Migrar Páginas
async function migratePages() {
  const pages = await strapiClient.fetch(`
    *[_type == "page"] {
      _id,
      title,
      slug,
      content,
      seo
    }
  `);
  
  console.log(`Encontradas ${pages.length} páginas`);
  
  for (const page of pages) {
    try {
      const htmlContent = convertPortableTextToHTML(page.content);
      
      const strapiData = {
        title: page.title,
        slug: page.slug?.current || generateSlug(page.title),
        content: htmlContent,
        seo: page.seo || {},
        strapiId: page._id
      };
      
      // Criar página no Strapi
      await axios.post(
        `${STRAPI_URL}/api/pages`,
        { data: strapiData },
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Página migrada: ${page.title}`);
    } catch (error) {
      console.error(`❌ Erro ao migrar página ${page.title}:`, error.response?.data || error.message);
    }
  }
}

// Executar migração
if (require.main === module) {
  migrate();
}