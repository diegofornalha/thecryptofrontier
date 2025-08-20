/**
 * Serviço de Git modularizado para o Auto Commit Agent
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { CommitResult, FileChange } from '../interfaces';

const execAsync = promisify(exec);

export class GitService {
  private gitSSHCommand?: string;
  private workingDirectory: string;

  constructor(workingDirectory: string = process.cwd()) {
    this.workingDirectory = workingDirectory;
  }

  /**
   * Define comando SSH customizado
   */
  setSSHCommand(command: string) {
    this.gitSSHCommand = command;
  }

  /**
   * Verifica se o diretório é um repositório Git
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.exec('git rev-parse --git-dir');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém status do repositório
   */
  async getStatus(): Promise<string> {
    const { stdout } = await this.exec('git status --porcelain');
    return stdout.trim();
  }

  /**
   * Obtém branch atual
   */
  async getCurrentBranch(): Promise<string> {
    const { stdout } = await this.exec('git branch --show-current');
    return stdout.trim();
  }

  /**
   * Verifica se há remotes configurados
   */
  async hasRemotes(): Promise<boolean> {
    const { stdout } = await this.exec('git remote');
    return stdout.trim().length > 0;
  }

  /**
   * Adiciona arquivos ao stage
   */
  async addFiles(pattern: string = '.'): Promise<void> {
    await this.exec(`git add ${pattern}`);
  }

  /**
   * Faz commit com mensagem
   */
  async commit(message: string): Promise<string> {
    const { stdout } = await this.exec(`git commit -m "${message}"`);
    
    // Extrair hash do commit
    const hashMatch = stdout.match(/\[[\w\s-]+\s+([\w]+)\]/);
    return hashMatch ? hashMatch[1] : '';
  }

  /**
   * Faz push para o remote
   */
  async push(setUpstream: boolean = false): Promise<void> {
    const branch = await this.getCurrentBranch();
    const command = setUpstream 
      ? `git push -u origin ${branch}`
      : 'git push';
    
    await this.exec(command);
  }

  /**
   * Testa conexão com remote
   */
  async testRemoteConnection(): Promise<boolean> {
    try {
      await this.exec('git ls-remote');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém log de commits
   */
  async getLog(limit: number = 10): Promise<Array<{hash: string, message: string, date: string}>> {
    const { stdout } = await this.exec(
      `git log --pretty=format:"%H|%s|%ad" --date=short -n ${limit}`
    );
    
    return stdout.trim().split('\n').map(line => {
      const [hash, message, date] = line.split('|');
      return { hash, message, date };
    });
  }

  /**
   * Obtém diff de arquivos modificados
   */
  async getDiff(staged: boolean = false): Promise<string> {
    const command = staged ? 'git diff --cached' : 'git diff';
    const { stdout } = await this.exec(command);
    return stdout;
  }

  /**
   * Obtém lista de arquivos modificados
   */
  async getModifiedFiles(): Promise<FileChange[]> {
    const { stdout } = await this.exec('git status --porcelain');
    const lines = stdout.trim().split('\n').filter(line => line.length > 0);
    
    return lines.map(line => {
      const status = line.substring(0, 2).trim();
      const path = line.substring(3);
      
      let action: 'added' | 'modified' | 'deleted' = 'modified';
      if (status === 'A' || status === '??') action = 'added';
      else if (status === 'D') action = 'deleted';
      
      return {
        action,
        path,
        timestamp: new Date()
      };
    });
  }

  /**
   * Executa comando Git com suporte a SSH customizado
   */
  private async exec(command: string): Promise<{ stdout: string; stderr: string }> {
    const env = { ...process.env };
    
    if (this.gitSSHCommand) {
      env.GIT_SSH_COMMAND = this.gitSSHCommand;
    }
    
    return execAsync(command, {
      cwd: this.workingDirectory,
      env
    });
  }

  /**
   * Faz rollback do último commit
   */
  async rollback(): Promise<void> {
    await this.exec('git reset --soft HEAD~1');
  }

  /**
   * Obtém informações do repositório
   */
  async getRepositoryInfo(): Promise<{
    name: string;
    remote?: string;
    branch: string;
  }> {
    const branch = await this.getCurrentBranch();
    
    try {
      const { stdout } = await this.exec('git remote get-url origin');
      const remote = stdout.trim();
      const name = remote.split('/').pop()?.replace('.git', '') || 'unknown';
      
      return { name, remote, branch };
    } catch {
      return { name: 'local', branch };
    }
  }

  /**
   * Configura credenciais de forma segura
   */
  async configureCredentials(username: string, email: string): Promise<void> {
    await this.exec(`git config user.name "${username}"`);
    await this.exec(`git config user.email "${email}"`);
  }

  /**
   * Verifica se há conflitos
   */
  async hasConflicts(): Promise<boolean> {
    try {
      const { stdout } = await this.exec('git diff --name-only --diff-filter=U');
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Faz stash das mudanças atuais
   */
  async stash(message?: string): Promise<void> {
    const command = message 
      ? `git stash push -m "${message}"`
      : 'git stash';
    await this.exec(command);
  }

  /**
   * Aplica stash
   */
  async stashPop(): Promise<void> {
    await this.exec('git stash pop');
  }
}