/**
 * Script para coordenar unificação de ferramentas usando Guardian + Cleanup
 */

import { GuardianWithAutoLogs } from '../agents/guardian-with-auto-logs';
import axios from 'axios';

async function coordinateUnification() {
  console.log('🤝 Coordenando unificação com Guardian + Cleanup Service...\n');
  
  const guardian = new GuardianWithAutoLogs('/home/strapi/thecryptofrontier');
  const cleanupServiceUrl = 'http://localhost:3003';
  
  // 1. Registrar plano de unificação
  await guardian.logPlan({
    agentName: 'Guardian Coordinator',
    tasks: [
      {
        id: 'analyze-1',
        description: 'Analisar ferramentas de geração de imagem',
        type: 'análise',
        metadata: {
          target: 'image_generation*.py',
          expectedFiles: 3
        }
      },
      {
        id: 'analyze-2',
        description: 'Analisar ferramentas Algolia',
        type: 'análise',
        metadata: {
          target: '*algolia*.py',
          expectedFiles: 9
        }
      },
      {
        id: 'unify-1',
        description: 'Unificar ferramentas de imagem',
        type: 'unificação',
        metadata: {
          newFile: 'image_generation_service.py',
          complexity: 'medium'
        }
      },
      {
        id: 'unify-2',
        description: 'Unificar ferramentas Algolia',
        type: 'unificação',
        metadata: {
          newFile: 'algolia_sync_service.py',
          complexity: 'high'
        }
      }
    ],
    metadata: {
      objetivo: 'Eliminar duplicação de código',
      estimatedSavings: '80KB'
    }
  });
  
  // 2. Obter análise do Cleanup Service
  console.log('📊 Obtendo análise do Cleanup Service...');
  
  try {
    const cleanupAnalysis = await axios.post(`${cleanupServiceUrl}/cleanup/execute`, {
      dryRun: true,
      patterns: [
        '**/blog_crew/src/tools/*algolia*.py',
        '**/blog_crew/src/tools/image_generation*.py'
      ]
    });
    
    const { filesFound } = cleanupAnalysis.data.report;
    
    await guardian.logTaskProgress('analyze-1', 
      `Encontrados ${filesFound.filter(f => f.includes('image_generation')).length} arquivos de geração de imagem`
    );
    
    await guardian.logTaskProgress('analyze-2',
      `Encontrados ${filesFound.filter(f => f.includes('algolia')).length} arquivos Algolia`
    );
    
    // 3. Analisar duplicação
    console.log('\n🔍 Analisando nível de duplicação...');
    
    const imageFiles = filesFound.filter(f => f.includes('image_generation'));
    const algoliaFiles = filesFound.filter(f => f.includes('algolia'));
    
    // Registrar análise
    await guardian.logAnalysis({
      filesAnalyzed: filesFound.length,
      agentsFound: 0, // Não são agentes, são ferramentas
      recommendations: [
        `Unificar ${imageFiles.length} arquivos de geração de imagem em image_generation_service.py`,
        `Consolidar ${algoliaFiles.length} arquivos Algolia em algolia_sync_service.py`,
        'Criar testes automatizados para validar a unificação',
        'Manter backups dos arquivos originais antes de remover'
      ],
      insights: {
        imageGenerationFiles: imageFiles,
        algoliaFiles: algoliaFiles,
        estimatedDuplication: '70%',
        potentialSavings: '80KB'
      }
    });
    
    // 4. Criar relatório de ação
    console.log('\n📝 Criando relatório de ação...');
    
    const actionReport = {
      timestamp: new Date().toISOString(),
      guardianAnalysis: {
        totalFiles: filesFound.length,
        imageGenerationFiles: imageFiles.length,
        algoliaFiles: algoliaFiles.length
      },
      unificationPlan: {
        phase1: {
          target: 'Image Generation Tools',
          currentFiles: imageFiles,
          newFile: '/framework_crewai/blog_crew/src/tools/image_generation_service.py',
          estimatedTime: '2 hours',
          complexity: 'medium'
        },
        phase2: {
          target: 'Algolia Tools',
          currentFiles: algoliaFiles,
          newFile: '/framework_crewai/blog_crew/src/tools/algolia_sync_service.py',
          estimatedTime: '4 hours',
          complexity: 'high'
        }
      },
      nextSteps: [
        '1. Criar image_generation_service.py com funcionalidades unificadas',
        '2. Testar nova implementação',
        '3. Migrar código existente para usar novo serviço',
        '4. Remover arquivos antigos após validação',
        '5. Repetir processo para ferramentas Algolia'
      ]
    };
    
    console.log('\n📊 Relatório de Ação:');
    console.log(JSON.stringify(actionReport, null, 2));
    
    // 5. Buscar logs recentes
    console.log('\n📜 Histórico de ações:');
    const history = await guardian.searchLogs('unificação', 10);
    history.forEach((log, idx) => {
      console.log(`  ${idx + 1}. ${log.content}`);
    });
    
    // 6. Estatísticas finais
    const stats = await guardian.getLogStats();
    console.log('\n📈 Estatísticas do Guardian:');
    console.log(`  Total de logs: ${stats.guardian.totalLogs}`);
    console.log(`  Tarefas ativas: ${stats.guardian.activeTasks}`);
    
    console.log('\n✅ Coordenação concluída!');
    console.log('🎯 Guardian e Cleanup Service trabalhando juntos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    await guardian.logTaskError('analyze-1', error as Error);
  }
}

// Executar
coordinateUnification().catch(console.error);