/**
 * Registra início da unificação no Mem0
 */
import { GuardianWithAutoLogs } from '../agents/guardian-with-auto-logs';
async function logUnificationStart() {
    const guardian = new GuardianWithAutoLogs('/home/strapi/thecryptofrontier');
    // Registrar início da unificação
    await guardian.logTaskProgress('unify-1', 'Iniciando unificação das ferramentas de geração de imagem', {
        startTime: new Date().toISOString(),
        targetFiles: [
            'image_generation_unified.py',
            'image_generation_tools_unified.py',
            'image_generation_queue.py'
        ],
        outputFile: 'image_generation_service.py',
        estimatedDuration: '2 hours'
    });
    console.log('✅ Início da unificação registrado no Mem0');
}
logUnificationStart().catch(console.error);
