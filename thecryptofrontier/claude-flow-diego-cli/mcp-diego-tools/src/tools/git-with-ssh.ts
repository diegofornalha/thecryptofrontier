/**
 * Ferramenta Git com suporte a SSH compartilhado
 * Usa credenciais armazenadas pelo Auto Commit Agent
 */

import { CredentialsManager } from '../credentials-manager';

export class GitWithSSHTool {
  /**
   * Executa comando git usando credenciais compartilhadas
   */
  async execute(command: string): Promise<{ success: boolean; output?: string; error?: string }> {
    try {
      // Verificar se existe chave SSH compartilhada
      if (CredentialsManager.hasSharedCredentials()) {
        const credentials = CredentialsManager.getSharedCredentials();
        console.log(`🔑 Usando chave SSH compartilhada por: ${credentials?.agent}`);
      }

      // Executar comando com SSH personalizado (se disponível)
      const result = await CredentialsManager.executeGitWithSSH(command);
      
      return {
        success: true,
        output: result.stdout
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clone com SSH
   */
  async clone(repoUrl: string, directory?: string): Promise<{ success: boolean; output?: string; error?: string }> {
    const dir = directory ? ` ${directory}` : '';
    return this.execute(`git clone ${repoUrl}${dir}`);
  }

  /**
   * Push com SSH
   */
  async push(branch?: string): Promise<{ success: boolean; output?: string; error?: string }> {
    const branchArg = branch ? ` origin ${branch}` : '';
    return this.execute(`git push${branchArg}`);
  }

  /**
   * Pull com SSH
   */
  async pull(branch?: string): Promise<{ success: boolean; output?: string; error?: string }> {
    const branchArg = branch ? ` origin ${branch}` : '';
    return this.execute(`git pull${branchArg}`);
  }

  /**
   * Status das credenciais
   */
  getCredentialsStatus(): { hasCredentials: boolean; details?: any } {
    const credentials = CredentialsManager.getSharedCredentials();
    
    if (!credentials) {
      return { hasCredentials: false };
    }

    return {
      hasCredentials: true,
      details: {
        type: credentials.type,
        agent: credentials.agent,
        createdAt: credentials.createdAt
      }
    };
  }
}

// Exemplo de uso no MCP DiegoTools
export async function gitToolExample() {
  const gitTool = new GitWithSSHTool();
  
  // Verificar status das credenciais
  const status = gitTool.getCredentialsStatus();
  console.log('Status das credenciais:', status);
  
  // Executar operações git
  const pushResult = await gitTool.push('main');
  if (pushResult.success) {
    console.log('✅ Push realizado com sucesso!');
  } else {
    console.log('❌ Erro no push:', pushResult.error);
  }
}