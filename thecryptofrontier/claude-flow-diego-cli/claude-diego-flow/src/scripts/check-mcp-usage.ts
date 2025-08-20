#!/usr/bin/env npx tsx

import { MCPUsageTracker } from '../monitoring/mcp-usage-tracker';
import * as fs from 'fs';
import * as path from 'path';

async function checkMCPUsage() {
  console.log('🔍 Verificando uso do MCP no sistema...\n');
  
  const tracker = MCPUsageTracker.getInstance();
  const stats = tracker.getStats();
  
  // 1. Status Geral
  console.log('📊 STATUS GERAL DO MCP:');
  console.log('─'.repeat(50));
  console.log(`Total de tentativas: ${stats.total}`);
  console.log(`Sucessos: ${stats.success} ✅`);
  console.log(`Erros: ${stats.errors} ❌`);
  console.log(`Pulados: ${stats.skipped} ⏭️`);
  console.log(`Taxa de sucesso: ${stats.successRate}`);
  console.log();
  
  // 2. Por Ferramenta
  if (Object.keys(stats.byTool).length > 0) {
    console.log('🔧 USO POR FERRAMENTA:');
    console.log('─'.repeat(50));
    Object.entries(stats.byTool).forEach(([tool, data]: [string, any]) => {
      console.log(`\n${tool}:`);
      console.log(`  Total: ${data.total}`);
      console.log(`  ✅ Sucesso: ${data.success}`);
      console.log(`  ❌ Erro: ${data.error}`);
      console.log(`  ⏭️ Pulado: ${data.skipped}`);
    });
  } else {
    console.log('❌ Nenhuma ferramenta MCP foi usada ainda');
  }
  console.log();
  
  // 3. Por Chamador
  if (Object.keys(stats.byCaller).length > 0) {
    console.log('👤 USO POR CHAMADOR:');
    console.log('─'.repeat(50));
    Object.entries(stats.byCaller).forEach(([caller, data]: [string, any]) => {
      console.log(`\n${caller}:`);
      console.log(`  Total: ${data.total}`);
      console.log(`  Taxa de sucesso: ${data.success > 0 ? (data.success / data.total * 100).toFixed(1) + '%' : '0%'}`);
    });
  }
  console.log();
  
  // 4. Últimas Chamadas
  if (stats.recentCalls && stats.recentCalls.length > 0) {
    console.log('📜 ÚLTIMAS CHAMADAS:');
    console.log('─'.repeat(50));
    stats.recentCalls.slice(-5).forEach((call: any) => {
      const time = new Date(call.timestamp).toLocaleTimeString();
      const status = call.result === 'success' ? '✅' : call.result === 'error' ? '❌' : '⏭️';
      console.log(`${time} ${status} ${call.tool} - ${call.reason || 'OK'}`);
    });
  }
  console.log();
  
  // 5. Sugestões
  const suggestions = tracker.getSuggestions();
  if (suggestions.length > 0) {
    console.log('💡 SUGESTÕES:');
    console.log('─'.repeat(50));
    suggestions.forEach(s => console.log(`• ${s}`));
    console.log();
  }
  
  // 6. Verificar logs do Guardian
  console.log('📁 VERIFICANDO LOGS DO GUARDIAN:');
  console.log('─'.repeat(50));
  
  const logsDir = path.join(process.cwd(), 'logs');
  if (fs.existsSync(logsDir)) {
    const logFiles = fs.readdirSync(logsDir).filter(f => f.includes('guardian'));
    if (logFiles.length > 0) {
      console.log(`Encontrados ${logFiles.length} arquivos de log do Guardian:`);
      logFiles.forEach(f => {
        const stats = fs.statSync(path.join(logsDir, f));
        console.log(`  • ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
      });
    } else {
      console.log('❌ Nenhum log do Guardian encontrado');
    }
  } else {
    console.log('❌ Diretório de logs não existe');
  }
  console.log();
  
  // 7. Diagnóstico
  console.log('🔍 DIAGNÓSTICO:');
  console.log('─'.repeat(50));
  
  if (stats.total === 0) {
    console.log('⚠️ PROBLEMA: Nenhuma tentativa de uso do MCP registrada!');
    console.log('\nPossíveis causas:');
    console.log('1. MCPBridge não está sendo inicializado');
    console.log('2. Guardian não está usando MCP quando deveria');
    console.log('3. Condições para ativar MCP muito restritivas');
    console.log('\nAções recomendadas:');
    console.log('1. Verificar se MCPBridge.connect() está sendo chamado');
    console.log('2. Adicionar mais logs no Guardian para debug');
    console.log('3. Revisar condições de ativação do MCP');
  } else if (stats.skipped > stats.success) {
    console.log('⚠️ PROBLEMA: Muitas chamadas MCP estão sendo puladas!');
    console.log('\nPossível causa: MCPBridge não está conectado');
    console.log('Verifique os logs de inicialização do Guardian');
  } else if (stats.success > 0) {
    console.log('✅ MCP está funcionando corretamente!');
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('Para monitorar em tempo real, execute:');
  console.log('npx tsx src/scripts/monitor-mcp-realtime.ts');
}

// Executar
checkMCPUsage().catch(console.error);