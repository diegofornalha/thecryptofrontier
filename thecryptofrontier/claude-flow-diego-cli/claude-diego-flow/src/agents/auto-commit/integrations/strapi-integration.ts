/**
 * Integração com Strapi para persistência de dados
 */

import axios, { AxiosInstance } from 'axios';
import { StrapiCommitRecord, FileChange } from '../interfaces';

export class StrapiIntegration {
  private api: AxiosInstance;
  private collectionName = 'auto-commit-records';

  constructor(strapiUrl: string, apiToken?: string) {
    this.api = axios.create({
      baseURL: strapiUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken && { 'Authorization': `Bearer ${apiToken}` })
      }
    });
  }

  /**
   * Registra um commit no Strapi
   */
  async recordCommit(record: StrapiCommitRecord): Promise<void> {
    try {
      await this.api.post(`/api/${this.collectionName}`, {
        data: {
          hash: record.hash,
          message: record.message,
          changes: JSON.stringify(record.changes),
          timestamp: record.timestamp,
          author: record.author,
          branch: record.branch,
          repository: record.repository,
          changesCount: record.changes.length
        }
      });
      
      console.log(`📝 Commit registrado no Strapi: ${record.hash}`);
    } catch (error: any) {
      console.error('Erro ao registrar commit no Strapi:', error.message);
      
      // Se a collection não existir, tentar criar
      if (error.response?.status === 404) {
        await this.createCollection();
        // Tentar novamente
        await this.recordCommit(record);
      }
    }
  }

  /**
   * Busca histórico de commits
   */
  async getCommitHistory(filters?: {
    repository?: string;
    branch?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<StrapiCommitRecord[]> {
    try {
      const params: any = {
        sort: 'timestamp:desc',
        pagination: {
          limit: filters?.limit || 100
        }
      };

      // Adicionar filtros
      const filterConditions: any = {};
      
      if (filters?.repository) {
        filterConditions.repository = { $eq: filters.repository };
      }
      
      if (filters?.branch) {
        filterConditions.branch = { $eq: filters.branch };
      }
      
      if (filters?.startDate || filters?.endDate) {
        filterConditions.timestamp = {};
        if (filters.startDate) {
          filterConditions.timestamp.$gte = filters.startDate.toISOString();
        }
        if (filters.endDate) {
          filterConditions.timestamp.$lte = filters.endDate.toISOString();
        }
      }

      if (Object.keys(filterConditions).length > 0) {
        params.filters = filterConditions;
      }

      const response = await this.api.get(`/api/${this.collectionName}`, { params });
      
      return response.data.data.map((item: any) => ({
        id: item.id,
        hash: item.attributes.hash,
        message: item.attributes.message,
        changes: JSON.parse(item.attributes.changes || '[]'),
        timestamp: new Date(item.attributes.timestamp),
        author: item.attributes.author,
        branch: item.attributes.branch,
        repository: item.attributes.repository
      }));
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error.message);
      return [];
    }
  }

  /**
   * Obtém estatísticas agregadas
   */
  async getStatistics(repository?: string): Promise<{
    totalCommits: number;
    totalChanges: number;
    mostActiveHour: number;
    mostActiveDay: string;
    averageChangesPerCommit: number;
    topFiles: Array<{ path: string; count: number }>;
  }> {
    try {
      const history = await this.getCommitHistory({ 
        repository, 
        limit: 1000 
      });

      // Calcular estatísticas
      const totalCommits = history.length;
      const totalChanges = history.reduce((sum, commit) => sum + commit.changes.length, 0);
      
      // Hora mais ativa
      const hourCounts = new Map<number, number>();
      history.forEach(commit => {
        const hour = commit.timestamp.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });
      const mostActiveHour = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

      // Dia mais ativo
      const dayCounts = new Map<string, number>();
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      history.forEach(commit => {
        const day = days[commit.timestamp.getDay()];
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      });
      const mostActiveDay = Array.from(dayCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Segunda';

      // Arquivos mais modificados
      const fileCounts = new Map<string, number>();
      history.forEach(commit => {
        commit.changes.forEach(change => {
          fileCounts.set(change.path, (fileCounts.get(change.path) || 0) + 1);
        });
      });
      const topFiles = Array.from(fileCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }));

      return {
        totalCommits,
        totalChanges,
        mostActiveHour,
        mostActiveDay,
        averageChangesPerCommit: totalCommits > 0 ? totalChanges / totalCommits : 0,
        topFiles
      };
    } catch (error: any) {
      console.error('Erro ao calcular estatísticas:', error.message);
      return {
        totalCommits: 0,
        totalChanges: 0,
        mostActiveHour: 0,
        mostActiveDay: 'Segunda',
        averageChangesPerCommit: 0,
        topFiles: []
      };
    }
  }

  /**
   * Cria collection no Strapi (se não existir)
   */
  private async createCollection(): Promise<void> {
    console.log('📋 Tentando criar collection no Strapi...');
    
    // Esta é uma representação do que seria necessário
    // Em produção, a collection deve ser criada via Strapi Admin ou API de Content-Type Builder
    const collectionSchema = {
      singularName: 'auto-commit-record',
      pluralName: 'auto-commit-records',
      displayName: 'Auto Commit Record',
      attributes: {
        hash: {
          type: 'string',
          required: true,
          unique: true
        },
        message: {
          type: 'text',
          required: true
        },
        changes: {
          type: 'json'
        },
        changesCount: {
          type: 'integer'
        },
        timestamp: {
          type: 'datetime',
          required: true
        },
        author: {
          type: 'string',
          required: true
        },
        branch: {
          type: 'string',
          required: true
        },
        repository: {
          type: 'string',
          required: true
        }
      }
    };

    console.log('Schema da collection:', JSON.stringify(collectionSchema, null, 2));
    console.log('⚠️  Por favor, crie esta collection manualmente no Strapi Admin');
  }

  /**
   * Testa conexão com Strapi
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/api');
      console.log('✅ Conexão com Strapi estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com Strapi:', error);
      return false;
    }
  }

  /**
   * Limpa registros antigos
   */
  async cleanupOldRecords(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const oldRecords = await this.getCommitHistory({
        endDate: cutoffDate
      });

      let deletedCount = 0;
      for (const record of oldRecords) {
        if (record.id) {
          await this.api.delete(`/api/${this.collectionName}/${record.id}`);
          deletedCount++;
        }
      }

      console.log(`🧹 ${deletedCount} registros antigos removidos`);
      return deletedCount;
    } catch (error: any) {
      console.error('Erro ao limpar registros:', error.message);
      return 0;
    }
  }
}