/**
 * Ponte de comunicação entre Claude Flow e DiegoTools MCP
 * Usa Mem0 como Memory Manager nativo
 */
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { MCP_CONFIG, MCP_TOOLS } from './mcp-integration';
import { MCPUsageTracker } from '../monitoring/mcp-usage-tracker';
export class MCPBridge extends EventEmitter {
    constructor() {
        super(...arguments);
        this.process = null; // Made public for checking
        this.messageId = 0;
        this.pendingRequests = new Map();
    }
    async connect() {
        return new Promise((resolve, reject) => {
            var _a, _b;
            console.log('🔌 Connecting to MCP DiegoTools...');
            console.log(`📁 Script path: ${MCP_CONFIG.DiegoTools.path}`);
            console.log(`🔧 Environment:`, {
                GITHUB_TOKEN: MCP_CONFIG.DiegoTools.env.GITHUB_TOKEN ? '✅ Set' : '❌ Missing',
                MEM0_API_KEY: MCP_CONFIG.DiegoTools.env.MEM0_API_KEY ? '✅ Set' : '❌ Missing',
                MEM0_BASE_URL: MCP_CONFIG.DiegoTools.env.MEM0_BASE_URL
            });
            try {
                this.process = spawn(MCP_CONFIG.DiegoTools.path, [], {
                    env: { ...process.env, ...MCP_CONFIG.DiegoTools.env },
                    stdio: ['pipe', 'pipe', 'pipe']
                });
            }
            catch (error) {
                console.error('❌ Failed to spawn MCP process:', error);
                reject(error);
                return;
            }
            (_a = this.process.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                const message = data.toString();
                console.log('📨 MCP stdout:', message.substring(0, 200));
                this.handleMessage(message);
            });
            (_b = this.process.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                const error = data.toString();
                console.error('❌ MCP stderr:', error);
            });
            this.process.on('error', (error) => {
                console.error('❌ MCP process error:', error);
                reject(error);
            });
            this.process.on('close', (code) => {
                console.log(`MCP process exited with code ${code}`);
                this.process = null;
            });
            // Aguardar inicialização
            console.log('⏳ Waiting for MCP initialization...');
            setTimeout(() => {
                if (this.process) {
                    console.log('✅ MCP process started successfully');
                    resolve();
                }
                else {
                    reject(new Error('MCP process failed to start'));
                }
            }, 2000);
        });
    }
    async callTool(toolName, params) {
        var _a, _b;
        const tracker = MCPUsageTracker.getInstance();
        const caller = ((_b = (_a = new Error().stack) === null || _a === void 0 ? void 0 : _a.split('\n')[2]) === null || _b === void 0 ? void 0 : _b.trim()) || 'unknown';
        if (!this.process) {
            tracker.logAttempt(toolName, caller, params, 'MCP process not connected');
            throw new Error('MCP process not connected');
        }
        const tracking = tracker.logCall(toolName, caller, params);
        const id = ++this.messageId;
        const message = {
            jsonrpc: '2.0',
            id,
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: params
            }
        };
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, {
                resolve: (result) => {
                    tracking.complete(true);
                    resolve(result);
                },
                reject: (error) => {
                    tracking.complete(false, error);
                    reject(error);
                }
            });
            this.sendMessage(message);
            // Timeout de 30 segundos
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    const error = new Error(`Timeout calling tool: ${toolName}`);
                    tracking.complete(false, error);
                    reject(error);
                }
            }, 30000);
        });
    }
    // Métodos específicos para Mem0 (Memory Manager)
    async addMemory(userId, content, metadata) {
        return this.callTool(MCP_TOOLS.MEMORY_ADD, {
            user_id: userId,
            content,
            metadata,
            category: (metadata === null || metadata === void 0 ? void 0 : metadata.category) || 'general'
        });
    }
    async searchMemory(userId, query, limit = 10) {
        return this.callTool(MCP_TOOLS.MEMORY_SEARCH, {
            user_id: userId,
            query,
            limit
        });
    }
    async listMemories(userId, limit = 50) {
        return this.callTool(MCP_TOOLS.MEMORY_LIST, {
            user_id: userId,
            limit
        });
    }
    async deleteMemory(userId, memoryId) {
        return this.callTool(MCP_TOOLS.MEMORY_DELETE, {
            user_id: userId,
            memory_id: memoryId
        });
    }
    // Método genérico para executar qualquer ferramenta
    async executeTool(toolName, args = {}) {
        return this.callTool(toolName, args);
    }
    // Métodos para outras ferramentas
    async navigate(url) {
        return this.callTool(MCP_TOOLS.WEB_NAVIGATE, { url });
    }
    async screenshot(path, fullPage = false) {
        return this.callTool(MCP_TOOLS.WEB_SCREENSHOT, { path, fullPage });
    }
    async createGithubIssue(owner, repo, title, body) {
        return this.callTool(MCP_TOOLS.GITHUB_CREATE_ISSUE, {
            owner,
            repo,
            title,
            body
        });
    }
    async gitStatus(detailed = false) {
        return this.callTool(MCP_TOOLS.GIT_STATUS, { detailed });
    }
    sendMessage(message) {
        var _a;
        if (!((_a = this.process) === null || _a === void 0 ? void 0 : _a.stdin)) {
            throw new Error('MCP process not connected');
        }
        const data = JSON.stringify(message) + '\n';
        this.process.stdin.write(data);
    }
    handleMessage(data) {
        try {
            const lines = data.trim().split('\n');
            for (const line of lines) {
                if (line && line.trim()) {
                    // Filtrar apenas linhas que parecem ser JSON
                    if (!line.trim().startsWith('{')) {
                        continue; // Pular logs não-JSON
                    }
                    try {
                        const message = JSON.parse(line);
                        if (message.id && this.pendingRequests.has(message.id)) {
                            const { resolve, reject } = this.pendingRequests.get(message.id);
                            this.pendingRequests.delete(message.id);
                            if (message.error) {
                                reject(new Error(message.error.message));
                            }
                            else {
                                resolve(message.result);
                            }
                        }
                        // Emitir eventos para mensagens não solicitadas
                        if (message.method) {
                            this.emit(message.method, message.params);
                        }
                    }
                    catch (parseError) {
                        // Ignorar erros de parse para linhas individuais
                        console.debug('Skipping non-JSON line:', line.substring(0, 50));
                    }
                }
            }
        }
        catch (error) {
            console.error('Error parsing MCP message:', error);
        }
    }
    disconnect() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
}
