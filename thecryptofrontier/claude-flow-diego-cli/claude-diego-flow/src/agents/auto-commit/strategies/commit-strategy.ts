/**
 * Estratégias de commit para o Auto Commit Agent
 */

import { CommitStrategy, FileChange } from '../interfaces';
import * as path from 'path';

/**
 * Estratégia padrão - commit por tempo e quantidade
 */
export class DefaultCommitStrategy implements CommitStrategy {
  private minChanges: number;
  private maxChanges: number;

  constructor(minChanges: number = 1, maxChanges: number = 50) {
    this.minChanges = minChanges;
    this.maxChanges = maxChanges;
  }

  shouldCommit(changes: FileChange[]): boolean {
    const count = changes.length;
    return count >= this.minChanges && count <= this.maxChanges;
  }

  generateMessage(changes: FileChange[]): string {
    const summary = this.summarizeChanges(changes);
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `[Auto] ${summary.action} ${summary.scope}: ${summary.count} file${summary.count > 1 ? 's' : ''} at ${timestamp}`;
  }

  getPriority(): number {
    return 1;
  }

  private summarizeChanges(changes: FileChange[]) {
    const actions = new Set(changes.map(c => c.action));
    const fileTypes = new Set<string>();

    changes.forEach(change => {
      const ext = path.extname(change.path);
      if (ext) fileTypes.add(ext);
    });

    // Determinar ação principal
    let action = 'Update';
    if (actions.size === 1) {
      const singleAction = actions.values().next().value;
      action = singleAction === 'added' ? 'Add' :
               singleAction === 'deleted' ? 'Remove' : 'Update';
    } else if (actions.size > 1) {
      action = 'Refactor';
    }

    // Determinar escopo
    let scope = 'files';
    if (fileTypes.has('.ts') || fileTypes.has('.js')) {
      scope = 'code';
    } else if (fileTypes.has('.md')) {
      scope = 'docs';
    } else if (fileTypes.has('.json') || fileTypes.has('.yml')) {
      scope = 'config';
    } else if (fileTypes.has('.css') || fileTypes.has('.scss')) {
      scope = 'styles';
    }

    return {
      action,
      scope,
      count: changes.length
    };
  }
}

/**
 * Estratégia inteligente - analisa conteúdo das mudanças
 */
export class SmartCommitStrategy implements CommitStrategy {
  private patterns: Map<RegExp, string> = new Map([
    [/^feat:/, 'feature'],
    [/^fix:/, 'bugfix'],
    [/^docs:/, 'documentation'],
    [/^style:/, 'formatting'],
    [/^refactor:/, 'refactoring'],
    [/^test:/, 'testing'],
    [/^chore:/, 'maintenance']
  ]);

  shouldCommit(changes: FileChange[]): boolean {
    // Sempre fazer commit se houver mudanças
    return changes.length > 0;
  }

  generateMessage(changes: FileChange[]): string {
    // Agrupar por tipo de mudança
    const grouped = this.groupChanges(changes);
    
    // Se houver apenas um tipo, mensagem específica
    if (grouped.size === 1) {
      const [type, files] = grouped.entries().next().value;
      return this.generateSpecificMessage(type, files);
    }

    // Múltiplos tipos - mensagem genérica
    return this.generateGenericMessage(changes);
  }

  getPriority(): number {
    return 2;
  }

  private groupChanges(changes: FileChange[]): Map<string, FileChange[]> {
    const grouped = new Map<string, FileChange[]>();

    changes.forEach(change => {
      const type = this.detectChangeType(change);
      
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      
      grouped.get(type)!.push(change);
    });

    return grouped;
  }

  private detectChangeType(change: FileChange): string {
    const ext = path.extname(change.path);
    const dir = path.dirname(change.path);

    // Detectar por diretório
    if (dir.includes('test') || dir.includes('spec')) return 'test';
    if (dir.includes('docs')) return 'docs';
    if (dir.includes('config')) return 'config';
    if (dir.includes('styles') || dir.includes('css')) return 'style';

    // Detectar por extensão
    switch (ext) {
      case '.md': return 'docs';
      case '.test.ts':
      case '.test.js':
      case '.spec.ts':
      case '.spec.js': return 'test';
      case '.css':
      case '.scss':
      case '.less': return 'style';
      case '.json':
      case '.yml':
      case '.yaml': return 'config';
      default: return 'code';
    }
  }

