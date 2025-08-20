/**
 * Teste simples de integração Guardian + Mem0
 */

import { GuardianMemoryManagerOSS } from '../utils/guardian-memory-oss';

async function testSimple() {
  console.log('🧪 Teste simples Guardian + Mem0...\n');
  
  const memory = new GuardianMemoryManagerOSS('http://localhost:3002');
  
  try {
    // 1. Adicionar memória do Guardian
    console.log('1️⃣ Adicionando memória do Guardian...');
    await memory.addMemory({
      content: 'Guardian analisou o projeto claude-flow-diego e encontrou 10 agentes',
      metadata: {
        project: 'claude-flow-diego',
        action: 'análise',
        agentsFound: 10,
        date: new Date().toISOString()
      },
      tags: ['análise', 'guardian', 'agentes'],
      category: 'project-analysis'
    });
    console.log('✅ Memória adicionada!');
    
    // 2. Buscar memórias
    console.log('\n2️⃣ Buscando memórias do Guardian...');
    const results = await memory.searchMemories('claude-flow-diego', 5);
    console.log(`📊 Encontradas ${results.length} memórias:`);
    results.forEach((mem, idx) => {
      console.log(`  ${idx + 1}. ${mem.content}`);
      if (mem.metadata) {
        console.log(`     Metadata:`, mem.metadata);
      }
    });
    
    // 3. Adicionar log de tarefa
    console.log('\n3️⃣ Registrando tarefa do Guardian...');
    await memory.addMemory({
      content: 'Guardian iniciou organização dos agentes de log',
      metadata: {
        project: 'claude-flow-diego',
        action: 'organização',
        taskType: 'unificação-logs',
        status: 'iniciado',
        timestamp: new Date().toISOString()
      },
      tags: ['tarefa', 'logs', 'organização'],
      category: 'task-log'
    });
    console.log('✅ Tarefa registrada!');
    
    // 4. Simular conclusão
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await memory.addMemory({
      content: 'Guardian concluiu unificação dos 3 agentes de log em 1 sistema unificado',
      metadata: {
        project: 'claude-flow-diego',
        action: 'organização',
        taskType: 'unificação-logs',
        status: 'concluído',
        agentesProcessados: 3,
        resultado: 'sistema-unificado',
        timestamp: new Date().toISOString()
      },
      tags: ['tarefa', 'logs', 'concluído'],
      category: 'task-log'
    });
    console.log('✅ Conclusão registrada!');
    
    // 5. Buscar histórico de tarefas
    console.log('\n4️⃣ Histórico de tarefas...');
    const taskHistory = await memory.searchMemories('unificação-logs', 10);
    console.log(`📋 ${taskHistory.length} registros encontrados`);
    
    console.log('\n✅ Teste concluído com sucesso!');
    console.log('🤝 Guardian e Mem0 estão trabalhando juntos!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
testSimple().catch(console.error);