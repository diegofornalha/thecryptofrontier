/**
 * Guardian com Sistema de Logs Automático
 *
 * Wrapper que adiciona logging automático ao Guardian
 * usando o Mem0 para persistência
 */
import { GuardianMemoryManagerOSS } from '../utils/guardian-memory-oss';
import { AgentType } from '../core/agent-types';
export class GuardianWithAutoLogs {
    constructor(projectPath, memoryBridgeUrl = 'http://localhost:3002') {
        this.activeTasks = new Map();
        this.projectPath = projectPath;
        this.memory = new GuardianMemoryManagerOSS(memoryBridgeUrl);
    }
    /**
     * Registra um plano criado pelo Guardian
     */
    async logPlan(plan) {
        const planId = `plan-${Date.now()}`;
        // Log do plano principal
        await this.memory.addMemory({
            content: `Guardian criou plano com ${plan.tasks.length} tarefas para ${this.projectPath}`,
            metadata: {
                project: this.projectPath,
                action: 'criar-plano',
                planId,
                taskCount: plan.tasks.length,
                agentName: plan.agentName,
                timestamp: new Date().toISOString(),
                ...plan.metadata
            },
            tags: ['guardian', 'plano', 'coordenação'],
            category: 'plan-creation'
        });
        // Log de cada tarefa do plano
        for (const task of plan.tasks) {
            await this.logTaskStart(task);
        }
    }
    /**
     * Registra início de uma tarefa
     */
    async logTaskStart(task) {
        const startTime = new Date();
        this.activeTasks.set(task.id, {
            ...task,
            startTime,
            status: 'iniciado'
        });
        await this.memory.addMemory({
            content: `Tarefa iniciada: ${task.description}`,
            metadata: {
                project: this.projectPath,
                action: 'iniciar-tarefa',
                taskId: task.id,
                taskType: task.type,
                assignedAgent: task.assignedAgent,
                agentType: task.agentType,
                complexity: task.complexity,
                status: 'iniciado',
                startTime: startTime.toISOString(),
                ...task.metadata
            },
            tags: ['guardian', 'tarefa', 'execução', task.type || 'geral'],
            category: 'task-execution'
        });
    }
    /**
     * Registra progresso de uma tarefa
     */
    async logTaskProgress(taskId, progress, metadata) {
        const task = this.activeTasks.get(taskId);
        if (!task)
            return;
        await this.memory.addMemory({
            content: `Progresso: ${progress}`,
            metadata: {
                project: this.projectPath,
                action: 'progresso-tarefa',
                taskId,
                taskDescription: task.description,
                status: 'em-progresso',
                timestamp: new Date().toISOString(),
                ...metadata
            },
            tags: ['guardian', 'progresso', 'tarefa'],
            category: 'task-progress'
        });
    }
    /**
     * Registra conclusão de uma tarefa
     */
    async logTaskComplete(taskId, result) {
        const task = this.activeTasks.get(taskId);
        if (!task)
            return;
        const endTime = new Date();
        const duration = endTime.getTime() - task.startTime.getTime();
        await this.memory.addMemory({
            content: `Tarefa concluída: ${task.description} (${duration}ms)`,
            metadata: {
                project: this.projectPath,
                action: 'concluir-tarefa',
                taskId,
                taskDescription: task.description,
                status: 'concluído',
                duration,
                startTime: task.startTime.toISOString(),
                endTime: endTime.toISOString(),
                result,
                ...task.metadata
            },
            tags: ['guardian', 'tarefa', 'concluído'],
            category: 'task-completion'
        });
        this.activeTasks.delete(taskId);
    }
    /**
     * Registra erro em uma tarefa
     */
    async logTaskError(taskId, error) {
        const task = this.activeTasks.get(taskId);
        if (!task)
            return;
        const endTime = new Date();
        const duration = endTime.getTime() - task.startTime.getTime();
        const errorMessage = error instanceof Error ? error.message : error;
        await this.memory.addMemory({
            content: `Erro na tarefa: ${task.description} - ${errorMessage}`,
            metadata: {
                project: this.projectPath,
                action: 'erro-tarefa',
                taskId,
                taskDescription: task.description,
                status: 'erro',
                error: errorMessage,
                duration,
                startTime: task.startTime.toISOString(),
                endTime: endTime.toISOString(),
                ...task.metadata
            },
            tags: ['guardian', 'tarefa', 'erro'],
            category: 'task-error'
        });
        this.activeTasks.delete(taskId);
    }
    /**
     * Registra análise do Guardian
     */
    async logAnalysis(analysis) {
        await this.memory.addMemory({
            content: `Guardian analisou ${analysis.filesAnalyzed} arquivos e encontrou ${analysis.agentsFound} agentes`,
            metadata: {
                project: this.projectPath,
                action: 'análise-projeto',
                filesAnalyzed: analysis.filesAnalyzed,
                agentsFound: analysis.agentsFound,
                recommendationCount: analysis.recommendations.length,
                recommendations: analysis.recommendations,
                insights: analysis.insights,
                timestamp: new Date().toISOString()
            },
            tags: ['guardian', 'análise', 'relatório'],
            category: 'project-analysis'
        });
    }
    /**
     * Busca histórico de logs
     */
    async searchLogs(query, limit = 20) {
        return await this.memory.searchMemories(query, limit);
    }
    /**
     * Obtém estatísticas dos logs
     */
    async getLogStats() {
        const stats = await this.memory.getMemoryStats();
        // Buscar logs específicos do Guardian
        const guardianLogs = await this.memory.searchMemories('Guardian', 100);
        const guardianStats = {
            totalLogs: guardianLogs.length,
            byCategory: {},
            byStatus: {},
            activeTasks: this.activeTasks.size
        };
        // Processar estatísticas
        guardianLogs.forEach(log => {
            var _a, _b;
            const category = ((_a = log.metadata) === null || _a === void 0 ? void 0 : _a.category) || 'outros';
            const status = ((_b = log.metadata) === null || _b === void 0 ? void 0 : _b.status) || 'desconhecido';
            guardianStats.byCategory[category] = (guardianStats.byCategory[category] || 0) + 1;
            guardianStats.byStatus[status] = (guardianStats.byStatus[status] || 0) + 1;
        });
        return {
            general: stats,
            guardian: guardianStats
        };
    }
}
// Função helper para criar Guardian com logs
export function createGuardianWithLogs(projectPath) {
    return new GuardianWithAutoLogs(projectPath);
}
// Exemplo de uso
export async function demonstrateGuardianLogs() {
    console.log('🤖 Demonstrando Guardian com Logs Automáticos...\n');
    const guardian = createGuardianWithLogs('/home/strapi/thecryptofrontier');
    // Simular criação de plano
    const plan = {
        agentName: 'Guardian Principal',
        tasks: [
            {
                id: 'task-1',
                description: 'Analisar estrutura do projeto',
                type: 'análise',
                assignedAgent: 'FileAnalyzer',
                agentType: AgentType.ANALYST,
                complexity: 'medium'
            },
            {
                id: 'task-2',
                description: 'Organizar agentes de log',
                type: 'organização',
                assignedAgent: 'LogOrganizer',
                agentType: AgentType.IMPLEMENTER,
                complexity: 'complex'
            }
        ],
        metadata: {
            objetivo: 'Unificar sistema de logs'
        }
    };
    // Registrar plano
    await guardian.logPlan(plan);
    console.log('✅ Plano registrado');
    // Simular execução das tarefas
    for (const task of plan.tasks) {
        // Progresso
        await guardian.logTaskProgress(task.id, `Processando ${task.description}...`);
        // Simular trabalho
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Conclusão
        await guardian.logTaskComplete(task.id, {
            filesProcessed: 10,
            changesApplied: 3
        });
        console.log(`✅ Tarefa concluída: ${task.description}`);
    }
    // Registrar análise final
    await guardian.logAnalysis({
        filesAnalyzed: 150,
        agentsFound: 10,
        recommendations: [
            'Unificar agentes de log',
            'Implementar cache de memória',
            'Otimizar buscas'
        ],
        insights: {
            duplicatedCode: true,
            optimizationPotential: 'high'
        }
    });
    console.log('\n📊 Análise registrada');
    // Buscar histórico
    console.log('\n📜 Histórico recente:');
    const history = await guardian.searchLogs('tarefa', 5);
    history.forEach((log, idx) => {
        console.log(`  ${idx + 1}. ${log.content}`);
    });
    // Estatísticas
    console.log('\n📈 Estatísticas:');
    const stats = await guardian.getLogStats();
    console.log('  Guardian:', stats.guardian);
    console.log('\n✅ Demonstração concluída!');
}
