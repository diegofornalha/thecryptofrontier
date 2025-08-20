/**
 * Classe base para todos os agentes do sistema
 *
 * Esta classe abstrata define a interface e comportamento base
 * que todos os agentes devem implementar.
 */
/**
 * Classe abstrata base para todos os agentes
 */
export class Agent {
    constructor(config) {
        this.context = {};
        this.isInitialized = false;
        this.config = config;
    }
    /**
     * Retorna a configuração do agente
     */
    getConfig() {
        return this.config;
    }
    /**
     * Retorna o ID do agente
     */
    getId() {
        return this.config.id;
    }
    /**
     * Retorna o nome do agente
     */
    getName() {
        return this.config.name;
    }
    /**
     * Retorna a descrição do agente
     */
    getDescription() {
        return this.config.description;
    }
    /**
     * Retorna as capacidades do agente
     */
    getCapabilities() {
        return this.config.capabilities;
    }
    /**
     * Verifica se o agente tem uma capacidade específica
     */
    hasCapability(capability) {
        return this.config.capabilities.includes(capability);
    }
    /**
     * Atualiza o contexto do agente
     */
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    /**
     * Retorna o contexto atual do agente
     */
    getContext() {
        return this.context;
    }
    /**
     * Verifica se o agente está inicializado
     */
    getIsInitialized() {
        return this.isInitialized;
    }
    /**
     * Valida se o agente pode processar uma mensagem
     * Pode ser sobrescrito por agentes específicos
     */
    async canProcess(message) {
        if (!this.isInitialized) {
            return false;
        }
        // Implementação padrão - sempre pode processar
        // Agentes específicos podem implementar lógica customizada
        return true;
    }
    /**
     * Processa uma mensagem com validação
     */
    async process(message) {
        if (!this.isInitialized) {
            throw new Error(`Agent ${this.config.name} is not initialized`);
        }
        const canProcess = await this.canProcess(message);
        if (!canProcess) {
            throw new Error(`Agent ${this.config.name} cannot process this message`);
        }
        return await this.processMessage(message);
    }
    /**
     * Reseta o estado do agente
     * Pode ser sobrescrito por agentes específicos
     */
    async reset() {
        this.context = {};
        // Agentes específicos podem adicionar lógica adicional
    }
    /**
     * Retorna informações de status do agente
     */
    getStatus() {
        return {
            id: this.config.id,
            name: this.config.name,
            initialized: this.isInitialized,
            capabilities: this.config.capabilities,
            contextKeys: Object.keys(this.context),
            metadata: this.config.metadata
        };
    }
    /**
     * Método utilitário para logging
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.config.name}]`;
        switch (level) {
            case 'error':
                console.error(`${prefix} ❌ ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ⚠️ ${message}`);
                break;
            default:
                console.log(`${prefix} ℹ️ ${message}`);
        }
    }
}
