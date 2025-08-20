#!/usr/bin/env node
/**
 * MCP HTTP/WebSocket Bridge
 * Mantém o servidor MCP sempre ativo e permite reconexões
 */
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
class MCPHttpBridge extends EventEmitter {
    constructor(port = 3003, mcpPath = './build/index.js') {
        super();
        this.port = port;
        this.mcpPath = mcpPath;
        this.mcpProcess = null;
        this.sessions = new Map();
        this.messageQueue = [];
        // private isProcessing = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        // Log de requisições
        this.app.use((req, _res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }
    setupRoutes() {
        // Health check
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                mcp_connected: this.mcpProcess !== null,
                sessions: this.sessions.size,
                uptime: process.uptime()
            });
        });
        // Criar nova sessão
        this.app.post('/session', (_req, res) => {
            const sessionId = uuidv4();
            const session = {
                id: sessionId,
                created: new Date(),
                lastActivity: new Date(),
                pendingRequests: new Map()
            };
            this.sessions.set(sessionId, session);
            res.json({
                sessionId,
                websocket_url: `ws://localhost:${this.port}/ws?session=${sessionId}`
            });
        });
        // Listar ferramentas disponíveis
        this.app.get('/tools', async (_req, res) => {
            try {
                const result = await this.sendMCPRequest({
                    jsonrpc: '2.0',
                    id: uuidv4(),
                    method: 'tools/list',
                    params: {}
                });
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        // Executar ferramenta via HTTP
        this.app.post('/tools/:toolName', async (req, res) => {
            const { toolName } = req.params;
            const sessionId = req.headers['x-session-id'];
            if (!sessionId || !this.sessions.has(sessionId)) {
                return res.status(401).json({ error: 'Invalid session' });
            }
            try {
                const result = await this.sendMCPRequest({
                    jsonrpc: '2.0',
                    id: uuidv4(),
                    method: 'tools/call',
                    params: {
                        name: toolName,
                        arguments: req.body
                    }
                }, sessionId);
                return res.json(result);
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
        // Reconectar ao MCP
        this.app.post('/reconnect', async (_req, res) => {
            try {
                await this.reconnectMCP();
                res.json({ message: 'MCP reconnected successfully' });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    setupWebSocket() {
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server });
        this.wss.on('connection', (ws, req) => {
            const url = new URL(req.url, `http://localhost:${this.port}`);
            const sessionId = url.searchParams.get('session');
            if (!sessionId || !this.sessions.has(sessionId)) {
                ws.close(1008, 'Invalid session');
                return;
            }
            console.log(`WebSocket conectado: sessão ${sessionId}`);
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    const session = this.sessions.get(sessionId);
                    session.lastActivity = new Date();
                    const result = await this.sendMCPRequest(message, sessionId);
                    ws.send(JSON.stringify(result));
                }
                catch (error) {
                    ws.send(JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: error.message
                        }
                    }));
                }
            });
            ws.on('close', () => {
                console.log(`WebSocket desconectado: sessão ${sessionId}`);
            });
            ws.on('error', (error) => {
                console.error(`WebSocket erro: ${error.message}`);
            });
        });
    }
    async connectMCP() {
        return new Promise((resolve, reject) => {
            var _a, _b;
            console.log('Conectando ao MCP...');
            this.mcpProcess = spawn('node', [this.mcpPath], {
                env: { ...process.env },
                stdio: ['pipe', 'pipe', 'pipe']
            });
            (_a = this.mcpProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                this.handleMCPData(data.toString());
            });
            (_b = this.mcpProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                console.error('MCP Error:', data.toString());
            });
            this.mcpProcess.on('error', (error) => {
                console.error('MCP Process Error:', error);
                this.handleMCPDisconnect();
                reject(error);
            });
            this.mcpProcess.on('close', (code) => {
                console.log(`MCP process exited with code ${code}`);
                this.handleMCPDisconnect();
            });
            // Aguardar inicialização
            setTimeout(() => {
                console.log('MCP conectado com sucesso');
                this.reconnectAttempts = 0;
                resolve();
            }, 1000);
        });
    }
    async reconnectMCP() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            throw new Error('Max reconnection attempts reached');
        }
        this.reconnectAttempts++;
        console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        // Desconectar processo existente
        if (this.mcpProcess) {
            this.mcpProcess.kill();
            this.mcpProcess = null;
        }
        // Aguardar antes de reconectar
        await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
        try {
            await this.connectMCP();
            // Reprocessar mensagens pendentes
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                await this.sendMCPRequest(message);
            }
        }
        catch (error) {
            console.error('Falha na reconexão:', error);
            // Aumentar delay para próxima tentativa
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
            // Tentar novamente
            setTimeout(() => this.reconnectMCP(), this.reconnectDelay);
        }
    }
    handleMCPDisconnect() {
        console.log('MCP desconectado');
        this.mcpProcess = null;
        // Rejeitar todas as requisições pendentes
        this.sessions.forEach(session => {
            session.pendingRequests.forEach(({ reject, timeout }) => {
                clearTimeout(timeout);
                reject(new Error('MCP disconnected'));
            });
            session.pendingRequests.clear();
        });
        // Tentar reconectar automaticamente
        setTimeout(() => this.reconnectMCP(), this.reconnectDelay);
    }
    handleMCPData(data) {
        try {
            const lines = data.trim().split('\n');
            for (const line of lines) {
                if (line) {
                    const message = JSON.parse(line);
                    // Procurar em todas as sessões
                    for (const session of this.sessions.values()) {
                        if (message.id && session.pendingRequests.has(message.id)) {
                            const { resolve, reject, timeout } = session.pendingRequests.get(message.id);
                            clearTimeout(timeout);
                            session.pendingRequests.delete(message.id);
                            if (message.error) {
                                reject(new Error(message.error.message));
                            }
                            else {
                                resolve(message.result);
                            }
                            break;
                        }
                    }
                    // Emitir eventos para mensagens não solicitadas
                    if (message.method) {
                        this.emit('mcp-event', message);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error parsing MCP message:', error);
        }
    }
    async sendMCPRequest(message, sessionId) {
        if (!this.mcpProcess) {
            // Adicionar à fila e tentar reconectar
            this.messageQueue.push(message);
            await this.reconnectMCP();
        }
        return new Promise((resolve, reject) => {
            const id = message.id || uuidv4();
            const messageWithId = { ...message, id };
            // Timeout de 30 segundos
            const timeout = setTimeout(() => {
                if (sessionId) {
                    const session = this.sessions.get(sessionId);
                    session === null || session === void 0 ? void 0 : session.pendingRequests.delete(id);
                }
                reject(new Error(`Timeout for request ${id}`));
            }, 30000);
            // Registrar requisição pendente
            if (sessionId) {
                const session = this.sessions.get(sessionId);
                if (session) {
                    session.pendingRequests.set(id, { resolve, reject, timeout });
                }
            }
            // Enviar mensagem
            const data = JSON.stringify(messageWithId) + '\n';
            this.mcpProcess.stdin.write(data);
        });
    }
    async start() {
        // Conectar ao MCP
        await this.connectMCP();
        // Iniciar servidor HTTP/WS
        return new Promise((resolve) => {
            this.server.listen(this.port, () => {
                console.log(`\n🌉 MCP HTTP/WebSocket Bridge iniciado!`);
                console.log(`📡 HTTP: http://localhost:${this.port}`);
                console.log(`🔌 WebSocket: ws://localhost:${this.port}/ws`);
                console.log(`💚 Health: http://localhost:${this.port}/health`);
                console.log(`🔧 MCP: ${this.mcpPath}\n`);
                resolve();
            });
        });
        // Limpar sessões antigas periodicamente
        setInterval(() => {
            const now = new Date();
            const maxAge = 30 * 60 * 1000; // 30 minutos
            for (const [id, session] of this.sessions.entries()) {
                if (now.getTime() - session.lastActivity.getTime() > maxAge) {
                    console.log(`Removendo sessão inativa: ${id}`);
                    session.pendingRequests.forEach(({ timeout }) => clearTimeout(timeout));
                    this.sessions.delete(id);
                }
            }
        }, 60000); // A cada minuto
    }
    async stop() {
        console.log('🛑 Parando MCP HTTP Bridge...');
        // Fechar WebSocket
        this.wss.close();
        // Fechar servidor HTTP
        this.server.close();
        // Desconectar MCP
        if (this.mcpProcess) {
            this.mcpProcess.kill();
        }
        // Limpar sessões
        this.sessions.clear();
    }
}
// Executar se chamado diretamente
if (require.main === module) {
    const port = parseInt(process.env.MCP_BRIDGE_PORT || '3003');
    const mcpPath = process.env.MCP_PATH || './build/index.js';
    const bridge = new MCPHttpBridge(port, mcpPath);
    bridge.start().catch(error => {
        console.error('❌ Erro ao iniciar bridge:', error);
        process.exit(1);
    });
    // Graceful shutdown
    process.on('SIGTERM', async () => {
        await bridge.stop();
        process.exit(0);
    });
    process.on('SIGINT', async () => {
        await bridge.stop();
        process.exit(0);
    });
}
export { MCPHttpBridge };
