/**
 * Agente que usa diretamente as ferramentas MCP
 * Sem dependência de API do Claude ou respostas simuladas
 */
import { BaseAgent, AgentType } from '../core/base-agent';
import { MCP_TOOLS } from './mcp-integration';
export class MCPDirectAgent extends BaseAgent {
    constructor(config, mcpBridge) {
        super(config, mcpBridge);
        this.executeStrategy = config.executeStrategy || 'sequential';
    }
    async executeTask(task) {
        console.log(`\n🔧 ${this.name} executando tarefa diretamente via MCP...`);
        console.log(`📋 Tarefa: ${task.description}`);
        try {
            // Determinar ações baseadas no tipo de agente e descrição da tarefa
            const actions = this.determineActions(task);
            // Executar ações
            const results = await this.executeActions(actions, task);
            // Compilar resultado final
            const finalResult = {
                taskId: task.id,
                agentId: this.id,
                agentName: this.name,
                actions: actions.length,
                results,
                timestamp: new Date().toISOString()
            };
            console.log(`✅ Tarefa concluída por ${this.name}`);
            return finalResult;
        }
        catch (error) {
            console.error(`❌ Erro ao executar tarefa:`, error);
            throw error;
        }
    }
    determineActions(task) {
        var _a, _b, _c, _d, _e;
        const actions = [];
        const description = task.description.toLowerCase();
        switch (this.type) {
            case AgentType.RESEARCHER:
                // Pesquisador: navegar, capturar, salvar
                if (description.includes('pesquisar') || description.includes('buscar')) {
                    // Extrair URL se houver
                    const urlMatch = description.match(/https?:\/\/[^\s]+/);
                    if (urlMatch) {
                        actions.push({
                            tool: MCP_TOOLS.WEB_NAVIGATE,
                            params: { url: urlMatch[0] }
                        });
                        actions.push({
                            tool: MCP_TOOLS.WEB_SCREENSHOT,
                            params: { path: `./screenshots/${Date.now()}.png` }
                        });
                    }
                    // Sempre salvar resultado na memória
                    actions.push({
                        tool: MCP_TOOLS.MEMORY_ADD,
                        params: {
                            user_id: this.id,
                            content: `Pesquisa realizada: ${task.description}`,
                            category: 'research'
                        }
                    });
                }
                break;
            case AgentType.IMPLEMENTER:
                // Desenvolvedor: git e github
                if (description.includes('commit')) {
                    actions.push({
                        tool: MCP_TOOLS.GIT_STATUS,
                        params: { detailed: true }
                    });
                    actions.push({
                        tool: MCP_TOOLS.GIT_COMMIT,
                        params: {
                            message: ((_a = task.metadata) === null || _a === void 0 ? void 0 : _a.commitMessage) || 'Automated commit via Claude Flow',
                            addAll: true
                        }
                    });
                }
                if (description.includes('issue')) {
                    const issueData = ((_b = task.metadata) === null || _b === void 0 ? void 0 : _b.issue) || {};
                    actions.push({
                        tool: MCP_TOOLS.GITHUB_CREATE_ISSUE,
                        params: {
                            owner: issueData.owner || 'default-owner',
                            repo: issueData.repo || 'default-repo',
                            title: issueData.title || `Task: ${task.description}`,
                            body: issueData.body || 'Created via Claude Flow'
                        }
                    });
                }
                break;
            case AgentType.ANALYST:
                // Analista: buscar e analisar memórias
                actions.push({
                    tool: MCP_TOOLS.MEMORY_SEARCH,
                    params: {
                        user_id: this.id,
                        query: ((_c = task.metadata) === null || _c === void 0 ? void 0 : _c.searchQuery) || task.description,
                        limit: 10
                    }
                });
                // Salvar análise
                actions.push({
                    tool: MCP_TOOLS.MEMORY_ADD,
                    params: {
                        user_id: this.id,
                        content: `Análise completada: ${task.description}`,
                        category: 'analysis'
                    }
                });
                break;
            case AgentType.COORDINATOR:
                // Coordenador: criar issues e gerenciar tarefas
                if (description.includes('organizar') || description.includes('coordenar')) {
                    actions.push({
                        tool: MCP_TOOLS.GITHUB_LIST_ISSUES,
                        params: {
                            owner: ((_d = task.metadata) === null || _d === void 0 ? void 0 : _d.owner) || 'default-owner',
                            repo: ((_e = task.metadata) === null || _e === void 0 ? void 0 : _e.repo) || 'default-repo',
                            state: 'open'
                        }
                    });
                }
                break;
            default:
                // Ação padrão: salvar na memória
                actions.push({
                    tool: MCP_TOOLS.MEMORY_ADD,
                    params: {
                        user_id: this.id,
                        content: `Tarefa processada: ${task.description}`,
                        category: 'general'
                    }
                });
        }
        return actions;
    }
    async executeActions(actions, task) {
        const results = [];
        if (this.executeStrategy === 'parallel') {
            // Executar em paralelo
            const promises = actions.map(async (action) => {
                try {
                    console.log(`  🔨 Executando: ${this.getToolName(action.tool)}`);
                    const result = await this.mcp.callTool(action.tool, action.params);
                    return { tool: action.tool, success: true, result };
                }
                catch (error) {
                    return {
                        tool: action.tool,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    };
                }
            });
            const parallelResults = await Promise.all(promises);
            results.push(...parallelResults);
        }
        else {
            // Executar sequencialmente
            for (const action of actions) {
                try {
                    console.log(`  🔨 Executando: ${this.getToolName(action.tool)}`);
                    const result = await this.mcp.callTool(action.tool, action.params);
                    results.push({ tool: action.tool, success: true, result });
                }
                catch (error) {
                    results.push({
                        tool: action.tool,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        }
        return results;
    }
    getToolName(tool) {
        // Extrair nome simplificado da ferramenta
        const parts = tool.split('__');
        return parts[parts.length - 1] || tool;
    }
    getDefaultSystemPrompt() {
        // Prompts diretos focados em execução de ferramentas
        switch (this.type) {
            case AgentType.RESEARCHER:
                return 'Agente de pesquisa que navega, captura e armazena informações usando ferramentas MCP.';
            case AgentType.IMPLEMENTER:
                return 'Agente desenvolvedor que gerencia código e repositórios usando Git e GitHub.';
            case AgentType.ANALYST:
                return 'Agente analista que busca e processa informações armazenadas na memória.';
            case AgentType.COORDINATOR:
                return 'Agente coordenador que organiza tarefas e gerencia projetos.';
            default:
                return 'Agente especializado em executar ferramentas MCP.';
        }
    }
}
