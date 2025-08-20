/**
 * Auto Commit Agent - Versão Modularizada
 */

import { EventEmitter } from 'events';
import { 
  AutoCommitConfig, 
  CommitResult, 
  FileChange, 
  AgentState,
  DashboardMetrics 
} from './interfaces';
import { GitService } from './services/git-service';
import { SSHService } from './services/ssh-service';
import { FileWatcherService } from './services/file-watcher-service';
import { NotificationService } from './services/notification-service';
import { DefaultCommitStrategy, CompositeStrategy, UrgentFileStrategy, SmartCommitStrategy } from './strategies/commit-strategy';
import { DashboardService } from './services/dashboard-service';
import { MCPIntegration } from './integrations/mcp-integration';
import { Mem0Integration } from './integrations/mem0-integration';
import { StrapiIntegration } from './integrations/strapi-integration';

export class AutoCommitAgent extends EventEmitter {
  private config: AutoCommitConfig;
  private git: GitService;
  private ssh: SSHService;
  private watcher: FileWatcherService;
  private notification: NotificationService;
  private dashboard?: DashboardService;
  private mcp?: MCPIntegration;
  private mem0?: Mem0Integration;
  private strapi?: StrapiIntegration;
  
  private state: AgentState;
  private startTime: Date;
  private commitCount: number = 0;
  private totalChanges: number = 0;

  constructor(config: AutoCommitConfig) {
    super();
    
    // Configuração padrão
    this.config = {
      debounceTime: 3000,
      maxAuthFailures: 3,
      keyValidationInterval: 30 * 60 * 1000, // 30 minutos
      ...config
    };

    // Inicializar serviços
    this.git = new GitService(this.config.watchPath);
    this.ssh = new SSHService();
    this.watcher = new FileWatcherService(this.config.watchPath, this.config.debounceTime);
    this.notification = new NotificationService();

    // Configurar estratégia de commit
    if (!this.config.strategy) {
      this.config.strategy = new CompositeStrategy([
        new UrgentFileStrategy(),
        new SmartCommitStrategy(),
        new DefaultCommitStrategy()
      ]);
    }

    // Inicializar integrações opcionais
    if (this.config.enableDashboard) {
      this.dashboard = new DashboardService(this);
    }

    if (this.config.enableMCP) {
      this.mcp = new MCPIntegration(this);
    }

    if (this.config.enableMem0) {
      this.mem0 = new Mem0Integration(this);
    }

    if (this.config.strapiUrl) {
      this.strapi = new StrapiIntegration(this.config.strapiUrl);
    }

    // Estado inicial
    this.state = {
      isRunning: false,
      isPaused: false,
      watchedPaths: [this.config.watchPath],
      pendingChanges: [],
      config: this.config,
      metrics: this.getMetrics()
    };

    this.startTime = new Date();
    this.setupEventHandlers();
  }

  /**
   * Inicia o agente
   */
  async start(): Promise<void> {
    console.log('🚀 Iniciando Auto Commit Agent...\n');

    try {
      // Verificar pré-requisitos
      await this.checkPrerequisites();

      // Configurar SSH se disponível
      const sshCommand = this.ssh.getGitSSHCommand();
      if (sshCommand) {
        this.git.setSSHCommand(sshCommand);
        console.log('🔑 Chave SSH configurada');
      }

      // Iniciar monitoramento
      this.watcher.start();
      this.state.isRunning = true;

      // Iniciar validação periódica de SSH
      if (this.config.keyValidationInterval) {
        this.startSSHValidation();
      }

      // Iniciar dashboard se habilitado
      if (this.dashboard) {
        await this.dashboard.start();
      }

      // Notificar início
      await this.notification.notify({
        type: 'info',
        message: 'Auto Commit Agent iniciado',
        timestamp: new Date(),
        severity: 'low'
      });

      this.emit('started');

    } catch (error) {
      console.error('❌ Erro ao iniciar:', error);
      throw error;
    }
  }

