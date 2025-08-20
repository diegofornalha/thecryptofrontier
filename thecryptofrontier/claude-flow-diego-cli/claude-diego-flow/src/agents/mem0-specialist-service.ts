import { MemoryNamespaces } from '../constants/memory-constants';

/**
 * Mem0 Specialist Service
 * 
 * Serviço auxiliar que fornece interface simplificada para outros agentes
 * interagirem com o sistema Mem0
 */
export class Mem0SpecialistService {
    private mem0BridgeUrl: string = 'http://localhost:3002';
    private defaultTimeout: number = 5000;

    /**
     * Adiciona uma nova memória ao sistema
     */
    async addMemory(params: {
        content: string;
        userId: string;
        category?: string;
        tags?: string[];
        metadata?: any;
    }): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            const response = await fetch(`${this.mem0BridgeUrl}/mcp/add_memory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: params.userId,
                    content: params.content,
                    category: params.category || 'general',
                    tags: params.tags || [],
                    metadata: {
                        ...params.metadata,
                        timestamp: new Date().toISOString()
                    }
                }),
                signal: AbortSignal.timeout(this.defaultTimeout)
            });

            if (!response.ok) {
                throw new Error(`Failed to add memory: ${response.status}`);
            }

            const result = await response.json();
            return { success: true, id: result.id };
        } catch (error) {
            console.error('Error adding memory:', error);
            return { success: false, error: error.toString() };
        }
    }

    /**
     * Busca memórias relevantes
     */
    async searchMemories(params: {
        query: string;
        userId?: string;
        category?: string;
        tags?: string[];
        limit?: number;
    }): Promise<{ success: boolean; memories?: any[]; error?: string }> {
        try {
            const searchParams: any = {
                query: params.query,
                limit: params.limit || 10
            };

            if (params.userId) {
                searchParams.user_id = params.userId;
            }

            if (params.category) {
                searchParams.filters = { category: params.category };
            }

            if (params.tags && params.tags.length > 0) {
                searchParams.filters = {
                    ...searchParams.filters,
                    tags: { $in: params.tags }
                };
            }

            const response = await fetch(`${this.mem0BridgeUrl}/mcp/search_memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchParams),
                signal: AbortSignal.timeout(this.defaultTimeout)
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const result = await response.json();
            return { success: true, memories: result.memories || [] };
        } catch (error) {
            console.error('Error searching memories:', error);
            return { success: false, error: error.toString() };
        }
    }

    /**
     * Obtém memórias de um agente específico
     */
    async getAgentMemories(agentId: string, limit: number = 50): Promise<any[]> {
        const result = await this.searchMemories({
            query: '*',
            userId: MemoryNamespaces.AGENT(agentId),
            limit
        });

        return result.success ? result.memories || [] : [];
    }

    /**
     * Salva contexto de conversa
     */
    async saveConversationContext(params: {
        agentId: string;
        userMessage: string;
        agentResponse: string;
        metadata?: any;
    }): Promise<boolean> {
        const content = `User: ${params.userMessage}\nAgent: ${params.agentResponse}`;
        
        const result = await this.addMemory({
            content,
            userId: MemoryNamespaces.AGENT(params.agentId),
            category: 'conversation',
            tags: ['context', 'dialogue', params.agentId],
            metadata: {
                ...params.metadata,
                type: 'conversation',
                userMessage: params.userMessage,
                agentResponse: params.agentResponse
            }
        });

        return result.success;
    }

    /**
     * Salva conhecimento técnico
     */
    async saveTechnicalKnowledge(params: {
        agentId: string;
        topic: string;
        content: string;
        category: string;
        tags?: string[];
    }): Promise<boolean> {
        const result = await this.addMemory({
            content: params.content,
            userId: MemoryNamespaces.AGENT(params.agentId),
            category: `technical-${params.category}`,
            tags: ['knowledge', params.topic, ...(params.tags || [])],
            metadata: {
                type: 'technical_knowledge',
                topic: params.topic,
                source: params.agentId
            }
        });

        return result.success;
    }

    /**
     * Busca conhecimento relacionado a um tópico
     */
    async findRelatedKnowledge(topic: string, limit: number = 5): Promise<any[]> {
        const result = await this.searchMemories({
            query: topic,
            tags: ['knowledge'],
            limit
        });

        return result.success ? result.memories || [] : [];
    }

    /**
     * Compartilha memória entre agentes
     */
    async shareMemoryBetweenAgents(params: {
        fromAgent: string;
        toAgent: string;
        memoryId: string;
        reason?: string;
    }): Promise<boolean> {
        try {
            // Buscar a memória original
            const searchResult = await this.searchMemories({
                query: params.memoryId,
                userId: MemoryNamespaces.AGENT(params.fromAgent),
                limit: 1
            });

            if (!searchResult.success || !searchResult.memories?.length) {
                console.error('Memory not found for sharing');
                return false;
            }

            const originalMemory = searchResult.memories[0];

            // Criar cópia para o agente destino
            const result = await this.addMemory({
                content: originalMemory.content,
                userId: MemoryNamespaces.AGENT(params.toAgent),
                category: originalMemory.category,
                tags: [...(originalMemory.tags || []), 'shared', params.fromAgent],
                metadata: {
                    ...originalMemory.metadata,
                    sharedFrom: params.fromAgent,
                    sharedAt: new Date().toISOString(),
                    shareReason: params.reason
                }
            });

            return result.success;
        } catch (error) {
            console.error('Error sharing memory:', error);
            return false;
        }
    }

    /**
     * Limpa memórias antigas
     */
    async cleanupOldMemories(olderThanDays: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            // Esta é uma operação simulada - em produção, seria necessário
            // implementar no backend do Mem0
            console.log(`Would clean memories older than ${cutoffDate.toISOString()}`);
            
            return 0; // Retornar número de memórias limpas
        } catch (error) {
            console.error('Error cleaning memories:', error);
            return 0;
        }
    }

    /**
     * Obtém estatísticas de uso de memória por agente
     */
    async getMemoryStats(agentId?: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
        recentActivity: number;
    }> {
        try {
            const searchParams: any = {
                query: '*',
                limit: 10000
            };

            if (agentId) {
                searchParams.user_id = MemoryNamespaces.AGENT(agentId);
            }

            const result = await this.searchMemories(searchParams);
            
            if (!result.success) {
                return { total: 0, byCategory: {}, recentActivity: 0 };
            }

            const memories = result.memories || [];
            const byCategory: Record<string, number> = {};
            const now = new Date();
            let recentActivity = 0;

            memories.forEach((mem: any) => {
                // Categorias
                const cat = mem.category || 'uncategorized';
                byCategory[cat] = (byCategory[cat] || 0) + 1;

                // Atividade recente (últimas 24h)
                const created = new Date(mem.created_at);
                if (now.getTime() - created.getTime() < 24 * 60 * 60 * 1000) {
                    recentActivity++;
                }
            });

            return {
                total: memories.length,
                byCategory,
                recentActivity
            };
        } catch (error) {
            console.error('Error getting memory stats:', error);
            return { total: 0, byCategory: {}, recentActivity: 0 };
        }
    }
}

// Singleton instance
export const mem0Service = new Mem0SpecialistService();