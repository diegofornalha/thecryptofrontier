/**
 * Base Agent para MCP - TypeScript
 * Classe base para todos os agentes MCP
 */
import * as fs from 'fs/promises';
import * as path from 'path';
export class BaseMCPAgent {
    constructor(config) {
        this.config = config;
    }
    /**
     * Busca tarefas pendentes para este agente
     */
    async getPendingTasks() {
        try {
            const files = await fs.readdir(this.config.tasksDir);
            const agentFiles = files.filter(f => f.startsWith(this.config.name.toLowerCase()) &&
                f.endsWith('.md'));
            const tasks = [];
            for (const file of agentFiles) {
                const content = await fs.readFile(path.join(this.config.tasksDir, file), 'utf-8');
                tasks.push({
                    id: file.replace('.md', ''),
                    agent: this.config.name,
                    created: file.split('_')[1] || '',
                    status: 'pending',
                    content
                });
            }
            return tasks;
        }
        catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            return [];
        }
    }
    /**
     * Salva output da tarefa
     */
    async saveOutput(taskId, output) {
        const outputPath = path.join(this.config.outputsDir, `${taskId}_output.json`);
        await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
        console.log(`✅ Output salvo: ${outputPath}`);
    }
    /**
     * Remove tarefa processada
     */
    async removeTask(taskId) {
        const taskPath = path.join(this.config.tasksDir, `${taskId}.md`);
        try {
            await fs.unlink(taskPath);
            console.log(`🗑️  Tarefa removida: ${taskId}`);
        }
        catch (error) {
            console.error('Erro ao remover tarefa:', error);
        }
    }
    /**
     * Extrai contexto JSON da tarefa
     */
    extractContext(content) {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            }
            catch (error) {
                console.error('Erro ao parsear JSON:', error);
                return {};
            }
        }
        return {};
    }
    /**
     * Executa o agente
     */
    async run() {
        console.log(`🤖 ${this.config.name} Agent iniciado...`);
        const tasks = await this.getPendingTasks();
        if (tasks.length === 0) {
            console.log('📭 Nenhuma tarefa pendente');
            return;
        }
        console.log(`📋 ${tasks.length} tarefa(s) encontrada(s)`);
        for (const task of tasks) {
            try {
                console.log(`\n⚙️  Processando: ${task.id}`);
                const output = await this.processTask(task);
                await this.saveOutput(task.id, output);
                await this.removeTask(task.id);
                console.log(`✅ Tarefa concluída: ${task.id}`);
            }
            catch (error) {
                console.error(`❌ Erro ao processar ${task.id}:`, error);
                // Salva erro como output
                await this.saveOutput(task.id, {
                    agent: this.config.name,
                    task_id: task.id,
                    timestamp: new Date().toISOString(),
                    status: 'failed',
                    result: { error: error.message },
                    metadata: {
                        processing_time: '0',
                        confidence: 0,
                        notes: 'Erro durante processamento'
                    }
                });
            }
        }
        console.log(`\n✨ ${this.config.name} Agent finalizado`);
    }
}
