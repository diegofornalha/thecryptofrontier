#!/usr/bin/env node

/**
 * Script para configurar webhook no Strapi v5
 * Este script deve ser executado no contexto do Strapi
 */

const path = require('path');
const fs = require('fs');

// Configuração do webhook
const WEBHOOK_CONFIG = {
  name: 'CrewAI Integration',
  url: 'https://webhook-crewai.agentesintegrados.com/webhook/strapi',
  headers: {
    'Authorization': 'Bearer crew-ai-webhook-secret-2025',
    'Content-Type': 'application/json',
    'X-CrewAI-Version': '1.0'
  },
  events: [
    'entry.create',
    'entry.update',
    'entry.delete',
    'entry.publish',
    'entry.unpublish',
    'media.create',
    'media.update',
    'media.delete'
  ],
  enabled: true
};

// Criar arquivo de configuração do servidor se necessário
function updateServerConfig() {
  const configPath = path.join(__dirname, '../strapi-v5-fresh/config/server.js');
  
  console.log('📝 Atualizando configuração do servidor...');
  
  const serverConfig = `module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    defaultHeaders: {
      'Authorization': 'Bearer crew-ai-webhook-secret-2025',
      'X-CrewAI-Version': '1.0',
    },
  },
});`;

  try {
    // Fazer backup do arquivo existente
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, `${configPath}.backup`);
      console.log('✅ Backup criado:', `${configPath}.backup`);
    }
    
    // Escrever nova configuração
    fs.writeFileSync(configPath, serverConfig);
    console.log('✅ Configuração do servidor atualizada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error);
    return false;
  }
}

// Criar arquivo de lifecycle hooks para processar webhooks
function createLifecycleHooks() {
  const lifecyclePath = path.join(__dirname, '../strapi-v5-fresh/src/index.js');
  
  console.log('📝 Criando lifecycle hooks...');
  
  const lifecycleCode = `module.exports = {
  register({ strapi }) {
    // Log quando webhooks são disparados
    const models = [
      'api::post.post',
      'api::author.author',
      'api::page.page'
    ];
    
    models.forEach(model => {
      strapi.db.lifecycles.subscribe({
        models: [model],
        
        async afterCreate(event) {
          const { result } = event;
          console.log(\`[Webhook] Created \${model}:\`, result.id);
        },
        
        async afterUpdate(event) {
          const { result } = event;
          console.log(\`[Webhook] Updated \${model}:\`, result.id);
        },
        
        async afterDelete(event) {
          const { result } = event;
          console.log(\`[Webhook] Deleted \${model}:\`, result.id);
        }
      });
    });
  },
  
  bootstrap({ strapi }) {
    console.log('🚀 Strapi bootstrapped with webhook support');
    console.log('📡 Webhook URL: https://webhook-crewai.agentesintegrados.com/webhook/strapi');
  }
};`;

  try {
    // Fazer backup se existir
    if (fs.existsSync(lifecyclePath)) {
      fs.copyFileSync(lifecyclePath, `${lifecyclePath}.backup`);
    }
    
    // Criar diretório se não existir
    const dir = path.dirname(lifecyclePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Escrever arquivo
    fs.writeFileSync(lifecyclePath, lifecycleCode);
    console.log('✅ Lifecycle hooks criados');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar lifecycle hooks:', error);
    return false;
  }
}

// Criar script SQL para inserir webhook diretamente no banco
function createSQLScript() {
  const sqlPath = path.join(__dirname, 'insert-webhook.sql');
  
  console.log('📝 Criando script SQL...');
  
  const sqlScript = `-- Script para inserir webhook diretamente no banco de dados do Strapi v5
-- Execute este script no banco de dados PostgreSQL do Strapi

INSERT INTO webhooks (
  name,
  url,
  headers,
  events,
  enabled,
  created_at,
  updated_at
) VALUES (
  'CrewAI Integration',
  'https://webhook-crewai.agentesintegrados.com/webhook/strapi',
  '{"Authorization": "Bearer crew-ai-webhook-secret-2025", "Content-Type": "application/json", "X-CrewAI-Version": "1.0"}',
  '["entry.create", "entry.update", "entry.delete", "entry.publish", "entry.unpublish", "media.create", "media.update", "media.delete"]',
  true,
  NOW(),
  NOW()
) ON CONFLICT (name) DO UPDATE SET
  url = EXCLUDED.url,
  headers = EXCLUDED.headers,
  events = EXCLUDED.events,
  enabled = EXCLUDED.enabled,
  updated_at = NOW();`;

  try {
    fs.writeFileSync(sqlPath, sqlScript);
    console.log('✅ Script SQL criado:', sqlPath);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar script SQL:', error);
    return false;
  }
}

// Função principal
async function main() {
  console.log('=== Configuração de Webhook Strapi v5 ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('');
  
  // 1. Atualizar configuração do servidor
  updateServerConfig();
  console.log('');
  
  // 2. Criar lifecycle hooks
  createLifecycleHooks();
  console.log('');
  
  // 3. Criar script SQL
  createSQLScript();
  console.log('');
  
  // Instruções finais
  console.log('📌 Próximos passos:');
  console.log('');
  console.log('1. Reiniciar o Strapi para aplicar as configurações:');
  console.log('   docker-compose -f docker-compose.yml restart strapi');
  console.log('');
  console.log('2. Se o webhook não aparecer no painel admin, execute o SQL:');
  console.log('   docker exec -i strapi-postgres psql -U strapi strapi < scripts/insert-webhook.sql');
  console.log('');
  console.log('3. Configurar manualmente via painel admin:');
  console.log('   - URL: http://localhost:1338/admin');
  console.log('   - Settings → Webhooks → Create new webhook');
  console.log('   - Usar os dados do objeto WEBHOOK_CONFIG acima');
  console.log('');
  console.log('4. Testar o webhook:');
  console.log('   cd scripts/docker && ./test-webhook.sh');
  console.log('');
  console.log('✅ Scripts de configuração criados com sucesso!');
}

// Executar
main().catch(console.error);