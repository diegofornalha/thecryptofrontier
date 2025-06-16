#!/usr/bin/env node

/**
 * 🧪 Script de Teste e Validação da Configuração i18n
 * Baseado na documentação oficial do Strapi v5
 */

const chalk = require('chalk');

// Configurações de teste
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Lista de locales configurados
const LOCALES = ['en', 'pt-BR', 'es'];

/**
 * Testa se o endpoint da API REST está funcionando com i18n
 */
async function testRESTAPI() {
  console.log(chalk.blue('\n🔗 Testando REST API com i18n...'));
  
  for (const locale of LOCALES) {
    try {
      const url = `${STRAPI_URL}/api/posts?locale=${locale}&populate=*`;
      console.log(chalk.gray(`  Testando: ${url}`));
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(chalk.green(`  ✅ Locale ${locale}: ${data.data?.length || 0} posts encontrados`));
        
        // Verificar se o campo locale está presente
        if (data.data && data.data.length > 0) {
          const hasLocaleField = data.data[0].attributes?.locale || data.data[0].locale;
          if (hasLocaleField) {
            console.log(chalk.green(`    📍 Campo locale presente: ${hasLocaleField}`));
          } else {
            console.log(chalk.yellow(`    ⚠️  Campo locale não encontrado na resposta`));
          }
        }
      } else {
        console.log(chalk.red(`  ❌ Erro ${response.status}: ${response.statusText}`));
      }
    } catch (error) {
      console.log(chalk.red(`  ❌ Erro na requisição para ${locale}: ${error.message}`));
    }
  }
}

/**
 * Testa se o endpoint GraphQL está funcionando com i18n
 */
