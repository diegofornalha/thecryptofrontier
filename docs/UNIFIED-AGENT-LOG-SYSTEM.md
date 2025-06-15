# Sistema Unificado de Logging de Agentes

## Visão Geral

O Sistema Unificado de Logging (`agent-log-unified.ts`) combina o melhor dos três sistemas de logging anteriores em uma solução única e coesa:

- **agent-log.ts**: Sistema completo com análise e persistência
- **agent-log-conversational.ts**: Formato conversacional estruturado  
- **agent-log-simple.ts**: API REST simples e direta

## Características Principais

### 1. Múltiplos Formatos de Log

O sistema suporta três formatos de logging:

- **text**: Logs simples em texto
- **conversational**: Formato de conversa estruturada para análise de padrões
- **structured**: Dados estruturados para análise detalhada

### 2. Dupla Persistência

- **Memória Local**: Via `createAgentMemory()` para acesso rápido
- **OSS Bridge**: Via `GuardianMemoryManagerOSS` para persistência distribuída

### 3. Integração Automática com Guardian

```typescript
// Guardian registra planos automaticamente
await logGuardianPlan({
  agentName: 'Guardian',
  tasks: tasks,
  metadata: { projectPath: '/path/to/project' }
});
```

### 4. API REST Completa

Endpoints disponíveis:

- `GET /health` - Status do serviço
- `GET /stats/:agentName` - Estatísticas do agente
- `GET /history/:agentName` - Histórico de execuções
- `GET /pipeline-report` - Relatório completo do pipeline
- `GET /agents` - Listar todos os agentes
- `GET /logs/active` - Logs ativos em execução
- `GET /logs/search` - Buscar logs com filtros
- `POST /log/start` - Registrar início de tarefa
- `POST /log/end` - Registrar fim de tarefa
- `POST /log/progress` - Registrar progresso
- `POST /log/plan` - Registrar plano de execução

## Uso Básico

### Importação

```typescript
import { unifiedLog, logAgent, startUnifiedLogAPI } from './agent-log-unified';
import { AgentType } from '../core/agent-types';
```

### Logging de Tarefas

```typescript
// Iniciar tarefa
await logAgent.start(
  'My Agent',
  AgentType.IMPLEMENTER,
  'task-123',
  'Implementar nova funcionalidade',
  { complexity: 'medium', taskType: 'feature' }
);

// Registrar progresso
await logAgent.progress('task-123', 'Analisando arquivos...');
await logAgent.progress('task-123', 'Aplicando mudanças...');

// Concluir tarefa
await logAgent.end(
  'My Agent',
  'task-123',
  'completed',
  undefined,
  { filesChanged: 5, linesAdded: 100 }
);

// Ou registrar erro
await logAgent.end(
  'My Agent',
  'task-123',
  'error',
  'Falha ao processar arquivo',
  { file: 'config.json' }
);
```

### Logging de Planos (Guardian)

```typescript
await unifiedLog.logPlan({
  agentName: 'Guardian',
  tasks: [
    {
      id: 'task-1',
      type: 'analysis',
      description: 'Analisar código',
      assignedAgent: 'Code Scout',
      agentType: AgentType.SCOUT,
      complexity: 'medium'
    },
    {
      id: 'task-2',
      type: 'implementation',
      description: 'Implementar melhorias',
      assignedAgent: 'Developer',
      agentType: AgentType.IMPLEMENTER,
      complexity: 'complex'
    }
  ],
  metadata: {
    projectPath: '/project',
    gitBranch: 'main'
  }
});
```

### Consultar Estatísticas

```typescript
// Estatísticas de um agente
const stats = await logAgent.getStats('My Agent');
console.log(`Total de execuções: ${stats.totalExecutions}`);
console.log(`Taxa de sucesso: ${stats.successRate}%`);
console.log(`Duração média: ${stats.averageDuration}ms`);

// Histórico
const history = await logAgent.getHistory('My Agent', 10);

// Relatório do pipeline
const report = await logAgent.generateReport(24); // últimas 24 horas
```

## Configuração

### Variáveis de Ambiente

```bash
# Porta da API
UNIFIED_AGENT_LOG_API_PORT=3001

# URL do OSS Bridge
OSS_BRIDGE_URL=http://localhost:3002

# Modo mock para desenvolvimento
AGENT_LOG_MOCK=false
```

### Docker Compose

```yaml
services:
  unified-log-api:
    build:
      context: .
      dockerfile: Dockerfile.unified-log
    ports:
      - "3001:3001"
    environment:
      - UNIFIED_AGENT_LOG_API_PORT=3001
      - OSS_BRIDGE_URL=http://mem0-bridge:3002
    networks:
      - app-network
    depends_on:
      - mem0-bridge
```

## Estrutura de Dados

### UnifiedLogEntry

```typescript
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
  
  // Conversacional
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
```

## Migração dos Sistemas Antigos

### Script de Migração

Execute o script de migração para atualizar automaticamente as importações:

```bash
./scripts/migrate-to-unified-log.sh
```

### Mapeamento de Importações

```typescript
// Antes (agent-log.ts):
import { agentLog, logAgent, startAgentLogAPI } from './agent-log';

// Depois:
import { unifiedLog, logAgent, startUnifiedLogAPI } from './agent-log-unified';

// Antes (agent-log-conversational.ts):
import { conversationalLog, startConversationalLog } from './agent-log-conversational';

// Depois:
import { unifiedLog, logAgent } from './agent-log-unified';
// Use format: 'conversational' nas chamadas

// Antes (agent-log-simple.ts):
import { startSimpleLogServer } from './agent-log-simple';

// Depois:
import { startUnifiedLogAPI } from './agent-log-unified';
```

## Testes

### Executar Testes

```bash
cd claude-flow-diego/claude-diego-flow
npx ts-node src/test-unified-log.ts
```

### Verificar API

```bash
# Health check
curl http://localhost:3001/health

# Listar agentes
curl http://localhost:3001/agents

# Ver logs ativos
curl http://localhost:3001/logs/active

# Gerar relatório
curl http://localhost:3001/pipeline-report
```

## Benefícios do Sistema Unificado

1. **Código Único**: Elimina duplicação e manutenção de múltiplos sistemas
2. **Flexibilidade**: Suporta diferentes formatos conforme a necessidade
3. **Persistência Robusta**: Dupla camada de persistência com fallback
4. **API Unificada**: Um único endpoint para todas as operações
5. **Integração Automática**: Guardian e outros agentes registram automaticamente
6. **Estatísticas Avançadas**: Análise por agente, tipo de tarefa e complexidade
7. **Compatibilidade**: Mantém compatibilidade com APIs dos sistemas antigos

## Troubleshooting

### Erro de Conexão com OSS Bridge

Se o OSS Bridge não estiver disponível, o sistema automaticamente usa apenas a memória local:

```
[UnifiedLog] Falha ao salvar no OSS, usando apenas memória local
```

### Logs Não Aparecem

Verifique se:
1. A API está rodando: `curl http://localhost:3001/health`
2. O autoLogEnabled está true: `POST /config/auto-log {"enabled": true}`
3. Os agentes estão usando o novo sistema de import

### Performance

Para melhor performance em produção:
1. Use Redis como cache intermediário
2. Configure índices no PostgreSQL do Mem0
3. Limite o histórico mantido em memória

## Próximos Passos

1. Integrar com sistema de alertas
2. Adicionar dashboard visual
3. Implementar agregação de métricas em tempo real
4. Adicionar suporte a webhooks para eventos
5. Implementar retenção automática de logs antigos