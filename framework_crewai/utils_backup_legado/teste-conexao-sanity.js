/**
 * Script para testar a conexão com o Sanity CMS
 */

const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Carregar variáveis de ambiente

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

  console.log('Cliente Sanity inicializado. Tentando conectar...');

  // Testar a conexão
  async function testarConexao() {
    try {
      // Buscar documentos para testar a conexão
      console.log('Buscando posts...');
      const posts = await client.fetch('*[_type == "post"][0...5]');
      console.log(`Conexão bem-sucedida! ${posts.length} posts encontrados.`);
      
      if (posts.length > 0) {
        console.log('Detalhes do primeiro post:');
        console.log(`- ID: ${posts[0]._id}`);
        console.log(`- Título: ${posts[0].title}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao conectar com o Sanity: ${error.message}`);
      if (error.message.includes('token')) {
        console.error('Possível problema com o token de autenticação.');
      }
      return false;
    }
  }

  // Executar o teste
  testarConexao()
    .then(success => {
      if (success) {
        console.log('Teste concluído com sucesso!');
      } else {
        console.error('Teste falhou.');
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