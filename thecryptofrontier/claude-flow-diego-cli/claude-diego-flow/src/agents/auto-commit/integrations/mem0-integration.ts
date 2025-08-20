/**
 * Integração com Mem0 para memória de longo prazo
 */

import axios, { AxiosInstance } from 'axios';
import { CommitResult, FileChange, NotificationEvent } from '../interfaces';

interface Mem0Memory {
  id?: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  category: string;
}

export class Mem0Integration {
  private api: AxiosInstance;
  private agentId: string;
  private userId: string = 'auto-commit-agent';

  constructor(private agent: any, mem0Url: string = 'http://localhost:8000') {
    this.agentId = 'auto-commit-agent';
    
    this.api = axios.create({
      baseURL: mem0Url,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupEventListeners();
  }

  /**
   * Configura listeners para eventos do agente
   */
  private setupEventListeners(): void {
    // Escutar commits bem-sucedidos
    this.agent.on('commit-success', async (result: CommitResult) => {
      await this.recordCommitMemory(result);
    });

    // Escutar erros
    this.agent.on('commit-error', async (result: CommitResult) => {
      await this.recordErrorMemory(result);
    });

    // Escutar notificações importantes
    this.agent.on('notification', async (event: NotificationEvent) => {
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.recordNotificationMemory(event);
      }
    });
  }

  /**
   * Registra memória de commit
   */
  private async recordCommitMemory(commit: CommitResult): Promise<void> {
    if (!commit.success) return;

    const memory: Mem0Memory = {
      content: `Commit realizado: ${commit.message}`,
      metadata: {
        hash: commit.hash,
        changes: commit.changes,
        timestamp: commit.timestamp,
        type: 'commit'
      },
      timestamp: new Date(),
      category: 'commits'
    };

    await this.addMemory(memory);
  }

  /**
   * Registra memória de erro
   */
  private async recordErrorMemory(error: CommitResult): Promise<void> {
    const memory: Mem0Memory = {
      content: `Erro no commit: ${error.error || error.message}`,
      metadata: {
        error: error.error,
        timestamp: error.timestamp,
        type: 'error'
      },
      timestamp: new Date(),
      category: 'errors'
    };

    await this.addMemory(memory);
  }

  /**
   * Registra memória de notificação
   */
  private async recordNotificationMemory(event: NotificationEvent): Promise<void> {
    const memory: Mem0Memory = {
      content: `${event.type}: ${event.message}`,
      metadata: {
        severity: event.severity,
        details: event.details,
        type: 'notification'
      },
      timestamp: event.timestamp,
      category: 'notifications'
    };

    await this.addMemory(memory);
  }

  /**
   * Adiciona memória ao Mem0
   */
  async addMemory(memory: Mem0Memory): Promise<void> {
    try {
      await this.api.post('/memories', {
        messages: [{
          role: 'assistant',
          content: memory.content
        }],
        user_id: this.userId,
        agent_id: this.agentId,
        metadata: {
          ...memory.metadata,
          category: memory.category,
          timestamp: memory.timestamp.toISOString()
        }
      });

      console.log(`🧠 Memória registrada: ${memory.category}`);
    } catch (error: any) {
      console.error('Erro ao registrar memória:', error.message);
    }
  }

  /**
   * Busca memórias
   */
  async searchMemories(query: string, filters?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Mem0Memory[]> {
    try {
      const params: any = {
        query,
        user_id: this.userId,
        agent_id: this.agentId,
        limit: filters?.limit || 50
      };

      if (filters?.category) {
        params.filters = { category: filters.category };
      }

      const response = await this.api.post('/memories/search', params);
      
      return response.data.memories.map((mem: any) => ({
        id: mem.id,
        content: mem.content,
        metadata: mem.metadata,
        timestamp: new Date(mem.metadata.timestamp),
        category: mem.metadata.category
      }));
    } catch (error: any) {
      console.error('Erro ao buscar memórias:', error.message);
      return [];
    }
  }

  /**
   * Obtém insights baseados nas memórias
   */
  async getInsights(): Promise<{
    patterns: string[];
    suggestions: string[];
    warnings: string[];
  }> {
    try {
      // Buscar memórias recentes
      const recentMemories = await this.searchMemories('', {
        limit: 100
      });

      // Analisar padrões
      const patterns: string[] = [];
      const suggestions: string[] = [];
      const warnings: string[] = [];

      // Contar erros frequentes
      const errors = recentMemories.filter(m => m.category === 'errors');
      const errorCounts = new Map<string, number>();
      
      errors.forEach(error => {
        const msg = error.content;
        errorCounts.set(msg, (errorCounts.get(msg) || 0) + 1);
      });

      // Identificar padrões de erro
      errorCounts.forEach((count, error) => {
        if (count >= 3) {
          warnings.push(`Erro recorrente detectado: ${error} (${count} vezes)`);
        }
      });

      // Analisar commits
      const commits = recentMemories.filter(m => m.category === 'commits');
      
      // Padrão de horário
      const hourCounts = new Map<number, number>();
      commits.forEach(commit => {
        const hour = commit.timestamp.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });

      const mostActiveHour = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostActiveHour) {
        patterns.push(`Horário mais ativo: ${mostActiveHour[0]}h (${mostActiveHour[1]} commits)`);
      }

      // Sugestões baseadas em padrões
      if (errors.length > commits.length * 0.3) {
        suggestions.push('Alta taxa de erros detectada. Verifique a configuração do Git e SSH.');
      }

      if (commits.length === 0 && recentMemories.length > 0) {
        suggestions.push('Nenhum commit recente. Verifique se o agente está funcionando corretamente.');
      }

      // Analisar notificações críticas
      const criticalNotifications = recentMemories.filter(
        m => m.category === 'notifications' && 
        (m.metadata.severity === 'high' || m.metadata.severity === 'critical')
      );

      if (criticalNotifications.length > 0) {
        warnings.push(`${criticalNotifications.length} notificações críticas recentes`);
      }

      return { patterns, suggestions, warnings };
    } catch (error: any) {
      console.error('Erro ao gerar insights:', error.message);
      return { patterns: [], suggestions: [], warnings: [] };
    }
  }

  /**
   * Registra evento customizado
   */
  async recordEvent(event: {
    type: string;
    data: any;
  }): Promise<void> {
    const memory: Mem0Memory = {
      content: `Evento ${event.type}`,
      metadata: {
        ...event.data,
        eventType: event.type
      },
      timestamp: new Date(),
      category: 'events'
    };

    await this.addMemory(memory);
  }

  /**
   * Limpa memórias antigas
   */
  async cleanupOldMemories(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Buscar memórias antigas
      const oldMemories = await this.searchMemories('', {
        endDate: cutoffDate,
        limit: 1000
      });

      let deletedCount = 0;
      for (const memory of oldMemories) {
        if (memory.id) {
          try {
            await this.api.delete(`/memories/${memory.id}`);
            deletedCount++;
          } catch (error) {
            console.error(`Erro ao deletar memória ${memory.id}:`, error);
          }
        }
      }

      console.log(`🧹 ${deletedCount} memórias antigas removidas`);
      return deletedCount;
    } catch (error: any) {
      console.error('Erro ao limpar memórias:', error.message);
      return 0;
    }
  }

  /**
   * Testa conexão com Mem0
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/health');
      console.log('✅ Conexão com Mem0 estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com Mem0:', error);
      return false;
    }
  }
}