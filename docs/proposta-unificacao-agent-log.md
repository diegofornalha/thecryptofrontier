# Proposta de Unificação dos Agentes de Log

## Análise dos 3 Agentes Existentes

### 1. agent-log.ts (Completo)
- **Funcionalidades**: Sistema unificado com logging, análise e API REST
- **Pontos fortes**: 
  - Integração com memória persistente
  - Análise de performance e estatísticas
  - API REST para acesso remoto
  - Suporte a mock para desenvolvimento
  - Estrutura completa com metadata e contexto git

### 2. agent-log-simple.ts (Básico)
- **Funcionalidades**: Servidor Express simples
- **Pontos fortes**: Leve e direto
- **Limitações**: Apenas endpoints básicos sem persistência

### 3. agent-log-conversational.ts (Conversacional)
- **Funcionalidades**: Formato de conversa estruturada
- **Pontos fortes**:
  - Usa GuardianMemoryManagerOSS
  - Formato conversacional para análise de padrões
  - Rastreamento de conversas entre agentes

## Proposta de Unificação

### AgentLogUnified - Sistema Unificado de Logging

```typescript
// /claude-flow-diego/claude-diego-flow/src/agents/agent-log-unified.ts

import { BaseAgent, Task } from '../core/base-agent-simple';
import { AgentType } from '../core/agent-types';
import { GuardianMemoryManagerOSS } from '../utils/guardian-memory-oss';
import express from 'express';
import cors from 'cors';

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
  level: 'info' | 'warn' | 'error' | 'debug' | 'task' | 'plan';
  content: string;
  format: 'text' | 'conversational' | 'structured';
  
  // Estado
  status: 'started' | 'in_progress' | 'completed' | 'error';
  
  // Contexto
  context?: {
    taskDescription?: string;
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
    role: 'system' | 'agent' | 'task' | 'result' | 'error';
    messages: Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;
  };
  
  // Metadata extensível
  metadata?: Record<string, any>;
}

export class UnifiedAgentLog {
  private memory: GuardianMemoryManagerOSS;
  private activeEntries: Map<string, UnifiedLogEntry> = new Map();
  private app?: express.Application;
  private autoLogEnabled: boolean = true;
  
  constructor(bridgeUrl: string = 'http://localhost:3002') {
    this.memory = new GuardianMemoryManagerOSS(bridgeUrl);
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
    
    const planEntry: UnifiedLogEntry = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentName: plan.agentName,
      agentType: 'coordinator' as AgentType,
      taskId: `plan-${Date.now()}`,
      timestamp: new Date(),
      startTime: new Date(),
      level: 'plan',
      content: `Plano criado com ${plan.tasks.length} tarefas`,
      format: 'structured',
      status: 'started',
      context: {
        taskDescription: 'Criação de plano de execução',
        complexity: plan.tasks.length > 5 ? 'complex' : 
                   plan.tasks.length > 2 ? 'medium' : 'simple',
        childTaskIds: plan.tasks.map(t => t.id)
      },
      metadata: plan.metadata
    };
    
    await this.saveLog(planEntry);
    
    // Logar cada tarefa do plano
    for (const task of plan.tasks) {
      await this.logTaskStart({
        agentName: task.assignedAgent || plan.agentName,
        agentType: task.agentType || 'implementer',
        taskId: task.id,
        taskDescription: task.description,
        parentTaskId: planEntry.taskId
      });
    }
  }
  
  /**
   * Log de início de tarefa
   */
  async logTaskStart(params: {
    agentName: string;
    agentType: AgentType;
    taskId: string;
    taskDescription: string;
    parentTaskId?: string;
    complexity?: 'simple' | 'medium' | 'complex';
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
        complexity: params.complexity,
        parentTaskId: params.parentTaskId
      }
    };
    
    this.activeEntries.set(params.taskId, entry);
    await this.saveLog(entry);
  }
  
  /**
   * Log de conclusão de tarefa
   */
  async logTaskComplete(taskId: string, result?: any): Promise<void> {
    const entry = this.activeEntries.get(taskId);
    if (!entry) return;
    
    entry.endTime = new Date();
    entry.duration = entry.endTime.getTime() - entry.startTime.getTime();
    entry.status = 'completed';
    entry.content = `Concluído: ${entry.context?.taskDescription}`;
    
    if (result) {
      entry.metadata = { ...entry.metadata, result };
    }
    
    await this.saveLog(entry);
    this.activeEntries.delete(taskId);
  }
  
  /**
   * Log de erro
   */
  async logError(taskId: string, error: Error | string): Promise<void> {
    const entry = this.activeEntries.get(taskId);
    if (entry) {
      entry.endTime = new Date();
      entry.duration = entry.endTime.getTime() - entry.startTime.getTime();
      entry.status = 'error';
      entry.level = 'error';
      entry.content = `Erro: ${error instanceof Error ? error.message : error}`;
      
      await this.saveLog(entry);
      this.activeEntries.delete(taskId);
    }
  }
  
  /**
   * Salvar log na memória persistente
   */
  private async saveLog(entry: UnifiedLogEntry): Promise<void> {
    try {
      // Salvar no Mem0 via bridge
      await this.memory.store({
        content: JSON.stringify(entry),
        namespace: 'agent-logs',
        metadata: {
          agentName: entry.agentName,
          agentType: entry.agentType,
          taskId: entry.taskId,
          level: entry.level,
          status: entry.status,
          timestamp: entry.timestamp.toISOString()
        }
      });
      
      console.log(`✅ Log salvo: ${entry.level} - ${entry.agentName} - ${entry.content}`);
    } catch (error) {
      console.error('❌ Erro ao salvar log:', error);
    }
  }
  
  /**
   * API REST para consulta de logs
   */
  async startAPI(port: number = 3001): Promise<void> {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'unified-agent-log',
        autoLogEnabled: this.autoLogEnabled,
        activeLogs: this.activeEntries.size
      });
    });
    
    // Criar log
    this.app.post('/log', async (req, res) => {
      try {
        await this.saveLog(req.body);
        res.json({ status: 'logged', id: req.body.id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Buscar logs
    this.app.get('/logs/search', async (req, res) => {
      try {
        const { query, agentName, level, status, limit = 50 } = req.query;
        
        const results = await this.memory.search({
          query: query as string || '',
          namespace: 'agent-logs',
          filters: {
            agentName: agentName as string,
            level: level as string,
            status: status as string
          },
          limit: Number(limit)
        });
        
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Estatísticas
    this.app.get('/stats', async (req, res) => {
      try {
        const stats = await this.getStatistics();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.listen(port, () => {
      console.log(`🚀 Unified Agent Log API running on port ${port}`);
    });
  }
  
  /**
   * Obter estatísticas dos logs
   */
  private async getStatistics(): Promise<any> {
    // Implementar busca e cálculo de estatísticas
    const allLogs = await this.memory.search({
      query: '',
      namespace: 'agent-logs',
      limit: 1000
    });
    
    // Calcular estatísticas básicas
    const stats = {
      totalLogs: allLogs.length,
      byAgent: {},
      byLevel: {},
      byStatus: {},
      avgDuration: 0,
      errorRate: 0
    };
    
    // Processar logs para estatísticas
    allLogs.forEach(log => {
      const entry = JSON.parse(log.content);
      
      // Por agente
      stats.byAgent[entry.agentName] = (stats.byAgent[entry.agentName] || 0) + 1;
      
      // Por nível
      stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
      
      // Por status
      stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
    });
    
    // Calcular taxa de erro
    stats.errorRate = (stats.byStatus['error'] || 0) / stats.totalLogs;
    
    return stats;
  }
}

// Singleton para uso global
export const unifiedLog = new UnifiedAgentLog();

// Função helper para Guardian
export async function logGuardianPlan(plan: any): Promise<void> {
  await unifiedLog.logPlan(plan);
}

// Função helper para tarefas
export async function logTask(taskInfo: any): Promise<void> {
  await unifiedLog.logTaskStart(taskInfo);
}
```

