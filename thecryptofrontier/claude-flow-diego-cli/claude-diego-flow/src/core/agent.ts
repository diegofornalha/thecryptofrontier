/**
 * Classe base para todos os agentes do sistema
 * 
 * Esta classe abstrata define a interface e comportamento base
 * que todos os agentes devem implementar.
 */

import { Message, AgentContext, AgentCapability, AgentMetadata } from '../types';

/**
 * Configuração base de um agente
 */
export interface AgentConfig {
  /** Identificador único do agente */
  id: string;
  
  /** Nome amigável do agente */
  name: string;
  
  /** Descrição detalhada do agente e suas responsabilidades */
  description: string;
  
  /** Lista de capacidades do agente */
  capabilities: string[];
  
  /** Metadados adicionais do agente */
  metadata?: AgentMetadata;
}

/**
 * Classe abstrata base para todos os agentes
 */
export abstract class Agent {
  protected config: AgentConfig;
  protected context: AgentContext = {};
  protected isInitialized: boolean = false;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Retorna a configuração do agente
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Retorna o ID do agente
   */
  getId(): string {
    return this.config.id;
  }

  /**
   * Retorna o nome do agente
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Retorna a descrição do agente
   */
  getDescription(): string {
    return this.config.description;
  }

  /**
   * Retorna as capacidades do agente
   */
  getCapabilities(): string[] {
    return this.config.capabilities;
  }

  /**
   * Verifica se o agente tem uma capacidade específica
   */
  hasCapability(capability: string): boolean {
    return this.config.capabilities.includes(capability);
  }

  /**
   * Atualiza o contexto do agente
   */
  setContext(context: AgentContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Retorna o contexto atual do agente
   */
  getContext(): AgentContext {
    return this.context;
  }

  /**
   * Verifica se o agente está inicializado
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Inicializa o agente
   * Deve ser implementado por cada agente específico
   */
  abstract initialize(): Promise<void>;

  /**
   * Processa uma mensagem e retorna uma resposta
   * Deve ser implementado por cada agente específico
   */
  abstract processMessage(message: Message): Promise<Message>;

  /**
   * Desliga o agente e libera recursos
   * Deve ser implementado por cada agente específico
   */
  abstract shutdown(): Promise<void>;

  /**
   * Valida se o agente pode processar uma mensagem
   * Pode ser sobrescrito por agentes específicos
   */
  async canProcess(message: Message): Promise<boolean> {
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
  async process(message: Message): Promise<Message> {
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
  async reset(): Promise<void> {
    this.context = {};
    // Agentes específicos podem adicionar lógica adicional
  }

  /**
   * Retorna informações de status do agente
   */
  getStatus(): Record<string, any> {
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
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
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