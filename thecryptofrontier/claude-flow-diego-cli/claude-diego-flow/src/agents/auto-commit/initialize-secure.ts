#!/usr/bin/env tsx
/**
 * Inicialização Segura do Auto Commit Agent com Mem0 Real
 */

import { createAutoCommitAgent } from '../auto-commit-agent';
import { mem0RealClient } from './mem0-real-client';
import { syncGitignoreToMem0 } from './gitignore-mem0-sync';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function initializeSecureAutoCommit() {
  console.log('🚀 Iniciando Auto Commit Agent Seguro com Mem0 Real...\n');

  try {
    // 1. Verificar configuração do Mem0
    console.log('🔍 Verificando configuração do Mem0...');
    if (!process.env.MEM0_API_KEY) {
      console.warn('⚠️  MEM0_API_KEY não encontrada. Usando chave padrão.');
      console.log('💡 Configure em .env: MEM0_API_KEY=sua-chave-aqui');
    }

    // 2. Adicionar instruções do Diego
    console.log('\n📝 Configurando instruções personalizadas do Diego...');
    
    // Instruções gerais
    await mem0RealClient.addInstruction('sempre usar português brasileiro nas mensagens');
    await mem0RealClient.addInstruction('incluir emojis relevantes do gitmoji');
    await mem0RealClient.addInstruction('mencionar número da issue quando disponível (ex: #123)');
    await mem0RealClient.addInstruction('ser específico sobre o que foi alterado');
    await mem0RealClient.addInstruction('respeitar o .gitignore com timestamp dinâmico');
    
    // Preferências de commit por tipo
    await mem0RealClient.addCommitPreference({
      pattern: '.tsx',
      message_template: '✨ feat: {action} componente React ({files} arquivos)',
      priority: 10
    });
    
    await mem0RealClient.addCommitPreference({
      pattern: '.ts',
      message_template: '🔧 {action}: lógica TypeScript ({files} arquivos)',
      priority: 9
    });
    
    await mem0RealClient.addCommitPreference({
      pattern: '.css',
      message_template: '💄 style: {action} estilos ({files} arquivos)',
      priority: 8
    });
    
    await mem0RealClient.addCommitPreference({
      pattern: '.md',
      message_template: '📝 docs: {action} documentação',
      priority: 7
    });
    
    await mem0RealClient.addCommitPreference({
      pattern: 'package.json',
      message_template: '📦 deps: {action} dependências',
      priority: 10
    });

    // 3. Sincronizar .gitignore
    console.log('\n🔄 Sincronizando .gitignore com Mem0...');
    await syncGitignoreToMem0('/home/strapi/thecryptofrontier');
    
    // 4. Criar e configurar o agente
    console.log('\n🤖 Criando instância do Auto Commit Agent...');
    const agent = createAutoCommitAgent('/home/strapi/thecryptofrontier');
    
    // 5. Configurar chave SSH se disponível
    if (process.env.SSH_PRIVATE_KEY) {
      console.log('\n🔑 Configurando chave SSH...');
      const success = await agent.storeSSHKey(process.env.SSH_PRIVATE_KEY);
      if (success) {
        console.log('✅ Chave SSH configurada com sucesso');
      } else {
        console.log('❌ Falha ao configurar chave SSH');
      }
    } else {
      console.log('\n⚠️  SSH_PRIVATE_KEY não encontrada no .env');
      console.log('💡 O agente usará as credenciais git do sistema');
    }

    // 6. Iniciar cache cleaner
    console.log('\n🧹 Iniciando limpeza periódica de cache...');
    mem0RealClient.startCacheCleaner();

    // 7. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('✅ AUTO COMMIT AGENT INICIALIZADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📋 Configurações ativas:');
    console.log('  • Mem0 Real: ✓');
    console.log('  • Segurança: ✓ (verificação de secrets, branches protegidas)');
    console.log('  • Rate Limiting: ✓ (máx 10 commits/minuto)');
    console.log('  • Pre-commit Hooks: ✓ (lint, typecheck, tests)');
    console.log('  • Instruções do Diego: ✓');
    console.log('  • .gitignore Sincronizado: ✓');
    console.log('\n🎯 Monitorando: /home/strapi/thecryptofrontier');
    console.log('⏱️  Commits automáticos após 3 segundos de inatividade');
    console.log('🔐 Branches protegidas: main, master, production, develop');
    console.log('\n💡 Dicas:');
    console.log('  • Use "diego instrucao <texto>" para adicionar instruções');
    console.log('  • Use "diego listar" para ver todas as configurações');
    console.log('  • Configure MEM0_API_KEY no .env para persistência real');
    console.log('\n⏹️  Pressione Ctrl+C para parar\n');

    // Manter processo rodando
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Parando Auto Commit Agent...');
      agent.stop();
      process.exit(0);
    });

    // Prevenir finalização
    setInterval(() => {}, 1000);

  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    process.exit(1);
  }
}

// Executar
initializeSecureAutoCommit();