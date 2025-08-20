/**
 * Script de teste do sistema unificado de logging
 * 
 * Testa todas as funcionalidades do agent-log-unified.ts
 */

import { unifiedLog, logGuardianPlan, logTask } from '../agents/agent-log-unified';
import { AgentType } from '../core/agent-types';
import { Task } from '../core/base-agent-simple';

async function testUnifiedLog() {
  console.log('🧪 Iniciando testes do Unified Agent Log...\n');
  
  // 1. Testar log de plano
  console.log('1️⃣ Testando log de plano...');
  const testTasks: Task[] = [
    {
      id: 'task-1',
      description: 'Analisar estrutura do projeto',
      type: 'analysis',
      metadata: {
        assignedAgent: 'FileAnalyzer',
        agentType: AgentType.ANALYST,
        complexity: 'medium'
      }
    },
    {
      id: 'task-2',
      description: 'Organizar documentação',
      type: 'organization',
      metadata: {
        assignedAgent: 'DocOrganizer',
        agentType: AgentType.IMPLEMENTER,
        complexity: 'simple'
      }
    },
    {
      id: 'task-3',
      description: 'Otimizar código',
      type: 'optimization',
      metadata: {
        assignedAgent: 'CodeOptimizer',
        agentType: AgentType.ANALYST,
        complexity: 'complex'
      }
    }
  ];
  
  await logGuardianPlan({
    agentName: 'TestGuardian',
    tasks: testTasks,
    metadata: {
      testRun: true,
      timestamp: new Date()
    }
  });
  console.log('✅ Log de plano criado\n');
  
  // 2. Testar progresso de tarefas
  console.log('2️⃣ Testando progresso de tarefas...');
  
  // Simular execução da task-1
  await unifiedLog.logProgress('task-1', 'Iniciando análise de arquivos TypeScript...');
  await delay(500);
  await unifiedLog.logProgress('task-1', 'Analisados 25 arquivos de 100...');
  await delay(500);
  await unifiedLog.logProgress('task-1', 'Análise completa: 100 arquivos processados');
  await unifiedLog.logTaskComplete('task-1', {
    filesAnalyzed: 100,
    issues: 5,
    suggestions: 12
  });
  console.log('✅ Task 1 completada\n');
  
  // Simular execução da task-2 com erro
  await unifiedLog.logProgress('task-2', 'Organizando arquivos de documentação...');
  await delay(300);
  await unifiedLog.logError('task-2', new Error('Permissão negada ao mover arquivo README.md'));
  console.log('✅ Task 2 falhou (esperado)\n');
  
  // Simular execução da task-3
  await unifiedLog.logProgress('task-3', 'Analisando oportunidades de otimização...');
  await delay(400);
  await unifiedLog.logProgress('task-3', 'Aplicando otimizações de performance...');
  await delay(600);
  await unifiedLog.logTaskComplete('task-3', {
    optimizationsApplied: 8,
    performanceGain: '23%'
  });
  console.log('✅ Task 3 completada\n');
  
  // 3. Testar estatísticas
  console.log('3️⃣ Testando estatísticas...');
  
  const agents = ['FileAnalyzer', 'DocOrganizer', 'CodeOptimizer', 'TestGuardian'];
  
  for (const agentName of agents) {
    const stats = await unifiedLog.getAgentStats(agentName);
    if (stats) {
      console.log(`📊 ${agentName}:`);
      console.log(`   - Execuções: ${stats.totalExecutions}`);
      console.log(`   - Taxa de sucesso: ${stats.successRate.toFixed(1)}%`);
      console.log(`   - Duração média: ${stats.averageDuration}ms`);
    }
  }
  console.log('');
  
  // 4. Testar relatório do pipeline
  console.log('4️⃣ Gerando relatório do pipeline...');
  const report = await unifiedLog.generatePipelineReport(1);
  
  console.log('📋 Relatório:');
  console.log(`   - Total de execuções: ${report.summary.totalExecutions}`);
  console.log(`   - Agentes únicos: ${report.summary.uniqueAgents}`);
  console.log(`   - Taxa de sucesso geral: ${report.summary.successRate.toFixed(1)}%`);
  console.log(`   - Duração total: ${report.summary.totalDuration}ms`);
  console.log(`   - Duração média: ${Math.round(report.summary.averageDuration)}ms\n`);
  
  // 5. Testar API REST
  console.log('5️⃣ Iniciando API REST...');
  const app = await unifiedLog.startAPI(3001);
  
  console.log('🌐 API REST iniciada em http://localhost:3001');
  console.log('   Endpoints disponíveis:');
  console.log('   - GET  /health');
  console.log('   - GET  /agents');
  console.log('   - GET  /stats/:agentName');
  console.log('   - GET  /history/:agentName');
  console.log('   - GET  /pipeline-report');
  console.log('   - GET  /logs/active');
  console.log('   - GET  /logs/search');
  console.log('   - POST /log/start');
  console.log('   - POST /log/end');
  console.log('   - POST /log/progress');
  console.log('   - POST /log/plan\n');
  
  // 6. Testar histórico conversacional
  console.log('6️⃣ Testando log conversacional...');
  
  const conversationalTaskId = 'conv-task-1';
  await unifiedLog.logTaskStart({
    agentName: 'ConversationalAgent',
    agentType: AgentType.ANALYST,
    taskId: conversationalTaskId,
    taskDescription: 'Análise conversacional de código',
    taskType: 'conversational-analysis'
  });
  
  await unifiedLog.logProgress(conversationalTaskId, 'Iniciando análise do código-fonte...');
  await delay(200);
  await unifiedLog.logProgress(conversationalTaskId, 'Identificados 3 pontos de melhoria');
  await delay(200);
  await unifiedLog.logProgress(conversationalTaskId, 'Gerando sugestões detalhadas...');
  await unifiedLog.logTaskComplete(conversationalTaskId, {
    suggestions: [
      'Refatorar função processData() para melhor legibilidade',
      'Adicionar tipos TypeScript às interfaces',
      'Implementar cache para operações custosas'
    ]
  });
  
  console.log('✅ Log conversacional criado\n');
  
  // 7. Listar todos os agentes
  console.log('7️⃣ Listando todos os agentes...');
  const allAgents = await unifiedLog.listAllAgents();
  console.log(`📋 Agentes registrados: ${allAgents.join(', ')}\n`);
  
  console.log('✅ Todos os testes concluídos com sucesso!');
  console.log('\n🎯 Próximos passos:');
  console.log('1. Integrar com Guardian real');
  console.log('2. Remover agentes de log antigos');
  console.log('3. Configurar Mem0 com permissões corretas');
  console.log('4. Deploy em produção');
  
  // Manter a API rodando
  console.log('\n⏳ API continuará rodando. Use Ctrl+C para parar.');
}

// Função auxiliar de delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar testes
if (require.main === module) {
  testUnifiedLog().catch(error => {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  });
}