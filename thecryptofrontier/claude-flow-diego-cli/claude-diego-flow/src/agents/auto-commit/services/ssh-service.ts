/**
 * Serviço de gerenciamento de chaves SSH
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { SSHKeyInfo } from '../interfaces';

export class SSHService {
  private static readonly CREDENTIALS_DIR = path.join(process.cwd(), '.diego-tools');
  private static readonly SSH_KEY_FILE = 'ssh-key';
  private static readonly METADATA_FILE = 'credentials';
  
  private keyInfo?: SSHKeyInfo;

  constructor() {
    this.ensureCredentialsDirectory();
    this.loadStoredKey();
  }

  /**
   * Garante que o diretório de credenciais existe
   */
  private ensureCredentialsDirectory(): void {
    if (!fs.existsSync(SSHService.CREDENTIALS_DIR)) {
      fs.mkdirSync(SSHService.CREDENTIALS_DIR, { 
        recursive: true, 
        mode: 0o700 
      });
    }
  }

  /**
   * Carrega chave SSH armazenada
   */
  private loadStoredKey(): void {
    const keyPath = this.getKeyPath();
    
    if (fs.existsSync(keyPath)) {
      try {
        const keyContent = fs.readFileSync(keyPath, 'utf-8');
        const metadataPath = this.getMetadataPath();
        
        let metadata: any = {};
        if (fs.existsSync(metadataPath)) {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        }
        
        this.keyInfo = {
          path: keyPath,
          fingerprint: this.generateFingerprint(keyContent),
          createdAt: metadata.createdAt ? new Date(metadata.createdAt) : new Date(),
          lastValidated: metadata.lastValidated ? new Date(metadata.lastValidated) : undefined,
          isValid: true,
          failureCount: 0
        };
      } catch (error) {
        console.error('Erro ao carregar chave SSH:', error);
      }
    }
  }

  /**
   * Armazena nova chave SSH
   */
  async storeKey(keyContent: string): Promise<boolean> {
    try {
      // Validar formato da chave
      if (!this.isValidKeyFormat(keyContent)) {
        throw new Error('Formato de chave SSH inválido');
      }

      const keyPath = this.getKeyPath();
      
      // Fazer backup se existir chave anterior
      if (fs.existsSync(keyPath)) {
        await this.backupCurrentKey();
      }
      
      // Escrever nova chave
      fs.writeFileSync(keyPath, keyContent, { mode: 0o600 });
      
      // Criar metadata
      const metadata = {
        type: 'ssh-key',
        path: keyPath,
        createdAt: new Date().toISOString(),
        agent: 'auto-commit-agent',
        fingerprint: this.generateFingerprint(keyContent)
      };
      
      fs.writeFileSync(
        this.getMetadataPath(),
        JSON.stringify(metadata, null, 2)
      );
      
      // Atualizar keyInfo
      this.keyInfo = {
        path: keyPath,
        fingerprint: metadata.fingerprint,
        createdAt: new Date(),
        isValid: true,
        failureCount: 0
      };
      
      return true;
    } catch (error) {
      console.error('Erro ao armazenar chave SSH:', error);
      return false;
    }
  }

  /**
   * Remove chave SSH
   */
  removeKey(): boolean {
    try {
      const keyPath = this.getKeyPath();
      const metadataPath = this.getMetadataPath();
      
      if (fs.existsSync(keyPath)) {
        fs.unlinkSync(keyPath);
      }
      
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }
      
      this.keyInfo = undefined;
      return true;
    } catch (error) {
      console.error('Erro ao remover chave SSH:', error);
      return false;
    }
  }

  /**
   * Obtém comando SSH para Git
   */
  getGitSSHCommand(): string | undefined {
    if (!this.keyInfo || !this.keyInfo.isValid) {
      return undefined;
    }
    
    return `ssh -i ${this.keyInfo.path} -o StrictHostKeyChecking=no`;
  }

  /**
   * Marca falha de autenticação
   */
  markAuthFailure(): void {
    if (this.keyInfo) {
      this.keyInfo.failureCount++;
      
      if (this.keyInfo.failureCount >= 3) {
        this.keyInfo.isValid = false;
        this.saveNotification({
          type: 'ssh-key-failure',
          message: 'Chave SSH falhou múltiplas vezes',
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Marca sucesso de autenticação
   */
  markAuthSuccess(): void {
    if (this.keyInfo) {
      this.keyInfo.failureCount = 0;
      this.keyInfo.isValid = true;
      this.keyInfo.lastValidated = new Date();
      
      // Atualizar metadata
      this.updateMetadata({
        lastValidated: new Date().toISOString()
      });
    }
  }

  /**
   * Obtém informações da chave
   */
  getKeyInfo(): SSHKeyInfo | undefined {
    return this.keyInfo;
  }

  /**
   * Lista histórico de backups
   */
  getBackupHistory(): string[] {
    try {
      return fs.readdirSync(SSHService.CREDENTIALS_DIR)
        .filter(file => file.startsWith(`${SSHService.SSH_KEY_FILE}.backup`))
        .sort((a, b) => b.localeCompare(a));
    } catch {
      return [];
    }
  }

  /**
   * Restaura backup de chave
   */
  async restoreBackup(backupName: string): Promise<boolean> {
    try {
      const backupPath = path.join(SSHService.CREDENTIALS_DIR, backupName);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup não encontrado');
      }
      
      const keyContent = fs.readFileSync(backupPath, 'utf-8');
      return await this.storeKey(keyContent);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  }

  /**
   * Valida formato da chave
   */
  private isValidKeyFormat(keyContent: string): boolean {
    return keyContent.includes('BEGIN') && keyContent.includes('END');
  }

  /**
   * Gera fingerprint da chave
   */
  private generateFingerprint(keyContent: string): string {
    return crypto
      .createHash('sha256')
      .update(keyContent)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Faz backup da chave atual
   */
  private async backupCurrentKey(): Promise<void> {
    const keyPath = this.getKeyPath();
    
    if (fs.existsSync(keyPath)) {
      const timestamp = Date.now();
      const backupPath = path.join(
        SSHService.CREDENTIALS_DIR,
        `${SSHService.SSH_KEY_FILE}.backup.${timestamp}`
      );
      
      fs.copyFileSync(keyPath, backupPath);
    }
  }

  /**
   * Salva notificação
   */
  private saveNotification(notification: any): void {
    const notificationPath = path.join(
      SSHService.CREDENTIALS_DIR,
      'notifications.json'
    );
    
    try {
      let notifications = [];
      
      if (fs.existsSync(notificationPath)) {
        notifications = JSON.parse(
          fs.readFileSync(notificationPath, 'utf-8')
        );
      }
      
      notifications.push(notification);
      
      // Manter apenas últimas 100 notificações
      if (notifications.length > 100) {
        notifications = notifications.slice(-100);
      }
      
      fs.writeFileSync(
        notificationPath,
        JSON.stringify(notifications, null, 2)
      );
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  }

  /**
   * Atualiza metadata
   */
  private updateMetadata(updates: any): void {
    try {
      const metadataPath = this.getMetadataPath();
      let metadata = {};
      
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      }
      
      metadata = { ...metadata, ...updates };
      
      fs.writeFileSync(
        metadataPath,
        JSON.stringify(metadata, null, 2)
      );
    } catch (error) {
      console.error('Erro ao atualizar metadata:', error);
    }
  }

  /**
   * Obtém caminho da chave
   */
  private getKeyPath(): string {
    return path.join(SSHService.CREDENTIALS_DIR, SSHService.SSH_KEY_FILE);
  }

  /**
   * Obtém caminho do metadata
   */
  private getMetadataPath(): string {
    return path.join(SSHService.CREDENTIALS_DIR, SSHService.METADATA_FILE);
  }
}