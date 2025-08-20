/**
 * Sincronização dinâmica do .gitignore com Mem0
 * Mantém histórico e versiona mudanças automaticamente
 */

import * as fs from 'fs';
import * as path from 'path';
import { autoCommitMemory } from './mem0-instructions';

export class GitignoreMem0Sync {
  private gitignorePath: string;
  private lastContent: string = '';
  private syncInterval?: NodeJS.Timer;
  
  constructor(projectPath: string = process.cwd()) {
    this.gitignorePath = path.join(projectPath, '.gitignore');
  }

  /**
   * Inicia sincronização automática
   */
  async startSync(intervalMinutes: number = 5) {
    // Registrar conteúdo inicial
    await this.syncToMem0();
    
    // Verificar mudanças periodicamente
    this.syncInterval = setInterval(async () => {
      await this.checkAndSync();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`🔄 Sincronização do .gitignore iniciada (a cada ${intervalMinutes} minutos)`);
  }

  /**
   * Para sincronização
   */
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      console.log('⏹️ Sincronização do .gitignore parada');
    }
  }

  /**
   * Verifica mudanças e sincroniza se necessário
   */
  private async checkAndSync() {
    const currentContent = await this.readGitignore();
    
    if (currentContent !== this.lastContent) {
      console.log('📝 Mudança detectada no .gitignore');
      await this.syncToMem0();
    }
  }

  /**
   * Lê conteúdo atual do .gitignore
   */
  private async readGitignore(): Promise<string> {
    try {
      return fs.readFileSync(this.gitignorePath, 'utf-8');
    } catch (error) {
      return '';
    }
  }

  /**
   * Sincroniza conteúdo para Mem0
   */
  async syncToMem0() {
    const content = await this.readGitignore();
    if (!content) return;
    
    this.lastContent = content;
    
    // Extrair timestamp da primeira linha (se existir)
    const lines = content.split('\n');
    const firstLine = lines[0];
    let timestamp = '';
    
    if (firstLine.startsWith('#')) {
      const timeMatch = firstLine.match(/(\d{2}:\d{2})/);
      const dateMatch = firstLine.match(/dia (\d{2}\/\d{2}\/\d{4})/);
      
      if (timeMatch && dateMatch) {
        timestamp = `${timeMatch[1]} do dia ${dateMatch[1]}`;
      }
    }
    
    // Registrar no Mem0
    const instruction = `Meu arquivo .gitignore atual ${timestamp ? `(atualizado às ${timestamp})` : ''} contém as seguintes regras:\n${content}`;
    
    await autoCommitMemory.addInstruction(instruction);
    
    // Registrar cada diretório/arquivo ignorado
    const ignoreRules = lines
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.trim());
    
    for (const rule of ignoreRules) {
      const reason = this.inferReason(rule);
      await autoCommitMemory.addIgnoreRule(rule, reason);
    }
    
    console.log(`✅ .gitignore sincronizado com Mem0 (${ignoreRules.length} regras)`);
  }

  /**
   * Infere razão para ignorar baseado no nome
   */
  private inferReason(rule: string): string {
    const reasons: Record<string, string> = {
      'node_modules': 'dependências não devem ser versionadas',
      '.env': 'arquivos de ambiente contêm segredos',
      'dist': 'arquivos compilados são gerados automaticamente',
      'build': 'diretório de build é gerado automaticamente',
      '.DS_Store': 'arquivo do sistema macOS',
      '*.log': 'arquivos de log são temporários',
      '*.tmp': 'arquivos temporários',
      'mem0-persistent': 'dados persistentes do Mem0 não devem ser commitados',
      'strapi-cms': 'CMS Strapi tem seu próprio controle de versão',
      'frontend-nextjs': 'aplicação Next.js deve ter commits independentes',
      'infrastructure-docker': 'configurações Docker devem ser versionadas separadamente',
      'claude-flow-diego-cli': 'CLI do Claude Flow tem seu próprio repositório',
      'agetes-python': 'subprojeto Python deve ser gerenciado separadamente'
    };
    
    // Procurar correspondência
    for (const [pattern, reason] of Object.entries(reasons)) {
      if (rule.includes(pattern.replace('*', ''))) {
        return reason;
      }
    }
    
    return 'arquivo ou diretório específico do projeto';
  }

  /**
   * Atualiza .gitignore com timestamp
   */
  async updateGitignoreWithTimestamp() {
    const content = await this.readGitignore();
    const lines = content.split('\n');
    
    // Gerar timestamp atual
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('pt-BR');
    const timestamp = `# raiz ${time} dia ${date}`;
    
    // Atualizar primeira linha se for comentário
    if (lines[0].startsWith('#')) {
      lines[0] = timestamp;
    } else {
      lines.unshift(timestamp);
    }
    
    // Salvar arquivo atualizado
    const newContent = lines.join('\n');
    fs.writeFileSync(this.gitignorePath, newContent);
    
    console.log(`⏰ .gitignore atualizado com timestamp: ${timestamp}`);
    
    // Sincronizar com Mem0
    await this.syncToMem0();
  }

  /**
   * Recupera histórico do Mem0
   */
  async getGitignoreHistory(): Promise<any[]> {
    const memories = await autoCommitMemory.getAllInstructions();
    
    return memories.filter(m => 
      m.memory.includes('.gitignore') || 
      m.metadata?.type === 'ignore_rule'
    );
  }
}

// Função helper para uso direto
export async function syncGitignoreToMem0(projectPath?: string) {
  const sync = new GitignoreMem0Sync(projectPath);
  await sync.syncToMem0();
  return sync;
}

// Auto-sync ao importar (opcional)
export async function enableGitignoreAutoSync(projectPath?: string, intervalMinutes: number = 5) {
  const sync = new GitignoreMem0Sync(projectPath);
  await sync.startSync(intervalMinutes);
  return sync;
}