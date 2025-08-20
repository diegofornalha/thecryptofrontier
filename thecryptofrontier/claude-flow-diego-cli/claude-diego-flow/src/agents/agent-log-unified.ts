/**
 * Agent Log Unified - Sistema Unificado de Logging de Agentes
 * 
 * Combina o melhor dos 3 sistemas existentes:
 * - agent-log.ts: Sistema completo com análise e persistência
 * - agent-log-conversational.ts: Formato conversacional estruturado
 * - agent-log-simple.ts: API REST simples e direta
 * 
 * Características:
 * - Persistência via Mem0/GuardianMemoryManagerOSS
 * - Suporte a múltiplos formatos (texto, conversacional, estruturado)
 * - API REST unificada
 * - Integração automática com Guardian
 * - Estatísticas e análise de performance
 */

import { BaseAgent, Task } from '../core/base-agent-simple';
import { AgentType } from '../core/agent-types';
import { createAgentMemory } from './memory-enhanced-agents';
import { MemoryNamespaces } from '../constants/memory-constants';
import { GuardianMemoryManagerOSS } from '../utils/guardian-memory-oss';
import express from 'express';
import cors from 'cors';

// Tipos unificados
interface UnifiedLogEntry {
  // Identificação
  id: string;
  agentName: string;
  agentType: AgentType;
  taskId: string;
  
  // Temporal
  timestamp: Date;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Conteúdo
  level: 'info' | 'warn' | 'error' | 'debug' | 'task' | 'plan' | 'progress';
  content: string;
  format: 'text' | 'conversational' | 'structured';
  
  // Estado
  status: 'started' | 'in_progress' | 'completed' | 'error';
  
  // Contexto
  context?: {
    taskDescription?: string;
    taskType?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    parentTaskId?: string;
    childTaskIds?: string[];
    gitContext?: {
      filesChanged: number;
      insertions: number;
      deletions: number;
      branch: string;
    };
  };
  
  // Conversacional (opcional)
  conversation?: {
    messages: Array<{
      role: 'system' | 'agent' | 'task' | 'result' | 'error' | 'context';
      content: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
  };
  
  // Resultado e erro
  result?: any;
  error?: string;
  
  // Metadata extensível
  metadata?: Record<string, any>;
}

interface AgentStats {
  totalExecutions: number;
  lastExecution: Date;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  errorCount: number;
  byTaskType?: Record<string, number>;
  byComplexity?: Record<string, number>;
}

interface PipelineReport {
  reportGeneratedAt: string;
  period: {
    hours: number;
    from: string;
    to: string;
  };
  summary: {
    totalExecutions: number;
    uniqueAgents: number;
    successRate: number;
    totalDuration: number;
    averageDuration: number;
  };
  agentPerformance: Array<{
    agentName: string;
    stats: AgentStats;
  }>;
  taskStatistics: Array<{
    taskType: string;
    complexity: string;
    count: number;
    avgDuration: number;
    successRate: number;
  }>;
  recentErrors: Array<{
    agentName: string;
    task: string;
    error: string;
    timestamp: string;
  }>;
}

export class UnifiedAgentLog extends BaseAgent {
  private memory;
  private ossMemory: GuardianMemoryManagerOSS;
  private activeEntries: Map<string, UnifiedLogEntry> = new Map();
  private conversationCache: Map<string, Array<any>> = new Map();
  private app?: express.Application;
  private autoLogEnabled: boolean = true;
  private USE_MOCK = process.env.AGENT_LOG_MOCK === 'true';
  
  constructor(bridgeUrl: string = process.env.OSS_BRIDGE_URL || 'http://localhost:3002') {
    super({
      name: 'Unified Agent Log',
      type: AgentType.ANALYST,
      description: 'Sistema unificado de logging e análise de agentes',
      enableLogging: false // Evitar loop infinito
    });
    
    // Dupla persistência: memória local e OSS
    this.memory = createAgentMemory('UnifiedAgentLog');
    this.ossMemory = new GuardianMemoryManagerOSS(bridgeUrl);
  }
  
