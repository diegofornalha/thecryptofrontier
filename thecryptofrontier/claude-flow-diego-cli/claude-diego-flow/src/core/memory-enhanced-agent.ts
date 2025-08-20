/**
 * Base class para agentes com capacidade de memória
 * Extende BaseAgent adicionando funcionalidades do mem0
 */

import { Agent, AgentConfig } from './agent';
import { Message } from '../types';
import * as http from 'http';

export interface MemoryConfig {
    userId?: string;
    category?: string;
    autoSave?: boolean;
    retentionDays?: number;
}

export abstract class MemoryEnhancedAgent extends Agent {
    protected memoryUserId: string;
    protected memoryCategory: string;
    protected autoSave: boolean;
    protected retentionDays: number;
    protected learningCount: number = 0;
    protected memoryHost: string;

    constructor(config: AgentConfig & { memory?: MemoryConfig }) {
        super(config);
        
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
    protected async saveMemory(
        content: string, 
        tags: string[] = [], 
        metadata: Record<string, any> = {}
    ): Promise<void> {
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
        } catch (error) {
            console.error('❌ Erro ao salvar memória:', error);
        }
    }

    /**
     * Faz uma requisição HTTP
     */
    private makeHttpRequest(options: any, data: string): Promise<string> {
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
    protected async searchMemories(
        query: string, 
        limit: number = 10
    ): Promise<any[]> {
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
            } else if (result.memories) {
                console.log(`📚 Encontradas ${result.memories.length} memórias relevantes`);
                return result.memories;
            }
            
            return [];
        } catch (error) {
            console.error('❌ Erro ao buscar memórias:', error);
            return [];
        }
    }

    /**
     * Lista todas as memórias do agente
     */
    protected async listMemories(limit: number = 50): Promise<any[]> {
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
        } catch (error) {
            console.error('❌ Erro ao listar memórias:', error);
            return [];
        }
    }

    /**
     * Limpa memórias antigas
     */
    protected async cleanOldMemories(): Promise<void> {
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
        } catch (error) {
            console.error('❌ Erro ao limpar memórias antigas:', error);
        }
    }

    /**
     * Deleta uma memória específica
     */
    protected async deleteMemory(memoryId: string): Promise<void> {
        try {
            const payload = {
                user_id: this.memoryUserId,
                memory_id: memoryId
            };

            const command = `curl -X DELETE http://${this.memoryHost}:3002/mcp/delete_memories -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' -s`;
            await execAsync(command);
        } catch (error) {
            console.error('❌ Erro ao deletar memória:', error);
        }
    }

    /**
     * Aplica conhecimento prévio baseado em memórias
     */
    protected async applyPreviousKnowledge(context: string): Promise<string[]> {
        const memories = await this.searchMemories(context, 5);
        const insights: string[] = [];

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
    protected async saveError(
        error: string, 
        context: string, 
        solution?: string
    ): Promise<void> {
        const content = `ERRO: ${error}\nCONTEXTO: ${context}${solution ? `\nSOLUÇÃO: ${solution}` : ''}`;
        await this.saveMemory(content, ['error', 'learning'], { type: 'error', solved: !!solution });
    }

    /**
     * Salva padrão identificado
     */
    protected async savePattern(
        pattern: string, 
        occurrences: number, 
        context: string
    ): Promise<void> {
        const content = `PADRÃO: ${pattern}\nOCORRÊNCIAS: ${occurrences}\nCONTEXTO: ${context}`;
        await this.saveMemory(content, ['pattern', 'insight'], { type: 'pattern', occurrences });
    }

    /**
     * Override do processMessage para adicionar memória
     */
    async processMessage(message: Message): Promise<Message> {
        // Buscar memórias relevantes antes de processar
        const relevantMemories = await this.applyPreviousKnowledge(message.content);
        
        // Processar mensagem normalmente
        const response = await super.processMessage(message);
        
        // Se autoSave está ativado, salvar interação importante
        if (this.autoSave && this.isImportantInteraction(message, response)) {
            await this.saveMemory(
                `Q: ${message.content}\nA: ${response.content}`,
                ['interaction'],
                { messageId: message.metadata?.id }
            );
        }
        
        return response;
    }

    /**
     * Determina se uma interação é importante para salvar
     */
    protected isImportantInteraction(message: Message, response: Message): boolean {
        // Override em classes filhas para lógica específica
        return response.content.length > 100; // Exemplo simples
    }

    /**
     * Gera relatório de memórias
     */
    async generateMemoryReport(): Promise<string> {
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