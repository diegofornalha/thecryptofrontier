#!/usr/bin/env node

/**
 * Script para testar o formato correto de envio de conteúdo para o Strapi v5
 * Baseado nos schemas definidos para Post e Article
 */

const axios = require('axios');
require('dotenv').config();

// Configurações
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || 'seu-token-aqui';

// Exemplos de dados válidos baseados nos schemas

// Exemplo de Post válido
const validPost = {
  data: {
    // Campos obrigatórios
    title: "Como o Bitcoin está revolucionando as finanças",
    slug: "bitcoin-revolucionando-financas", // será gerado automaticamente se não fornecido
    content: "## Introdução\n\nO Bitcoin tem transformado o cenário financeiro global...\n\n### Principais impactos\n\n1. Descentralização\n2. Transparência\n3. Acessibilidade global",
    
    // Campos opcionais
    excerpt: "Uma análise profunda sobre como o Bitcoin está mudando o sistema financeiro tradicional",
    author: "João Silva",
    tags: ["bitcoin", "criptomoedas", "finanças", "blockchain"],
    categories: ["Criptomoedas", "Tecnologia Blockchain"],
    readingTime: 8,
    featured: true,
    seo: {
      metaTitle: "Bitcoin: A Revolução Financeira | The Crypto Frontier",
      metaDescription: "Descubra como o Bitcoin está transformando o sistema financeiro global",
      keywords: ["bitcoin", "criptomoedas", "blockchain", "finanças descentralizadas"]
    }
  }
};

// Exemplo de Article válido
const validArticle = {
  data: {
    // Campos obrigatórios
    title: "Ethereum 2.0: O Futuro dos Smart Contracts",
    slug: "ethereum-2-futuro-smart-contracts",
    content: "## O que é Ethereum 2.0?\n\nEthereum 2.0 representa uma grande atualização...\n\n### Melhorias principais\n\n- Proof of Stake\n- Maior escalabilidade\n- Menor consumo de energia",
    
    // Campos opcionais
    summary: "Uma visão completa sobre as mudanças e melhorias do Ethereum 2.0",
    author: "Maria Santos",
    category: "Smart Contracts",
    tags: ["ethereum", "smart contracts", "blockchain", "defi"],
    publishDate: new Date().toISOString(),
    metaDescription: "Entenda as principais mudanças do Ethereum 2.0 e seu impacto",
    metaKeywords: "ethereum, eth 2.0, smart contracts, blockchain",
    readTime: 12,
    isHighlighted: true,
    viewCount: 0
  }
};

// Exemplos de dados INVÁLIDOS (para demonstrar erros comuns)
const invalidExamples = {
  // Faltando campos obrigatórios
  missingRequired: {
    data: {
      // Falta 'title' e 'content' que são obrigatórios
      excerpt: "Apenas um resumo"
    }
  },
  
  // Tipo de dado incorreto
  wrongDataType: {
    data: {
      title: "Título válido",
      content: "Conteúdo válido",
      readingTime: "oito minutos", // Deve ser integer, não string
      featured: "sim" // Deve ser boolean, não string
    }
  },
  
  // Violação de validações
  validationErrors: {
    data: {
      title: "T", // Muito curto (sem minLength definido, mas pode ter limite prático)
      content: "C", // Muito curto para ser útil
      readingTime: -5, // Viola min: 1
      excerpt: "a".repeat(501) // Viola maxLength: 500
    }
  },
  
  // Campos não definidos no schema
  extraFields: {
    data: {
      title: "Título válido",
      content: "Conteúdo válido",
      customField: "Não existe no schema", // Será ignorado
      anotherField: 123 // Também será ignorado
    }
  }
};

// Função para testar criação de Post
async function testCreatePost() {
  console.log('\n📝 Testando criação de Post...\n');
  
  try {
    const response = await axios.post(
      `${STRAPI_URL}/api/posts`,
      validPost,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );
    
    console.log('✅ Post criado com sucesso!');
    console.log('ID:', response.data.data.id);
    console.log('Dados retornados:', JSON.stringify(response.data.data.attributes, null, 2));
    
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Erro ao criar post:', error.response?.data || error.message);
    return null;
  }
}

