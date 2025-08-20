/**
 * Agente de Auto-Commit + Push
 * Monitora mudanças no diretório e faz commits + push automáticos
 */

import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import { secureGitManager } from './auto-commit/secure-git-manager';
import { mem0RealClient } from './auto-commit/mem0-real-client';
import { MemoryClient } from 'mem0ai';

const execAsync = promisify(exec);

/**
 * Agente de Auto-Commit com Push Automático
 */
export class AutoCommitAgent {
  private watcher?: chokidar.FSWatcher;
  private debounceTimer?: NodeJS.Timeout;
  private pendingChanges: Set<string> = new Set();
  private watchPath: string;
  private sshKeyPath?: string;
  private gitSSHCommand?: string;
  private static sharedCredentialsPath = path.join(process.cwd(), '.diego-tools', 'credentials');
  private authFailureCount: number = 0;
  private lastAuthCheck: Date = new Date();
  private maxAuthFailures: number = 3;
  private keyValidationInterval?: NodeJS.Timer;
  private mem0Client?: MemoryClient;
  private userId: string = 'auto-commit-agent';
  
  constructor(watchPath: string = process.cwd()) {
    this.watchPath = watchPath;
    this.ensureCredentialsDirectory();
    this.loadStoredSSHKey();
    this.initializeMem0();
    this.initialize();
    this.startKeyValidation();
  }

  /**
   * Garante que o diretório de credenciais existe
   */
  private ensureCredentialsDirectory() {
    const credDir = path.dirname(AutoCommitAgent.sharedCredentialsPath);
    if (!fs.existsSync(credDir)) {
      fs.mkdirSync(credDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Carrega chave SSH armazenada se existir
   */
  private loadStoredSSHKey() {
    const sshKeyFile = path.join(path.dirname(AutoCommitAgent.sharedCredentialsPath), 'ssh-key');
    if (fs.existsSync(sshKeyFile)) {
      this.sshKeyPath = sshKeyFile;
      this.gitSSHCommand = `ssh -i ${this.sshKeyPath} -o StrictHostKeyChecking=no`;
      console.log('🔑 Chave SSH carregada do armazenamento compartilhado');
    }
  }

  /**
   * Armazena chave SSH de forma segura
   */
  public async storeSSHKey(sshKeyContent: string): Promise<boolean> {
    try {
      // Validar formato básico da chave
      if (!sshKeyContent.includes('BEGIN') || !sshKeyContent.includes('END')) {
        console.error('❌ Formato de chave SSH inválido');
        return false;
      }

      // Caminho para armazenar a chave
      const sshKeyFile = path.join(path.dirname(AutoCommitAgent.sharedCredentialsPath), 'ssh-key');
      
      // Escrever chave com permissões restritas
      fs.writeFileSync(sshKeyFile, sshKeyContent, { mode: 0o600 });
      
      // Atualizar configuração interna
      this.sshKeyPath = sshKeyFile;
      this.gitSSHCommand = `ssh -i ${this.sshKeyPath} -o StrictHostKeyChecking=no`;
      
      // Salvar metadata para compartilhamento com MCP
      const metadata = {
        type: 'ssh-key',
        path: sshKeyFile,
        createdAt: new Date().toISOString(),
        agent: 'auto-commit-agent'
      };
      
      fs.writeFileSync(
        AutoCommitAgent.sharedCredentialsPath, 
        JSON.stringify(metadata, null, 2)
      );
      
      // Armazenar no Mem0
      if (this.mem0Client) {
        try {
          await this.mem0Client.add(
            [{"role": "system", "content": `New SSH key stored at ${metadata.createdAt}. Agent: ${metadata.agent}`}],
            { user_id: this.userId, metadata: { type: 'ssh_key_storage', ...metadata } }
          );
        } catch (error) {
          console.log('⚠️ Não foi possível armazenar no Mem0:', error);
        }
      }
      
      console.log('✅ Chave SSH armazenada com sucesso!');
      console.log('📁 Localização:', sshKeyFile);
      console.log('🔗 Compartilhada com MCP DiegoTools');
      
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao armazenar chave SSH:', error.message);
      return false;
    }
  }

  /**
   * Remove chave SSH armazenada
   */
  public removeSSHKey(): boolean {
    try {
      const sshKeyFile = path.join(path.dirname(AutoCommitAgent.sharedCredentialsPath), 'ssh-key');
      
      if (fs.existsSync(sshKeyFile)) {
        fs.unlinkSync(sshKeyFile);
      }
      
      if (fs.existsSync(AutoCommitAgent.sharedCredentialsPath)) {
        fs.unlinkSync(AutoCommitAgent.sharedCredentialsPath);
      }
      
      this.sshKeyPath = undefined;
      this.gitSSHCommand = undefined;
      
      console.log('✅ Chave SSH removida');
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao remover chave SSH:', error.message);
      return false;
    }
  }

  private async initialize() {
    // Verificar se está em um repositório git
    try {
      await execAsync('git rev-parse --git-dir');
    } catch {
      console.error('❌ Erro: Este diretório não é um repositório git!');
      console.log('💡 Execute "git init" primeiro');
      return;
    }

    // Verificar se tem remote configurado
    try {
      const { stdout: remotes } = await execAsync('git remote');
      if (!remotes.trim()) {
        console.warn('⚠️  Aviso: Nenhum remote configurado');
        console.log('💡 Configure com: git remote add origin <url>');
      }
    } catch (error) {
      console.warn('⚠️  Não foi possível verificar remotes');
    }

    this.setupWatcher();
  }

  /**
   * Configura o observador de arquivos
   */
  private setupWatcher() {
    // Ignora diretórios comuns que não devem ser monitorados
    const ignored = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.log',
      '**/.DS_Store'
    ];

    this.watcher = chokidar.watch(this.watchPath, {
      ignored,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });

    // Eventos de mudança
    this.watcher
      .on('add', (path) => this.handleFileChange('added', path))
      .on('change', (path) => this.handleFileChange('modified', path))
      .on('unlink', (path) => this.handleFileChange('deleted', path));

    console.log(`🔍 Monitorando mudanças em: ${this.watchPath}`);
    console.log(`🤖 Auto-commit + push ATIVADO!`);
    console.log(`⏱️  Commits automáticos após 3 segundos de inatividade`);
    console.log(`⏹️  Pressione Ctrl+C para parar\n`);
  }

  /**
   * Lida com mudanças de arquivos
   */
  private handleFileChange(action: string, filePath: string) {
    this.pendingChanges.add(`${action}: ${filePath}`);
    
    // Debounce para agrupar mudanças próximas
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processChanges();
    }, 3000); // Aguarda 3 segundos de inatividade
  }

