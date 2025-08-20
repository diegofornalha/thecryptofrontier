/**
 * Base class simplificada para agentes sem logging automático
 * Para evitar dependências circulares
 */
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MCPBridge } from '../mcp/mcp-bridge';
import { AgentStatus } from './agent-types';
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
        this.enableLogging = config.enableLogging !== false;
    }
    /**
     * Processa uma tarefa
     */
    async processTask(task) {
        if (!task.id) {
            task.id = `task_${uuidv4().substring(0, 8)}`;
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
            // Emitir evento
            this.emit('task:failed', {
                agent: this.id,
                agentName: this.name,
                task: task.id,
                error: error instanceof Error ? error.message : String(error),
                duration: task.duration,
                timestamp: task.endTime
            });
            // Limpar e atualizar status
            this.currentTasks.delete(task.id);
            if (this.currentTasks.size === 0) {
                this.status = AgentStatus.IDLE;
            }
            throw error;
        }
    }
    /**
     * Verifica se pode processar mais tarefas
     */
    canProcessMore() {
        const maxConcurrent = this.config.maxConcurrentTasks || 3;
        return this.currentTasks.size < maxConcurrent;
    }
    /**
     * Retorna o status atual
     */
    getStatus() {
        return this.status;
    }
    /**
     * Retorna tarefas em execução
     */
    getCurrentTasks() {
        return Array.from(this.currentTasks.values());
    }
    /**
     * Retorna estatísticas
     */
    getStats() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            currentTasks: this.currentTasks.size,
            completedTasks: this.completedTasks
        };
    }
}
