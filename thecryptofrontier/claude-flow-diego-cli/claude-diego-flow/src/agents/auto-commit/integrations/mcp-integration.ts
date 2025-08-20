/**
 * Integração com MCP para comunicação entre agentes
 */

import { EventEmitter } from 'events';
import { MCPMessage, CommitResult, AgentState, NotificationEvent } from '../interfaces';

export class MCPIntegration extends EventEmitter {
  private agent: any;
  private mcpClient: any; // Seria o cliente MCP real
  private agentId = 'auto-commit-agent';
  private subscriptions: Map<string, (message: MCPMessage) => void> = new Map();

  constructor(agent: any) {
    super();
    this.agent = agent;
    this.setupEventHandlers();
    this.connectToMCP();
  }

  /**
   * Conecta ao servidor MCP
   */
  private async connectToMCP(): Promise<void> {
    try {
      // Em produção, isso seria a conexão real com MCP
      console.log('🔗 Conectando ao MCP Server...');
      
      // Simular conexão
      setTimeout(() => {
        console.log('✅ Conectado ao MCP Server');
        this.emit('connected');
        this.registerAgent();
      }, 1000);
    } catch (error) {
      console.error('❌ Erro ao conectar com MCP:', error);
      this.emit('error', error);
    }
  }

  /**
   * Registra o agente no MCP
   */
  private async registerAgent(): Promise<void> {
    const registration = {
      agentId: this.agentId,
      type: 'auto-commit',
      capabilities: [
        'git-management',
        'file-monitoring',
        'commit-automation',
        'ssh-key-management'
      ],
      status: 'online',
      metadata: {
        version: '1.0.0',
        watchPath: this.agent.config.watchPath
      }
    };

    await this.sendMessage({
      from: this.agentId,
      to: 'mcp-server',
      action: 'register',
      payload: registration,
      timestamp: new Date()
    });
  }

