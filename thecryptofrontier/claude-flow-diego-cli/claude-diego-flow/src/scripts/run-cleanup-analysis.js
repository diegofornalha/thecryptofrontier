/**
 * Script para executar análise de limpeza no projeto
 */
import { CleanupSpecialistAgent } from '../agents/cleanup-specialist-agent';
async function runCleanupAnalysis() {
    console.log('🧹 Iniciando análise de limpeza do projeto...\n');
    // Criar agente de limpeza
    const cleanupAgent = new CleanupSpecialistAgent({
        name: 'CleanupSpecialist',
        maxConcurrentTasks: 1
    });
    // Diretórios para analisar
    const directories = [
        '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/src/tools',
        '/home/strapi/thecryptofrontier/framework_crewai/blog_crew/scripts/actions',
        '/home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/src/agents'
    ];
    console.log('📁 Analisando diretórios:');
    directories.forEach(dir => console.log(`  - ${dir}`));
    console.log('');
    for (const dir of directories) {
        console.log(`\n🔍 Analisando: ${dir}`);
        console.log('='.repeat(80));
        try {
            // Executar análise (dry run)
            const result = await cleanupAgent.executeTask({
                id: `cleanup-${Date.now()}`,
                description: `Analisar duplicações e oportunidades de limpeza em ${dir}`,
                type: 'duplicate-detection',
                params: {
                    targetPath: dir,
                    mode: 'analyze',
                    options: {
                        dryRun: true,
                        aggressive: false,
                        includeNodeModules: false,
                        includeTests: false
                    }
                }
            });
            if (result.result) {
                console.log('\n📊 Resultados:');
                console.log(JSON.stringify(result.result, null, 2));
            }
        }
        catch (error) {
            console.error(`❌ Erro ao analisar ${dir}:`, error);
        }
    }
    console.log('\n✅ Análise concluída!');
    console.log('\n💡 Dica: Para executar a limpeza real, mude dryRun para false');
}
// Executar
runCleanupAnalysis().catch(console.error);