## Integração com Guardian

### Modificações no Guardian para usar o log unificado:

```typescript
// No guardian-standalone.ts ou universal-organization-guardian.ts

import { logGuardianPlan, logTask, unifiedLog } from './agent-log-unified';

// Quando Guardian criar um plano:
async createPlan(tasks: Task[]) {
  const plan = {
    agentName: 'Guardian',
    tasks: tasks,
    metadata: {
      projectPath: this.projectPath,
      timestamp: new Date()
    }
  };
  
  // Log automático do plano
  await logGuardianPlan(plan);
  
  // Executar tarefas...
}

// Quando iniciar uma tarefa:
async executeTask(task: Task) {
  await logTask({
    agentName: this.name,
    agentType: this.type,
    taskId: task.id,
    taskDescription: task.description,
    complexity: task.complexity
  });
  
  try {
    // Executar tarefa...
    const result = await this.performTask(task);
    
    // Log de conclusão
    await unifiedLog.logTaskComplete(task.id, result);
  } catch (error) {
    // Log de erro
    await unifiedLog.logError(task.id, error);
    throw error;
  }
}
```

## Correção do Mem0

### Para corrigir o problema de permissão do Mem0:

```yaml
# No docker-compose.yml do claude-flow-diego
services:
  mem0-bridge:
    # ... outras configs ...
    volumes:
      - ./memory:/data:rw  # Garantir permissão de escrita
    user: "1000:1000"  # Usar o mesmo usuário do host
```

Ou criar script de correção:

```bash
#!/bin/bash
# fix-mem0-permissions.sh

# Criar diretório se não existir
mkdir -p /home/strapi/thecryptofrontier/claude-flow-diego/memory

# Ajustar permissões
chmod 777 /home/strapi/thecryptofrontier/claude-flow-diego/memory

# Reiniciar container
docker restart mem0-bridge
```

## Benefícios da Unificação

1. **Código único**: Elimina duplicação e sobreposição
2. **Flexibilidade**: Suporta diferentes formatos (texto, conversacional, estruturado)
3. **Integração automática**: Guardian registra planos e tarefas automaticamente
4. **Persistência garantida**: Usa Mem0 com fallback local
5. **API unificada**: Um único endpoint para todos os logs
6. **Estatísticas centralizadas**: Visão completa do sistema

## Próximos Passos

1. Implementar o `agent-log-unified.ts`
2. Corrigir permissões do Mem0
3. Integrar com Guardian
4. Remover os 3 agentes antigos
5. Testar o sistema completo