  /**
   * Processa as mudanças acumuladas
   */
  private async processChanges() {
    if (this.pendingChanges.size === 0) return;

    console.log(`\n📝 Processando ${this.pendingChanges.size} mudanças...`);
    
    try {
      // 1. Verificar status do git
      const { stdout: status } = await execAsync('git status --porcelain');
      if (!status.trim()) {
        console.log('✅ Nada para commitar');
        this.pendingChanges.clear();
        return;
      }

      // 2. Gerar mensagem de commit
      const changes = Array.from(this.pendingChanges);
      const message = await this.generateCommitMessage(changes);
      
      console.log(`💬 Mensagem: ${message}`);
      console.log(`📋 Mudanças:`);
      changes.forEach(change => console.log(`  - ${change}`));

      // 3. Git add
      console.log(`\n🔄 Executando git add...`);
      await execAsync('git add .');

      // 4. Git commit com segurança
      console.log(`📝 Fazendo commit seguro...`);
      const commitResult = await secureGitManager.secureCommit(message, {
        userId: 'auto-commit-agent',
        skipHooks: false
      });
      
      if (!commitResult.success) {
        console.error(`❌ ${commitResult.message}`);
        this.pendingChanges.clear();
        return;
      }
      
      console.log(`✅ ${commitResult.message}`);

      // 5. Git push
      console.log(`🚀 Fazendo push...`);
      try {
        // Usar SSH command personalizado se disponível
        const pushCommand = this.gitSSHCommand 
          ? `GIT_SSH_COMMAND="${this.gitSSHCommand}" git push`
          : 'git push';
          
        await execAsync(pushCommand);
        console.log(`✅ Push realizado com sucesso!`);
      } catch (pushError: any) {
        if (pushError.message.includes('no upstream branch')) {
          console.log(`⚠️  Criando branch upstream...`);
          const { stdout: branch } = await execAsync('git branch --show-current');
          
          const pushUpstreamCommand = this.gitSSHCommand
            ? `GIT_SSH_COMMAND="${this.gitSSHCommand}" git push -u origin ${branch.trim()}`
            : `git push -u origin ${branch.trim()}`;
            
          await execAsync(pushUpstreamCommand);
          console.log(`✅ Push realizado com upstream!`);
        } else {
          // Detectar falha de autenticação
          if (this.isAuthenticationError(pushError.message)) {
            await this.handleAuthenticationFailure();
          } else {
            console.warn(`⚠️  Push falhou:`, pushError.message);
            if (this.sshKeyPath) {
              console.log(`💡 Verifique se a chave SSH está configurada corretamente`);
            }
          }
        }
      }

      this.pendingChanges.clear();
      console.log(`\n✨ Auto-commit + push concluído!\n`);

    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      this.pendingChanges.clear();
    }
  }

