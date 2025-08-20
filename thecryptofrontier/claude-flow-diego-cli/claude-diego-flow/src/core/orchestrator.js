/**
 * Orchestrator principal do Claude Flow Diego
 * Gerencia a coordenação de agentes e workflows
 */
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
export class Orchestrator extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map();
        this.workflows = new Map();
        this.isRunning = false;
        this.memoryPath = '/workspace/memory';
        this.coordinationPath = '/workspace/coordination';
        this.port = 3003;
    }
    async init(options = {}) {
        console.log('🚀 Inicializando Orchestrator...');
        // Criar diretórios necessários
        await this.ensureDirectories();
        // Limpar dados antigos se force=true
        if (options.force) {
            console.log('🧹 Limpando dados antigos...');
            await this.cleanData();
        }
        console.log('✅ Orchestrator inicializado!');
    }
    async start(options = {}) {
        if (this.isRunning) {
            console.log('⚠️  Orchestrator já está rodando');
            return;
        }
        if (options.port) {
            this.port = options.port;
        }
        console.log(`🌟 Iniciando Orchestrator na porta ${this.port}...`);
        // Aqui seria onde iniciamos o servidor HTTP/WebSocket
        // Por enquanto, apenas marcamos como rodando
        this.isRunning = true;
        console.log(`✅ Orchestrator rodando na porta ${this.port}`);
        // Manter o processo vivo
        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
        // Loop infinito para manter o processo rodando
        while (this.isRunning) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    async stop() {
        console.log('🛑 Parando Orchestrator...');
        this.isRunning = false;
        process.exit(0);
    }
    async ensureDirectories() {
        const dirs = [this.memoryPath, this.coordinationPath];
        for (const dir of dirs) {
            try {
                await fs.access(dir);
            }
            catch (_a) {
                await fs.mkdir(dir, { recursive: true });
                console.log(`📁 Diretório criado: ${dir}`);
            }
        }
    }
    async cleanData() {
        const dirs = [this.memoryPath, this.coordinationPath];
        for (const dir of dirs) {
            try {
                const files = await fs.readdir(dir);
                for (const file of files) {
                    await fs.unlink(path.join(dir, file));
                }
            }
            catch (error) {
                // Ignorar erros de limpeza
            }
        }
    }
    // Métodos para gerenciar agentes
    registerAgent(name, agent) {
        this.agents.set(name, agent);
        this.emit('agent:registered', { name, agent });
    }
    getAgent(name) {
        return this.agents.get(name);
    }
    listAgents() {
        return Array.from(this.agents.keys());
    }
    // Métodos para gerenciar workflows
    registerWorkflow(name, workflow) {
        this.workflows.set(name, workflow);
        this.emit('workflow:registered', { name, workflow });
    }
    getWorkflow(name) {
        return this.workflows.get(name);
    }
    listWorkflows() {
        return Array.from(this.workflows.keys());
    }
}
