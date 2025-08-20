/**
 * Sistema de Memória Automática do Guardian
 *
 * Registra automaticamente todas as ações, decisões e preferências,
 * permitindo continuidade total entre sessões sem necessidade do
 * usuário repetir contexto.
 */
export class GuardianMemorySystem {
    constructor(mcpBridge, userId = 'default-user') {
        this.autoSaveInterval = null;
        this.mcpBridge = mcpBridge;
        this.userId = userId;
        this.currentSession = this.createNewSession();
        // Auto-save a cada 30 segundos
        this.startAutoSave();
    }
    /**
     * Registra o início de uma nova tarefa
     */
    async rememberTaskStart(task) {
        var _a, _b;
        const memory = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'task_start',
            status: 'started',
            timestamp: new Date(),
            taskName: task.taskName || 'Unknown Task',
            context: {
                userRequest: ((_a = task.context) === null || _a === void 0 ? void 0 : _a.userRequest) || '',
                specialists: ((_b = task.context) === null || _b === void 0 ? void 0 : _b.specialists) || [],
                ...task.context
            },
            ...task
        };
        console.log(`📝 Registrando início da tarefa: ${memory.taskName}`);
        // Adiciona à sessão atual
        this.currentSession.pendingTasks.push(memory);
        this.currentSession.lastActivity = new Date();
        // Salva no Mem0
        await this.saveToMem0(memory);
    }
    /**
     * Registra progresso de uma tarefa em execução
     */
    async rememberTaskProgress(taskId, progress) {
        const task = this.findTask(taskId);
        if (!task) {
            console.warn(`Task ${taskId} não encontrada`);
            return;
        }
        const progressMemory = {
            ...task,
            type: 'task_progress',
            status: 'in_progress',
            timestamp: new Date(),
            context: {
                ...task.context,
                ...progress
            }
        };
        console.log(`📊 Progresso: ${progress.currentStep || 'updating'} (${progress.progress || 0}%)`);
        // Atualiza na sessão
        task.status = 'in_progress';
        task.context = progressMemory.context;
        this.currentSession.lastActivity = new Date();
        // Salva no Mem0
        await this.saveToMem0(progressMemory);
    }
    /**
     * Registra conclusão de uma tarefa
     */
    async rememberTaskComplete(taskId, result) {
        const task = this.findTask(taskId);
        if (!task) {
            console.warn(`Task ${taskId} não encontrada`);
            return;
        }
        const completeMemory = {
            ...task,
            type: 'task_complete',
            status: 'completed',
            timestamp: new Date(),
            metadata: result
        };
        console.log(`✅ Tarefa concluída: ${task.taskName}`);
        // Move para tarefas completas
        this.moveTaskToCompleted(taskId);
        this.currentSession.lastActivity = new Date();
        // Salva no Mem0
        await this.saveToMem0(completeMemory);
    }
    /**
     * Registra erro em uma tarefa
     */
    async rememberTaskError(taskId, error) {
        const task = this.findTask(taskId);
        if (!task) {
            console.warn(`Task ${taskId} não encontrada`);
            return;
        }
        const errorMessage = error instanceof Error ? error.message : error;
        const errorMemory = {
            ...task,
            type: 'task_error',
            status: 'failed',
            timestamp: new Date(),
            context: {
                ...task.context,
                error: errorMessage
            }
        };
        console.log(`❌ Erro na tarefa: ${task.taskName} - ${errorMessage}`);
        // Atualiza status
        task.status = 'failed';
        task.context.error = errorMessage;
        this.currentSession.lastActivity = new Date();
        // Salva no Mem0
        await this.saveToMem0(errorMemory);
    }
    /**
     * Registra uma decisão tomada
     */
    async rememberDecision(topic, decision, reason, context) {
        const decisionMemory = {
            id: `decision-${Date.now()}`,
            type: 'decision',
            taskName: `Decision: ${topic}`,
            status: 'completed',
            timestamp: new Date(),
            context: {
                userRequest: topic,
                specialists: [],
                decision,
                reason
            },
            metadata: context
        };
        console.log(`🎯 Decisão registrada: ${topic} → ${decision}`);
        this.currentSession.lastActivity = new Date();
        // Salva no Mem0
        await this.saveToMem0(decisionMemory);
    }
    /**
     * Registra preferência do usuário
     */
    async rememberUserPreference(preference, value) {
        this.currentSession.userPreferences[preference] = value;
        const preferenceMemory = {
            id: `pref-${Date.now()}`,
            type: 'user_preference',
            taskName: `Preference: ${preference}`,
            status: 'completed',
            timestamp: new Date(),
            context: {
                userRequest: `Set ${preference} to ${value}`,
                specialists: [],
                decision: value
            }
        };
        console.log(`⚙️ Preferência registrada: ${preference} = ${value}`);
        // Salva no Mem0
        await this.saveToMem0(preferenceMemory);
    }
    /**
     * Recupera o que estava sendo feito
     */
    async whatWasIDoing() {
        // Busca tarefas pendentes das últimas 24h
        const recentMemories = await this.searchMemories('task_start OR task_progress', 20);
        const pendingTasks = recentMemories
            .filter(m => {
            const memory = JSON.parse(m.content);
            return memory.status === 'started' || memory.status === 'in_progress';
        })
            .map(m => JSON.parse(m.content));
        return pendingTasks;
    }
    /**
     * Recupera decisões sobre um tópico
     */
    async whatDidIDecide(topic) {
        const memories = await this.searchMemories(`decision AND ${topic}`, 10);
        return memories
            .filter(m => {
            const memory = JSON.parse(m.content);
            return memory.type === 'decision';
        })
            .map(m => {
            const memory = JSON.parse(m.content);
            return {
                id: memory.id,
                timestamp: new Date(memory.timestamp),
                topic: memory.taskName.replace('Decision: ', ''),
                decision: memory.context.decision || '',
                reason: memory.context.reason || '',
                context: memory.metadata
            };
        });
    }
    /**
     * Recupera quando uma ação foi realizada
     */
    async whenDidI(action) {
        const memories = await this.searchMemories(action, 20);
        return memories
            .map(m => JSON.parse(m.content))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    /**
     * Sugere próximos passos baseado no histórico
     */
    async suggestNextSteps() {
        const suggestions = [];
        // Verifica tarefas pendentes
        const pendingTasks = await this.whatWasIDoing();
        if (pendingTasks.length > 0) {
            suggestions.push(`Continuar tarefa: ${pendingTasks[0].taskName} (${pendingTasks[0].context.progress || 0}% completo)`);
        }
        // Verifica padrões de uso
        const cleanupMemories = await this.searchMemories('cleanup OR limpeza', 5);
        if (cleanupMemories.length > 0) {
            const lastCleanup = new Date(JSON.parse(cleanupMemories[0].content).timestamp);
            const daysSinceCleanup = Math.floor((Date.now() - lastCleanup.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceCleanup > 7) {
                suggestions.push('Executar limpeza semanal do projeto');
            }
        }
        // Verifica preferências
        if (this.currentSession.userPreferences.preferDryRun) {
            suggestions.push('Lembre-se: usuário prefere dry-run antes de executar ações');
        }
        return suggestions;
    }
    /**
     * Resume o contexto da última sessão
     */
    async resumeLastSession() {
        const pendingTasks = await this.whatWasIDoing();
        const recentDecisions = await this.searchMemories('decision', 5);
        let resume = '📋 **Resumo da última sessão:**\n\n';
        if (pendingTasks.length > 0) {
            resume += '**Tarefas pendentes:**\n';
            pendingTasks.forEach(task => {
                resume += `- ${task.taskName} (${task.status}) - ${task.context.progress || 0}% completo\n`;
            });
            resume += '\n';
        }
        if (recentDecisions.length > 0) {
            resume += '**Decisões recentes:**\n';
            recentDecisions.slice(0, 3).forEach(m => {
                const decision = JSON.parse(m.content);
                resume += `- ${decision.context.decision} (${decision.context.reason})\n`;
            });
            resume += '\n';
        }
        const suggestions = await this.suggestNextSteps();
        if (suggestions.length > 0) {
            resume += '**Sugestões:**\n';
            suggestions.forEach(s => resume += `- ${s}\n`);
        }
        return resume;
    }
    // Métodos auxiliares privados
    createNewSession() {
        return {
            sessionId: `session-${Date.now()}`,
            userId: this.userId,
            startTime: new Date(),
            lastActivity: new Date(),
            conversationHistory: [],
            pendingTasks: [],
            completedTasks: [],
            userPreferences: {
                language: 'pt-br',
                preferDryRun: true,
                verbosityLevel: 'concise'
            }
        };
    }
    async saveToMem0(memory) {
        try {
            await this.mcpBridge.addMemory(this.userId, JSON.stringify(memory), {
                type: memory.type,
                taskName: memory.taskName,
                status: memory.status,
                timestamp: memory.timestamp.toISOString()
            });
        }
        catch (error) {
            console.error('Erro ao salvar memória:', error);
        }
    }
    async searchMemories(query, limit = 10) {
        try {
            return await this.mcpBridge.searchMemory(this.userId, query, limit);
        }
        catch (error) {
            console.error('Erro ao buscar memórias:', error);
            return [];
        }
    }
    findTask(taskId) {
        return this.currentSession.pendingTasks.find(t => t.id === taskId);
    }
    moveTaskToCompleted(taskId) {
        const taskIndex = this.currentSession.pendingTasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
            const task = this.currentSession.pendingTasks.splice(taskIndex, 1)[0];
            task.status = 'completed';
            this.currentSession.completedTasks.push(task);
        }
    }
    startAutoSave() {
        this.autoSaveInterval = setInterval(async () => {
            await this.saveSessionState();
        }, 30000); // 30 segundos
    }
    async saveSessionState() {
        try {
            await this.mcpBridge.addMemory(this.userId, JSON.stringify(this.currentSession), {
                type: 'session_state',
                sessionId: this.currentSession.sessionId,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Erro ao salvar estado da sessão:', error);
        }
    }
    /**
     * Limpa recursos ao desligar
     */
    async shutdown() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        await this.saveSessionState();
        console.log('💾 Sistema de memória salvo e desligado');
    }
}