  /**
   * Gera mensagem de commit inteligente baseada nas mudanças
   */
  private async generateCommitMessage(changes: string[]): Promise<string> {
    const fileTypes = new Set<string>();
    const actions = new Set<string>();
    const files: string[] = [];
    
    changes.forEach(change => {
      const [action, filePath] = change.split(': ');
      actions.add(action);
      files.push(filePath);
      
      const ext = path.extname(filePath);
      if (ext) fileTypes.add(ext);
    });

    // Usar Mem0 real para gerar mensagem
    try {
      const mem0Message = await mem0RealClient.generateSecureCommitMessage({
        files,
        actions: Array.from(actions)
      });
      
      if (mem0Message) {
        console.log('💭 Usando instruções do Diego via Mem0 Real');
        return mem0Message;
      }
    } catch (error) {
      // Se Mem0 não estiver disponível, continuar com lógica padrão
      console.log('⚠️ Mem0 Real não disponível, usando lógica padrão');
    }

    // Lógica padrão (fallback)
    let actionVerb = 'Update';
    if (actions.has('added') && !actions.has('modified')) {
      actionVerb = 'Add';
    } else if (actions.has('deleted') && actions.size === 1) {
      actionVerb = 'Remove';
    } else if (actions.has('modified') && actions.size === 1) {
      actionVerb = 'Update';
    } else {
      actionVerb = 'Refactor';
    }

    let scope = 'files';
    if (fileTypes.has('.ts') || fileTypes.has('.js')) {
      scope = 'code';
    } else if (fileTypes.has('.md')) {
      scope = 'docs';
    } else if (fileTypes.has('.json')) {
      scope = 'config';
    } else if (fileTypes.has('.css') || fileTypes.has('.scss')) {
      scope = 'styles';
    }

    const filesCount = changes.length;
    const timestamp = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const message = `[Auto] ${actionVerb} ${scope}: ${filesCount} file${filesCount > 1 ? 's' : ''} at ${timestamp}`;

    return message;
  }

  /**
   * Detecta se é erro de autenticação
   */
  private isAuthenticationError(errorMessage: string): boolean {
    const authErrors = [
      'Permission denied',
      'Could not read from remote repository',
      'Authentication failed',
      'Invalid key',
      'Host key verification failed'
    ];
    
    return authErrors.some(error => errorMessage.includes(error));
  }

  /**
   * Lida com falha de autenticação
   */
  private async handleAuthenticationFailure() {
    this.authFailureCount++;
    console.error(`❌ Falha de autenticação SSH (${this.authFailureCount}/${this.maxAuthFailures})`);
    
    if (this.authFailureCount >= this.maxAuthFailures) {
      console.log(`🔔 Muitas falhas de autenticação. A chave SSH pode estar inválida.`);
      console.log(`💡 Solicite ao usuário uma nova chave SSH.`);
      
      // Notificar via Mem0 se disponível
      await this.notifyKeyFailure();
      
      // Desabilitar temporariamente
      this.sshKeyPath = undefined;
      this.gitSSHCommand = undefined;
      this.authFailureCount = 0;
    }
  }

  /**
   * Valida chave SSH periodicamente
   */
  /**
   * Inicializa cliente Mem0 para persistência
   */
  private async initializeMem0() {
    try {
      const mem0ApiKey = process.env.MEM0_API_KEY;
      if (mem0ApiKey) {
        this.mem0Client = new MemoryClient({ apiKey: mem0ApiKey });
        console.log('🧠 Mem0 conectado para persistência de histórico');
      } else {
        console.log('⚠️ MEM0_API_KEY não configurada - histórico local apenas');
      }
    } catch (error) {
      console.log('⚠️ Não foi possível inicializar Mem0:', error);
    }
  }