  /**
   * Log automático quando Guardian cria um plano
   */
  async logPlan(plan: {
    agentName: string;
    tasks: Task[];
    metadata?: any;
  }): Promise<void> {
    if (!this.autoLogEnabled) return;
    
    const planId = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const planEntry: UnifiedLogEntry = {
      id: planId,
      agentName: plan.agentName,
      agentType: AgentType.COORDINATOR,
      taskId: planId,
      timestamp: new Date(),
      startTime: new Date(),
      level: 'plan',
      content: `Plano criado com ${plan.tasks.length} tarefas`,
      format: 'structured',
      status: 'started',
      context: {
        taskDescription: 'Criação de plano de execução',
        taskType: 'planning',
        complexity: plan.tasks.length > 5 ? 'complex' : 
                   plan.tasks.length > 2 ? 'medium' : 'simple',
        childTaskIds: plan.tasks.map(t => t.id)
      },
      metadata: {
        ...plan.metadata,
        taskCount: plan.tasks.length,
        tasks: plan.tasks.map(t => ({
          id: t.id,
          description: t.description,
          type: t.type,
          assignedAgent: t.assignedAgent
        }))
      }
    };
    
    await this.saveLog(planEntry);
    
    // Criar conversação para o plano
    this.conversationCache.set(planId, [{
      role: 'system',
      content: `Guardian iniciou plano com ${plan.tasks.length} tarefas`,
      timestamp: new Date().toISOString(),
      metadata: { planId, taskCount: plan.tasks.length }
    }]);
    
    // Logar cada tarefa do plano
    for (const task of plan.tasks) {
      await this.logTaskStart({
        agentName: task.assignedAgent || plan.agentName,
        agentType: task.agentType || AgentType.IMPLEMENTER,
        taskId: task.id,
        taskDescription: task.description,
        parentTaskId: planId,
        taskType: task.type,
        complexity: task.complexity
      });
    }
  }
  
  /**
   * Log de início de tarefa (compatível com agent-log.ts)
   */
  async logAgentStart(
    agentName: string,
    agentType: AgentType,
    taskId: string,
    taskDescription: string,
    metadata?: any
  ): Promise<void> {
    return this.logTaskStart({
      agentName,
      agentType,
      taskId,
      taskDescription,
      taskType: metadata?.taskType,
      complexity: metadata?.complexity,
      parentTaskId: metadata?.parentTaskId
    });
  }
  
  /**
   * Log de início de tarefa (novo formato unificado)
   */
  async logTaskStart(params: {
    agentName: string;
    agentType: AgentType;
    taskId: string;
    taskDescription: string;
    parentTaskId?: string;
    taskType?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    metadata?: any;
  }): Promise<void> {
    const entry: UnifiedLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentName: params.agentName,
      agentType: params.agentType,
      taskId: params.taskId,
      timestamp: new Date(),
      startTime: new Date(),
      level: 'task',
      content: `Iniciando: ${params.taskDescription}`,
      format: 'text',
      status: 'started',
      context: {
        taskDescription: params.taskDescription,
        taskType: params.taskType,
        complexity: params.complexity || 'medium',
        parentTaskId: params.parentTaskId
      },
      metadata: params.metadata
    };
    
    this.activeEntries.set(params.taskId, entry);
    
    // Iniciar conversação se for formato conversacional
    if (!this.conversationCache.has(params.taskId)) {
      this.conversationCache.set(params.taskId, []);
    }
    
    this.conversationCache.get(params.taskId)!.push({
      role: 'system',
      content: `${params.agentName} iniciou: ${params.taskDescription}`,
      timestamp: new Date().toISOString(),
      metadata: { action: 'start' }
    });
    
    await this.saveLog(entry);
    console.log(`[UnifiedLog] ${params.agentName} iniciou: ${params.taskDescription}`);
  }
  
