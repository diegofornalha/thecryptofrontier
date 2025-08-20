/**
 * Guardian Memory Manager OSS
 *
 * Nova versão que usa Chroma DB local via bridge
 * Mantém compatibilidade com GuardianMemoryManager original
 */
import axios from 'axios';
export class GuardianMemoryManagerOSS {
    constructor(bridgeUrl = 'http://localhost:3002') {
        this.USER_ID = "guardian";
        this.bridgeUrl = bridgeUrl;
    }
    /**
     * Adiciona uma nova memória para o Guardian
     */
    async addMemory(memory) {
        var _a;
        try {
            console.log('🧠 Guardian OSS está memorizando:', memory.content);
            const response = await axios.post(`${this.bridgeUrl}/mcp/add_memory`, {
                content: memory.content,
                user_id: this.USER_ID,
                metadata: memory.metadata || {},
                tags: memory.tags || [],
                category: memory.category
            });
            if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.id) {
                console.log('💾 Memória OSS salva com sucesso:', response.data.id);
            }
        }
        catch (error) {
            console.error('❌ Erro ao salvar memória OSS:', error.message);
            // Fallback para versão antiga se bridge não disponível
            if (error.code === 'ECONNREFUSED') {
                console.warn('⚠️ Bridge OSS indisponível, usando fallback...');
                // Aqui poderia chamar a versão original como fallback
            }
        }
    }
    /**
     * Busca memórias relevantes
     */
    async searchMemories(query, limit = 5) {
        var _a;
        try {
            console.log('🔍 Guardian OSS procurando memórias sobre:', query);
            const response = await axios.post(`${this.bridgeUrl}/mcp/search_memory`, {
                query,
                user_id: this.USER_ID,
                limit
            });
            return ((_a = response.data) === null || _a === void 0 ? void 0 : _a.results) || [];
        }
        catch (error) {
            console.error('❌ Erro ao buscar memórias OSS:', error.message);
            return [];
        }
    }
    /**
     * Lista todas as memórias do Guardian
     */
    async listMemories(limit = 50) {
        var _a;
        try {
            console.log('📋 Listando memórias do Guardian OSS');
            const response = await axios.get(`${this.bridgeUrl}/mcp/list_memories/${this.USER_ID}`, {
                params: { limit }
            });
            return ((_a = response.data) === null || _a === void 0 ? void 0 : _a.memories) || [];
        }
        catch (error) {
            console.error('❌ Erro ao listar memórias OSS:', error.message);
            return [];
        }
    }
    /**
     * Remove uma memória específica ou todas
     */
    async deleteMemory(memoryId) {
        try {
            if (memoryId) {
                console.log('🗑️ Removendo memória OSS:', memoryId);
            }
            else {
                console.log('🗑️ Removendo todas as memórias do Guardian OSS');
            }
            await axios.delete(`${this.bridgeUrl}/mcp/delete_memories`, {
                data: {
                    user_id: this.USER_ID,
                    memory_id: memoryId
                }
            });
            console.log('✅ Memória(s) OSS removida(s) com sucesso');
        }
        catch (error) {
            console.error('❌ Erro ao deletar memória OSS:', error.message);
        }
    }
    // Métodos auxiliares para tipos específicos de memória (idênticos ao original)
    /**
     * Memoriza uma decisão de organização
     */
    async rememberOrganizationDecision(project, action, description, metadata) {
        await this.addMemory({
            content: `[${project}] ${action}: ${description}`,
            category: 'organization_decision',
            metadata: {
                project,
                action,
                date: new Date().toISOString(),
                source: 'guardian_oss',
                ...metadata
            },
            tags: ['decision', 'organization', project, 'oss']
        });
    }
    /**
     * Memoriza uma estrutura bem-sucedida
     */
    async rememberSuccessfulStructure(projectType, score, structure) {
        await this.addMemory({
            content: `Estrutura ${projectType} alcançou ${score}% de organização: ${structure}`,
            category: 'successful_structure',
            metadata: {
                project_type: projectType,
                score,
                date: new Date().toISOString(),
                source: 'guardian_oss'
            },
            tags: ['structure', 'success', projectType, `score_${score}`, 'oss']
        });
    }
    /**
     * Memoriza um padrão aprendido
     */
    async rememberLearnedPattern(pattern, context, type) {
        await this.addMemory({
            content: `Padrão aprendido: ${pattern}. Contexto: ${context}`,
            category: 'learned_pattern',
            metadata: {
                pattern_type: type,
                date: new Date().toISOString(),
                source: 'guardian_oss'
            },
            tags: ['pattern', type, 'oss']
        });
    }
    /**
     * Busca decisões anteriores similares
     */
    async findSimilarDecisions(project, issueType) {
        const query = `${project} ${issueType} organização decisão`;
        return await this.searchMemories(query, 3);
    }
    /**
     * Busca estruturas bem-sucedidas para um tipo de projeto
     */
    async findSuccessfulStructures(projectType) {
        const query = `estrutura ${projectType} score 100 organização`;
        return await this.searchMemories(query, 5);
    }
    /**
     * Memoriza análise de agentes
     */
    async rememberAgentAnalysis(analysis, metadata) {
        await this.addMemory({
            content: `Análise de agentes: ${analysis}`,
            category: 'agent_analysis',
            metadata: {
                date: new Date().toISOString(),
                source: 'guardian_oss',
                ...metadata
            },
            tags: ['agents', 'analysis', 'optimization', 'oss']
        });
    }
    /**
     * Funcionalidades NOVAS do OSS - não disponíveis na versão original
     */
    /**
     * Adiciona uma conversa completa (novo recurso OSS)
     */
    async addConversation(messages, metadata) {
        var _a;
        try {
            console.log('💬 Guardian OSS memorizando conversa com', messages.length, 'mensagens');
            const response = await axios.post(`${this.bridgeUrl}/oss/add_conversation`, {
                messages,
                user_id: this.USER_ID,
                metadata: {
                    date: new Date().toISOString(),
                    source: 'guardian_oss',
                    ...metadata
                }
            });
            if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.id) {
                console.log('💾 Conversa OSS salva com sucesso:', response.data.id);
            }
        }
        catch (error) {
            console.error('❌ Erro ao salvar conversa OSS:', error.message);
        }
    }
    /**
     * Memoriza interação entre agentes
     */
    async recordAgentInteraction(agentName, taskId, interactionType, content, metadata) {
        try {
            console.log(`🤖 Registrando interação ${interactionType} do agente ${agentName}`);
            await axios.post(`${this.bridgeUrl}/oss/agent_interaction`, {
                agent_name: agentName,
                task_id: taskId,
                interaction_type: interactionType,
                content,
                metadata: {
                    date: new Date().toISOString(),
                    source: 'guardian_oss',
                    ...metadata
                }
            });
            console.log(`✅ Interação ${interactionType} registrada para ${agentName}`);
        }
        catch (error) {
            console.error('❌ Erro ao registrar interação OSS:', error.message);
        }
    }
    /**
     * Verifica status do bridge OSS
     */
    async checkBridgeHealth() {
        try {
            const response = await axios.get(`${this.bridgeUrl}/health`);
            return {
                healthy: response.data.status === 'healthy',
                details: response.data
            };
        }
        catch (error) {
            return {
                healthy: false,
                details: { error: error instanceof Error ? error.message : String(error) }
            };
        }
    }
    /**
     * Obtém estatísticas do sistema de memória
     */
    async getMemoryStats() {
        try {
            const response = await axios.get(`${this.bridgeUrl}/stats`);
            return response.data;
        }
        catch (error) {
            console.error('❌ Erro ao obter estatísticas OSS:', error.message);
            return null;
        }
    }
}