  /**
   * Verifica por falhas de chave notificadas
   */
  public async checkForKeyFailures(): Promise<any> {
    const notificationPath = path.join(path.dirname(AutoCommitAgent.sharedCredentialsPath), 'notifications.json');
    
    if (!fs.existsSync(notificationPath)) {
      return null;
    }
    
    try {
      const notifications = JSON.parse(fs.readFileSync(notificationPath, 'utf-8'));
      const keyFailures = notifications.filter((n: any) => n.type === 'ssh-key-failure');
      
      if (keyFailures.length > 0) {
        const latest = keyFailures[keyFailures.length - 1];
        
        // Armazenar no Mem0 se disponível
        if (this.mem0Client) {
          await this.mem0Client.add(
            [{\"role\": \"system\", \"content\": `SSH key failure detected at ${latest.timestamp}. User needs to provide new SSH key.`}],
            { user_id: this.userId, metadata: { type: 'ssh_key_failure', ...latest } }
          );
        }
        
        return latest;
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
    
    return null;
  }

  /**
   * Armazena histórico de rotação de chaves
   */
  private async storeKeyRotation(oldKeyInfo: any, newKeyInfo: any) {
    const rotationInfo = {
      event: 'ssh_key_rotation',
      timestamp: new Date().toISOString(),
      old_key: {
        created_at: oldKeyInfo.createdAt,
        agent: oldKeyInfo.agent
      },
      new_key: {
        created_at: newKeyInfo.createdAt,
        agent: newKeyInfo.agent
      }
    };
    
    // Armazenar no Mem0 se disponível
    if (this.mem0Client) {
      try {
        await this.mem0Client.add(
          [{\"role\": \"system\", \"content\": `SSH key rotated. Old key from ${oldKeyInfo.createdAt} replaced with new key.`}],
          { user_id: this.userId, metadata: rotationInfo }
        );
      } catch (error) {
        console.error('Erro ao armazenar rotação no Mem0:', error);
      }
    }
    
    // Também armazenar localmente
    const historyPath = path.join(path.dirname(AutoCommitAgent.sharedCredentialsPath), 'key-history.json');
    try {
      let history = [];
      if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      }
      history.push(rotationInfo);
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Erro ao salvar histórico local:', error);
    }
  }

  /**
   * Obtém histórico de chaves do Mem0
   */
  public async getKeyHistoryFromMem0(): Promise<any[]> {
    if (!this.mem0Client) {
      console.log('⚠️ Mem0 não disponível');
      return [];
    }
    
    try {
      const result = await this.mem0Client.search(
        'SSH key rotation history',
        { user_id: this.userId }
      );
      return result.results || [];
    } catch (error) {
      console.error('Erro ao buscar histórico no Mem0:', error);
      return [];
    }
  }

  /**
   * Solicita nova chave SSH ao usuário
   */
  public async requestNewKey(): Promise<string> {
    const request = {
      type: 'key_request',
      timestamp: new Date().toISOString(),
      reason: 'Previous key failed authentication',
      status: 'pending'
    };
    
    // Armazenar solicitação no Mem0
    if (this.mem0Client) {
      try {
        await this.mem0Client.add(
          [{\"role\": \"assistant\", \"content\": \"Diego, preciso de uma nova chave SSH. A chave anterior falhou na autenticação. Por favor, forneça uma nova chave SSH privada.\"}],
          { user_id: this.userId, metadata: request }
        );
      } catch (error) {
        console.error('Erro ao solicitar nova chave via Mem0:', error);
      }
    }
    
    return '🔑 Solicitação de nova chave SSH criada. Diego, por favor forneça uma nova chave.';
  }

  private startKeyValidation() {
    // Validar a cada 30 minutos
    this.keyValidationInterval = setInterval(async () => {
      if (this.sshKeyPath) {
        await this.validateSSHKey();
      }
    }, 30 * 60 * 1000);
  }

  /**
   * Valida se a chave SSH ainda funciona
   */
  private async validateSSHKey(): Promise<boolean> {
    if (!this.sshKeyPath) return false;
    
    try {
      console.log(`🔍 Validando chave SSH...`);
      const testCommand = this.gitSSHCommand
        ? `GIT_SSH_COMMAND="${this.gitSSHCommand}" git ls-remote`
        : 'git ls-remote';
      
      await execAsync(testCommand);
      this.authFailureCount = 0; // Reset contador em caso de sucesso
      console.log(`✅ Chave SSH válida`);
      return true;
    } catch (error: any) {
      if (this.isAuthenticationError(error.message)) {
        await this.handleAuthenticationFailure();
      }
      return false;
    }
  }

  /**
   * Notifica falha de chave (integração com Mem0)
   */
  private async notifyKeyFailure() {
    const notification = {
      type: 'ssh-key-failure',
      timestamp: new Date().toISOString(),
      message: 'Chave SSH falhou múltiplas vezes e foi desabilitada',
      action: 'request-new-key'
    };
    
    // Salvar no Mem0 se disponível
    if (this.mem0Client) {
      try {
        await this.mem0Client.add(
          [{\"role\": \"system\", \"content\": notification.message}],
          { user_id: this.userId, metadata: notification }
        );
        console.log('📨 Notificação de falha enviada ao Mem0');
      } catch (error) {
        console.error('Erro ao notificar via Mem0:', error);
      }
    }
    
    // Também salvar localmente para outros agentes
    const notificationPath = path.join(path.dirname(AutoCommitAgent.sharedCredentialsPath), 'notifications.json');
    try {
      let notifications = [];
      if (fs.existsSync(notificationPath)) {
        notifications = JSON.parse(fs.readFileSync(notificationPath, 'utf-8'));
      }
      notifications.push(notification);
      fs.writeFileSync(notificationPath, JSON.stringify(notifications, null, 2));
    } catch (error) {
      console.error('Erro ao salvar notificação local:', error);
    }
    
    // Solicitar nova chave automaticamente
    await this.requestNewKey();
  }

  /**
   * Rotaciona chave SSH (cria backup da antiga)
   */
  public async rotateSSHKey(newSSHKey: string): Promise<boolean> {
    try {
      // Obter informações da chave antiga
      let oldKeyInfo = null;
      if (fs.existsSync(AutoCommitAgent.sharedCredentialsPath)) {
        oldKeyInfo = JSON.parse(fs.readFileSync(AutoCommitAgent.sharedCredentialsPath, 'utf-8'));
      }
      
      // Backup da chave antiga se existir
      if (this.sshKeyPath && fs.existsSync(this.sshKeyPath)) {
        const backupPath = `${this.sshKeyPath}.backup.${Date.now()}`;
        fs.copyFileSync(this.sshKeyPath, backupPath);
        console.log(`📋 Backup da chave antiga criado: ${backupPath}`);
      }
      
      // Armazenar nova chave
      const success = await this.storeSSHKey(newSSHKey);
      
      if (success) {
        // Obter informações da nova chave
        const newKeyInfo = JSON.parse(fs.readFileSync(AutoCommitAgent.sharedCredentialsPath, 'utf-8'));
        
        // Armazenar histórico de rotação se tinha chave antiga
        if (oldKeyInfo) {
          await this.storeKeyRotation(oldKeyInfo, newKeyInfo);
        }
        
        // Resetar contadores
        this.authFailureCount = 0;
        this.lastAuthCheck = new Date();
        
        // Validar nova chave
        const isValid = await this.validateSSHKey();
        if (!isValid) {
          console.error(`❌ Nova chave não é válida`);
          return false;
        }
      }
      
      return success;
    } catch (error: any) {
      console.error(`❌ Erro ao rotacionar chave:`, error.message);
      return false;
    }
  }

  /**
   * Lista histórico de chaves (backups)
   */
  public getKeyHistory(): string[] {
    const keyDir = path.dirname(this.sshKeyPath || path.join(path.dirname(AutoCommitAgent.sharedCredentialsPath), 'ssh-key'));
    try {
      return fs.readdirSync(keyDir)
        .filter(file => file.includes('ssh-key.backup'))
        .sort((a, b) => b.localeCompare(a));
    } catch {
      return [];
    }
  }

  /**
   * Para o monitoramento
   */
  public stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log('🛑 Monitoramento parado');
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.keyValidationInterval) {
      clearInterval(this.keyValidationInterval);
    }
  }
}

/**
 * Factory function para criar instância do agente
 */
export function createAutoCommitAgent(watchPath?: string): AutoCommitAgent {
  return new AutoCommitAgent(watchPath);
}

/**
 * Função para iniciar o agente diretamente
 */
export async function startAutoCommitAgent(watchPath?: string) {
  console.log('🚀 Iniciando Auto-Commit + Push Agent...\n');
  
  const agent = createAutoCommitAgent(watchPath);
  
  // Manter o processo rodando
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Parando auto-commit...');
    agent.stop();
    process.exit(0);
  });

  // Prevenir o processo de finalizar
  setInterval(() => {}, 1000);
}