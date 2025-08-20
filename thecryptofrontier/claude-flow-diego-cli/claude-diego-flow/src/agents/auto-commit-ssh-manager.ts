#!/usr/bin/env npx tsx

/**
 * CLI para gerenciamento de chaves SSH do Auto Commit Agent
 * Integrado com Mem0 para persistência de histórico
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { AutoCommitAgent } from './auto-commit-agent';
import * as readline from 'readline';

const program = new Command();

program
  .name('auto-commit-ssh')
  .description('Gerenciador de chaves SSH para Auto Commit Agent')
  .version('1.0.0');

/**
 * Comando para armazenar nova chave SSH
 */
program
  .command('store')
  .description('Armazena uma nova chave SSH')
  .option('-f, --file <path>', 'Caminho para arquivo com a chave SSH')
  .option('-k, --key <content>', 'Conteúdo da chave SSH (não recomendado)')
  .action(async (options) => {
    try {
      let sshKey = '';
      
      if (options.file) {
        // Ler chave do arquivo
        sshKey = fs.readFileSync(options.file, 'utf-8');
      } else if (options.key) {
        // Usar chave fornecida diretamente
        sshKey = options.key;
      } else {
        // Ler chave interativamente
        console.log('📝 Cole sua chave SSH privada (Ctrl+D quando terminar):');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const lines: string[] = [];
        for await (const line of rl) {
          lines.push(line);
        }
        sshKey = lines.join('\n');
      }
      
      const agent = new AutoCommitAgent();
      const success = await agent.storeSSHKey(sshKey);
      
      if (success) {
        console.log('✅ Chave SSH armazenada com sucesso!');
      } else {
        console.error('❌ Falha ao armazenar chave SSH');
        process.exit(1);
      }
    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    }
  });

/**
 * Comando para rotacionar chave SSH
 */
program
  .command('rotate')
  .description('Rotaciona a chave SSH (backup da antiga, armazena nova)')
  .option('-f, --file <path>', 'Caminho para arquivo com a nova chave SSH')
  .action(async (options) => {
    try {
      let sshKey = '';
      
      if (options.file) {
        sshKey = fs.readFileSync(options.file, 'utf-8');
      } else {
        console.log('📝 Cole sua nova chave SSH privada (Ctrl+D quando terminar):');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const lines: string[] = [];
        for await (const line of rl) {
          lines.push(line);
        }
        sshKey = lines.join('\n');
      }
      
      const agent = new AutoCommitAgent();
      const success = await agent.rotateSSHKey(sshKey);
      
      if (success) {
        console.log('✅ Chave SSH rotacionada com sucesso!');
        console.log('📋 Backup da chave antiga foi criado');
      } else {
        console.error('❌ Falha ao rotacionar chave SSH');
        process.exit(1);
      }
    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    }
  });

/**
 * Comando para verificar status da chave
 */
program
  .command('status')
  .description('Verifica status da chave SSH atual')
  .action(async () => {
    try {
      const credentialsPath = path.join(process.cwd(), '.diego-tools', 'credentials');
      
      if (!fs.existsSync(credentialsPath)) {
        console.log('❌ Nenhuma chave SSH configurada');
        console.log('💡 Use "auto-commit-ssh store" para adicionar uma chave');
        return;
      }
      
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
      console.log('✅ Chave SSH configurada:');
      console.log(`  📁 Tipo: ${credentials.type}`);
      console.log(`  🤖 Agente: ${credentials.agent}`);
      console.log(`  📅 Criada em: ${credentials.createdAt}`);
      console.log(`  📍 Localização: ${credentials.path}`);
      
      // Verificar se arquivo existe
      if (fs.existsSync(credentials.path)) {
        console.log(`  ✅ Arquivo de chave existe`);
      } else {
        console.log(`  ❌ Arquivo de chave não encontrado!`);
      }
      
      // Verificar por falhas
      const agent = new AutoCommitAgent();
      const failures = await agent.checkForKeyFailures();
      
      if (failures) {
        console.log('\n⚠️ Falhas detectadas:');
        console.log(`  📅 Última falha: ${failures.timestamp}`);
        console.log(`  💬 ${failures.message}`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar status:', error.message);
    }
  });

/**
 * Comando para listar histórico
 */
program
  .command('history')
  .description('Lista histórico de rotação de chaves')
  .option('--local', 'Mostrar apenas histórico local')
  .option('--mem0', 'Buscar histórico do Mem0')
  .action(async (options) => {
    try {
      const agent = new AutoCommitAgent();
      
      // Histórico local (backups)
      if (options.local || !options.mem0) {
        console.log('📋 Histórico Local (Backups):');
        const backups = agent.getKeyHistory();
        
        if (backups.length === 0) {
          console.log('  Nenhum backup encontrado');
        } else {
          backups.forEach(backup => {
            console.log(`  - ${backup}`);
          });
        }
      }
      
      // Histórico do Mem0
      if (options.mem0 || !options.local) {
        console.log('\n🧠 Histórico Mem0:');
        const mem0History = await agent.getKeyHistoryFromMem0();
        
        if (mem0History.length === 0) {
          console.log('  Nenhum histórico encontrado no Mem0');
        } else {
          mem0History.forEach((item: any) => {
            console.log(`  - ${item.memory}`);
            if (item.metadata) {
              console.log(`    Metadata: ${JSON.stringify(item.metadata, null, 2)}`);
            }
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar histórico:', error.message);
    }
  });

/**
 * Comando para remover chave
 */
program
  .command('remove')
  .description('Remove a chave SSH armazenada')
  .option('--force', 'Força remoção sem confirmação')
  .action(async (options) => {
    try {
      if (!options.force) {
        console.log('⚠️ Tem certeza que deseja remover a chave SSH? (s/N)');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise<string>(resolve => {
          rl.question('', resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() !== 's') {
          console.log('❌ Operação cancelada');
          return;
        }
      }
      
      const agent = new AutoCommitAgent();
      const success = agent.removeSSHKey();
      
      if (success) {
        console.log('✅ Chave SSH removida com sucesso');
      } else {
        console.error('❌ Falha ao remover chave SSH');
      }
    } catch (error: any) {
      console.error('❌ Erro:', error.message);
    }
  });

/**
 * Comando para validar chave
 */
program
  .command('validate')
  .description('Valida se a chave SSH atual funciona')
  .action(async () => {
    try {
      const credentialsPath = path.join(process.cwd(), '.diego-tools', 'credentials');
      
      if (!fs.existsSync(credentialsPath)) {
        console.log('❌ Nenhuma chave SSH configurada');
        return;
      }
      
      console.log('🔍 Validando chave SSH...');
      
      // Criar instância temporária do agent para validar
      const agent = new AutoCommitAgent();
      
      // Tentar um comando git remoto simples
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
      const gitCommand = `GIT_SSH_COMMAND="ssh -i ${credentials.path} -o StrictHostKeyChecking=no" git ls-remote`;
      
      try {
        await execAsync(gitCommand);
        console.log('✅ Chave SSH válida e funcionando!');
      } catch (error: any) {
        console.error('❌ Chave SSH inválida ou sem permissão');
        console.error('💡 Detalhes:', error.message);
      }
    } catch (error: any) {
      console.error('❌ Erro ao validar:', error.message);
    }
  });

program.parse();