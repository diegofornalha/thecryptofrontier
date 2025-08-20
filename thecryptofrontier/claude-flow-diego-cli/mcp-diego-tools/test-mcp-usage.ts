#!/usr/bin/env npx tsx

/**
 * Script para testar e monitorar o uso das ferramentas MCP
 * Verifica se as ferramentas estão sendo chamadas corretamente
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configurar logging
const LOG_FILE = path.join(process.cwd(), 'mcp-usage-test.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry);
  logStream.write(logEntry + '\n');
  
  if (data) {
    const dataStr = JSON.stringify(data, null, 2);
    console.log(dataStr);
    logStream.write(dataStr + '\n');
  }
}

// Função para chamar ferramenta MCP via processo
async function callMCPTool(toolName: string, args: any): Promise<any> {
  return new Promise((resolve, reject) => {
    log(`Chamando ferramenta MCP: ${toolName}`, args);
    
    const mcpProcess = spawn('node', [path.join(__dirname, 'src/index.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        LOG_LEVEL: 'DEBUG',
        LOG_FILE: 'true',
        LOG_DIR: './logs'
      }
    });
    
    let responseBuffer = '';
    let errorBuffer = '';
    
    mcpProcess.stdout.on('data', (data) => {
      responseBuffer += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      errorBuffer += data.toString();
      log('MCP stderr:', data.toString());
    });
    
    mcpProcess.on('close', (code) => {
      log(`MCP processo finalizado com código: ${code}`);
      
      if (code !== 0) {
        reject(new Error(`MCP process exited with code ${code}: ${errorBuffer}`));
      } else {
        try {
          const lines = responseBuffer.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);
          resolve(result);
        } catch (e) {
          resolve({ raw: responseBuffer });
        }
      }
    });
    
    // Enviar request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };
    
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();
  });
}

// Testes das ferramentas principais
async function runTests() {
  log('=== Iniciando testes de uso das ferramentas MCP ===');
  
  // Teste 1: Guardian Status
  try {
    log('\n--- Teste 1: Guardian Status ---');
    const result = await callMCPTool('mcp__diego-tools__guardian_status', {});
    log('Resultado Guardian Status:', result);
  } catch (error) {
    log('Erro no Guardian Status:', error);
  }
  
  // Teste 2: Listar Agentes
  try {
    log('\n--- Teste 2: Listar Agentes ---');
    const result = await callMCPTool('mcp__diego-tools__agents_list', {});
    log('Resultado Listar Agentes:', result);
  } catch (error) {
    log('Erro ao Listar Agentes:', error);
  }
  
  // Teste 3: Adicionar Memória
  try {
    log('\n--- Teste 3: Adicionar Memória ---');
    const result = await callMCPTool('mcp__diego-tools__mem0_add_memory', {
      user_id: 'test-user',
      content: 'Teste de memória MCP',
      category: 'test'
    });
    log('Resultado Adicionar Memória:', result);
  } catch (error) {
    log('Erro ao Adicionar Memória:', error);
  }
  
  // Teste 4: Buscar Memórias
  try {
    log('\n--- Teste 4: Buscar Memórias ---');
    const result = await callMCPTool('mcp__diego-tools__mem0_search_memory', {
      user_id: 'test-user',
      query: 'teste'
    });
    log('Resultado Buscar Memórias:', result);
  } catch (error) {
    log('Erro ao Buscar Memórias:', error);
  }
  
  log('\n=== Testes concluídos ===');
  log(`Log salvo em: ${LOG_FILE}`);
}

// Executar testes
runTests().catch(error => {
  log('Erro fatal:', error);
  process.exit(1);
}).finally(() => {
  logStream.end();
});