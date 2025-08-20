#!/usr/bin/env node

/**
 * CLI para o Auto Commit Agent
 */

import { createAutoCommitAgent } from './auto-commit-core';
import { CompositeStrategy, DefaultCommitStrategy, SmartCommitStrategy, UrgentFileStrategy } from './strategies/commit-strategy';
import * as path from 'path';

// Configuração via variáveis de ambiente
const config = {
  watchPath: process.env.PROJECT_PATH || process.cwd(),
  debounceTime: parseInt(process.env.DEBOUNCE_TIME || '3000'),
  enableDashboard: process.env.ENABLE_DASHBOARD === 'true',
  enableMCP: process.env.ENABLE_MCP === 'true',
  enableMem0: process.env.ENABLE_MEM0 === 'true',
  strapiUrl: process.env.STRAPI_URL,
  strategy: new CompositeStrategy([
    new UrgentFileStrategy(),
    new SmartCommitStrategy(),
    new DefaultCommitStrategy()
  ])
};

console.log('🚀 Auto Commit Agent - Versão Modularizada');
console.log('📁 Monitorando:', config.watchPath);
console.log('⏱️  Debounce:', config.debounceTime + 'ms');
console.log('📊 Dashboard:', config.enableDashboard ? 'Habilitado' : 'Desabilitado');
console.log('🔗 MCP:', config.enableMCP ? 'Habilitado' : 'Desabilitado');
console.log('🧠 Mem0:', config.enableMem0 ? 'Habilitado' : 'Desabilitado');

// Criar e iniciar agente
const agent = createAutoCommitAgent(config);

// Tratamento de sinais
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT, parando agente...');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM, parando agente...');
  await agent.stop();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Iniciar agente
(async () => {
  try {
    await agent.start();
    
    // Verificar se tem chave SSH nas variáveis de ambiente
    if (process.env.SSH_PRIVATE_KEY) {
      console.log('🔑 Configurando chave SSH do ambiente...');
      const success = await agent.storeSSHKey(process.env.SSH_PRIVATE_KEY);
      if (success) {
        console.log('✅ Chave SSH configurada com sucesso');
      } else {
        console.warn('⚠️  Falha ao configurar chave SSH');
      }
    }
    
    console.log('\n✨ Auto Commit Agent está rodando!');
    console.log('⏹️  Pressione Ctrl+C para parar\n');
    
  } catch (error) {
    console.error('❌ Erro ao iniciar agente:', error);
    process.exit(1);
  }
})();