#!/bin/bash

echo "=== Reinicializando aplicação Streamlit ===="
echo "1. Parando processos Streamlit existentes..."
pkill -f streamlit

echo "2. Limpando caches..."
rm -rf ~/.streamlit/cache/* 2>/dev/null || true
rm -rf .streamlit/cache/* 2>/dev/null || true
rm -rf /tmp/streamlit/* 2>/dev/null || true

echo "3. Verificando integridade do banco de dados..."
sqlite3 posts_database.sqlite "VACUUM; PRAGMA integrity_check;" || echo "AVISO: Verificação de BD falhou!"

echo "4. Otimizando banco de dados..."
sqlite3 posts_database.sqlite "PRAGMA optimize;" || echo "AVISO: Otimização do BD falhou!"

echo "5. Limpando arquivos temporários..."
rm -f *.temp.js *.pid 2>/dev/null || true

echo "6. Limpar e recriar diretório de scripts..."
if [ -d "scripts" ]; then
    rm -f scripts/excluir-postagem.js.temp 2>/dev/null || true
else
    mkdir -p scripts
fi

# Recria o script de exclusão com o dotenv
cat << 'EOF' > scripts/excluir-postagem.js
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

// Imprimir status inicial
console.log('Iniciando script de exclusão de posts do Sanity');
console.log(`Token disponível: ${process.env.SANITY_DEV_TOKEN ? 'Sim' : 'Não'}`);

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

  console.log(`Configuração do Sanity: projectId=${projectId}, dataset=${dataset}, apiVersion=${apiVersion}`);

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

  console.log(`Iniciando exclusão de ${POST_IDS.length} post(s): ${JSON.stringify(POST_IDS)}`);

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
EOF

echo "7. Instalando dependências necessárias..."
npm install dotenv @sanity/client

echo "8. Iniciando aplicação Streamlit..."
streamlit run app.py --server.runOnSave=true --browser.serverAddress=0.0.0.0 --server.enableCORS=false 