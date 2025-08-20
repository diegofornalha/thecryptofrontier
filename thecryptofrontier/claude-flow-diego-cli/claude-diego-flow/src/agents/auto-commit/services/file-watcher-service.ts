/**
 * Serviço de monitoramento de arquivos
 */

import * as chokidar from 'chokidar';
import * as path from 'path';
import { FileChange } from '../interfaces';
import { EventEmitter } from 'events';

export interface WatcherOptions {
  ignored?: string[];
  persistent?: boolean;
  ignoreInitial?: boolean;
  awaitWriteFinish?: {
    stabilityThreshold?: number;
    pollInterval?: number;
  };
  depth?: number;
  followSymlinks?: boolean;
}

export class FileWatcherService extends EventEmitter {
  private watcher?: chokidar.FSWatcher;
  private watchPath: string;
  private options: WatcherOptions;
  private pendingChanges: Map<string, FileChange> = new Map();
  private debounceTimer?: NodeJS.Timeout;
  private debounceTime: number;

  constructor(watchPath: string, debounceTime: number = 3000) {
    super();
    this.watchPath = watchPath;
    this.debounceTime = debounceTime;
    
    // Configurações padrão
    this.options = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/*.log',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/.diego-tools/**'
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      },
      depth: 10,
      followSymlinks: false
    };
  }

  /**
   * Inicia o monitoramento
   */
  start(customIgnored?: string[]): void {
    if (this.watcher) {
      this.stop();
    }

    // Adicionar padrões customizados de ignore
    if (customIgnored) {
      this.options.ignored = [
        ...(this.options.ignored as string[]),
        ...customIgnored
      ];
    }

    this.watcher = chokidar.watch(this.watchPath, this.options);

    // Configurar eventos
    this.watcher
      .on('add', (filePath) => this.handleChange('added', filePath))
      .on('change', (filePath) => this.handleChange('modified', filePath))
      .on('unlink', (filePath) => this.handleChange('deleted', filePath))
      .on('error', (error) => this.emit('error', error))
      .on('ready', () => {
        this.emit('ready');
        console.log(`🔍 Monitorando: ${this.watchPath}`);
      });
  }

  /**
   * Para o monitoramento
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    this.pendingChanges.clear();
    this.emit('stopped');
  }

  /**
   * Pausa o monitoramento temporariamente
   */
  pause(): void {
    if (this.watcher) {
      this.watcher.unwatch(this.watchPath);
      this.emit('paused');
    }
  }

  /**
   * Resume o monitoramento
   */
  resume(): void {
    if (this.watcher) {
      this.watcher.add(this.watchPath);
      this.emit('resumed');
    }
  }

  /**
   * Adiciona padrão de ignore
   */
  addIgnorePattern(pattern: string): void {
    if (Array.isArray(this.options.ignored)) {
      this.options.ignored.push(pattern);
      
      // Recriar watcher se estiver ativo
      if (this.watcher) {
        this.stop();
        this.start();
      }
    }
  }

  /**
   * Remove padrão de ignore
   */
  removeIgnorePattern(pattern: string): void {
    if (Array.isArray(this.options.ignored)) {
      this.options.ignored = this.options.ignored.filter(p => p !== pattern);
      
      // Recriar watcher se estiver ativo
      if (this.watcher) {
        this.stop();
        this.start();
      }
    }
  }

  /**
   * Obtém mudanças pendentes
   */
  getPendingChanges(): FileChange[] {
    return Array.from(this.pendingChanges.values());
  }

  /**
   * Limpa mudanças pendentes
   */
  clearPendingChanges(): void {
    this.pendingChanges.clear();
  }

  /**
   * Define tempo de debounce
   */
  setDebounceTime(ms: number): void {
    this.debounceTime = ms;
  }

  /**
   * Verifica se está monitorando
   */
  isWatching(): boolean {
    return this.watcher !== undefined;
  }

  /**
   * Obtém estatísticas
   */
  getStats(): {
    watchedPaths: number;
    pendingChanges: number;
    isActive: boolean;
  } {
    const watchedPaths = this.watcher 
      ? Object.keys(this.watcher.getWatched()).length 
      : 0;

    return {
      watchedPaths,
      pendingChanges: this.pendingChanges.size,
      isActive: this.isWatching()
    };
  }

  /**
   * Processa mudança de arquivo
   */
  private handleChange(action: 'added' | 'modified' | 'deleted', filePath: string): void {
    // Criar objeto de mudança
    const change: FileChange = {
      action,
      path: filePath,
      timestamp: new Date(),
      type: path.extname(filePath)
    };

    // Adicionar às mudanças pendentes
    this.pendingChanges.set(filePath, change);

    // Emitir evento de mudança individual
    this.emit('file-change', change);

    // Reset debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Configurar novo timer
    this.debounceTimer = setTimeout(() => {
      this.processPendingChanges();
    }, this.debounceTime);
  }

  /**
   * Processa mudanças acumuladas
   */
  private processPendingChanges(): void {
    if (this.pendingChanges.size === 0) return;

    const changes = Array.from(this.pendingChanges.values());
    
    // Emitir evento com todas as mudanças
    this.emit('changes-detected', changes);

    // Limpar após emitir
    // Não limpar automaticamente - deixar para o consumidor decidir
  }

  /**
   * Filtra mudanças por tipo
   */
  filterChangesByType(changes: FileChange[], extensions: string[]): FileChange[] {
    return changes.filter(change => {
      const ext = path.extname(change.path);
      return extensions.includes(ext);
    });
  }

  /**
   * Agrupa mudanças por diretório
   */
  groupChangesByDirectory(changes: FileChange[]): Map<string, FileChange[]> {
    const grouped = new Map<string, FileChange[]>();

    changes.forEach(change => {
      const dir = path.dirname(change.path);
      
      if (!grouped.has(dir)) {
        grouped.set(dir, []);
      }
      
      grouped.get(dir)!.push(change);
    });

    return grouped;
  }

  /**
   * Obtém sumário de mudanças
   */
  getChangesSummary(changes: FileChange[]): {
    added: number;
    modified: number;
    deleted: number;
    byType: Map<string, number>;
  } {
    const summary = {
      added: 0,
      modified: 0,
      deleted: 0,
      byType: new Map<string, number>()
    };

    changes.forEach(change => {
      // Contar por ação
      summary[change.action]++;

      // Contar por tipo
      const ext = path.extname(change.path) || 'no-extension';
      summary.byType.set(ext, (summary.byType.get(ext) || 0) + 1);
    });

    return summary;
  }
}