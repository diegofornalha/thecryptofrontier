/**
 * Mem0 MCP Bridge - Compatibilidade entre MCP Tools e Mem0 OSS
 *
 * Este bridge permite que os agentes existentes continuem usando as funções MCP
 * enquanto internamente utilizam o Mem0 OSS local para melhor performance e controle.
 */
import express from 'express';
import cors from 'cors';
import axios from 'axios';
export class Mem0MCPBridge {
    constructor(chromaUrl = 'http://localhost:8000', port = 3002) {
        this.app = express();
        this.chromaUrl = chromaUrl;
        this.mem0OSSUrl = chromaUrl; // Usar ChromaDB diretamente
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        // Log requests for debugging
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }
    setupRoutes() {
        // Health check
        this.app.get('/health', async (req, res) => {
            try {
                // Verificar conexão com Chroma (apenas testar se responde)
                const chromaResponse = await axios.get(`${this.chromaUrl}/`);
                res.json({
                    status: 'healthy',
                    service: 'mem0-mcp-bridge',
                    chroma_url: this.chromaUrl,
                    chroma_status: 'connected',
                    chroma_response: chromaResponse.data,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                res.json({
                    status: 'degraded',
                    service: 'mem0-mcp-bridge',
                    chroma_url: this.chromaUrl,
                    chroma_status: 'disconnected',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
        // MCP Memory Add (compatibilidade com mcp__DiegoTools__mem0_add_memory)
        this.app.post('/mcp/add_memory', async (req, res) => {
            try {
                const { content, user_id, metadata, category, tags } = req.body;
                // Usar ChromaDB diretamente - criar coleção se não existir
                const collectionName = `user_${user_id.replace(/[^a-zA-Z0-9]/g, '_')}`;
                try {
                    // Verificar se coleção existe
                    await axios.get(`${this.chromaUrl}/api/v2/collections/${collectionName}`);
                }
                catch (_a) {
                    // Criar coleção com embedding function dummy (sem embeddings)
                    await axios.post(`${this.chromaUrl}/api/v2/collections`, {
                        name: collectionName,
                        metadata: { user_id, description: 'MCP Memory Collection' },
                        embedding_function: {
                            name: 'dummy',
                            dimension: 1
                        }
                    });
                }
                // Adicionar documento à coleção com embedding dummy
                const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const response = await axios.post(`${this.chromaUrl}/api/v2/collections/${collectionName}/add`, {
                    ids: [documentId],
                    documents: [content],
                    embeddings: [[0.1]], // Embedding dummy para satisfazer a API
                    metadatas: [{
                            ...metadata,
                            source: 'mcp-bridge',
                            category,
                            tags: (tags === null || tags === void 0 ? void 0 : tags.join(',')) || '',
                            user_id,
                            timestamp: new Date().toISOString()
                        }]
                });
                // Converter resposta para formato MCP
                res.json({
                    id: documentId,
                    content: content,
                    user_id: user_id,
                    created_at: new Date().toISOString(),
                    metadata: metadata
                });
            }
            catch (error) {
                console.error('Erro no add_memory:', error);
                res.status(500).json({
                    error: 'Failed to add memory',
                    details: error.message
                });
            }
        });
        // MCP Memory Search (compatibilidade com mcp__DiegoTools__mem0_search_memory)
        this.app.post('/mcp/search_memory', async (req, res) => {
            var _a;
            try {
                const { query, user_id, limit = 10, filters } = req.body;
                const searchRequest = {
                    query,
                    user_id,
                    limit,
                    filters
                };
                const response = await axios.post(`${this.mem0OSSUrl}/v1/memories/search`, searchRequest);
                // Converter resultados OSS para formato MCP
                const mcpResults = ((_a = response.data.memories) === null || _a === void 0 ? void 0 : _a.map((memory) => ({
                    id: memory.id,
                    content: memory.memory || memory.content,
                    score: memory.score,
                    created_at: memory.created_at,
                    metadata: memory.metadata
                }))) || [];
                res.json({
                    results: mcpResults,
                    total: mcpResults.length
                });
            }
            catch (error) {
                console.error('Erro no search_memory:', error);
                res.status(500).json({
                    error: 'Failed to search memories',
                    details: error.message
                });
            }
        });
        // MCP Memory List (compatibilidade com mcp__DiegoTools__mem0_list_memories)
        this.app.get('/mcp/list_memories/:user_id', async (req, res) => {
            var _a;
            try {
                const { user_id } = req.params;
                const { limit = 50 } = req.query;
                const response = await axios.get(`${this.mem0OSSUrl}/v1/memories`, {
                    params: { user_id, limit }
                });
                // Converter para formato MCP
                const mcpMemories = ((_a = response.data.memories) === null || _a === void 0 ? void 0 : _a.map((memory) => ({
                    id: memory.id,
                    content: memory.memory || memory.content,
                    created_at: memory.created_at,
                    metadata: memory.metadata
                }))) || [];
                res.json({
                    memories: mcpMemories,
                    total: mcpMemories.length,
                    user_id
                });
            }
            catch (error) {
                console.error('Erro no list_memories:', error);
                res.status(500).json({
                    error: 'Failed to list memories',
                    details: error.message
                });
            }
        });
        // MCP Memory Delete (compatibilidade com mcp__DiegoTools__mem0_delete_memories)
        this.app.delete('/mcp/delete_memories', async (req, res) => {
            try {
                const { user_id, memory_id } = req.body;
                if (memory_id) {
                    // Deletar memória específica
                    await axios.delete(`${this.mem0OSSUrl}/v1/memories/${memory_id}`);
                    res.json({
                        message: 'Memory deleted successfully',
                        deleted_id: memory_id
                    });
                }
                else {
                    // Deletar todas as memórias do usuário
                    await axios.delete(`${this.mem0OSSUrl}/v1/memories`, {
                        data: { user_id }
                    });
                    res.json({
                        message: 'All memories deleted successfully',
                        user_id
                    });
                }
            }
            catch (error) {
                console.error('Erro no delete_memories:', error);
                res.status(500).json({
                    error: 'Failed to delete memories',
                    details: error.message
                });
            }
        });
        // Enhanced Conversational Memory (novo recurso OSS)
        this.app.post('/oss/add_conversation', async (req, res) => {
            try {
                const { messages, user_id, metadata } = req.body;
                const ossRequest = {
                    messages,
                    user_id,
                    metadata: {
                        ...metadata,
                        source: 'conversational',
                        conversation_length: messages.length,
                        timestamp: new Date().toISOString()
                    }
                };
                const response = await axios.post(`${this.mem0OSSUrl}/v1/memories`, ossRequest);
                res.json({
                    id: response.data.id,
                    conversation_id: response.data.id,
                    messages_count: messages.length,
                    user_id,
                    created_at: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Erro no add_conversation:', error);
                res.status(500).json({
                    error: 'Failed to add conversation',
                    details: error.message
                });
            }
        });
        // Agent Interaction Timeline
        this.app.post('/oss/agent_interaction', async (req, res) => {
            try {
                const { agent_name, task_id, interaction_type, content, metadata } = req.body;
                const messages = [
                    {
                        role: 'system',
                        content: `Agent ${agent_name} iniciou ${interaction_type}`,
                        timestamp: new Date().toISOString()
                    },
                    {
                        role: 'agent',
                        content: content,
                        timestamp: new Date().toISOString()
                    }
                ];
                const ossRequest = {
                    messages,
                    user_id: agent_name,
                    metadata: {
                        ...metadata,
                        agent_name,
                        task_id,
                        interaction_type,
                        source: 'agent-timeline',
                        timestamp: new Date().toISOString()
                    }
                };
                const response = await axios.post(`${this.mem0OSSUrl}/v1/memories`, ossRequest);
                res.json({
                    id: response.data.id,
                    agent_name,
                    task_id,
                    interaction_type,
                    created_at: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Erro no agent_interaction:', error);
                res.status(500).json({
                    error: 'Failed to record agent interaction',
                    details: error.message
                });
            }
        });
        // Stats and Analytics
        this.app.get('/stats', async (req, res) => {
            try {
                // Buscar estatísticas básicas do OSS
                const statsResponse = await axios.get(`${this.mem0OSSUrl}/v1/stats`);
                res.json({
                    bridge_status: 'active',
                    mem0_oss_status: 'connected',
                    oss_stats: statsResponse.data,
                    bridge_info: {
                        version: '1.0.0',
                        uptime: process.uptime(),
                        memory_usage: process.memoryUsage()
                    }
                });
            }
            catch (error) {
                res.json({
                    bridge_status: 'active',
                    mem0_oss_status: 'disconnected',
                    error: error.message
                });
            }
        });
        // Fallback para métodos não implementados
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                available_endpoints: [
                    'POST /mcp/add_memory',
                    'POST /mcp/search_memory',
                    'GET /mcp/list_memories/:user_id',
                    'DELETE /mcp/delete_memories',
                    'POST /oss/add_conversation',
                    'POST /oss/agent_interaction',
                    'GET /stats',
                    'GET /health'
                ]
            });
        });
    }
    async start() {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`\n🌉 Mem0 MCP Bridge iniciado!`);
                console.log(`📡 Porta: ${this.port}`);
                console.log(`🔗 Chroma DB: ${this.chromaUrl}`);
                console.log(`📋 Endpoints MCP: /mcp/*`);
                console.log(`✨ Recursos OSS: /oss/*`);
                console.log(`💚 Health: http://localhost:${this.port}/health\n`);
                resolve();
            });
        });
    }
    async stop() {
        // Implementar graceful shutdown se necessário
        console.log('🛑 Parando Mem0 MCP Bridge...');
    }
}
// Executar se chamado diretamente
if (require.main === module) {
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    const port = parseInt(process.env.MCP_BRIDGE_PORT || '3002');
    const bridge = new Mem0MCPBridge(chromaUrl, port);
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
