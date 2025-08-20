#!/usr/bin/env tsx
/**
 * Script para sincronizar .gitignore com Mem0 imediatamente
 */

import { syncGitignoreToMem0, enableGitignoreAutoSync } from './gitignore-mem0-sync';
import { diegoCommand } from './diego-commands';

async function main() {
  console.log('🔄 Sincronizando .gitignore do Diego com Mem0...\n');
  
  // Caminho do projeto
  const projectPath = '/home/strapi/thecryptofrontier';
  
  // 1. Sincronizar conteúdo atual
  const sync = await syncGitignoreToMem0(projectPath);
  
  // 2. Adicionar instrução geral sobre o .gitignore
  await diegoCommand('instrucao meu .gitignore tem timestamp na primeira linha comentada mostrando hora e data da última atualização');
  await diegoCommand('instrucao sempre respeitar as regras do meu .gitignore ao fazer commits');
  await diegoCommand('instrucao o .gitignore é dinâmico e deve ser sincronizado com o Mem0 periodicamente');
  
  // 3. Configurar preferência para commits do .gitignore
  await diegoCommand('preferencia .gitignore "🚫 chore: atualiza regras de ignore ({timestamp})"');
  
  // 4. Habilitar sincronização automática a cada 5 minutos
  console.log('\n🤖 Habilitando sincronização automática...');
  await enableGitignoreAutoSync(projectPath, 5);
  
  console.log('\n✅ Sincronização concluída!');
  console.log('📋 O .gitignore do Diego foi registrado na memória do Auto Commit Agent');
  console.log('🔄 Sincronização automática ativada (a cada 5 minutos)');
  
  // Mostrar resumo
  const history = await diegoCommand('listar');
  console.log('\n📊 Resumo das configurações:');
  console.log(history);
}

// Executar
main().catch(console.error);