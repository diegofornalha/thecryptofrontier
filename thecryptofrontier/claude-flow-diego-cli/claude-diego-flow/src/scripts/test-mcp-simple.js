#!/usr/bin/env npx tsx
import { GuardianOrchestratorMCP } from '../agents/guardian-orchestrator-mcp';
import { MCPUsageTracker } from '../monitoring/mcp-usage-tracker';
async function testSimple() {
    console.log('🧪 Teste simples do MCP...\n');
    const guardian = new GuardianOrchestratorMCP();
    const tracker = MCPUsageTracker.getInstance();
    try {
        // Inicializar
        console.log('Inicializando Guardian...');
        await guardian.initialize();
        // Testar comando simples
        const message = {
            role: 'user',
            content: 'verifique o status do projeto',
            metadata: { source: 'test' }
        };
        console.log(`\nProcessando: "${message.content}"`);
        const response = await guardian.processMessage(message);
        // Verificar uso do MCP
        const stats = tracker.getStats();
        console.log(`\n📊 MCP calls: ${stats.total}`);
        console.log(`✅ Success: ${stats.success}`);
        console.log(`❌ Errors: ${stats.errors}`);
        console.log(`⏭️ Skipped: ${stats.skipped}`);
        if (stats.total > 0) {
            console.log('\n✅ MCP está funcionando!');
        }
        else {
            console.log('\n❌ MCP não foi usado');
        }
        // Shutdown
        await guardian.shutdown();
    }
    catch (error) {
        console.error('Erro:', error);
    }
}
testSimple().catch(console.error);
