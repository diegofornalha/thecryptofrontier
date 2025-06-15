#!/usr/bin/env node

// Teste simples do sistema unificado sem compilação TypeScript

const http = require('http');

console.log('🧪 Teste Simples do Sistema Unificado de Logging\n');

// Testar se o sistema antigo está funcionando
async function testOldSystem() {
  console.log('📝 Testando sistema antigo (porta 3001)...');
  
  return new Promise((resolve) => {
    http.get('http://localhost:3001/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Sistema antigo respondendo:', result);
          resolve(true);
        } catch (e) {
          console.log('❌ Sistema antigo não está respondendo');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Erro ao conectar no sistema antigo:', err.message);
      resolve(false);
    });
  });
}

// Verificar se Guardian pode remover arquivos antigos
async function checkGuardianReadiness() {
  console.log('\n📝 Verificando se Guardian está pronto...');
  
  const fs = require('fs');
  const path = require('path');
  
  const agentDir = path.join(__dirname, '../claude-flow-diego/claude-diego-flow/src/agents');
  const oldFiles = [
    'agent-log.ts',
    'agent-log-conversational.ts',
    'agent-log-simple.ts'
  ];
  
  console.log('\n📁 Arquivos antigos encontrados:');
  let canRemove = true;
  
  for (const file of oldFiles) {
    const filePath = path.join(agentDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  ✓ ${file} (${stats.size} bytes)`);
    } else {
      console.log(`  ✗ ${file} (não encontrado)`);
    }
  }
  
  // Verificar se o novo sistema existe
  const unifiedPath = path.join(agentDir, 'agent-log-unified.ts');
  if (fs.existsSync(unifiedPath)) {
    console.log('\n✅ Sistema unificado encontrado!');
    console.log('  agent-log-unified.ts');
  } else {
    console.log('\n❌ Sistema unificado NÃO encontrado!');
    canRemove = false;
  }
  
  // Verificar backup
  const backupDir = '/home/strapi/thecryptofrontier/backups';
  const backups = fs.readdirSync(backupDir).filter(f => f.startsWith('old-logging-system-'));
  if (backups.length > 0) {
    console.log('\n📦 Backups encontrados:');
    backups.forEach(b => console.log(`  - ${b}`));
  }
  
  return canRemove;
}

// Executar testes
async function main() {
  const oldSystemOk = await testOldSystem();
  const canRemove = await checkGuardianReadiness();
  
  console.log('\n📊 Resumo:');
  console.log(`  Sistema antigo: ${oldSystemOk ? '✅ Funcionando' : '❌ Não está rodando'}`);
  console.log(`  Sistema unificado: ${canRemove ? '✅ Pronto' : '❌ Não está pronto'}`);
  console.log(`  Guardian pode remover: ${canRemove ? '✅ SIM' : '❌ NÃO'}`);
  
  if (canRemove) {
    console.log('\n✅ Guardian pode proceder com a remoção dos arquivos antigos!');
    console.log('\n📝 Arquivos para remover:');
    console.log('  - agent-log.ts');
    console.log('  - agent-log-conversational.ts');
    console.log('  - agent-log-simple.ts (se existir)');
  } else {
    console.log('\n⚠️  Aguarde o sistema unificado estar pronto antes de remover!');
  }
}

main();