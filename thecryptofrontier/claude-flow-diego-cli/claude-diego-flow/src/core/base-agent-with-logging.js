/**
 * Base class for all agents with automatic logging
 * Extended version with AgentLog integration
 */
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MCPBridge } from '../mcp/mcp-bridge';
import { AgentStatus } from './agent-types';
// Função de log simplificada para evitar dependência circular
const logAgent = (agentName, action, details) => {
    console.log(`[${new Date().toISOString()}] [${agentName}] ${action}`, details || '');
};
// Re-exportar tipos do arquivo compartilhado
export { AgentType, AgentStatus } from './agent-types';
export class BaseAgent extends EventEmitter {
    constructor(config, mcpBridge) {
        super();
        this.status = AgentStatus.IDLE;
        this.currentTasks = new Map();
        this.completedTasks = 0;
        this.id = `agent_${config.type}_${uuidv4().substring(0, 8)}`;
        this.name = config.name;
        this.type = config.type;
        this.description = config.description || '';
        this.config = config;
        this.mcp = mcpBridge || new MCPBridge();
        this.enableLogging = config.enableLogging !== false; // Habilitado por padrão
    }
    /**
     * Processa uma tarefa
     */
    async processTask(task) {
        if (!task.id) {
            task.id = `task_${uuidv4().substring(0, 8)}`;
        }
        // Log de início (se habilitado)
        if (this.enableLogging) {
            try {
                await logAgent.start(this.name, this.type, task.id, task.description, {
                    taskType: task.type,
                    params: task.params,
                    priority: task.priority
                });
            }
            catch (error) {
                console.warn(`⚠️ Erro ao logar início da tarefa:`, error);
            }
        }
        // Atualizar status
        this.status = AgentStatus.WORKING;
        task.status = 'running';
        task.startTime = new Date();
        this.currentTasks.set(task.id, task);
        // Emitir evento
        this.emit('task:started', {
            agent: this.id,
            agentName: this.name,
            task: task.id,
            description: task.description,
            timestamp: task.startTime
        });
        try {
            // Executar tarefa (implementada pela classe derivada)
            const result = await this.executeTask(task);
            // Atualizar tarefa
            task.result = result;
            task.status = 'completed';
            task.endTime = new Date();
            task.duration = task.endTime.getTime() - task.startTime.getTime();
            // Log de sucesso (se habilitado)
            if (this.enableLogging) {
                try {
                    await logAgent.end(this.name, task.id, 'completed', undefined, {
                        result: typeof result === 'object' ? JSON.stringify(result).substring(0, 200) : result,
                        duration: task.duration
                    });
                }
                catch (error) {
                    console.warn(`⚠️ Erro ao logar fim da tarefa:`, error);
                }
            }
            // Emitir evento
            this.emit('task:completed', {
                agent: this.id,
                agentName: this.name,
                task: task.id,
                result,
                duration: task.duration,
                timestamp: task.endTime
            });
            // Limpar e atualizar contadores
            this.currentTasks.delete(task.id);
            this.completedTasks++;
            if (this.currentTasks.size === 0) {
                this.status = AgentStatus.IDLE;
            }
            return result;
        }
        catch (error) {
            // Atualizar tarefa com erro
            task.error = error;
            task.status = 'failed';
            task.endTime = new Date();
            task.duration = task.endTime.getTime() - task.startTime.getTime();
            // Log de erro (se habilitado)
            if (this.enableLogging) {
                try {
                    await logAgent.end(this.name, task.id, 'error', error instanceof Error ? error.message : String(error), {
                        errorType: error instanceof Error ? error.name : 'UnknownError',
                        duration: task.duration
                    });
                }
                catch (logError) {
                    console.warn(`⚠️ Erro ao logar erro da tarefa:`, logError);
                }
            }
            // Emitir evento
            this.emit('task:failed', {
                agent: this.id,
                agentName: this.name,
                task: task.id,
                error: error instanceof Error ? error.message : String(error),
                duration: task.duration,
                timestamp: task.endTime
            });
            // Limpar tarefa
            this.currentTasks.delete(task.id);
            if (this.currentTasks.size === 0) {
                this.status = AgentStatus.IDLE;
            }
            throw error;
        }
    }
    /**
     * Verifica se pode aceitar nova tarefa
     */
    canAcceptTask() {
        const maxTasks = this.config.maxConcurrentTasks || 1;
        return this.status !== AgentStatus.ERROR &&
            this.currentTasks.size < maxTasks;
    }
    /**
     * Retorna status atual
     */
    getStatus() {
        return this.status;
    }
    /**
     * Retorna capacidade (0-100%)
     */
    getCapacity() {
        const maxTasks = this.config.maxConcurrentTasks || 1;
        const used = this.currentTasks.size;
        return Math.round(((maxTasks - used) / maxTasks) * 100);
    }
    /**
     * Retorna tarefas atuais
     */
    getCurrentTasks() {
        return Array.from(this.currentTasks.values());
    }
    /**
     * Retorna contagem de tarefas completas
     */
    getCompletedTasksCount() {
        return this.completedTasks;
    }
    /**
     * Salva contexto na memória
     */
    async saveContext(key, value) {
        if (this.mcp.isConnected()) {
            await this.mcp.useTool('mem0_add_memory', {
                user_id: this.id,
                content: JSON.stringify({ key, value }),
                category: 'context',
                metadata: {
                    agent: this.name,
                    type: this.type,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    /**
     * Salva resultado na memória
     */
    async saveResult(task, result) {
        if (this.mcp.isConnected()) {
            await this.mcp.useTool('mem0_add_memory', {
                user_id: this.id,
                content: `Tarefa concluída: ${task.description}`,
                category: 'result',
                metadata: {
                    agent: this.name,
                    type: this.type,
                    taskId: task.id,
                    result: typeof result === 'object' ? JSON.stringify(result) : result,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
}
// Re-exportar de base-agent.ts para manter compatibilidade
export { BaseAgent as OriginalBaseAgent } from './base-agent';
