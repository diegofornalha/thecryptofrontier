/**
 * Cliente HTTP/WebSocket para conectar ao MCP Bridge
 * Permite que Claude se reconecte sem perder estado
 */
import axios from 'axios';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
export class MCPHttpClient extends EventEmitter {
    constructor(config) {
        super();
        this.ws = null;
        this.sessionId = null;
        this.reconnectTimer = null;
        this.isConnecting = false;
        this.config = {
            autoReconnect: true,
            reconnectInterval: 5000,
            ...config
        };
    }
    /**
     * Conectar ao MCP Bridge
     */
    async connect() {
        if (this.isConnecting) {
            throw new Error('Already connecting');
        }
        this.isConnecting = true;
        try {
            // Criar ou reutilizar sessão
            if (!this.sessionId && !this.config.sessionId) {
                const response = await axios.post(`${this.config.bridgeUrl}/session`);
                this.sessionId = response.data.sessionId;
                console.log(`Nova sessão criada: ${this.sessionId}`);
            }
            else {
                this.sessionId = this.config.sessionId || this.sessionId;
                console.log(`Reutilizando sessão: ${this.sessionId}`);
            }
            // Conectar WebSocket
            await this.connectWebSocket();
            this.isConnecting = false;
            this.emit('connected', { sessionId: this.sessionId });
        }
        catch (error) {
            this.isConnecting = false;
            throw error;
        }
    }
    /**
     * Conectar WebSocket para comunicação em tempo real
     */
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            const wsUrl = `${this.config.bridgeUrl.replace('http', 'ws')}/ws?session=${this.sessionId}`;
            this.ws = new WebSocket(wsUrl);
            this.ws.on('open', () => {
                console.log('WebSocket conectado');
                resolve();
            });
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.emit('message', message);
                }
                catch (error) {
                    console.error('Erro ao processar mensagem:', error);
                }
            });
            this.ws.on('close', () => {
                console.log('WebSocket desconectado');
                this.ws = null;
                this.handleDisconnect();
            });
            this.ws.on('error', (error) => {
                console.error('WebSocket erro:', error);
                reject(error);
            });
        });
    }
    /**
     * Lidar com desconexão
     */
    handleDisconnect() {
        this.emit('disconnected');
        if (this.config.autoReconnect && !this.reconnectTimer) {
            console.log(`Tentando reconectar em ${this.config.reconnectInterval}ms...`);
            this.reconnectTimer = setTimeout(async () => {
                this.reconnectTimer = null;
                try {
                    await this.connect();
                }
                catch (error) {
                    console.error('Falha na reconexão:', error);
                    this.handleDisconnect();
                }
            }, this.config.reconnectInterval);
        }
    }
    /**
     * Executar ferramenta via HTTP
     */
    async executeTool(toolName, args = {}) {
        var _a;
        if (!this.sessionId) {
            throw new Error('Not connected');
        }
        try {
            const response = await axios.post(`${this.config.bridgeUrl}/tools/${toolName}`, args, {
                headers: {
                    'X-Session-Id': this.sessionId
                }
            });
            return response.data;
        }
        catch (error) {
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                // Sessão inválida, reconectar
                this.sessionId = null;
                await this.connect();
                // Tentar novamente
                return this.executeTool(toolName, args);
            }
            throw error;
        }
    }
    /**
     * Executar ferramenta via WebSocket (mais rápido)
     */
    async executeToolWS(toolName, args = {}) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            // Fallback para HTTP
            return this.executeTool(toolName, args);
        }
        return new Promise((resolve, reject) => {
            const id = Date.now().toString();
            const timeout = setTimeout(() => {
                this.off('message', handler);
                reject(new Error('Timeout'));
            }, 30000);
            const handler = (message) => {
                if (message.id === id) {
                    clearTimeout(timeout);
                    this.off('message', handler);
                    if (message.error) {
                        reject(new Error(message.error.message));
                    }
                    else {
                        resolve(message.result);
                    }
                }
            };
            this.on('message', handler);
            this.ws.send(JSON.stringify({
                jsonrpc: '2.0',
                id,
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: args
                }
            }));
        });
    }
    /**
     * Listar ferramentas disponíveis
     */
    async listTools() {
        const response = await axios.get(`${this.config.bridgeUrl}/tools`);
        return response.data;
    }
    /**
     * Verificar saúde do bridge
     */
    async checkHealth() {
        const response = await axios.get(`${this.config.bridgeUrl}/health`);
        return response.data;
    }
    /**
     * Desconectar
     */
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.sessionId = null;
        this.emit('disconnected');
    }
    /**
     * Obter ID da sessão atual
     */
    getSessionId() {
        return this.sessionId;
    }
}
// Exemplo de uso
export async function exampleUsage() {
    const client = new MCPHttpClient({
        bridgeUrl: 'http://localhost:3003',
        autoReconnect: true
    });
    // Eventos
    client.on('connected', ({ sessionId }) => {
        console.log(`Conectado com sessão: ${sessionId}`);
    });
    client.on('disconnected', () => {
        console.log('Desconectado do MCP');
    });
    try {
        // Conectar
        await client.connect();
        // Listar ferramentas
        const tools = await client.listTools();
        console.log('Ferramentas disponíveis:', tools);
        // Executar ferramenta Mem0
        const result = await client.executeTool('mem0_add_memory', {
            content: 'Teste de memória via HTTP Bridge',
            user_id: 'test-user',
            metadata: {
                source: 'http-client-test'
            }
        });
        console.log('Resultado:', result);
        // Buscar memórias
        const memories = await client.executeTool('mem0_search_memory', {
            query: 'teste',
            user_id: 'test-user'
        });
        console.log('Memórias encontradas:', memories);
    }
    catch (error) {
        console.error('Erro:', error);
    }
}