async function testGraphQLAPI() {
  console.log(chalk.blue('\n🔗 Testando GraphQL API com i18n...'));
  
  const query = `
    query TestI18N($locale: I18NLocaleCode) {
      posts(locale: $locale) {
        documentId
        title
        locale
      }
    }
  `;
  
  for (const locale of LOCALES) {
    try {
      console.log(chalk.gray(`  Testando GraphQL com locale: ${locale}`));
      
      const response = await fetch(`${STRAPI_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          query,
          variables: { locale }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.errors) {
          console.log(chalk.red(`  ❌ Erro GraphQL: ${data.errors[0].message}`));
        } else {
          const posts = data.data?.posts || [];
          console.log(chalk.green(`  ✅ Locale ${locale}: ${posts.length} posts encontrados`));
          
          // Verificar se o campo locale está presente
          if (posts.length > 0 && posts[0].locale) {
            console.log(chalk.green(`    📍 Campo locale presente: ${posts[0].locale}`));
          }
        }
      } else {
        console.log(chalk.red(`  ❌ Erro HTTP ${response.status}: ${response.statusText}`));
      }
    } catch (error) {
      console.log(chalk.red(`  ❌ Erro na requisição GraphQL para ${locale}: ${error.message}`));
    }
  }
}

/**
 * Testa a criação de conteúdo em diferentes locales
 */
async function testContentCreation() {
  console.log(chalk.blue('\n✏️  Testando criação de conteúdo com i18n...'));
  
  const testPost = {
    title: 'Test Post i18n',
    content: 'Conteúdo de teste para verificar i18n',
    excerpt: 'Resumo do post de teste'
  };
  
  for (const locale of LOCALES) {
    try {
      console.log(chalk.gray(`  Criando post de teste em ${locale}...`));
      
      const response = await fetch(`${STRAPI_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          data: {
            ...testPost,
            title: `${testPost.title} - ${locale}`,
            locale
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(chalk.green(`  ✅ Post criado em ${locale}: ID ${data.data.id}`));
        
        // Verificar locale do post criado
        const createdLocale = data.data.attributes?.locale || data.data.locale;
        if (createdLocale === locale) {
          console.log(chalk.green(`    📍 Locale correto: ${createdLocale}`));
        } else {
          console.log(chalk.yellow(`    ⚠️  Locale esperado: ${locale}, recebido: ${createdLocale}`));
        }
      } else {
        const errorData = await response.json();
        console.log(chalk.red(`  ❌ Erro ${response.status}: ${errorData.error?.message || response.statusText}`));
      }
    } catch (error) {
      console.log(chalk.red(`  ❌ Erro ao criar post em ${locale}: ${error.message}`));
    }
  }
}

/**
 * Verifica a configuração dos plugins
 */
async function checkPluginConfiguration() {
  console.log(chalk.blue('\n⚙️  Verificando configuração dos plugins...'));
  
  try {
    // Verificar se o GraphQL playground está acessível
    const graphqlResponse = await fetch(`${STRAPI_URL}/graphql`);
    if (graphqlResponse.ok) {
      console.log(chalk.green('  ✅ Plugin GraphQL configurado'));
    } else {
      console.log(chalk.red('  ❌ Plugin GraphQL não está acessível'));
    }
    
    // Verificar se a API REST está respondendo
    const restResponse = await fetch(`${STRAPI_URL}/api/posts`);
    if (restResponse.status === 200 || restResponse.status === 403) {
      console.log(chalk.green('  ✅ API REST está funcionando'));
    } else {
      console.log(chalk.red('  ❌ API REST não está respondendo corretamente'));
    }
    
  } catch (error) {
    console.log(chalk.red(`  ❌ Erro ao verificar plugins: ${error.message}`));
  }
}

/**
 * Verifica se os content types estão configurados com i18n
 */
async function checkContentTypeConfiguration() {
  console.log(chalk.blue('\n📋 Verificando configuração dos Content Types...'));
  
  try {
    // Teste básico para ver se o locale está sendo aceito nas queries
    const response = await fetch(`${STRAPI_URL}/api/posts?locale=en`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (response.ok) {
      console.log(chalk.green('  ✅ Content Type Post aceita parâmetro locale'));
    } else if (response.status === 400) {
      console.log(chalk.red('  ❌ Content Type Post não está configurado para i18n'));
    } else {
      console.log(chalk.yellow(`  ⚠️  Status ${response.status}: Verifique autenticação`));
    }
    
    // Verificar content type Article também
    const articleResponse = await fetch(`${STRAPI_URL}/api/articles?locale=en`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (articleResponse.ok) {
      console.log(chalk.green('  ✅ Content Type Article aceita parâmetro locale'));
    } else if (articleResponse.status === 400) {
      console.log(chalk.red('  ❌ Content Type Article não está configurado para i18n'));
    }
    
  } catch (error) {
    console.log(chalk.red(`  ❌ Erro ao verificar Content Types: ${error.message}`));
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log(chalk.bold.cyan('🌍 Iniciando testes de configuração i18n do Strapi v5\n'));
  
  if (!API_TOKEN) {
    console.log(chalk.yellow('⚠️  API_TOKEN não configurado. Alguns testes podem falhar.'));
    console.log(chalk.gray('   Configure: export STRAPI_API_TOKEN="seu_token_aqui"\n'));
  }
  
  console.log(chalk.gray(`🔗 URL do Strapi: ${STRAPI_URL}`));
  console.log(chalk.gray(`🌐 Locales configurados: ${LOCALES.join(', ')}\n`));
  
  // Executar todos os testes
  await checkPluginConfiguration();
  await checkContentTypeConfiguration();
  await testRESTAPI();
  await testGraphQLAPI();
  
  // Só tenta criar conteúdo se tiver token
  if (API_TOKEN) {
    await testContentCreation();
  } else {
    console.log(chalk.yellow('\n⚠️  Pulando teste de criação de conteúdo (API_TOKEN necessário)'));
  }
  
  console.log(chalk.bold.green('\n✅ Testes de configuração i18n concluídos!'));
  console.log(chalk.gray('\n📖 Consulte a documentação em docs/STRAPI-I18N-API-REFERENCE.md'));
}

/**
 * Função principal
 */
async function main() {
  try {
    await runAllTests();
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro durante execução dos testes: ${error.message}`));
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  testRESTAPI,
  testGraphQLAPI,
  testContentCreation,
  checkPluginConfiguration,
  checkContentTypeConfiguration,
  runAllTests
}; 