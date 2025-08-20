"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardianAPIService = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
class GuardianAPIService {
    constructor(memory, port = 3004) {
        this.app = (0, express_1.default)();
        this.memory = memory;
        this.port = port;
        // Middleware
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        // Rotas
        this.setupRoutes();
    }
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'guardian-api',
                timestamp: new Date().toISOString()
            });
        });
        // Tarefas pendentes
        this.app.get('/tasks/pending', async (req, res) => {
            try {
                const pendingTasks = await this.memory.whatWasIDoing();
                res.json({
                    count: pendingTasks.length,
                    tasks: pendingTasks.map(task => ({
                        id: task.id,
                        name: task.taskName,
                        status: task.status,
                        progress: task.context.progress || 0,
                        request: task.context.userRequest,
                        started: task.timestamp,
                        lastStep: task.context.currentStep
                    }))
                });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        // Tarefas pendentes (formato simples para terminal)
        this.app.get('/tasks/pending/simple', async (req, res) => {
            try {
                const pendingTasks = await this.memory.whatWasIDoing();
                if (pendingTasks.length === 0) {
                    res.send('Nenhuma tarefa pendente.\n');
                    return;
                }
                let output = '📋 Tarefas Pendentes:\n\n';
                pendingTasks.forEach((task, index) => {
                    output += `${index + 1}. ${task.taskName} (${task.context.progress || 0}%)\n`;
                    output += `   Solicitado: ${task.context.userRequest}\n`;
                    if (task.context.currentStep) {
                        output += `   Status: ${task.context.currentStep}\n`;
                    }
                    output += '\n';
                });
                res.type('text/plain').send(output);
            }
            catch (error) {
                res.status(500).send(`Erro: ${error.message}\n`);
            }
        });
        // Sugestões
        this.app.get('/suggestions', async (req, res) => {
            try {
                const suggestions = await this.memory.suggestNextSteps();
                res.json({ suggestions });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        // Resumo da sessão
        this.app.get('/session/resume', async (req, res) => {
            try {
                const resume = await this.memory.resumeLastSession();
                res.type('text/plain').send(resume);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    async start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Guardian API running on port ${this.port}`);
            console.log(`📋 Check pending tasks: http://localhost:${this.port}/tasks/pending/simple`);
        });
    }
    async stop() {
        // Implementar se necessário
    }
}
exports.GuardianAPIService = GuardianAPIService;
