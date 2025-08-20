/**
 * Script de teste de integração Guardian + Logs
 */

import { GuardianMemoryManagerOSS } from '../utils/guardian-memory-oss';

async function testIntegration() {
  console.log('🧪 Testando integração Guardian + Logs...\n');
  
  // 1. Testar conexão com Mem0
  console.log('1️⃣ Testando conexão com Mem0...');
  const memory = new GuardianMemoryManagerOSS('http://localhost:3002');
  
  try {
    // Criar uma entrada de log de teste
    const testLog = {
      id: `test-${Date.now()}`,
      agentName: 'Guardian',
      agentType: 'coordinator',
      taskId: 'test-task-1',
      timestamp: new Date(),
      level: 'info',
      content: 'Teste de integração Guardian + Sistema de Logs',
      status: 'completed',
      context: {
        taskDescription: 'Validar integração de logs',
        complexity: 'simple'
      }
    };
    
    // Salvar no Mem0
    await memory.store({
      content: JSON.stringify(testLog),
      namespace: 'agent-logs',
      metadata: {
        agentName: testLog.agentName,
        level: testLog.level,
        timestamp: testLog.timestamp.toISOString()
      }
    });
    
    console.log('✅ Log salvo com sucesso!');
    
    // 2. Buscar logs salvos
    console.log('\n2️⃣ Buscando logs salvos...');
    const results = await memory.search({
      query: 'Guardian',
      namespace: 'agent-logs',
      limit: 10
    });
    
    console.log(`📊 Encontrados ${results.length} logs`);
    results.forEach((result: any) => {
      const log = JSON.parse(result.content);
      console.log(`  - ${log.level}: ${log.content} (${log.timestamp})`);
    });
    
    // 3. Simular tarefa do Guardian
    console.log('\n3️⃣ Simulando tarefa do Guardian...');
    const guardianTask = {
      id: `guardian-task-${Date.now()}`,
      agentName: 'Guardian',
      agentType: 'coordinator',
      taskId: `task-${Date.now()}`,
      timestamp: new Date(),
      startTime: new Date(),
      level: 'task',
      content: 'Analisando estrutura do projeto claude-flow-diego',
      status: 'started',
      context: {
        taskDescription: 'Análise completa do projeto',
        complexity: 'complex',
        projectPath: '/home/strapi/thecryptofrontier/claude-flow-diego'
      }
    };
    
    await memory.store({
      content: JSON.stringify(guardianTask),
      namespace: 'agent-logs',
      metadata: {
        agentName: guardianTask.agentName,
        level: guardianTask.level,
        status: guardianTask.status,
        timestamp: guardianTask.timestamp.toISOString()
      }
    });
    
    console.log('✅ Tarefa do Guardian registrada!');
    
    // Simular conclusão após 2 segundos
    setTimeout(async () => {
      guardianTask.status = 'completed';
      guardianTask.content = 'Análise concluída: 150 arquivos, 10 agentes identificados';
      const endTime = new Date();
      const duration = endTime.getTime() - guardianTask.startTime.getTime();
      
      const completedTask = {
        ...guardianTask,
        endTime,
        duration,
        metadata: {
          filesAnalyzed: 150,
          agentsFound: 10,
          recommendations: 5
        }
      };
      
      await memory.store({
        content: JSON.stringify(completedTask),
        namespace: 'agent-logs',
        metadata: {
          agentName: completedTask.agentName,
          level: completedTask.level,
          status: completedTask.status,
          timestamp: completedTask.timestamp.toISOString()
        }
      });
      
      console.log(`✅ Tarefa concluída em ${duration}ms`);
      
      // 4. Estatísticas finais
      console.log('\n4️⃣ Estatísticas do sistema...');
      const allLogs = await memory.search({
        query: '',
        namespace: 'agent-logs',
        limit: 100
      });
      
      const stats = {
        total: allLogs.length,
        byStatus: {} as Record<string, number>,
        byLevel: {} as Record<string, number>
      };
      
      allLogs.forEach((log: any) => {
        const entry = JSON.parse(log.content);
        stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
        stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
      });
      
      console.log('📊 Estatísticas:');
      console.log(`   Total de logs: ${stats.total}`);
      console.log('   Por status:', stats.byStatus);
      console.log('   Por nível:', stats.byLevel);
      
      console.log('\n✅ Integração testada com sucesso!');
      console.log('🎯 Guardian e Sistema de Logs estão prontos para trabalhar juntos!');
      
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
    process.exit(1);
  }
}

// Executar teste
testIntegration().catch(console.error);