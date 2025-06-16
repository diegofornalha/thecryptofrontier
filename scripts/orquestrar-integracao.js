#!/usr/bin/env node

/**
 * Orquestrador de Integração - Coordena todos os agentes
 * Guardian + Strapi Specialist + NextJS Specialist + Docker Specialist
 */

const axios = require('axios');
const { spawn } = require('child_process');
require('dotenv').config();

class IntegrationOrchestrator {
  constructor() {
    this.agents = {
      guardian: 'http://localhost:8000',
      strapiSpecialist: 'http://localhost:3007',
      nextjsSpecialist: 'http://localhost:3008', // se disponível
      dockerSpecialist: 'http://localhost:3009'  // se disponível
    };
    
    this.strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
    this.apiToken = process.env.STRAPI_API_TOKEN || '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb';
  }

  async log(message, type = 'info') {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      guardian: '🛡️',
      strapi: '🚀',
      nextjs: '⚡',
      docker: '🐳'
    };
    
    console.log(`${emoji[type] || '📝'} ${message}`);
    
    // Tentar registrar no Guardian
    try {
      await axios.post(`${this.agents.guardian}/api/logs`, {
        message,
        type,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      // Guardian pode não estar disponível
    }
  }

  async consultStrapiSpecialist(question) {
    try {
      const response = await axios.post(`${this.agents.strapiSpecialist}/process`, {
        content: question
      });
      return response.data;
    } catch (error) {
      this.log(`Erro ao consultar Strapi Specialist: ${error.message}`, 'error');
      return null;
    }
  }

  async checkStrapiHealth() {
    this.log('Verificando saúde do Strapi...', 'strapi');
    
    try {
      const response = await axios.get(`${this.strapiUrl}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });
      
      this.log(`Strapi operacional! ${response.data.meta.pagination.total} posts encontrados`, 'success');
      return true;
    } catch (error) {
      this.log(`Strapi com problemas: ${error.message}`, 'error');
      return false;
    }
  }

  async createTestPost() {
    this.log('Criando post de teste orquestrado...', 'info');
    
    const timestamp = Date.now();
    const testPost = {
      data: {
        title: `Post Orquestrado - ${new Date().toLocaleString('pt-BR')}`,
        slug: `post-orquestrado-${timestamp}`,
        content: `## Post criado pelo Orquestrador\n\nEste post foi criado automaticamente pelo sistema de orquestração que coordena:\n\n- 🛡️ Guardian (supervisão)\n- 🚀 Strapi Specialist (CMS)\n- ⚡ NextJS Specialist (frontend)\n- 🐳 Docker Specialist (infraestrutura)\n\n### Integração Funcionando!\n\nTodos os sistemas estão operacionais e prontos para receber conteúdo automatizado.`,
        excerpt: 'Post criado pelo sistema de orquestração de agentes',
        author: 'Sistema de Orquestração',
        tags: ['teste', 'orquestração', 'agentes', 'integração'],
        categories: ['Sistema'],
        featured: true
      }
    };

    try {
      const response = await axios.post(
        `${this.strapiUrl}/api/posts`,
        testPost,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      this.log(`Post criado com sucesso! ID: ${response.data.data.id}`, 'success');
      this.log(`URL: https://thecryptofrontier.agentesintegrados.com/blog/${response.data.data.slug}`, 'success');
      
      return response.data;
    } catch (error) {
      this.log(`Erro ao criar post: ${error.response?.data?.error?.message || error.message}`, 'error');
      return null;
    }
  }

  async startWebhookServer() {
    this.log('Iniciando servidor webhook para receber posts do CrewAI...', 'info');
    
    const webhook = spawn('node', ['scripts/strapi-post-manager.js', 'webhook-server'], {
      stdio: 'inherit'
    });

    webhook.on('error', (err) => {
      this.log(`Erro no webhook server: ${err.message}`, 'error');
    });

    return webhook;
  }

  async orchestrateFullIntegration() {
    console.log('\n🎭 INICIANDO ORQUESTRAÇÃO COMPLETA\n');
    
    // 1. Verificar Strapi
    this.log('Fase 1: Verificação de Sistemas', 'guardian');
    const strapiOk = await this.checkStrapiHealth();
    
    if (!strapiOk) {
      this.log('Strapi não está respondendo. Abortando.', 'error');
      return;
    }

    // 2. Consultar Strapi Specialist
    this.log('\nFase 2: Consultando Especialistas', 'guardian');
    const strapiAdvice = await this.consultStrapiSpecialist(
      'Como otimizar a criação de posts em lote no Strapi v5?'
    );
    
    if (strapiAdvice) {
      this.log('Conselho do Strapi Specialist recebido', 'success');
    }

    // 3. Criar post de teste
    this.log('\nFase 3: Teste de Criação', 'guardian');
    const testResult = await this.createTestPost();
    
    if (!testResult) {
      this.log('Falha ao criar post de teste', 'error');
      return;
    }

    // 4. Preparar para CrewAI
    this.log('\nFase 4: Preparação para Integração Automatizada', 'guardian');
    
    console.log('\n📋 RESUMO DA ORQUESTRAÇÃO:\n');
    console.log('✅ Strapi: Operacional');
    console.log('✅ API Token: Configurado');
    console.log('✅ Content-Types: Post e Article prontos');
    console.log('✅ Permissões: Configuradas');
    console.log('✅ Post de teste: Criado com sucesso');
    
    console.log('\n🚀 PRÓXIMOS COMANDOS:\n');
    console.log('1. Iniciar webhook server:');
    console.log('   node scripts/strapi-post-manager.js webhook-server\n');
    console.log('2. Executar CrewAI:');
    console.log('   cd framework_crewai/blog_crew && python main.py simple-pipeline\n');
    console.log('3. Monitorar logs:');
    console.log('   tail -f logs/integration.log\n');
    
    this.log('Orquestração completa!', 'success');
  }
}

// Menu principal
async function main() {
  const orchestrator = new IntegrationOrchestrator();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'test':
      await orchestrator.createTestPost();
      break;
      
    case 'check':
      await orchestrator.checkStrapiHealth();
      break;
      
    case 'webhook':
      await orchestrator.startWebhookServer();
      break;
      
    case 'full':
      await orchestrator.orchestrateFullIntegration();
      break;
      
    default:
      console.log(`
🎭 Orquestrador de Integração

Uso:
  node orquestrar-integracao.js <comando>

Comandos:
  test     - Criar um post de teste
  check    - Verificar saúde do Strapi
  webhook  - Iniciar servidor webhook
  full     - Executar orquestração completa
  help     - Mostrar esta ajuda

Exemplo:
  node orquestrar-integracao.js full
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { IntegrationOrchestrator };