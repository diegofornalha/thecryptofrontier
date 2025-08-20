const { GuardianMemoryRouter } = require('../core/guardian-memory-router');

/**
 * Script de teste para o sistema de roteamento de memórias
 */

async function testMemoryRouting() {
    console.log('🧪 Testando Sistema de Roteamento de Memórias\n');
    
    const router = new GuardianMemoryRouter();
    
    // Casos de teste
    const testCases = [
        {
            name: 'Docker Build Memory',
            memory: {
                id: 'test-1',
                type: 'task_start',
                taskName: 'Build Docker image for production',
                context: {
                    userRequest: 'Preciso criar uma imagem docker otimizada',
                    specialists: ['docker-specialist']
                }
            }
        },
        {
            name: 'Strapi API Memory',
            memory: {
                id: 'test-2',
                type: 'task_progress',
                taskName: 'Configure Strapi webhook for blog posts',
                context: {
                    userRequest: 'Configurar webhook no Strapi para notificar novos posts',
                    decision: 'Use collection-type events'
                }
            }
        },
        {
            name: 'NextJS Component Memory',
            memory: {
                id: 'test-3',
                type: 'decision',
                taskName: 'Choose React component library',
                context: {
                    userRequest: 'Qual biblioteca de componentes usar no frontend NextJS?',
                    decision: 'Use Tailwind CSS with custom components'
                }
            }
        },
        {
            name: 'Cleanup Task Memory',
            memory: {
                id: 'test-4',
                type: 'task_complete',
                taskName: 'Clean temporary files and optimize cache',
                metadata: {
                    filesDeleted: 150,
                    spaceFreed: '2.3GB'
                }
            }
        },
        {
            name: 'General Coordination Memory',
            memory: {
                id: 'test-5',
                type: 'session_state',
                taskName: 'Guardian system status update',
                context: {
                    userRequest: 'Status geral do sistema'
                }
            }
        },
        {
            name: 'Mixed Context Memory',
            memory: {
                id: 'test-6',
                type: 'task_start',
                taskName: 'Deploy NextJS app with Docker',
                context: {
                    userRequest: 'Fazer deploy da aplicação React usando container Docker',
                    specialists: ['docker-specialist', 'nextjs-specialist']
                }
            }
        }
    ];
    
    // Executa os testes
    for (const testCase of testCases) {
        console.log(`\n📌 Teste: ${testCase.name}`);
        console.log(`   Tarefa: ${testCase.memory.taskName}`);
        
        const decision = await router.routeMemory(testCase.memory);
        
        console.log(`   ✅ Roteado para: ${decision.targetAgent}`);
        console.log(`   📊 Confiança: ${(decision.confidence * 100).toFixed(0)}%`);
        console.log(`   📋 Razão: ${decision.reason}`);
        
        if (decision.allMatches && decision.allMatches.length > 1) {
            console.log(`   🔍 Outras correspondências:`);
            decision.allMatches.slice(1).forEach(match => {
                console.log(`      - ${match.rule} (${(match.confidence * 100).toFixed(0)}%)`);
            });
        }
    }
    
    // Estatísticas finais
    console.log('\n\n📊 Estatísticas do Sistema de Roteamento:');
    const stats = router.getRoutingStats();
    console.log(`   - Total de regras: ${stats.totalRules}`);
    console.log(`   - Status: ${stats.enabledStatus ? 'Ativado' : 'Desativado'}`);
    console.log(`   - Agente padrão: ${stats.defaultAgent}`);
}

// Executa os testes
testMemoryRouting().catch(console.error);