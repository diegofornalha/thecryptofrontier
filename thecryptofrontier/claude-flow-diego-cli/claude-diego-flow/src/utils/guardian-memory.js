/**
 * Guardian Memory Manager
 *
 * Gerencia memórias persistentes do Organization Guardian usando Mem0
 * Permite que o Guardian aprenda e lembre de decisões de organização
 */
import { execSync } from 'child_process';
import * as path from 'path';
import * as dotenv from 'dotenv';
// Carregar variáveis de ambiente do MCP
const mcpEnvPath = path.join(process.cwd().includes('claude-diego-flow') ?
    path.join(process.cwd(), '..', 'mcp-diego-tools') :
    path.join(process.cwd(), 'mcp-diego-tools'), '.env');
dotenv.config({ path: mcpEnvPath });
export class GuardianMemoryManager {
    constructor() {
        this.USER_ID = "guardian";
        // Caminho para as ferramentas MCP
        this.mcpToolsPath = path.join(process.cwd().includes('claude-diego-flow') ? process.cwd() : path.join(process.cwd(), 'claude-diego-flow'), '..', 'mcp-diego-tools');
    }
    /**
     * Adiciona uma nova memória para o Guardian
     */
    async addMemory(memory) {
        var _a;
        try {
            console.log('🧠 Guardian está memorizando:', memory.content);
            // Preparar comando para executar ferramenta MCP
            const toolData = {
                tool: 'mem0_add_memory',
                params: {
                    content: memory.content,
                    user_id: this.USER_ID,
                    metadata: memory.metadata || {},
                    tags: memory.tags || [],
                    category: memory.category
                }
            };
            // Executar ferramenta MCP
            const result = await this.executeMCPTool(toolData);
            if (result.success) {
                console.log('💾 Memória salva com sucesso:', (_a = result.data) === null || _a === void 0 ? void 0 : _a.id);
            }
            else {
                throw new Error(result.error || 'Erro ao salvar memória');
            }
        }
        catch (error) {
            console.error('❌ Erro ao salvar memória:', error);
        }
    }
    /**
     * Busca memórias relevantes
     */
    async searchMemories(query, limit = 5) {
        var _a;
        try {
            console.log('🔍 Guardian procurando memórias sobre:', query);
            const toolData = {
                tool: 'mem0_search_memory',
                params: {
                    query,
                    user_id: this.USER_ID,
                    limit
                }
            };
            const result = await this.executeMCPTool(toolData);
            if (result.success && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.results)) {
                return result.data.results;
            }
            return [];
        }
        catch (error) {
            console.error('❌ Erro ao buscar memórias:', error);
            return [];
        }
    }
    /**
     * Lista todas as memórias do Guardian
     */
    async listMemories(limit = 50) {
        var _a;
        try {
            console.log('📋 Listando memórias do Guardian');
            const toolData = {
                tool: 'mem0_list_memories',
                params: {
                    user_id: this.USER_ID,
                    limit
                }
            };
            const result = await this.executeMCPTool(toolData);
            if (result.success && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.memories)) {
                return result.data.memories;
            }
            return [];
        }
        catch (error) {
            console.error('❌ Erro ao listar memórias:', error);
            return [];
        }
    }
    /**
     * Remove uma memória específica ou todas
     */
    async deleteMemory(memoryId) {
        try {
            if (memoryId) {
                console.log('🗑️ Removendo memória:', memoryId);
            }
            else {
                console.log('🗑️ Removendo todas as memórias do Guardian');
            }
            const toolData = {
                tool: 'mem0_delete_memories',
                params: {
                    user_id: this.USER_ID,
                    memory_id: memoryId
                }
            };
            const result = await this.executeMCPTool(toolData);
            if (result.success) {
                console.log('✅ Memória(s) removida(s) com sucesso');
            }
            else {
                throw new Error(result.error || 'Erro ao deletar memória');
            }
        }
        catch (error) {
            console.error('❌ Erro ao deletar memória:', error);
        }
    }
    // Métodos auxiliares para tipos específicos de memória
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
                ...metadata
            },
            tags: ['decision', 'organization', project]
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
                date: new Date().toISOString()
            },
            tags: ['structure', 'success', projectType, `score_${score}`]
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
                date: new Date().toISOString()
            },
            tags: ['pattern', type]
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
                ...metadata
            },
            tags: ['agents', 'analysis', 'optimization']
        });
    }
    /**
     * Executa ferramenta MCP
     */
    async executeMCPTool(toolData) {
        try {
            // Verificar se MEM0_API_KEY está configurada
            if (!process.env.MEM0_API_KEY) {
                console.warn('⚠️ MEM0_API_KEY não configurada - memória persistente desabilitada');
                console.log('Para habilitar memória persistente, configure MEM0_API_KEY no arquivo .env');
                return { success: false, error: 'MEM0_API_KEY não configurada' };
            }
            // Executar ferramenta via comando
            const jsonData = JSON.stringify(toolData).replace(/'/g, "'\\'''");
            const command = `cd "${this.mcpToolsPath}" && npm run execute-tool -- '${jsonData}'`;
            const output = execSync(command, {
                encoding: 'utf8',
                env: { ...process.env }
            });
            // Parse do resultado
            try {
                const lines = output.split('\n').filter(line => line.trim());
                const jsonLine = lines.find(line => {
                    try {
                        JSON.parse(line);
                        return true;
                    }
                    catch (_a) {
                        return false;
                    }
                });
                if (jsonLine) {
                    const result = JSON.parse(jsonLine);
                    if (result.success && result.data) {
                        // Extrair dados da resposta MCP
                        return {
                            success: true,
                            data: result.data.data || result.data
                        };
                    }
                    return result;
                }
            }
            catch (parseError) {
                console.error('Erro ao parsear resposta:', output);
            }
            return { success: true, data: output };
        }
        catch (error) {
            console.error('Erro executando MCP:', error.message);
            return {
                success: false,
                error: error.message || 'Erro ao executar ferramenta MCP'
            };
        }
    }
}