  /**
   * Para o agente
   */
  async stop(): Promise<void> {
    console.log('\n🛑 Parando Auto Commit Agent...');

    this.watcher.stop();
    this.state.isRunning = false;

    if (this.dashboard) {
      await this.dashboard.stop();
    }

    await this.notification.notify({
      type: 'info',
      message: 'Auto Commit Agent parado',
      timestamp: new Date(),
      severity: 'low'
    });

    this.emit('stopped');
  }

  /**
   * Pausa temporariamente
   */
  pause(): void {
    this.watcher.pause();
    this.state.isPaused = true;
    this.emit('paused');
  }

  /**
   * Resume após pausa
   */
  resume(): void {
    this.watcher.resume();
    this.state.isPaused = false;
    this.emit('resumed');
  }

  /**
   * Armazena chave SSH
   */
  async storeSSHKey(keyContent: string): Promise<boolean> {
    const success = await this.ssh.storeKey(keyContent);
    
    if (success) {
      const sshCommand = this.ssh.getGitSSHCommand();
      if (sshCommand) {
        this.git.setSSHCommand(sshCommand);
      }

      await this.notification.notify({
        type: 'info',
        message: 'Chave SSH configurada com sucesso',
        timestamp: new Date(),
        severity: 'low'
      });
    }

    return success;
  }

  /**
   * Remove chave SSH
   */
  removeSSHKey(): boolean {
    const success = this.ssh.removeKey();
    
    if (success) {
      this.git.setSSHCommand('');
    }

    return success;
  }

  /**
   * Obtém estado atual
   */
  getState(): AgentState {
    return {
      ...this.state,
      metrics: this.getMetrics()
    };
  }

  /**
   * Obtém métricas
   */
  getMetrics(): DashboardMetrics {
    const sshInfo = this.ssh.getKeyInfo();
    const watcherStats = this.watcher.getStats();

    return {
      totalCommits: this.commitCount,
      totalChanges: this.totalChanges,
      uptime: Date.now() - this.startTime.getTime(),
      sshKeyStatus: sshInfo || {
        path: '',
        createdAt: new Date(),
        isValid: false,
        failureCount: 0
      },
      activeWatchers: watcherStats.watchedPaths,
      queuedChanges: watcherStats.pendingChanges
    };
  }

  /**
   * Força commit manual
   */
  async forceCommit(message?: string): Promise<CommitResult> {
    const changes = this.watcher.getPendingChanges();
    
    if (changes.length === 0) {
      return {
        success: false,
        message: 'Nenhuma mudança para commitar',
        changes: 0,
        timestamp: new Date()
      };
    }

    return await this.processCommit(changes, message);
  }

  /**
   * Configura handlers de eventos
   */
  private setupEventHandlers(): void {
    // Eventos do watcher
    this.watcher.on('changes-detected', async (changes: FileChange[]) => {
      await this.handleChanges(changes);
    });

    this.watcher.on('error', (error: Error) => {
      console.error('❌ Erro no watcher:', error);
      this.emit('error', error);
    });

    // Eventos internos
    this.on('commit-success', async (result: CommitResult) => {
      // Registrar no Strapi se configurado
      if (this.strapi && result.hash) {
        await this.strapi.recordCommit({
          hash: result.hash,
          message: result.message,
          changes: this.watcher.getPendingChanges(),
          timestamp: result.timestamp,
          author: 'auto-commit-agent',
          branch: await this.git.getCurrentBranch(),
          repository: (await this.git.getRepositoryInfo()).name
        });
      }

      // Notificar Mem0
      if (this.mem0) {
        await this.mem0.recordEvent({
          type: 'commit',
          data: result
        });
      }
    });
  }

