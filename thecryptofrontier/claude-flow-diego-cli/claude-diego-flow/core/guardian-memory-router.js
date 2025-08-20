"use strict";

const fs = require('fs');
const path = require('path');

/**
 * Sistema de Roteamento de Memórias do Guardian
 * 
 * Responsável por analisar o conteúdo de cada memória e decidir
 * qual agente especialista deve recebê-la
 */
class GuardianMemoryRouter {
    constructor() {
        this.routingConfig = null;
        this.loadRoutingConfig();
    }

    /**
     * Carrega as configurações de roteamento
     */
    loadRoutingConfig() {
        try {
            const configPath = path.join(__dirname, '../config/guardian-memory-routing.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            this.routingConfig = JSON.parse(configData).memoryRouting;
            console.log('✅ Configurações de roteamento carregadas com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar configurações de roteamento:', error);
            // Usa configuração padrão se o arquivo não existir
            this.routingConfig = this.getDefaultConfig();
        }
    }

    /**
     * Analisa uma memória e determina para qual agente ela deve ser roteada
     * @param {Object} memory - Objeto de memória a ser analisado
     * @returns {Object} - Decisão de roteamento
     */
    async routeMemory(memory) {
        if (!this.routingConfig || !this.routingConfig.enabled) {
            return {
                targetAgent: this.routingConfig?.defaultAgent || 'mem0-specialist',
                reason: 'Sistema de roteamento desabilitado',
                confidence: 0
            };
        }

        // Extrai o conteúdo para análise
        const content = this.extractContentForAnalysis(memory);
        
        // Analisa contra todas as regras
        const matches = this.analyzeContent(content);
        
        // Resolve conflitos e retorna a decisão
        const decision = this.resolveRouting(matches, memory);
        
        if (this.routingConfig.monitoring.logRoutingDecisions) {
            console.log(`🔀 Roteamento: ${memory.taskName || memory.id} → ${decision.targetAgent} (confiança: ${decision.confidence})`);
        }
        
        return decision;
    }

    /**
     * Extrai conteúdo relevante da memória para análise
     */
    extractContentForAnalysis(memory) {
        const parts = [];
        
        // Adiciona campos principais
        if (memory.taskName) parts.push(memory.taskName);
        if (memory.type) parts.push(memory.type);
        
        // Adiciona contexto
        if (memory.context) {
            if (memory.context.userRequest) parts.push(memory.context.userRequest);
            if (memory.context.specialists) parts.push(...memory.context.specialists);
            if (memory.context.decision) parts.push(memory.context.decision);
            if (memory.context.reason) parts.push(memory.context.reason);
        }
        
        // Adiciona metadata
        if (memory.metadata) {
            parts.push(JSON.stringify(memory.metadata));
        }
        
        return parts.join(' ').toLowerCase();
    }

    /**
     * Analisa o conteúdo contra todas as regras de roteamento
     */
    analyzeContent(content) {
        const matches = [];
        
        for (const rule of this.routingConfig.routingRules) {
            let matchCount = 0;
            const matchedPatterns = [];
            
            for (const pattern of rule.patterns) {
                const searchPattern = this.routingConfig.routingLogic.caseSensitive 
                    ? pattern 
                    : pattern.toLowerCase();
                    
                if (content.includes(searchPattern)) {
                    matchCount++;
                    matchedPatterns.push(pattern);
                }
            }
            
            // Se encontrou pelo menos um padrão, considera uma correspondência válida
            if (matchCount > 0) {
                // Calcula confiança baseada na força da correspondência
                // Quanto mais padrões encontrados, maior a confiança
                const confidence = Math.min(1, matchCount * 0.3 + 0.7);
                
                matches.push({
                    rule,
                    confidence,
                    matchCount,
                    matchedPatterns
                });
            }
        }
        
        return matches;
    }

    /**
     * Resolve conflitos quando múltiplas regras correspondem
     */
    resolveRouting(matches, memory) {
        if (matches.length === 0) {
            return {
                targetAgent: this.routingConfig.defaultAgent,
                reason: this.routingConfig.defaultReason,
                confidence: 0,
                matchedRule: null
            };
        }
        
        // Ordena por prioridade (menor número = maior prioridade)
        matches.sort((a, b) => {
            // Primeiro por prioridade
            if (a.rule.priority !== b.rule.priority) {
                return a.rule.priority - b.rule.priority;
            }
            // Depois por confiança
            return b.confidence - a.confidence;
        });
        
        const bestMatch = matches[0];
        
        return {
            targetAgent: bestMatch.rule.targetAgent,
            reason: bestMatch.rule.description,
            confidence: bestMatch.confidence,
            matchedRule: bestMatch.rule.id,
            allMatches: matches.map(m => ({
                rule: m.rule.id,
                confidence: m.confidence
            }))
        };
    }

    /**
     * Retorna a configuração padrão caso o arquivo não exista
     */
    getDefaultConfig() {
        return {
            enabled: true,
            routingRules: [],
            defaultAgent: 'mem0-specialist',
            defaultReason: 'Agente padrão para memórias gerais',
            conflictResolution: {
                strategy: 'highest-priority-wins'
            },
            routingLogic: {
                caseSensitive: false,
                matchType: 'contains',
                minimumConfidence: 0.7
            },
            monitoring: {
                logRoutingDecisions: true
            }
        };
    }

    /**
     * Atualiza uma regra de roteamento
     */
    async updateRoutingRule(ruleId, updates) {
        const ruleIndex = this.routingConfig.routingRules.findIndex(r => r.id === ruleId);
        
        if (ruleIndex === -1) {
            throw new Error(`Regra ${ruleId} não encontrada`);
        }
        
        this.routingConfig.routingRules[ruleIndex] = {
            ...this.routingConfig.routingRules[ruleIndex],
            ...updates
        };
        
        // Salva as alterações
        await this.saveRoutingConfig();
    }

    /**
     * Adiciona uma nova regra de roteamento
     */
    async addRoutingRule(rule) {
        this.routingConfig.routingRules.push({
            id: rule.id || `rule-${Date.now()}`,
            ...rule
        });
        
        await this.saveRoutingConfig();
    }

    /**
     * Salva as configurações de roteamento
     */
    async saveRoutingConfig() {
        try {
            const configPath = path.join(__dirname, '../config/guardian-memory-routing.json');
            const configData = {
                memoryRouting: {
                    ...this.routingConfig,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
            console.log('✅ Configurações de roteamento salvas');
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
        }
    }

    /**
     * Obtém estatísticas de roteamento
     */
    getRoutingStats() {
        // Implementação futura para rastrear estatísticas
        return {
            totalRules: this.routingConfig.routingRules.length,
            enabledStatus: this.routingConfig.enabled,
            defaultAgent: this.routingConfig.defaultAgent
        };
    }
}

module.exports = { GuardianMemoryRouter };