#!/usr/bin/env node
import { MCPRemovalAgent } from './agents/mcp-removal-agent';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  const agent = new MCPRemovalAgent();
  const action = process.argv[2] || 'analyze';
  
  console.log(`\n🤖 MCPRemovalAgent - Ação: ${action}\n`);
  
  try {
    const result = await agent.execute({ action });
    
    if (result.success) {
      console.log('✅ Sucesso!\n');
      console.log(JSON.stringify(result.output, null, 2));
    } else {
      console.error('❌ Erro:', result.output.error);
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

main();