  private generateSpecificMessage(type: string, files: FileChange[]): string {
    const count = files.length;
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (type) {
      case 'test':
        return `test: update ${count} test file${count > 1 ? 's' : ''} at ${timestamp}`;
      case 'docs':
        return `docs: update documentation (${count} file${count > 1 ? 's' : ''}) at ${timestamp}`;
      case 'style':
        return `style: update styling (${count} file${count > 1 ? 's' : ''}) at ${timestamp}`;
      case 'config':
        return `chore: update configuration files at ${timestamp}`;
      default:
        return `feat: update ${type} (${count} file${count > 1 ? 's' : ''}) at ${timestamp}`;
    }
  }

  private generateGenericMessage(changes: FileChange[]): string {
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `[Auto] Mixed updates: ${changes.length} files at ${timestamp}`;
  }
}

/**
 * Estratégia por tamanho - commit quando atinge certo tamanho
 */
export class SizeBasedStrategy implements CommitStrategy {
  private maxSizeBytes: number;

  constructor(maxSizeMB: number = 10) {
    this.maxSizeBytes = maxSizeMB * 1024 * 1024;
  }

  shouldCommit(changes: FileChange[]): boolean {
    const totalSize = changes.reduce((sum, change) => {
      return sum + (change.size || 0);
    }, 0);

    return totalSize >= this.maxSizeBytes || changes.length > 100;
  }

  generateMessage(changes: FileChange[]): string {
    const totalSize = changes.reduce((sum, change) => sum + (change.size || 0), 0);
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    return `[Auto] Batch commit: ${changes.length} files (${sizeMB}MB)`;
  }

  getPriority(): number {
    return 3;
  }
}

/**
 * Estratégia urgente - commit imediato para arquivos críticos
 */
export class UrgentFileStrategy implements CommitStrategy {
  private criticalPatterns: RegExp[];

  constructor(patterns: string[] = []) {
    this.criticalPatterns = [
      /package\.json$/,
      /package-lock\.json$/,
      /\.env/,
      /docker-compose/,
      /Dockerfile/,
      /.github\/workflows/,
      ...patterns.map(p => new RegExp(p))
    ];
  }

  shouldCommit(changes: FileChange[]): boolean {
    return changes.some(change => 
      this.criticalPatterns.some(pattern => 
        pattern.test(change.path)
      )
    );
  }

  generateMessage(changes: FileChange[]): string {
    const criticalFiles = changes.filter(change =>
      this.criticalPatterns.some(pattern => pattern.test(change.path))
    );

    if (criticalFiles.length === 1) {
      const file = path.basename(criticalFiles[0].path);
      return `[Critical] Update ${file}`;
    }

    return `[Critical] Update ${criticalFiles.length} critical files`;
  }

  getPriority(): number {
    return 10; // Alta prioridade
  }
}

/**
 * Factory para criar estratégias compostas
 */
export class CompositeStrategy implements CommitStrategy {
  private strategies: CommitStrategy[];

  constructor(strategies: CommitStrategy[]) {
    this.strategies = strategies.sort((a, b) => b.getPriority() - a.getPriority());
  }

  shouldCommit(changes: FileChange[]): boolean {
    // Se qualquer estratégia disser sim, fazer commit
    return this.strategies.some(s => s.shouldCommit(changes));
  }

  generateMessage(changes: FileChange[]): string {
    // Usar mensagem da estratégia de maior prioridade que aprovou
    for (const strategy of this.strategies) {
      if (strategy.shouldCommit(changes)) {
        return strategy.generateMessage(changes);
      }
    }

    // Fallback
    return `[Auto] Update ${changes.length} files`;
  }

  getPriority(): number {
    return Math.max(...this.strategies.map(s => s.getPriority()));
  }
}