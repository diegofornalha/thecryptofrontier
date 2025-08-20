#!/usr/bin/env npx tsx

/**
 * Rastreador de Invocações MCP
 * Monitora e registra quando as ferramentas MCP são invocadas
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuração
const TRACKING_FILE = path.join(process.cwd(), 'mcp-invocations-tracking.json');
const LOG_FILE = path.join(process.cwd(), 'mcp-invocations.log');

// Estrutura de rastreamento
interface MCPInvocation {
  timestamp: string;
  tool: string;
  args: any;
  caller?: string;
  result?: any;
  error?: string;
  duration?: number;
}

class MCPTracker {
  private invocations: MCPInvocation[] = [];
  private logStream: fs.WriteStream;
  
  constructor() {
    // Carregar invocações existentes
    if (fs.existsSync(TRACKING_FILE)) {
      try {
        const data = fs.readFileSync(TRACKING_FILE, 'utf-8');
        this.invocations = JSON.parse(data);
      } catch (e) {
        console.log('Iniciando novo arquivo de rastreamento');
      }
    }
    
    // Criar stream de log
    this.logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
  }
  
  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    this.logStream.write(`[${timestamp}] ${message}\n`);
    
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      console.log(dataStr);
      this.logStream.write(dataStr + '\n');
    }
  }
  
  addInvocation(invocation: MCPInvocation) {
    this.invocations.push(invocation);
    this.save();
    
    this.log(`MCP Invocação registrada: ${invocation.tool}`, {
      tool: invocation.tool,
      timestamp: invocation.timestamp,
      args: invocation.args
    });
  }
  
  save() {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(this.invocations, null, 2));
  }
  
  analyze() {
    console.log('\n=== Análise de Invocações MCP ===');
    console.log(`Total de invocações: ${this.invocations.length}`);
    
    // Contar por ferramenta
    const toolCounts = new Map<string, number>();
    const toolErrors = new Map<string, number>();
    
    for (const inv of this.invocations) {
      toolCounts.set(inv.tool, (toolCounts.get(inv.tool) || 0) + 1);
      if (inv.error) {
        toolErrors.set(inv.tool, (toolErrors.get(inv.tool) || 0) + 1);
      }
    }
    
    console.log('\nFerramentas invocadas:');
    for (const [tool, count] of toolCounts) {
      const errors = toolErrors.get(tool) || 0;
      console.log(`  ${tool}: ${count} invocações (${errors} erros)`);
    }
    
    // Últimas 5 invocações
    console.log('\nÚltimas 5 invocações:');
    const recent = this.invocations.slice(-5);
    for (const inv of recent) {
      console.log(`  ${inv.timestamp} - ${inv.tool} ${inv.error ? '(ERRO)' : '(OK)'}`);
    }
    
    // Verificar se MCP está sendo usado
    const mcpTools = this.invocations.filter(inv => 
      inv.tool.startsWith('mcp__') || inv.tool.includes('diego-tools')
    );
    
    if (mcpTools.length === 0) {
      console.log('\n⚠️  AVISO: Nenhuma ferramenta MCP foi invocada!');
      console.log('Isso pode indicar que as ferramentas MCP não estão sendo chamadas quando necessário.');
    } else {
      console.log(`\n✅ ${mcpTools.length} ferramentas MCP foram invocadas.`);
    }
  }
  
  async checkProcesses() {
    console.log('\n=== Verificando Processos MCP ===');
    
    try {
      // Verificar processos node relacionados ao MCP
      const { stdout } = await execAsync('ps aux | grep -E "(mcp|diego-tools|guardian)" | grep -v grep');
      const lines = stdout.trim().split('\n');
      
      if (lines.length > 0 && lines[0]) {
        console.log('Processos MCP em execução:');
        for (const line of lines) {
          if (line.includes('node') || line.includes('tsx')) {
            console.log(`  ${line.substring(0, 100)}...`);
          }
        }
      } else {
        console.log('❌ Nenhum processo MCP em execução detectado');
      }
    } catch (e) {
      console.log('❌ Nenhum processo MCP em execução');
    }
  }
  
  async testDirectCall() {
    console.log('\n=== Teste de Chamada Direta MCP ===');
    
    try {
      // Tentar chamar ferramenta diretamente
      const startTime = Date.now();
      
      // Simular chamada Guardian Status
      this.log('Testando chamada direta: mcp__diego-tools__guardian_status');
      
      const invocation: MCPInvocation = {
        timestamp: new Date().toISOString(),
        tool: 'mcp__diego-tools__guardian_status',
        args: {},
        caller: 'test-direct'
      };
      
      // Aqui normalmente seria feita a chamada real
      // Por enquanto, apenas registramos
      invocation.duration = Date.now() - startTime;
      invocation.result = { test: true, message: 'Teste de rastreamento' };
      
      this.addInvocation(invocation);
      
      console.log('✅ Teste registrado com sucesso');
    } catch (error) {
      console.log('❌ Erro no teste:', error);
    }
  }
  
  async monitorFiles() {
    console.log('\n=== Monitorando Arquivos de Log ===');
    
    const logPatterns = [
      '/home/strapi/thecryptofrontier/claude-flow-diego/reports',
      '/home/strapi/thecryptofrontier/logs',
      '/home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/logs',
      '/home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools/logs'
    ];
    
    for (const pattern of logPatterns) {
      if (fs.existsSync(pattern)) {
        const files = fs.readdirSync(pattern);
        if (files.length > 0) {
          console.log(`\nArquivos em ${pattern}:`);
          for (const file of files.slice(0, 5)) {
            const stat = fs.statSync(path.join(pattern, file));
            console.log(`  ${file} (${stat.size} bytes, modificado: ${stat.mtime.toISOString()})`);
          }
        }
      }
    }
  }
  
  close() {
    this.logStream.end();
  }
}

// Executar análise
async function main() {
  const tracker = new MCPTracker();
  
  console.log('=== Rastreador de Invocações MCP ===');
  console.log(`Arquivo de rastreamento: ${TRACKING_FILE}`);
  console.log(`Log: ${LOG_FILE}`);
  
  // Executar análises
  tracker.analyze();
  await tracker.checkProcesses();
  await tracker.monitorFiles();
  
  // Opção de teste
  if (process.argv.includes('--test')) {
    await tracker.testDirectCall();
  }
  
  // Verificar padrões de uso
  console.log('\n=== Recomendações ===');
  console.log('1. Certifique-se de que LOG_FILE=true no .env do MCP');
  console.log('2. Verifique se o Guardian está configurado para usar MCPBridge');
  console.log('3. Execute o monitor-mcp-calls.ts para capturar chamadas em tempo real');
  console.log('4. Use --test para adicionar uma invocação de teste');
  
  tracker.close();
}

main().catch(error => {
  console.error('Erro:', error);
  process.exit(1);
});