/**
 * Script de teste para o Sistema Unificado de Logging
 */

import { unifiedLog, logAgent, startUnifiedLogAPI } from './agents/agent-log-unified';
import { AgentType } from './core/agent-types';

async function testUnifiedLog() {
  console.log('🧪 Iniciando testes do Sistema Unificado de Logging...\n');

  // Teste 1: Log básico de tarefa
  console.log('📝 Teste 1: Log básico de tarefa');
  const taskId1 = `test-task-${Date.now()}`;
  
  await logAgent.start(
    'Test Agent',
    AgentType.IMPLEMENTER,
    taskId1,
    'Implementar funcionalidade de teste',
    { taskType: 'implementation', complexity: 'medium' }
  );
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await logAgent.progress(taskId1, 'Processando arquivos de configuração...');
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  await logAgent.progress(taskId1, 'Aplicando mudanças no código...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await logAgent.end('Test Agent', taskId1, 'completed', undefined, {
    result: { filesChanged: 3, linesAdded: 42, linesRemoved: 10 }
  });
  
  console.log('✅ Teste 1 concluído\n');

  // Teste 2: Log com erro
  console.log('📝 Teste 2: Log com erro');
  const taskId2 = `error-task-${Date.now()}`;
  
  await logAgent.start(
    'Error Test Agent',
    AgentType.ANALYST,
    taskId2,
    'Tarefa que vai falhar',
    { taskType: 'validation', complexity: 'simple' }
  );
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await logAgent.end(
    'Error Test Agent',
    taskId2,
    'error',
    'Arquivo não encontrado: config.json',
    { attemptedPath: '/path/to/config.json' }
  );
  
  console.log('✅ Teste 2 concluído\n');

  // Teste 3: Log de plano do Guardian
  console.log('📝 Teste 3: Log de plano do Guardian');
  
  await unifiedLog.logPlan({
    agentName: 'Guardian',
    tasks: [
      {
        id: 'task-1',
        type: 'analysis',
        description: 'Analisar estrutura do projeto'
      },
      {
        id: 'task-2',
        type: 'implementation',
        description: 'Implementar melhorias sugeridas'
      },
      {
        id: 'task-3',
        type: 'testing',
        description: 'Executar testes automatizados'
      }
    ],
    metadata: {
      projectPath: '/home/strapi/thecryptofrontier',
      gitBranch: 'feature/unified-logging'
    }
  });
  
  console.log('✅ Teste 3 concluído\n');

  // Teste 4: Obter estatísticas
  console.log('📝 Teste 4: Obter estatísticas');
  
  const stats = await logAgent.getStats('Test Agent');
  console.log('Estatísticas do Test Agent:', JSON.stringify(stats, null, 2));
  
  const allAgents = await unifiedLog.listAllAgents();
  console.log('Todos os agentes:', allAgents);
  
  console.log('✅ Teste 4 concluído\n');

  // Teste 5: Gerar relatório
  console.log('📝 Teste 5: Gerar relatório do pipeline');
  
  const report = await logAgent.generateReport(1); // Última hora
  console.log('Relatório resumido:');
  console.log(`- Total de execuções: ${report.summary.totalExecutions}`);
  console.log(`- Taxa de sucesso: ${report.summary.successRate.toFixed(1)}%`);
  console.log(`- Agentes únicos: ${report.summary.uniqueAgents}`);
  console.log(`- Duração média: ${Math.round(report.summary.averageDuration)}ms`);
  
  console.log('✅ Teste 5 concluído\n');

  console.log('🎉 Todos os testes concluídos com sucesso!');
}

// Executar testes
async function main() {
  try {
    // Iniciar API em modo teste
    console.log('🚀 Iniciando API do Sistema Unificado de Logging...');
    const app = await startUnifiedLogAPI(3001);
    
    console.log('⏳ Aguardando API inicializar...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Executar testes
    await testUnifiedLog();
    
    console.log('\n📊 API disponível em: http://localhost:3001/health');
    console.log('🔍 Visualizar logs: http://localhost:3001/logs/active');
    console.log('📈 Relatório: http://localhost:3001/pipeline-report');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}