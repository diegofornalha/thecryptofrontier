# Mapeamento de Importações

## Substituições necessárias:

### agent-log.ts
```typescript
// Antes:
import { agentLog, logAgent, startAgentLogAPI } from './agent-log';

// Depois:
import { unifiedLog, logAgent, startUnifiedLogAPI } from './agent-log-unified';
```

### agent-log-conversational.ts
```typescript
// Antes:
import { conversationalLog, startConversationalLog } from './agent-log-conversational';

// Depois:
import { unifiedLog, logAgent } from './agent-log-unified';
// Use: unifiedLog.logTaskStart() com format: 'conversational'
```

### agent-log-simple.ts
```typescript
// Antes:
import { startSimpleLogServer } from './agent-log-simple';

// Depois:
import { startUnifiedLogAPI } from './agent-log-unified';
```

## Novos recursos:
- `logGuardianPlan()` - Para Guardian registrar planos automaticamente
- `logProgress()` - Para registrar progresso de tarefas
- Suporte a múltiplos formatos: 'text', 'conversational', 'structured'
