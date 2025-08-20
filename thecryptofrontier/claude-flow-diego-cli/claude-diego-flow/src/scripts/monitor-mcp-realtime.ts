#!/usr/bin/env npx tsx

import { MCPUsageTracker } from '../monitoring/mcp-usage-tracker';
import * as fs from 'fs';
import * as path from 'path';

function clearScreen() {
  process.stdout.write('\x1Bc');
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

async function monitorMCP() {
  console.log('🔴 Monitorando MCP em tempo real...');
  console.log('Pressione Ctrl+C para sair\n');
  
  const tracker = MCPUsageTracker.getInstance();
  let lastTotal = 0;
  
  // Criar diretório de logs se não existir
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  setInterval(() => {
    clearScreen();
    const stats = tracker.getStats();
    
    console.log('🔴 MONITOR MCP - TEMPO REAL');
    console.log('═'.repeat(60));
    console.log(`Horário: ${new Date().toLocaleString()}`);
    console.log();
    
    // Status Geral
    console.log('📊 STATUS:');
    console.log(`Total: ${stats.total} | ✅ ${stats.success} | ❌ ${stats.errors} | ⏭️ ${stats.skipped}`);
    console.log(`Taxa de Sucesso: ${stats.successRate}`);
    console.log();
    
    // Novas chamadas
    if (stats.total > lastTotal) {
      console.log('🆕 NOVA ATIVIDADE DETECTADA!');
      console.log('─'.repeat(60));
    }
    lastTotal = stats.total;
    
    // Últimas 10 chamadas
    if (stats.recentCalls && stats.recentCalls.length > 0) {
      console.log('📜 ÚLTIMAS CHAMADAS:');
      console.log('─'.repeat(60));
      console.log('Hora      | Status | Ferramenta            | Info');
      console.log('─'.repeat(60));
      
      stats.recentCalls.slice(-10).forEach((call: any) => {
        const time = formatTime(call.timestamp);
        const status = call.result === 'success' ? '✅' : 
                      call.result === 'error' ? '❌' : '⏭️';
        const tool = call.tool.padEnd(20);
        const info = call.reason || `${call.duration || 0}ms`;
        
        console.log(`${time} | ${status}     | ${tool} | ${info}`);
      });
    } else {
      console.log('⏳ Aguardando chamadas MCP...');
    }
    
    console.log();
    
    // Estatísticas por ferramenta
    if (Object.keys(stats.byTool).length > 0) {
      console.log('🔧 POR FERRAMENTA:');
      console.log('─'.repeat(60));
      
      Object.entries(stats.byTool)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .forEach(([tool, data]: [string, any]) => {
          const successRate = data.total > 0 ? 
            (data.success / data.total * 100).toFixed(0) : '0';
          console.log(`${tool}: ${data.total} calls (${successRate}% success)`);
        });
    }
    
    console.log();
    console.log('💡 Dica: Execute comandos que usam MCP em outro terminal');
    console.log('Ex: guardian_analyze, screenshot, navegação, etc.');
    
  }, 1000); // Atualiza a cada segundo
}

// Executar
console.log('Iniciando monitor...');
monitorMCP().catch(console.error);

// Capturar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor encerrado');
  process.exit(0);
});