// Função para testar criação de Article
async function testCreateArticle() {
  console.log('\n📄 Testando criação de Article...\n');
  
  try {
    const response = await axios.post(
      `${STRAPI_URL}/api/articles`,
      validArticle,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );
    
    console.log('✅ Article criado com sucesso!');
    console.log('ID:', response.data.data.id);
    console.log('Dados retornados:', JSON.stringify(response.data.data.attributes, null, 2));
    
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Erro ao criar article:', error.response?.data || error.message);
    return null;
  }
}

// Função para demonstrar erros comuns
async function demonstrateErrors() {
  console.log('\n⚠️  Demonstrando erros comuns...\n');
  
  // Teste 1: Campos obrigatórios faltando
  console.log('1️⃣ Tentando criar post sem campos obrigatórios...');
  try {
    await axios.post(
      `${STRAPI_URL}/api/posts`,
      invalidExamples.missingRequired,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );
  } catch (error) {
    console.log('❌ Erro esperado:', error.response?.data?.error || error.message);
  }
  
  // Teste 2: Tipo de dado incorreto
  console.log('\n2️⃣ Tentando criar post com tipos de dados incorretos...');
  try {
    await axios.post(
      `${STRAPI_URL}/api/posts`,
      invalidExamples.wrongDataType,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );
  } catch (error) {
    console.log('❌ Erro esperado:', error.response?.data?.error || error.message);
  }
}

// Função para buscar e exibir dados
async function fetchAndDisplay() {
  console.log('\n🔍 Buscando dados existentes...\n');
  
  // Buscar posts
  try {
    const postsResponse = await axios.get(`${STRAPI_URL}/api/posts?populate=*`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    console.log(`📚 Total de posts: ${postsResponse.data.data.length}`);
    if (postsResponse.data.data.length > 0) {
      console.log('Primeiro post:', JSON.stringify(postsResponse.data.data[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao buscar posts:', error.response?.data || error.message);
  }
  
  // Buscar articles
  try {
    const articlesResponse = await axios.get(`${STRAPI_URL}/api/articles?populate=*`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    console.log(`\n📑 Total de articles: ${articlesResponse.data.data.length}`);
    if (articlesResponse.data.data.length > 0) {
      console.log('Primeiro article:', JSON.stringify(articlesResponse.data.data[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao buscar articles:', error.response?.data || error.message);
  }
}

// Função principal
async function main() {
  console.log('🚀 Teste de Formato de Conteúdo - Strapi v5\n');
  console.log(`URL: ${STRAPI_URL}`);
  console.log(`Token: ${API_TOKEN.substring(0, 20)}...`);
  
  // Menu de opções
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\nEscolha uma opção:');
  console.log('1. Criar um Post de exemplo');
  console.log('2. Criar um Article de exemplo');
  console.log('3. Demonstrar erros comuns');
  console.log('4. Buscar dados existentes');
  console.log('5. Executar todos os testes');
  console.log('6. Mostrar exemplos de formato JSON');
  console.log('0. Sair');
  
  rl.question('\nOpção: ', async (answer) => {
    switch (answer) {
      case '1':
        await testCreatePost();
        break;
      case '2':
        await testCreateArticle();
        break;
      case '3':
        await demonstrateErrors();
        break;
      case '4':
        await fetchAndDisplay();
        break;
      case '5':
        await testCreatePost();
        await testCreateArticle();
        await demonstrateErrors();
        await fetchAndDisplay();
        break;
      case '6':
        console.log('\n📋 Exemplo de formato para POST:\n');
        console.log(JSON.stringify(validPost, null, 2));
        console.log('\n📋 Exemplo de formato para ARTICLE:\n');
        console.log(JSON.stringify(validArticle, null, 2));
        break;
      default:
        console.log('Saindo...');
    }
    
    rl.close();
  });
}

// Exportar exemplos para uso em outros scripts
module.exports = {
  validPost,
  validArticle,
  invalidExamples
};

// Executar se for chamado diretamente
if (require.main === module) {
  main();
}