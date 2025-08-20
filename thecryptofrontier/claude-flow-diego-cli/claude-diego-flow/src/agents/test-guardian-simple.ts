#!/usr/bin/env npx tsx

import { GuardianOrchestratorMCP } from './guardian-orchestrator-mcp';

async function test() {
  console.log('Starting Guardian test...');
  
  try {
    const guardian = new GuardianOrchestratorMCP();
    console.log('Guardian created');
    
    await guardian.initialize();
    console.log('Guardian initialized');
    
    const message = {
      role: 'user' as const,
      content: 'teste simples'
    };
    
    console.log('Testing with message:', message);
    
    const result = await guardian.processMessage(message);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();