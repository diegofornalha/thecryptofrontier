/**
 * Gerenciador de Credenciais Compartilhadas
 * Permite que o MCP DiegoTools acesse credenciais armazenadas por outros agentes
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SharedCredentials {
  type: 'ssh-key' | 'api-key' | 'token';
  path: string;
  createdAt: string;
  agent: string;
  metadata?: any;
}

export class CredentialsManager {
  private static credentialsDir = path.join(process.cwd(), '.diego-tools');
  private static credentialsFile = path.join(CredentialsManager.credentialsDir, 'credentials');

  /**
   * Lê as credenciais compartilhadas
   */
  static getSharedCredentials(): SharedCredentials | null {
    try {
      if (!fs.existsSync(this.credentialsFile)) {
        return null;
      }

      const data = fs.readFileSync(this.credentialsFile, 'utf-8');
      return JSON.parse(data) as SharedCredentials;
    } catch (error) {
      console.error('Erro ao ler credenciais compartilhadas:', error);
      return null;
    }
  }

  /**
   * Obtém o conteúdo da chave SSH se disponível
   */
  static getSSHKey(): string | null {
    try {
      const credentials = this.getSharedCredentials();
      
      if (!credentials || credentials.type !== 'ssh-key') {
        return null;
      }

      if (!fs.existsSync(credentials.path)) {
        console.error('Arquivo de chave SSH não encontrado:', credentials.path);
        return null;
      }

      return fs.readFileSync(credentials.path, 'utf-8');
    } catch (error) {
      console.error('Erro ao ler chave SSH:', error);
      return null;
    }
  }

  /**
   * Configura o GIT_SSH_COMMAND para usar a chave compartilhada
   */
  static getGitSSHCommand(): string | null {
    const credentials = this.getSharedCredentials();
    
    if (!credentials || credentials.type !== 'ssh-key') {
      return null;
    }

    return `ssh -i ${credentials.path} -o StrictHostKeyChecking=no`;
  }

  /**
   * Executa comando git com SSH personalizado
   */
  static async executeGitWithSSH(command: string): Promise<{ stdout: string; stderr: string }> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const sshCommand = this.getGitSSHCommand();
    
    if (sshCommand) {
      // Usar a chave SSH compartilhada
      const fullCommand = `GIT_SSH_COMMAND="${sshCommand}" ${command}`;
      return execAsync(fullCommand);
    } else {
      // Usar configuração padrão do sistema
      return execAsync(command);
    }
  }

  /**
   * Verifica se existem credenciais compartilhadas
   */
  static hasSharedCredentials(): boolean {
    return fs.existsSync(this.credentialsFile);
  }

  /**
   * Salva novas credenciais (para outros tipos além de SSH)
   */
  static saveCredentials(credentials: SharedCredentials): boolean {
    try {
      // Criar diretório se não existir
      if (!fs.existsSync(this.credentialsDir)) {
        fs.mkdirSync(this.credentialsDir, { recursive: true, mode: 0o700 });
      }

      // Salvar credenciais
      fs.writeFileSync(
        this.credentialsFile,
        JSON.stringify(credentials, null, 2),
        { mode: 0o600 }
      );

      return true;
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
      return false;
    }
  }

  /**
   * Remove todas as credenciais compartilhadas
   */
  static clearCredentials(): boolean {
    try {
      if (fs.existsSync(this.credentialsFile)) {
        // Ler credenciais para remover arquivos associados
        const credentials = this.getSharedCredentials();
        
        if (credentials && credentials.path && fs.existsSync(credentials.path)) {
          fs.unlinkSync(credentials.path);
        }
        
        fs.unlinkSync(this.credentialsFile);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar credenciais:', error);
      return false;
    }
  }
}

// Exportar para uso no MCP DiegoTools
export default CredentialsManager;