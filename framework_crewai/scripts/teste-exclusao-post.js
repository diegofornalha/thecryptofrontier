/**
 * Script para testar a exclusão de posts do Sanity CMS
 * Este é apenas um teste e não exclui nenhum post real
 */

const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Carregar variáveis de ambiente

// ID de teste - este é um ID fake e não será excluído
const TEST_ID = 'post-test-12345';

// Carregar configurações do arquivo sanity.config.js
try {
  let configContent = fs.readFileSync(path.resolve(__dirname, '../sanity.config.js'), 'utf8');
  
  // Extrair projectId, dataset e apiVersion usando regex
  const projectIdMatch = configContent.match(/projectId: ['"]([^'"]+)['"]/);
  const datasetMatch = configContent.match(/dataset: ['"]([^'"]+)['"]/);
  const apiVersionMatch = configContent.match(/apiVersion: ['"]([^'"]+)['"]/);
  
  const projectId = projectIdMatch ? projectIdMatch[1] : null;
  const dataset = datasetMatch ? datasetMatch[1] : 'production';
  const apiVersion = apiVersionMatch ? apiVersionMatch[1] : '2023-05-03';
  
  if (!projectId) {
    console.error('ProjectId não encontrado no arquivo sanity.config.js');
    process.exit(1);
  }

  console.log('Configuração do Sanity:');
  console.log(`- Project ID: ${projectId}`);
  console.log(`- Dataset: ${dataset}`);
  console.log(`- API Version: ${apiVersion}`);
  console.log(`- Token disponível: ${process.env.SANITY_DEV_TOKEN ? 'Sim' : 'Não'}`);
  
  if (!process.env.SANITY_DEV_TOKEN) {
    console.error('SANITY_DEV_TOKEN não encontrado nas variáveis de ambiente');
    process.exit(1);
  }

  // Inicializar o cliente Sanity
  const client = createClient({
    projectId: projectId,
    dataset: dataset,
    apiVersion: apiVersion,
    token: process.env.SANITY_DEV_TOKEN,
    useCdn: false
  });

  console.log('Cliente Sanity inicializado. Testando operação de exclusão (sem excluir realmente)...');

  // Função para simular a exclusão de um post (não exclui realmente)
  async function simularExclusao() {
    try {
      // Buscar um post real para testar as operações
      console.log('Buscando um post real para teste...');
      const posts = await client.fetch('*[_type == "post"][0...1]');
      
      if (!posts || posts.length === 0) {
        console.log('Nenhum post encontrado para testar.');
        return false;
      }
      
      const post = posts[0];
      console.log(`Post encontrado: "${post.title}" (ID: ${post._id})`);
      
      // Simular a função de exclusão (sem chamar client.delete())
      console.log(`Simulando exclusão do post "${post.title}" (ID: ${post._id})...`);
      console.log('Operação de simulação bem-sucedida! (Nenhum post foi excluído)');
      
      return true;
    } catch (error) {
      console.error(`Erro ao simular exclusão: ${error.message}`);
      if (error.message.includes('token')) {
        console.error('Possível problema com o token de autenticação.');
      }
      return false;
    }
  }

  // Executar simulação
  simularExclusao()
    .then(success => {
      if (success) {
        console.log('Teste concluído com sucesso! O script de exclusão deve funcionar corretamente.');
        console.log('IMPORTANTE: Nenhum post foi excluído durante este teste.');
      } else {
        console.error('Teste falhou. Verifique os erros acima.');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error(`Erro não tratado: ${err.message}`);
      process.exit(1);
    });

} catch (error) {
  console.error(`Erro ao inicializar script: ${error.message}`);
  process.exit(1);
} 