/**
 * Serviço de Notificações para o Auto Commit Agent
 */

import { EventEmitter } from 'events';
import { NotificationEvent } from '../interfaces';
import * as fs from 'fs';
import * as path from 'path';

export interface NotificationHandler {
  handle(event: NotificationEvent): Promise<void>;
}

export class NotificationService extends EventEmitter {
  private handlers: Map<string, NotificationHandler[]> = new Map();
  private history: NotificationEvent[] = [];
  private maxHistorySize: number = 1000;
  private persistPath?: string;

  constructor(persistPath?: string) {
    super();
    this.persistPath = persistPath;
    
    // Carregar histórico se houver
    if (persistPath) {
      this.loadHistory();
    }

    // Handler padrão para console
    this.registerHandler('console', new ConsoleHandler());
  }

  /**
   * Registra um handler de notificação
   */
  registerHandler(name: string, handler: NotificationHandler): void {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, []);
    }
    
    this.handlers.get(name)!.push(handler);
  }

  /**
   * Remove um handler
   */
  removeHandler(name: string): void {
    this.handlers.delete(name);
  }

  /**
   * Envia notificação
   */
  async notify(event: NotificationEvent): Promise<void> {
    // Adicionar ao histórico
    this.addToHistory(event);

    // Emitir evento
    this.emit('notification', event);
    this.emit(`notification:${event.type}`, event);

    // Processar com handlers
    const promises: Promise<void>[] = [];
    
    for (const [name, handlers] of this.handlers) {
      for (const handler of handlers) {
        promises.push(
          handler.handle(event).catch(error => {
            console.error(`Error in handler ${name}:`, error);
          })
        );
      }
    }

    await Promise.all(promises);
  }

  /**
   * Obtém histórico de notificações
   */
  getHistory(filter?: {
    type?: NotificationEvent['type'];
    severity?: NotificationEvent['severity'];
    startDate?: Date;
    endDate?: Date;
  }): NotificationEvent[] {
    let filtered = this.history;

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(e => e.type === filter.type);
      }
      
      if (filter.severity) {
        filtered = filtered.filter(e => e.severity === filter.severity);
      }
      
      if (filter.startDate) {
        filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
      }
      
      if (filter.endDate) {
        filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
      }
    }

    return filtered;
  }

  /**
   * Limpa histórico
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  /**
   * Obtém estatísticas
   */
  getStats(): {
    total: number;
    byType: Map<string, number>;
    bySeverity: Map<string, number>;
    lastNotification?: NotificationEvent;
  } {
    const stats = {
      total: this.history.length,
      byType: new Map<string, number>(),
      bySeverity: new Map<string, number>(),
      lastNotification: this.history[this.history.length - 1]
    };

    for (const event of this.history) {
      // Por tipo
      stats.byType.set(event.type, (stats.byType.get(event.type) || 0) + 1);
      
      // Por severidade
      stats.bySeverity.set(event.severity, (stats.bySeverity.get(event.severity) || 0) + 1);
    }

    return stats;
  }

  /**
   * Adiciona ao histórico
   */
  private addToHistory(event: NotificationEvent): void {
    this.history.push(event);

    // Limitar tamanho do histórico
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }

    // Salvar se configurado
    if (this.persistPath) {
      this.saveHistory();
    }
  }

  /**
   * Carrega histórico do disco
   */
  private loadHistory(): void {
    if (!this.persistPath) return;

    try {
      if (fs.existsSync(this.persistPath)) {
        const data = fs.readFileSync(this.persistPath, 'utf-8');
        const loaded = JSON.parse(data);
        
        // Converter timestamps
        this.history = loaded.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de notificações:', error);
    }
  }

  /**
   * Salva histórico no disco
   */
  private saveHistory(): void {
    if (!this.persistPath) return;

    try {
      const dir = path.dirname(this.persistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.persistPath,
        JSON.stringify(this.history, null, 2)
      );
    } catch (error) {
      console.error('Erro ao salvar histórico de notificações:', error);
    }
  }
}

/**
 * Handler para console
 */
class ConsoleHandler implements NotificationHandler {
  async handle(event: NotificationEvent): Promise<void> {
    const icon = this.getIcon(event.type);
    const color = this.getColor(event.severity);
    
    console.log(
      `${icon} [${event.timestamp.toLocaleTimeString()}] ${color}${event.message}\x1b[0m`
    );

    if (event.details) {
      console.log('  Details:', JSON.stringify(event.details, null, 2));
    }
  }

  private getIcon(type: NotificationEvent['type']): string {
    switch (type) {
      case 'commit': return '📝';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'ssh-failure': return '🔐';
      default: return '📢';
    }
  }

  private getColor(severity: NotificationEvent['severity']): string {
    switch (severity) {
      case 'critical': return '\x1b[31m'; // Red
      case 'high': return '\x1b[33m'; // Yellow
      case 'medium': return '\x1b[36m'; // Cyan
      case 'low': return '\x1b[32m'; // Green
      default: return '\x1b[0m'; // Reset
    }
  }
}

/**
 * Handler para arquivo
 */
export class FileHandler implements NotificationHandler {
  private logPath: string;

  constructor(logPath: string) {
    this.logPath = logPath;
  }

  async handle(event: NotificationEvent): Promise<void> {
    const line = `[${event.timestamp.toISOString()}] [${event.type}] [${event.severity}] ${event.message}\n`;
    
    fs.appendFileSync(this.logPath, line);
  }
}

/**
 * Handler para webhook
 */
export class WebhookHandler implements NotificationHandler {
  private url: string;
  private headers: Record<string, string>;

  constructor(url: string, headers?: Record<string, string>) {
    this.url = url;
    this.headers = headers || {};
  }

  async handle(event: NotificationEvent): Promise<void> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }
}