  /**
   * Configura handlers de eventos do agente
   */
  private setupEventHandlers(): void {
    // Broadcast de commits
    this.agent.on('commit-success', async (result: CommitResult) => {
      await this.broadcastCommit(result);
    });

    // Broadcast de estado
    this.agent.on('state-change', async (state: AgentState) => {
      await this.broadcastState(state);
    });

    // Broadcast de notificações importantes
    this.agent.on('notification', async (event: NotificationEvent) => {
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.broadcastNotification(event);
      }
    });
  }

  /**
   * Envia mensagem via MCP
   */
  async sendMessage(message: MCPMessage): Promise<void> {
    try {
      // Em produção, isso enviaria via MCP real
      console.log(`📤 MCP: ${message.from} -> ${message.to}: ${message.action}`);
      
      // Simular envio
      this.emit('message-sent', message);
      
      // Se for broadcast, enviar para todos os inscritos
      if (message.to === 'broadcast') {
        this.handleBroadcast(message);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem MCP:', error);
      this.emit('error', error);
    }
  }

  /**
   * Recebe mensagem via MCP
   */
  async receiveMessage(message: MCPMessage): Promise<void> {
    console.log(`📥 MCP: Mensagem recebida de ${message.from}`);
    
    // Processar ações específicas
    switch (message.action) {
      case 'request-status':
        await this.handleStatusRequest(message);
        break;
        
      case 'force-commit':
        await this.handleForceCommit(message);
        break;
        
      case 'pause':
        this.agent.pause();
        await this.sendResponse(message, { success: true });
        break;
        
      case 'resume':
        this.agent.resume();
        await this.sendResponse(message, { success: true });
        break;
        
      case 'get-metrics':
        await this.handleMetricsRequest(message);
        break;
        
      case 'configure-ssh':
        await this.handleSSHConfiguration(message);
        break;
        
      default:
        console.log(`Ação não reconhecida: ${message.action}`);
    }
    
    this.emit('message-received', message);
  }

  /**
   * Broadcast de commit realizado
   */
  private async broadcastCommit(result: CommitResult): Promise<void> {
    await this.sendMessage({
      from: this.agentId,
      to: 'broadcast',
      action: 'commit-completed',
      payload: {
        ...result,
        repository: await this.getRepositoryInfo()
      },
      timestamp: new Date()
    });
  }

  /**
   * Broadcast de mudança de estado
   */
  private async broadcastState(state: AgentState): Promise<void> {
    await this.sendMessage({
      from: this.agentId,
      to: 'broadcast',
      action: 'state-changed',
      payload: state,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast de notificação
   */
  private async broadcastNotification(event: NotificationEvent): Promise<void> {
    await this.sendMessage({
      from: this.agentId,
      to: 'broadcast',
      action: 'notification',
      payload: event,
      timestamp: new Date()
    });
  }

  /**
   * Trata requisição de status
   */
  private async handleStatusRequest(message: MCPMessage): Promise<void> {
    const state = this.agent.getState();
    
    await this.sendResponse(message, {
      status: 'online',
      state,
      uptime: Date.now() - this.agent.startTime
    });
  }

  /**
   * Trata requisição de commit forçado
   */
  private async handleForceCommit(message: MCPMessage): Promise<void> {
    try {
      const result = await this.agent.forceCommit(message.payload?.message);
      await this.sendResponse(message, { success: true, result });
    } catch (error: any) {
      await this.sendResponse(message, { 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Trata requisição de métricas
   */
  private async handleMetricsRequest(message: MCPMessage): Promise<void> {
    const metrics = this.agent.getMetrics();
    await this.sendResponse(message, metrics);
  }

  /**
   * Trata configuração de SSH
   */
  private async handleSSHConfiguration(message: MCPMessage): Promise<void> {
    try {
      const { sshKey } = message.payload;
      const success = await this.agent.storeSSHKey(sshKey);
      
      await this.sendResponse(message, { success });
    } catch (error: any) {
      await this.sendResponse(message, { 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Envia resposta para uma mensagem
   */
  private async sendResponse(originalMessage: MCPMessage, payload: any): Promise<void> {
    await this.sendMessage({
      from: this.agentId,
      to: originalMessage.from,
      action: `${originalMessage.action}-response`,
      payload,
      timestamp: new Date()
    });
  }

  /**
   * Trata mensagens broadcast
   */
  private handleBroadcast(message: MCPMessage): void {
    this.subscriptions.forEach(handler => {
      handler(message);
    });
  }

  /**
   * Inscreve-se para receber mensagens
   */
  subscribe(id: string, handler: (message: MCPMessage) => void): void {
    this.subscriptions.set(id, handler);
  }

  /**
   * Remove inscrição
   */
  unsubscribe(id: string): void {
    this.subscriptions.delete(id);
  }

  /**
   * Solicita ajuda de outro agente
   */
  async requestAgentHelp(agentType: string, action: string, payload: any): Promise<any> {
    const requestId = `${Date.now()}-${Math.random()}`;
    
    return new Promise((resolve, reject) => {
      // Timeout de 30 segundos
      const timeout = setTimeout(() => {
        this.unsubscribe(requestId);
        reject(new Error('Timeout na requisição ao agente'));
      }, 30000);
      
      // Inscrever-se para a resposta
      this.subscribe(requestId, (message) => {
        if (message.action === `${action}-response`) {
          clearTimeout(timeout);
          this.unsubscribe(requestId);
          
          if (message.payload.success) {
            resolve(message.payload);
          } else {
            reject(new Error(message.payload.error));
          }
        }
      });
      
      // Enviar requisição
      this.sendMessage({
        from: this.agentId,
        to: agentType,
        action,
        payload: {
          ...payload,
          requestId
        },
        timestamp: new Date()
      });
    });
  }

  /**
   * Obtém informações do repositório
   */
  private async getRepositoryInfo(): Promise<any> {
    // Usar o git service do agente
    return {
      path: this.agent.config.watchPath,
      // Outras informações viriam do git service
    };
  }

  /**
   * Desconecta do MCP
   */
  async disconnect(): Promise<void> {
    await this.sendMessage({
      from: this.agentId,
      to: 'mcp-server',
      action: 'unregister',
      payload: { agentId: this.agentId },
      timestamp: new Date()
    });
    
    this.subscriptions.clear();
    this.emit('disconnected');
  }
}