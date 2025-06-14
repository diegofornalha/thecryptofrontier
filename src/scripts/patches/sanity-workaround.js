// Este script serve como alternativa para quando não é possível rodar o Strapi Studio
// devido a incompatibilidades nas dependências
// É uma simples API para permitir listar e atualizar conteúdo sem o Studio

// Carregar variáveis de ambiente
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
// Importe diretamente a versão 6.8.0 do client
const { createClient } = require('@strapi/client');

// Configurações do Strapi
const projectId = process.env.NEXT_PUBLIC_strapi_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_strapi_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_strapi_API_VERSION || '2023-05-03';

console.log('Usando Strapi com as configurações:', {
  projectId,
  dataset,
  apiVersion
});

// Cliente Strapi
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.strapi_API_TOKEN,
});

// Servidor HTTP simples
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = url.pathname;

  try {
    if (route === '/' || route === '/index.html') {
      // Página inicial com informações sobre a API
      res.statusCode = 200;
      res.end(JSON.stringify({
        name: 'Strapi API Alternativa',
        description: 'API para gerenciar conteúdo do Strapi quando o Studio não está disponível',
        version: '1.0.0',
        endpoints: {
          '/api/status': 'Informações sobre o status da API',
          '/api/documents': 'Listar documentos do Strapi (opções: type, limit)',
          '/api/content-sync': 'Sincronizar conteúdo (POST)'
        },
        strapi: {
          projectId,
          dataset
        }
      }, null, 2));
    }
    else if (route === '/api/status') {
      // Status da API
      res.statusCode = 200;
      res.end(JSON.stringify({ 
        status: 'online',
        strapi: {
          projectId,
          dataset,
          apiVersion
        },
        env: {
          NODE_ENV: process.env.NODE_ENV || 'development'
        }
      }));
    } 
    else if (route === '/api/documents') {
      // Listar documentos
      const type = url.searchParams.get('type') || '*';
      const limit = parseInt(url.searchParams.get('limit') || '100');
      
      const query = `*[_type == "${type}" || "${type}" == "*"] | order(_createdAt desc)[0...${limit}]`;
      const documents = await client.fetch(query);
      
      res.statusCode = 200;
      res.end(JSON.stringify({ documents }));
    }
    else if (route === '/api/content-sync') {
      // Sincronizar conteúdo do filesystem para o Strapi
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          
          // Exemplo simples - criar um documento baseado em dados enviados
          if (data.document) {
            const result = await client.create(data.document);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, result }));
          } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid request body' }));
          }
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    }
    else {
      // Rota não encontrada
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = process.env.strapi_WORKAROUND_PORT || 3333;

server.listen(PORT, () => {
  console.log(`🚀 Strapi Workaround API rodando em http://localhost:${PORT}`);
  console.log(`✅ Use http://localhost:${PORT}/api/status para verificar o status`);
  console.log(`📚 Use http://localhost:${PORT}/api/documents para listar documentos`);
}); 