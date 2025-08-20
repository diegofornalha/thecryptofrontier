#!/usr/bin/env npx tsx

import { GuardianOrchestratorMCP } from '../agents/guardian-orchestrator-mcp';
import { MCPUsageTracker } from '../monitoring/mcp-usage-tracker';
import { Message } from '../types';

async function testMCPActivation() {
    console.log('🧪 Testando ativação do MCP no Guardian...\n');
    
    const guardian = new GuardianOrchestratorMCP();
    const tracker = MCPUsageTracker.getInstance();
    
    // Comandos de teste que DEVEM ativar o MCP
    const testCommands = [
        'faça uma análise completa do projeto',
        'capture screenshots das páginas',
        'verifique o status do git',
        'navegue até o site e tire uma foto',
        'crie uma issue no github sobre bugs',
        'salve isso na memória',
        'qual o histórico de análises?',
        'verifique as mudanças no código',
        'faça um relatório visual do site',
        'analise a página web do projeto'
    ];
    
    console.log('📋 Inicializando Guardian...');
    try {
        await guardian.initialize();
        console.log('✅ Guardian inicializado\n');
    } catch (error) {
        console.error('❌ Erro ao inicializar Guardian:', error);
        return;
    }
    
    // Capturar stats antes
    const statsBefore = tracker.getStats();
    console.log(`📊 MCP calls antes: ${statsBefore.total}\n`);
    
    // Testar cada comando
    for (const command of testCommands) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔬 Testando: "${command}"`);
        console.log('='.repeat(60));
        
        const message: Message = {
            role: 'user',
            content: command,
            metadata: { source: 'test' }
        };
        
        try {
            const response = await guardian.processMessage(message);
            
            // Verificar se MCP foi usado
            const mcpUsed = response.metadata?.mcpUsed;
            console.log(`\n📌 MCP usado: ${mcpUsed ? '✅ SIM' : '❌ NÃO'}`);
            
            if (response.metadata?.specialists) {
                console.log(`👥 Especialistas: ${response.metadata.specialists.join(', ')}`);
            }
            
            // Verificar tracker
            const currentStats = tracker.getStats();
            console.log(`📊 Total MCP calls: ${currentStats.total} (+${currentStats.total - statsBefore.total})`);
            
        } catch (error) {
            console.error(`❌ Erro ao processar comando:`, error);
        }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(60));
    
    const statsAfter = tracker.getStats();
    console.log(`Total de tentativas MCP: ${statsAfter.total}`);
    console.log(`Sucessos: ${statsAfter.success}`);
    console.log(`Erros: ${statsAfter.errors}`);
    console.log(`Pulados: ${statsAfter.skipped}`);
    console.log(`Taxa de sucesso: ${statsAfter.successRate}`);
    
    if (statsAfter.total === 0) {
        console.log('\n❌ PROBLEMA: Nenhuma chamada MCP foi feita!');
        console.log('Possíveis causas:');
        console.log('1. MCP Bridge não está conectando');
        console.log('2. Condições de ativação não funcionando');
        console.log('3. Erro na inicialização');
    } else {
        console.log('\n✅ MCP está sendo ativado!');
        console.log('\nFerramentas mais usadas:');
        Object.entries(statsAfter.byTool)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5)
            .forEach(([tool, data]: [string, any]) => {
                console.log(`- ${tool}: ${data.total} calls`);
            });
    }
    
    // Desligar Guardian
    await guardian.shutdown();
    process.exit(0);
}

// Executar teste
testMCPActivation().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});