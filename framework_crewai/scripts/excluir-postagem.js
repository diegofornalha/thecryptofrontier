/**
 * Script para excluir posts do Sanity CMS
 * 
 * Este script exclui um ou mais posts do Sanity CMS usando a API do cliente
 * Os IDs dos posts a serem excluídos são especificados no array POST_IDS
 */

// Array de IDs de posts para excluir
// Este array será modificado programaticamente pelo app.py
const POST_IDS = [];

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

  // Inicializar o cliente Sanity
  const client = createClient({
    projectId: projectId,
    dataset: dataset,
    apiVersion: apiVersion,
    token: process.env.SANITY_DEV_TOKEN, // Token de API do Sanity (usado para operações de escrita)
    useCdn: false // Não usar CDN para operações de escrita
  });

  // Validar se há IDs para excluir
  if (!POST_IDS || POST_IDS.length === 0) {
    console.error('Nenhum ID de post especificado para exclusão.');
    process.exit(1);
  }

  console.log(`Iniciando exclusão de ${POST_IDS.length} post(s)...`);

  // Função para excluir um post
  async function excluirPost(postId) {
    try {
      // Primeiro, obter detalhes do post para log
      const post = await client.getDocument(postId);
      const titulo = post ? post.title : 'Post desconhecido';
      
      // Excluir o post
      await client.delete(postId);
      console.log(`Post excluído com sucesso: "${titulo}" (ID: ${postId})`);
      return true;
    } catch (error) {
      console.error(`Erro ao excluir post ${postId}: ${error.message}`);
      return false;
    }
  }

  // Excluir todos os posts especificados
  async function excluirPosts() {
    const resultados = await Promise.all(POST_IDS.map(id => excluirPost(id)));
    const sucessos = resultados.filter(Boolean).length;
    
    console.log(`Exclusão concluída: ${sucessos} de ${POST_IDS.length} posts excluídos com sucesso.`);
    
    if (sucessos !== POST_IDS.length) {
      console.error('Alguns posts não puderam ser excluídos. Verifique os erros acima.');
      process.exit(1);
    }
  }

  // Executar exclusão
  excluirPosts()
    .catch(err => {
      console.error(`Erro ao executar exclusões: ${err.message}`);
      process.exit(1);
    });

} catch (error) {
  console.error(`Erro ao inicializar script: ${error.message}`);
  process.exit(1);
} 