  /**
   * Verifica pré-requisitos
   */
  private async checkPrerequisites(): Promise<void> {
    // Verificar se é repositório Git
    if (!await this.git.isGitRepository()) {
      throw new Error('Diretório não é um repositório Git');
    }

    // Verificar se tem remote
    if (!await this.git.hasRemotes()) {
      console.warn('⚠️  Nenhum remote configurado');
      console.log('💡 Configure com: git remote add origin <url>');
    }

    // Verificar credenciais Git
    try {
      await this.git.getRepositoryInfo();
    } catch {
      console.warn('⚠️  Configure suas credenciais Git:');
      console.log('git config user.name "Seu Nome"');
      console.log('git config user.email "seu@email.com"');
    }
  }

  /**
   * Processa mudanças detectadas
   */
  private async handleChanges(changes: FileChange[]): Promise<void> {
    this.state.pendingChanges = changes;
    this.totalChanges += changes.length;

    // Verificar se deve fazer commit
    if (this.config.strategy!.shouldCommit(changes)) {
      await this.processCommit(changes);
    }
  }

  /**
   * Processa commit
   */
  private async processCommit(changes: FileChange[], customMessage?: string): Promise<CommitResult> {
    console.log(`\n📝 Processando ${changes.length} mudanças...`);

    try {
      // Verificar status
      const status = await this.git.getStatus();
      if (!status) {
        return {
          success: false,
          message: 'Nada para commitar',
          changes: 0,
          timestamp: new Date()
        };
      }

      // Gerar mensagem
      const message = customMessage || this.config.strategy!.generateMessage(changes);
      console.log(`💬 Mensagem: ${message}`);

      // Adicionar arquivos
      await this.git.addFiles();

      // Fazer commit
      const hash = await this.git.commit(message);
      console.log(`✅ Commit realizado: ${hash}`);

      // Tentar push
      try {
        await this.git.push();
        console.log(`✅ Push realizado com sucesso!`);
        this.ssh.markAuthSuccess();
      } catch (pushError: any) {
        await this.handlePushError(pushError);
      }

      // Limpar mudanças pendentes
      this.watcher.clearPendingChanges();
      this.state.pendingChanges = [];
      this.commitCount++;

      const result: CommitResult = {
        success: true,
        message,
        hash,
        changes: changes.length,
        timestamp: new Date()
      };

      this.emit('commit-success', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erro no commit:', error.message);
      
      const result: CommitResult = {
        success: false,
        message: error.message,
        changes: 0,
        timestamp: new Date(),
        error: error.message
      };

      this.emit('commit-error', result);
      return result;
    }
  }

  /**
   * Trata erro de push
   */
  private async handlePushError(error: any): Promise<void> {
    const message = error.message || error.toString();

    if (message.includes('no upstream branch')) {
      console.log('⚠️  Configurando upstream...');
      try {
        await this.git.push(true);
        console.log('✅ Push com upstream configurado!');
        return;
      } catch (upstreamError) {
        console.error('❌ Erro ao configurar upstream:', upstreamError);
      }
    }

    if (this.isAuthError(message)) {
      this.ssh.markAuthFailure();
      await this.notification.notify({
        type: 'ssh-failure',
        message: 'Falha de autenticação SSH',
        timestamp: new Date(),
        severity: 'high'
      });
    }

    console.warn('⚠️  Push falhou:', message);
  }

  /**
   * Verifica se é erro de autenticação
   */
  private isAuthError(message: string): boolean {
    const authPatterns = [
      'Permission denied',
      'Could not read from remote repository',
      'Authentication failed',
      'Invalid key'
    ];

    return authPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Inicia validação periódica de SSH
   */
  private startSSHValidation(): void {
    setInterval(async () => {
      if (this.ssh.getKeyInfo()?.isValid) {
        const isValid = await this.git.testRemoteConnection();
        
        if (isValid) {
          this.ssh.markAuthSuccess();
        } else {
          this.ssh.markAuthFailure();
        }
      }
    }, this.config.keyValidationInterval!);
  }
}

/**
 * Factory function
 */
export function createAutoCommitAgent(config: AutoCommitConfig): AutoCommitAgent {
  return new AutoCommitAgent(config);
}