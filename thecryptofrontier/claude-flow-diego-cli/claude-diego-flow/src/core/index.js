/**
 * Orquestrador principal do Claude Flow
 * Gerencia agentes, tarefas e coordena execução
 */
import { EventEmitter } from 'events';
import { MCPBridge } from '../mcp/mcp-bridge';
import { MCPDirectAgent } from '../agents/mcp-direct-agent';
export class Orchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        this.agents = new Map();
        this.tasks = new Map();
        this.taskQueue = [];
        this.running = false;
        this.config = {
            maxConcurrentAgents: config.maxConcurrentAgents || 5,
            taskQueueSize: config.taskQueueSize || 100,
            userId: config.userId || process.env.USER_ID || 'default_user'
        };
        this.mcpBridge = new MCPBridge();
    }
    /**
     * Inicializa o orquestrador e conecta ao MCP
     */
    async initialize() {
        console.log('🚀 Inicializando Claude Flow Orchestrator...');
        try {
            await this.mcpBridge.connect();
            console.log('✅ Conectado ao DiegoTools MCP');
            this.running = true;
            this.startTaskProcessor();
            this.emit('initialized');
        }
        catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            throw error;
        }
    }
    /**
     * Cria um novo agente MCP
     */
    createAgent(config) {
        if (this.agents.size >= (this.config.maxConcurrentAgents || 5)) {
            throw new Error(`Limite de agentes atingido (${this.config.maxConcurrentAgents})`);
        }
        const agent = new MCPDirectAgent(config, this.mcpBridge);
        // Registrar listeners do agente
        agent.on('task:started', (data) => this.emit('agent:task:started', data));
        agent.on('task:completed', (data) => this.emit('agent:task:completed', data));
        agent.on('task:failed', (data) => this.emit('agent:task:failed', data));
        this.agents.set(agent.id, agent);
        console.log(`✅ Agente criado: ${agent.name} (${agent.id})`);
        this.emit('agent:created', { agent: agent.id, name: agent.name });
        return agent;
    }
    /**
     * Cria e enfileira uma nova tarefa
     */
    createTask(description, options = {}) {
        const task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description,
            priority: options.priority || 5,
            dependencies: options.dependencies || [],
            metadata: options.metadata || {}
        };
        this.tasks.set(task.id, task);
        if (options.assignTo) {
            this.assignTaskToAgent(task.id, options.assignTo);
        }
        else {
            this.enqueueTask(task);
        }
        console.log(`📋 Tarefa criada: ${task.id}`);
        this.emit('task:created', task);
        return task;
    }
    /**
     * Atribui tarefa a um agente específico
     */
    async assignTaskToAgent(taskId, agentId) {
        const task = this.tasks.get(taskId);
        const agent = this.agents.get(agentId);
        if (!task)
            throw new Error(`Tarefa não encontrada: ${taskId}`);
        if (!agent)
            throw new Error(`Agente não encontrado: ${agentId}`);
        if (!agent.canAcceptTask()) {
            throw new Error(`Agente ${agent.name} não pode aceitar tarefas no momento`);
        }
        try {
            await agent.processTask(task);
        }
        catch (error) {
            console.error(`Erro ao processar tarefa ${taskId}:`, error);
            this.emit('task:error', { task, error });
        }
    }
    /**
     * Enfileira tarefa para processamento automático
     */
    enqueueTask(task) {
        if (this.taskQueue.length >= (this.config.taskQueueSize || 100)) {
            throw new Error('Fila de tarefas cheia');
        }
        this.taskQueue.push(task);
        this.taskQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }
    /**
     * Processador automático de tarefas
     */
    async startTaskProcessor() {
        while (this.running) {
            if (this.taskQueue.length > 0) {
                const availableAgent = this.findAvailableAgent();
                if (availableAgent) {
                    const task = this.taskQueue.shift();
                    // Verificar dependências
                    if (this.areDepencenciesMet(task)) {
                        this.assignTaskToAgent(task.id, availableAgent.id)
                            .catch(error => {
                            console.error('Erro ao atribuir tarefa:', error);
                            // Re-enfileirar tarefa em caso de erro
                            this.enqueueTask(task);
                        });
                    }
                    else {
                        // Re-enfileirar se dependências não foram atendidas
                        this.taskQueue.push(task);
                    }
                }
            }
            // Aguardar antes de verificar novamente
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    /**
     * Encontra um agente disponível
     */
    findAvailableAgent() {
        for (const agent of this.agents.values()) {
            if (agent.canAcceptTask()) {
                return agent;
            }
        }
        return null;
    }
    /**
     * Verifica se as dependências de uma tarefa foram atendidas
     */
    areDepencenciesMet(task) {
        if (!task.dependencies || task.dependencies.length === 0) {
            return true;
        }
        for (const depId of task.dependencies) {
            const depTask = this.tasks.get(depId);
            if (!depTask || !this.isTaskCompleted(depTask)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Verifica se uma tarefa foi concluída
     */
    isTaskCompleted(task) {
        // Verificar se algum agente completou esta tarefa
        for (const agent of this.agents.values()) {
            if (agent.getCompletedTasksCount() > 0) {
                // TODO: Implementar verificação mais específica
                return true;
            }
        }
        return false;
    }
    /**
     * Obtém status do sistema
     */
    getStatus() {
        const agentsStatus = Array.from(this.agents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            status: agent.getStatus(),
            capacity: agent.getCapacity()
        }));
        const processingCount = Array.from(this.agents.values())
            .reduce((sum, agent) => sum + agent.getCurrentTasks().length, 0);
        return {
            agents: agentsStatus,
            tasks: {
                total: this.tasks.size,
                queued: this.taskQueue.length,
                processing: processingCount
            }
        };
    }
    /**
     * Para o orquestrador
     */
    async shutdown() {
        console.log('🛑 Desligando Claude Flow Orchestrator...');
        this.running = false;
        // Desconectar MCP
        this.mcpBridge.disconnect();
        // Limpar recursos
        this.agents.clear();
        this.tasks.clear();
        this.taskQueue = [];
        this.emit('shutdown');
    }
}
