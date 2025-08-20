"use strict";
/**
 * Base class para agentes com capacidade de memória
 * Extende BaseAgent adicionando funcionalidades do mem0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryEnhancedAgent = void 0;
const agent_1 = require("./agent");
const http = __importStar(require("http"));
class MemoryEnhancedAgent extends agent_1.Agent {
    constructor(config) {
        super(config);
        this.learningCount = 0;
        // Configurar memória
        this.memoryUserId = config.memory?.userId || `agent:${config.id}`;
        this.memoryCategory = config.memory?.category || 'general';
        this.autoSave = config.memory?.autoSave ?? true;
        this.retentionDays = config.memory?.retentionDays || 90;
        // Detectar se está rodando em Docker
        this.memoryHost = process.env.MEM0_HOST || (process.env.DOCKER_ENV ? 'mem0-bridge' : 'localhost');
    }
    /**
     * Salva uma memória
     */
    async saveMemory(content, tags = [], metadata = {}) {
        try {
            // Usar HTTP nativo para chamar o mem0-bridge
            const payload = {
                content,
                user_id: this.memoryUserId,
                category: this.memoryCategory,
                tags: [...tags, this.config.name.toLowerCase().replace(/\s+/g, '-')],
                metadata: JSON.stringify({
                    ...metadata,
                    agent: this.config.id,
                    agentName: this.config.name,
                    timestamp: new Date().toISOString(),
                    learningNumber: ++this.learningCount
                })
            };
            console.log(`🔄 Salvando memória para ${this.memoryUserId}...`);
            const data = JSON.stringify(payload);
            const options = {
                hostname: this.memoryHost,
                port: 3002,
                path: '/mcp/add_memory',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            const response = await this.makeHttpRequest(options, data);
            const result = JSON.parse(response);
            console.log(`💾 Memória salva com ID: ${result.id}`);
            console.log(`   Conteúdo: ${content.substring(0, 50)}...`);
        }
        catch (error) {
            console.error('❌ Erro ao salvar memória:', error);
        }
    }
    /**
     * Faz uma requisição HTTP
     */
    makeHttpRequest(options, data) {
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve(body));
            });
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }
    /**
     * Busca memórias relevantes
     */
    async searchMemories(query, limit = 10) {
        try {
            const payload = {
                query,
                user_id: this.memoryUserId,
                limit: limit.toString()
            };
            const data = JSON.stringify(payload);
            const options = {
                hostname: this.memoryHost,
                port: 3002,
                path: '/mcp/search_memory',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            const response = await this.makeHttpRequest(options, data);
            const result = JSON.parse(response);
            if (Array.isArray(result)) {
                console.log(`📚 Encontradas ${result.length} memórias relevantes`);
                return result;
            }
            else if (result.memories) {
                console.log(`📚 Encontradas ${result.memories.length} memórias relevantes`);
                return result.memories;
            }
            return [];
        }
        catch (error) {
            console.error('❌ Erro ao buscar memórias:', error);
            return [];
        }
    }
    /**
     * Lista todas as memórias do agente
     */
    async listMemories(limit = 50) {
        try {
            const options = {
                hostname: this.memoryHost,
                port: 3002,
                path: `/mcp/list_memories/${this.memoryUserId}?limit=${limit}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const response = await this.makeHttpRequest(options, '');
            const result = JSON.parse(response);
            return result.memories || [];
        }
        catch (error) {
            console.error('❌ Erro ao listar memórias:', error);
            return [];
        }
    }
    /**
     * Limpa memórias antigas
     */
    async cleanOldMemories() {
        try {
            const memories = await this.listMemories(100);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
            for (const memory of memories) {
                const memoryDate = new Date(memory.metadata?.timestamp || memory.created_at);
                if (memoryDate < cutoffDate) {
                    await this.deleteMemory(memory.id);
                }
            }
        }
        catch (error) {
            console.error('❌ Erro ao limpar memórias antigas:', error);
        }
    }
    /**
     * Deleta uma memória específica
     */
    async deleteMemory(memoryId) {
        try {
            const payload = {
                user_id: this.memoryUserId,
                memory_id: memoryId
            };
            const command = `curl -X DELETE http://${this.memoryHost}:3002/mcp/delete_memories -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' -s`;
            await execAsync(command);
        }
        catch (error) {
            console.error('❌ Erro ao deletar memória:', error);
        }
    }
    /**
     * Aplica conhecimento prévio baseado em memórias
     */
    async applyPreviousKnowledge(context) {
        const memories = await this.searchMemories(context, 5);
        const insights = [];
        for (const memory of memories) {
            if (memory.score > 0.7) { // Alta relevância
                insights.push(memory.content);
            }
        }
        if (insights.length > 0) {
            console.log(`🧠 Aplicando ${insights.length} insights anteriores`);
        }
        return insights;
    }
    /**
     * Salva erro para aprendizado futuro
     */
    async saveError(error, context, solution) {
        const content = `ERRO: ${error}\nCONTEXTO: ${context}${solution ? `\nSOLUÇÃO: ${solution}` : ''}`;
        await this.saveMemory(content, ['error', 'learning'], { type: 'error', solved: !!solution });
    }
    /**
     * Salva padrão identificado
     */
    async savePattern(pattern, occurrences, context) {
        const content = `PADRÃO: ${pattern}\nOCORRÊNCIAS: ${occurrences}\nCONTEXTO: ${context}`;
        await this.saveMemory(content, ['pattern', 'insight'], { type: 'pattern', occurrences });
    }
    /**
     * Override do processMessage para adicionar memória
     */
    async processMessage(message) {
        // Buscar memórias relevantes antes de processar
        const relevantMemories = await this.applyPreviousKnowledge(message.content);
        // Processar mensagem normalmente
        const response = await super.processMessage(message);
        // Se autoSave está ativado, salvar interação importante
        if (this.autoSave && this.isImportantInteraction(message, response)) {
            await this.saveMemory(`Q: ${message.content}\nA: ${response.content}`, ['interaction'], { messageId: message.metadata?.id });
        }
        return response;
    }
    /**
     * Determina se uma interação é importante para salvar
     */
    isImportantInteraction(message, response) {
        // Override em classes filhas para lógica específica
        return response.content.length > 100; // Exemplo simples
    }
    /**
     * Gera relatório de memórias
     */
    async generateMemoryReport() {
        const memories = await this.listMemories(20);
        const stats = {
            total: memories.length,
            errors: memories.filter(m => m.metadata?.type === 'error').length,
            patterns: memories.filter(m => m.metadata?.type === 'pattern').length,
            interactions: memories.filter(m => m.tags?.includes('interaction')).length
        };
        return `📊 Relatório de Memória - ${this.config.name}
        
Total de memórias: ${stats.total}
- Erros aprendidos: ${stats.errors}
- Padrões identificados: ${stats.patterns}
- Interações salvas: ${stats.interactions}

Últimas memórias:
${memories.slice(0, 5).map(m => `- ${m.content.substring(0, 80)}...`).join('\n')}
`;
    }
}
exports.MemoryEnhancedAgent = MemoryEnhancedAgent;