  /**
   * Log de progresso (compatível com conversational)
   */
  async logProgress(
    taskId: string,
    progressDescription: string,
    metadata?: any
  ): Promise<void> {
    const entry = this.activeEntries.get(taskId);
    if (!entry) {
      console.warn(`[UnifiedLog] Tarefa não encontrada para progresso: ${taskId}`);
      return;
    }
    
    // Adicionar à conversação
    const conversation = this.conversationCache.get(taskId) || [];
    conversation.push({
      role: 'agent',
      content: `Progresso: ${progressDescription}`,
      timestamp: new Date().toISOString(),
      metadata
    });
    this.conversationCache.set(taskId, conversation);
    
    // Log de progresso
    const progressLog: UnifiedLogEntry = {
      ...entry,
      id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'progress',
      content: progressDescription,
      status: 'in_progress',
      metadata: { ...entry.metadata, ...metadata }
    };
    
    await this.saveLog(progressLog);
    console.log(`[UnifiedLog] Progresso: ${progressDescription}`);
  }
  
  /**
   * Log de fim de tarefa (compatível com agent-log.ts)
   */
  async logAgentEnd(
    agentName: string,
    taskId: string,
    status: 'completed' | 'error',
    error?: string,
    metadata?: any
  ): Promise<void> {
    if (status === 'completed') {
      return this.logTaskComplete(taskId, metadata?.result, metadata);
    } else {
      return this.logError(taskId, error || 'Erro desconhecido', metadata);
    }
  }
  
  /**
   * Log de conclusão de tarefa
   */
  async logTaskComplete(taskId: string, result?: any, metadata?: any): Promise<void> {
    const entry = this.activeEntries.get(taskId);
    if (!entry) {
      console.warn(`[UnifiedLog] Tarefa não encontrada para completar: ${taskId}`);
      return;
    }
    
    entry.endTime = new Date();
    entry.duration = entry.endTime.getTime() - entry.startTime.getTime();
    entry.status = 'completed';
    entry.content = `Concluído: ${entry.context?.taskDescription} (${entry.duration}ms)`;
    entry.result = result;
    
    if (metadata) {
      entry.metadata = { ...entry.metadata, ...metadata };
    }
    
    // Adicionar conversação final
    const conversation = this.conversationCache.get(taskId) || [];
    conversation.push({
      role: 'result',
      content: result ? JSON.stringify(result) : 'Tarefa completada com sucesso',
      timestamp: new Date().toISOString(),
      metadata: { duration: entry.duration }
    });
    
    conversation.push({
      role: 'system',
      content: `Execução completada em ${entry.duration}ms`,
      timestamp: new Date().toISOString(),
      metadata: { status: 'completed' }
    });
    
    entry.conversation = { messages: conversation };
    
    await this.saveLog(entry);
    this.activeEntries.delete(taskId);
    this.conversationCache.delete(taskId);
    
    console.log(`[UnifiedLog] ${entry.agentName} completou: ${entry.context?.taskDescription} (${entry.duration}ms)`);
  }
  
  /**
   * Log de erro
   */
  async logError(taskId: string, error: Error | string, metadata?: any): Promise<void> {
    const entry = this.activeEntries.get(taskId);
    if (!entry) {
      // Criar entrada de erro mesmo sem início
      const errorEntry: UnifiedLogEntry = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agentName: 'Unknown',
        agentType: AgentType.UTILITY,
        taskId,
        timestamp: new Date(),
        startTime: new Date(),
        level: 'error',
        content: `Erro: ${error instanceof Error ? error.message : error}`,
        format: 'text',
        status: 'error',
        error: error instanceof Error ? error.stack : error,
        metadata
      };
      
      await this.saveLog(errorEntry);
      return;
    }
    
    entry.endTime = new Date();
    entry.duration = entry.endTime.getTime() - entry.startTime.getTime();
    entry.status = 'error';
    entry.level = 'error';
    entry.content = `Erro: ${error instanceof Error ? error.message : error}`;
    entry.error = error instanceof Error ? error.stack : error;
    
    if (metadata) {
      entry.metadata = { ...entry.metadata, ...metadata };
    }
    
    // Adicionar conversação de erro
    const conversation = this.conversationCache.get(taskId) || [];
    conversation.push({
      role: 'error',
      content: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
      metadata: { stack: error instanceof Error ? error.stack : undefined }
    });
    
