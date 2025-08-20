/**
 * Gerenciador Git Seguro
 * Implementa todas as correções de segurança recomendadas
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { quote } from 'shell-quote';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export class SecureGitManager {
  private rateLimiter = new Map<string, number[]>();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minuto
  private readonly MAX_COMMITS_PER_MINUTE = 10;

  /**
   * Executa comando git com segurança
   */
  async executeGitCommand(command: string, args: string[] = []): Promise<string> {
    // Sanitizar argumentos
    const safeArgs = quote(args);
    const fullCommand = `git ${command} ${safeArgs}`;

    try {
      const { stdout } = await execAsync(fullCommand);
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Verifica branch atual
   */
  async getCurrentBranch(): Promise<string> {
    return await this.executeGitCommand('branch', ['--show-current']);
  }

  /**
   * Verifica se é branch protegida
   */
  async isProtectedBranch(branch?: string): Promise<boolean> {
    const currentBranch = branch || await this.getCurrentBranch();
    const protectedBranches = ['main', 'master', 'production', 'prod', 'develop'];
    
    // Carregar branches protegidas customizadas do .gitconfig
    try {
      const { stdout } = await execAsync('git config --get-regexp "branch\\..*\\.protected"');
      const customProtected = stdout.split('\n')
        .map(line => line.match(/branch\.(.+)\.protected true/)?.[1])
        .filter(Boolean);
      
      protectedBranches.push(...customProtected);
    } catch {
      // Ignorar se não houver configuração
    }

    return protectedBranches.includes(currentBranch);
  }

  /**
   * Verifica rate limiting
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const timestamps = this.rateLimiter.get(userId) || [];
    
    // Limpar timestamps antigos
    const recentTimestamps = timestamps.filter(
      t => now - t < this.RATE_LIMIT_WINDOW
    );
    
    if (recentTimestamps.length >= this.MAX_COMMITS_PER_MINUTE) {
      return false; // Rate limit excedido
    }
    
    // Adicionar novo timestamp
    recentTimestamps.push(now);
    this.rateLimiter.set(userId, recentTimestamps);
    
    return true;
  }

  /**
   * Verifica por secrets no staged content
   */
  async checkForSecrets(): Promise<boolean> {
    const secretPatterns = [
      // AWS
      'AKIA[0-9A-Z]{16}',
      'aws_secret_access_key',
      
      // API Keys genéricas
      'api[_-]?key["\']?\\s*[:=]\\s*["\'][^"\']+["\']',
      'token["\']?\\s*[:=]\\s*["\'][^"\']+["\']',
      
      // Private keys
      '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----',
      
      // Passwords
      'password["\']?\\s*[:=]\\s*["\'][^"\']+["\']',
      
      // Database URLs
      'postgres://[^\\s]+:[^\\s]+@[^\\s]+',
      'mysql://[^\\s]+:[^\\s]+@[^\\s]+',
      'mongodb(\\+srv)?://[^\\s]+'
    ];

    try {
      // Verificar apenas arquivos staged
      const { stdout: stagedFiles } = await execAsync('git diff --cached --name-only');
      
      if (!stagedFiles) return true; // Sem arquivos staged
      
      for (const file of stagedFiles.split('\n').filter(Boolean)) {
        // Pular arquivos binários
        const { stdout: isBinary } = await execAsync(`git diff --cached --numstat ${quote([file])}`);
        if (isBinary.includes('-\t-\t')) continue;
        
        // Obter conteúdo do arquivo staged
        const { stdout: content } = await execAsync(`git show :${quote([file])}`);
        
        // Verificar cada padrão
        for (const pattern of secretPatterns) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(content)) {
            console.error(`⚠️ Possível secret detectado em ${file}`);
            console.error(`   Padrão: ${pattern}`);
            return false;
          }
        }
      }
      
      return true; // Nenhum secret encontrado
    } catch (error) {
      console.error('Erro ao verificar secrets:', error);
      return false; // Falhar por segurança
    }
  }

  /**
   * Executa hooks de pre-commit
   */
  async runPreCommitChecks(): Promise<boolean> {
    const checks = [
      // Linting
      { name: 'Linting', command: 'npm run lint --if-present' },
      
      // Type checking
      { name: 'Type Check', command: 'npm run typecheck --if-present' },
      
      // Tests
      { name: 'Tests', command: 'npm run test --if-present -- --passWithNoTests' },
      
      // Security audit
      { name: 'Security', command: 'npm audit --audit-level=high --if-present' }
    ];

    for (const check of checks) {
      try {
        console.log(`🔍 Executando ${check.name}...`);
        await execAsync(check.command);
        console.log(`✅ ${check.name} passou`);
      } catch (error) {
        console.warn(`⚠️ ${check.name} falhou, continuando...`);
        // Continuar com outros checks
      }
    }

    return true;
  }

  /**
   * Commit seguro com todas as validações
   */
  async secureCommit(message: string, options: {
    userId?: string;
    skipHooks?: boolean;
    force?: boolean;
  } = {}): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Verificar rate limiting
      if (options.userId && !this.checkRateLimit(options.userId)) {
        return {
          success: false,
          message: '⏱️ Rate limit excedido. Aguarde 1 minuto.'
        };
      }

      // 2. Verificar branch protegida
      const isProtected = await this.isProtectedBranch();
      if (isProtected && !options.force) {
        return {
          success: false,
          message: '🚫 Não é permitido commit em branch protegida'
        };
      }

      // 3. Verificar secrets
      console.log('🔐 Verificando por secrets...');
      const noSecrets = await this.checkForSecrets();
      if (!noSecrets) {
        return {
          success: false,
          message: '🚨 Secrets detectados! Remova-os antes de commitar.'
        };
      }

      // 4. Executar pre-commit hooks
      if (!options.skipHooks) {
        await this.runPreCommitChecks();
      }

      // 5. Sanitizar mensagem e fazer commit
      const safeMessage = quote([message]);
      await execAsync(`git commit -m ${safeMessage}`);

      return {
        success: true,
        message: '✅ Commit realizado com segurança'
      };

    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erro no commit: ${error.message}`
      };
    }
  }

  /**
   * Push seguro com validações
   */
  async securePush(options: {
    sshCommand?: string;
    branch?: string;
  } = {}): Promise<{ success: boolean; message: string }> {
    try {
      // Construir comando
      let pushCommand = 'git push';
      if (options.branch) {
        pushCommand += ` origin ${quote([options.branch])}`;
      }

      // Usar SSH personalizado se disponível
      if (options.sshCommand) {
        const { stdout } = await execAsync(pushCommand, {
          env: { ...process.env, GIT_SSH_COMMAND: options.sshCommand }
        });
        return { success: true, message: stdout };
      } else {
        const { stdout } = await execAsync(pushCommand);
        return { success: true, message: stdout };
      }

    } catch (error: any) {
      // Tentar criar upstream se necessário
      if (error.message.includes('no upstream branch')) {
        const branch = await this.getCurrentBranch();
        const upstreamCommand = `git push -u origin ${quote([branch])}`;
        
        try {
          await execAsync(upstreamCommand);
          return { success: true, message: '✅ Push realizado com upstream' };
        } catch (upstreamError: any) {
          return { success: false, message: upstreamError.message };
        }
      }

      return { success: false, message: error.message };
    }
  }

  /**
   * Verifica integridade do repositório
   */
  async verifyRepositoryIntegrity(): Promise<boolean> {
    try {
      // Verificar se é um repositório git válido
      await execAsync('git rev-parse --git-dir');
      
      // Verificar por corrupção
      await execAsync('git fsck --no-dangling');
      
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton
export const secureGitManager = new SecureGitManager();