    conversation.push({
      role: 'system',
      content: `Execução falhou após ${entry.duration}ms`,
      timestamp: new Date().toISOString(),
      metadata: { status: 'error' }
    });
    
    entry.conversation = { messages: conversation };
    
    await this.saveLog(entry);
    this.activeEntries.delete(taskId);
    this.conversationCache.delete(taskId);
    
    console.error(`[UnifiedLog] ${entry.agentName} erro: ${entry.content}`);
  }
  
  /**
   * Salvar log na memória persistente
   */
  private async saveLog(entry: UnifiedLogEntry): Promise<void> {
    try {
      // Salvar no sistema de memória local
      await this.memory.remember(
        `${entry.agentName} ${entry.level}: ${entry.content}`,
        {
          category: 'agent-execution-log',
          tags: [entry.level, entry.agentName, entry.agentType, entry.status],
          ...entry
        }
      );
      
      // Tentar salvar no OSS também
      try {
        await this.ossMemory.recordAgentInteraction(
          entry.agentName,
          entry.taskId,
          entry.status,
          entry.content,
          entry
        );
        
        // Se tiver conversação, salvar também
        if (entry.conversation && entry.conversation.messages.length > 0) {
          await this.ossMemory.addConversation(entry.conversation.messages, {
            agentName: entry.agentName,
            agentType: entry.agentType,
            taskId: entry.taskId,
            duration: entry.duration,
            status: entry.status
          });
        }
      } catch (ossError) {
        console.warn('[UnifiedLog] Falha ao salvar no OSS, usando apenas memória local:', ossError);
      }
      
    } catch (error) {
      console.error('[UnifiedLog] Erro ao salvar log:', error);
    }
  }
  
  /**
   * Obter histórico de agente (compatível com agent-log.ts)
   */
  async getAgentHistory(agentName: string, limit: number = 50): Promise<UnifiedLogEntry[]> {
    try {
      const results = await this.memory.recall(`${agentName} agent-execution-log`);
      
      if (!results || !results.results || !Array.isArray(results.results)) {
        return Array.from(this.activeEntries.values())
          .filter(e => e.agentName === agentName)
          .slice(0, limit);
      }
      
      return results.results
        .filter(r => r.metadata?.agentName === agentName)
        .map(r => r.metadata as UnifiedLogEntry)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, limit);
    } catch (error) {
      console.warn(`[UnifiedLog] Erro ao obter histórico de ${agentName}:`, error);
      return [];
    }
  }
  
  /**
   * Obter estatísticas de agente (compatível com agent-log.ts)
   */
  async getAgentStats(agentName: string): Promise<AgentStats | null> {
    const history = await this.getAgentHistory(agentName, 1000);
    
    if (history.length === 0) {
      return null;
    }
    
    const completedExecutions = history.filter(h => h.status === 'completed' && h.duration);
    const errorCount = history.filter(h => h.status === 'error').length;
    
    const durations = completedExecutions.map(h => h.duration!).filter(d => d > 0);
    
    if (durations.length === 0) {
      return {
        totalExecutions: history.length,
        lastExecution: new Date(history[0].startTime),
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        errorCount
      };
    }
    
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    // Estatísticas por tipo de tarefa
    const byTaskType: Record<string, number> = {};
    const byComplexity: Record<string, number> = {};
    
    history.forEach(h => {
      if (h.context?.taskType) {
        byTaskType[h.context.taskType] = (byTaskType[h.context.taskType] || 0) + 1;
      }
      if (h.context?.complexity) {
        byComplexity[h.context.complexity] = (byComplexity[h.context.complexity] || 0) + 1;
      }
    });
    
    return {
      totalExecutions: history.length,
      lastExecution: new Date(history[0].startTime),
      averageDuration: Math.round(averageDuration),
      minDuration,
      maxDuration,
      successRate: (completedExecutions.length / history.length) * 100,
      errorCount,
      byTaskType,
      byComplexity
    };
  }
  
  /**
   * Gerar relatório do pipeline
   */
  async generatePipelineReport(hours: number = 24): Promise<PipelineReport> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const memories = await this.memory.listMemories(1000);
      
      const recentLogs = (memories?.memories || [])
        .filter(m => m.metadata?.category === 'agent-execution-log' && 
                    new Date(m.metadata.startTime) > cutoffTime)
        .map(m => m.metadata as UnifiedLogEntry);
      
      // Coletar estatísticas por agente
      const agentStatsMap = new Map<string, AgentStats>();
      const uniqueAgents = new Set(recentLogs.map(l => l.agentName));
      
      for (const agentName of uniqueAgents) {
        const stats = await this.getAgentStats(agentName);
        if (stats) {
          agentStatsMap.set(agentName, stats);
        }
      }
      
      // Estatísticas por tipo de tarefa
      const taskStatsMap = new Map<string, any>();
      recentLogs.forEach(log => {
        if (log.context?.taskType && log.context?.complexity) {
          const key = `${log.context.taskType}-${log.context.complexity}`;
          if (!taskStatsMap.has(key)) {
            taskStatsMap.set(key, {
              taskType: log.context.taskType,
              complexity: log.context.complexity,
              count: 0,
              totalDuration: 0,
              successCount: 0
            });
          }
          
          const stats = taskStatsMap.get(key)!;
          stats.count++;
          if (log.duration) {
            stats.totalDuration += log.duration;
          }
          if (log.status === 'completed') {
            stats.successCount++;
          }
        }
      });
      
      const taskStatistics = Array.from(taskStatsMap.values()).map(stats => ({
        taskType: stats.taskType,
        complexity: stats.complexity,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
        successRate: (stats.successCount / stats.count) * 100
      }));
      
      // Erros recentes
      const recentErrors = recentLogs
        .filter(l => l.status === 'error')
        .slice(0, 10)
        .map(l => ({
          agentName: l.agentName,
          task: l.context?.taskDescription || 'Unknown',
          error: l.error || 'Unknown error',
          timestamp: l.startTime.toISOString()
        }));
      
      const totalDuration = recentLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
      const completedLogs = recentLogs.filter(l => l.status === 'completed');
      
      return {
        reportGeneratedAt: new Date().toISOString(),
        period: {
          hours,
          from: cutoffTime.toISOString(),
          to: new Date().toISOString()
        },
        summary: {
          totalExecutions: recentLogs.length,
          uniqueAgents: uniqueAgents.size,
          successRate: recentLogs.length > 0 
            ? (completedLogs.length / recentLogs.length) * 100
            : 0,
          totalDuration,
          averageDuration: recentLogs.length > 0 ? totalDuration / recentLogs.length : 0
        },
        agentPerformance: Array.from(agentStatsMap.entries()).map(([name, stats]) => ({
          agentName: name,
          stats
        })),
        taskStatistics,
        recentErrors
      };
    } catch (error) {
      console.error('[UnifiedLog] Erro ao gerar relatório:', error);
      return {
        reportGeneratedAt: new Date().toISOString(),
        period: { hours, from: '', to: '' },
        summary: {
          totalExecutions: 0,
          uniqueAgents: 0,
          successRate: 0,
          totalDuration: 0,
          averageDuration: 0
        },
        agentPerformance: [],
        taskStatistics: [],
        recentErrors: []
      };
    }
  }
  
  /**
   * Listar todos os agentes
   */
  async listAllAgents(): Promise<string[]> {
    try {
      const memories = await this.memory.listMemories(1000);
      const agentNames = new Set<string>();
      
      if (memories?.memories) {
        memories.memories.forEach(m => {
          if (m.metadata?.agentName) {
            agentNames.add(m.metadata.agentName);
          }
        });
      }
      
      // Adicionar agentes ativos
      for (const entry of this.activeEntries.values()) {
        agentNames.add(entry.agentName);
      }
      
      return Array.from(agentNames).sort();
    } catch (error) {
      console.warn('[UnifiedLog] Erro ao listar agentes:', error);
      return [];
    }
  }
  
  /**
   * Implementação obrigatória do BaseAgent
   */
  async executeTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'generate_report':
        return await this.generatePipelineReport(task.params?.hours || 24);
      
      case 'get_agent_stats':
        return await this.getAgentStats(task.params?.agentName);
      
      case 'list_agents':
        return await this.listAllAgents();
      
      default:
        return {
          message: 'UnifiedAgentLog está pronto para registrar execuções',
          availableMethods: [
            'logPlan',
            'logAgentStart / logTaskStart',
            'logProgress',
            'logAgentEnd / logTaskComplete / logError',
            'getAgentHistory',
            'getAgentStats',
            'generatePipelineReport'
          ]
        };
    }
  }
  
  /**
   * API REST Unificada
   */
  async startAPI(port: number = 3001): Promise<express.Application> {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    
    // Health check
    this.app.get('/health', async (req, res) => {
      const ossHealth = await this.ossMemory.checkBridgeHealth().catch(() => ({ healthy: false }));
      
      res.json({
        status: 'healthy',
        service: 'unified-agent-log',
        version: '1.0.0',
        mode: this.USE_MOCK ? 'mock' : 'production',
        autoLogEnabled: this.autoLogEnabled,
        activeLogs: this.activeEntries.size,
        ossConnection: ossHealth.healthy,
        timestamp: new Date().toISOString()
      });
    });
    
    // Estatísticas de agente
    this.app.get('/stats/:agentName', async (req, res) => {
      try {
        const stats = await this.getAgentStats(req.params.agentName);
        if (!stats) {
          return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Histórico de agente
    this.app.get('/history/:agentName', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const history = await this.getAgentHistory(req.params.agentName, limit);
        res.json({
          agentName: req.params.agentName,
          history,
          total: history.length
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Relatório do pipeline
    this.app.get('/pipeline-report', async (req, res) => {
      try {
        const hours = parseInt(req.query.hours as string) || 24;
        const report = await this.generatePipelineReport(hours);
        res.json(report);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Lista todos os agentes
    this.app.get('/agents', async (req, res) => {
      try {
        const agents = await this.listAllAgents();
        res.json({ agents, total: agents.length });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Logs ativos
    this.app.get('/logs/active', (req, res) => {
      const active = Array.from(this.activeEntries.values()).map(entry => ({
        id: entry.id,
        agentName: entry.agentName,
        taskId: entry.taskId,
        taskDescription: entry.context?.taskDescription,
        startTime: entry.startTime,
        status: entry.status,
        duration: entry.endTime ? entry.endTime.getTime() - entry.startTime.getTime() : null
      }));
      res.json({ active, total: active.length });
    });
    
    // Buscar logs
    this.app.get('/logs/search', async (req, res) => {
      try {
        const { query, agentName, level, status, limit = 50 } = req.query;
        
        let searchQuery = query as string || '';
        if (agentName) searchQuery += ` ${agentName}`;
        if (level) searchQuery += ` ${level}`;
        if (status) searchQuery += ` ${status}`;
        
        const results = await this.memory.recall(searchQuery);
        
        const logs = (results?.results || [])
          .filter(r => r.metadata?.category === 'agent-execution-log')
          .map(r => r.metadata)
          .slice(0, Number(limit));
        
        res.json({ logs, total: logs.length });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Registrar início (compatibilidade com agent-log.ts)
    this.app.post('/log/start', async (req, res) => {
      try {
        const { agentName, agentType, taskId, taskDescription, metadata } = req.body;
        
        if (!agentName || !agentType || !taskId || !taskDescription) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await this.logAgentStart(agentName, agentType, taskId, taskDescription, metadata);
        res.json({ success: true, message: 'Execution logged' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Registrar fim (compatibilidade com agent-log.ts)
    this.app.post('/log/end', async (req, res) => {
      try {
        const { agentName, taskId, status, error, metadata } = req.body;
        
        if (!agentName || !taskId || !status) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await this.logAgentEnd(agentName, taskId, status, error, metadata);
        res.json({ success: true, message: 'Execution end logged' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Registrar progresso (compatibilidade com conversational)
    this.app.post('/log/progress', async (req, res) => {
      try {
        const { taskId, progress, metadata } = req.body;
        
        if (!taskId || !progress) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await this.logProgress(taskId, progress, metadata);
        res.json({ success: true, message: 'Progress logged' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Criar plano
    this.app.post('/log/plan', async (req, res) => {
      try {
        const { agentName, tasks, metadata } = req.body;
        
        if (!agentName || !tasks || !Array.isArray(tasks)) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await this.logPlan({ agentName, tasks, metadata });
        res.json({ success: true, message: 'Plan logged' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Toggle auto-logging
    this.app.post('/config/auto-log', (req, res) => {
      const { enabled } = req.body;
      this.autoLogEnabled = enabled;
      res.json({ autoLogEnabled: this.autoLogEnabled });
    });
    
    const server = this.app.listen(port, () => {
      console.log(`🚀 Unified Agent Log API rodando na porta ${port}`);
      console.log(`📊 Dashboard: http://localhost:${port}/health`);
      console.log(`🔧 Modo: ${this.USE_MOCK ? 'Mock' : 'Produção'}`);
      console.log(`🔗 OSS Bridge: ${this.ossMemory['bridgeUrl']}`);
      
      // Relatório periódico
      setInterval(async () => {
        try {
          const report = await this.generatePipelineReport(1);
          console.log(`\n📊 Relatório Periódico (última hora):`);
          console.log(`   Total de execuções: ${report.summary.totalExecutions}`);
          console.log(`   Taxa de sucesso: ${report.summary.successRate.toFixed(1)}%`);
          console.log(`   Agentes ativos: ${report.summary.uniqueAgents}`);
          console.log(`   Duração média: ${Math.round(report.summary.averageDuration)}ms`);
        } catch (error) {
          console.error('Erro ao gerar relatório periódico:', error);
        }
      }, 300000); // A cada 5 minutos
    });
    
    return this.app;
  }
}

// Instância singleton
export const unifiedLog = new UnifiedAgentLog();

// Helper compatível com agent-log.ts
export const logAgent = {
  start: (agentName: string, agentType: AgentType, taskId: string, description: string, metadata?: any) =>
    unifiedLog.logAgentStart(agentName, agentType, taskId, description, metadata),
  
  end: (agentName: string, taskId: string, status: 'completed' | 'error', error?: string, metadata?: any) =>
    unifiedLog.logAgentEnd(agentName, taskId, status, error, metadata),
  
  progress: (taskId: string, progress: string, metadata?: any) =>
    unifiedLog.logProgress(taskId, progress, metadata),
  
  getLastExecution: async (agentName: string) => {
    const history = await unifiedLog.getAgentHistory(agentName, 1);
    return history[0] || null;
  },
  
  getHistory: (agentName: string, limit?: number) =>
    unifiedLog.getAgentHistory(agentName, limit),
  
  getStats: (agentName: string) =>
    unifiedLog.getAgentStats(agentName),
  
  generateReport: (hours?: number) =>
    unifiedLog.generatePipelineReport(hours)
};

// Funções de conveniência para Guardian
export async function logGuardianPlan(plan: any): Promise<void> {
  await unifiedLog.logPlan(plan);
}

export async function logTask(taskInfo: any): Promise<void> {
  await unifiedLog.logTaskStart(taskInfo);
}

// API starter
export function startUnifiedLogAPI(port?: number) {
  return unifiedLog.startAPI(port);
}

// Configurar o logger helper
import { setLogAgent } from '../utils/agent-logger';
setLogAgent(logAgent);

// Auto-start da API se configurado
if (process.env.UNIFIED_AGENT_LOG_API_PORT) {
  startUnifiedLogAPI(parseInt(process.env.UNIFIED_AGENT_LOG_API_PORT));
}

// Executar se chamado diretamente
if (require.main === module) {
  const port = parseInt(process.env.AGENT_LOG_API_PORT || '3001');
  
  startUnifiedLogAPI(port).catch(error => {
    console.error('❌ Erro ao iniciar Unified Agent Log API:', error);
    process.exit(1);
  });
}