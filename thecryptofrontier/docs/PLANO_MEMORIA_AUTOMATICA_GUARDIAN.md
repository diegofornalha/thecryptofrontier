# 🧠 Plano: Sistema de Memória Automática para Guardian

## 🎯 Objetivo
Implementar um sistema onde o Guardian registre automaticamente TODAS as ações no Mem0, criando um "diário de bordo" completo que elimine a necessidade do usuário lembrar ou repetir contexto.

## 🔍 Situação Atual

### O que já existe:
- Guardian salva análises completas APÓS conclusão
- Mem0 está integrado via MCP Bridge
- Sistema de logging básico em console

### O que falta:
- Registro do INÍCIO das tarefas
- Status em tempo real (iniciado, em progresso, pausado, erro)
- Contexto de conversação contínua
- Histórico de decisões tomadas
- Rastreamento de tarefas interrompidas

## 📋 Plano de Implementação

### Fase 1: Task Lifecycle Memory (Memória do Ciclo de Vida)

```typescript
// Novo sistema de memória para Guardian
interface TaskMemory {
    id: string;
    type: 'task_start' | 'task_progress' | 'task_complete' | 'task_error' | 'decision';
    taskName: string;
    status: 'started' | 'in_progress' | 'completed' | 'failed' | 'paused';
    timestamp: Date;
    context: {
        userRequest: string;
        specialists: string[];
        currentStep?: string;
        progress?: number;
        error?: string;
    };
    metadata?: any;
}
```

#### Implementação:

1. **Criar método `rememberTaskStart()`**
   - Chamado ANTES de iniciar qualquer tarefa
   - Registra: o que foi pedido, qual especialista vai usar, timestamp
   
2. **Criar método `rememberTaskProgress()`**
   - Chamado durante execução (a cada passo importante)
   - Registra: progresso, decisões tomadas, resultados parciais

3. **Criar método `rememberTaskComplete()`**
   - Chamado ao finalizar
   - Registra: resultado final, tempo total, próximos passos

4. **Criar método `rememberTaskError()`**
   - Chamado em caso de erro
   - Registra: o que falhou, em que ponto, possível solução

### Fase 2: Context Continuity (Continuidade de Contexto)

```typescript
// Sistema de sessão contínua
interface SessionMemory {
    sessionId: string;
    userId: string;
    startTime: Date;
    lastActivity: Date;
    conversationHistory: Message[];
    pendingTasks: TaskMemory[];
    completedTasks: TaskMemory[];
    userPreferences: {
        cleanupFrequency?: string;
        autoExecute?: boolean;
        verbosityLevel?: string;
    };
}
```

#### Funcionalidades:

1. **Auto-resumo ao iniciar**
   - Guardian busca últimas 24h de memória
   - Resume o que estava fazendo
   - Pergunta se quer continuar tarefas pendentes

2. **Detecção de padrões**
   - Se usuário sempre pede limpeza às segundas
   - Se prefere análise antes de executar
   - Ajusta comportamento automaticamente

3. **Memória de preferências**
   - "Usuário sempre quer dry-run primeiro"
   - "Usuário prefere relatórios concisos"
   - Aplica automaticamente

### Fase 3: Intelligent Recall (Recuperação Inteligente)

```typescript
// Sistema de recuperação contextual
class MemoryRecall {
    async whatWasIDoing(): Promise<TaskMemory[]> {
        // Retorna últimas tarefas não finalizadas
    }
    
    async whatDidIDecide(topic: string): Promise<Decision[]> {
        // Busca decisões sobre um tópico
    }
    
    async whenDidI(action: string): Promise<TaskMemory[]> {
        // Busca quando uma ação foi feita
    }
    
    async suggestNextSteps(): Promise<string[]> {
        // Baseado no histórico, sugere próximos passos
    }
}
```

### Fase 4: Integração Completa

1. **Modificar Guardian para usar novo sistema**
   ```typescript
   // Antes de qualquer ação
   await this.rememberTaskStart({
       taskName: 'Análise de limpeza',
       userRequest: message.content,
       specialists: ['cleanup']
   });
   
   // Durante execução
   await this.rememberTaskProgress({
       currentStep: 'Executando cleanup em container',
       progress: 50
   });
   ```

2. **Comandos automáticos para usuário**
   - "O que eu estava fazendo?" → Guardian consulta memória
   - "Continue de onde parou" → Guardian retoma tarefas
   - "O que decidimos sobre X?" → Guardian busca decisões

3. **Dashboard de memória**
   - Endpoint REST para visualizar histórico
   - Estatísticas de uso
   - Linha do tempo de ações

## 🚀 Benefícios Esperados

1. **Zero repetição**: Usuário nunca precisa repetir contexto
2. **Continuidade total**: Pode parar e voltar a qualquer momento
3. **Aprendizado**: Guardian aprende preferências ao longo do tempo
4. **Rastreabilidade**: Todo histórico de decisões disponível
5. **Proatividade**: Guardian sugere ações baseadas em padrões

## 📅 Cronograma de Implementação

- **Semana 1**: Implementar Task Lifecycle Memory
- **Semana 2**: Implementar Context Continuity
- **Semana 3**: Implementar Intelligent Recall
- **Semana 4**: Testes e ajustes finais

## 🔧 Implementação Técnica

### Arquivo: `guardian-memory-system.ts`
```typescript
export class GuardianMemorySystem {
    private memoryBridge: MCPBridge;
    private currentSession: SessionMemory;
    
    async rememberTaskStart(task: Partial<TaskMemory>): Promise<void> {
        const memory: TaskMemory = {
            id: `task-${Date.now()}`,
            type: 'task_start',
            status: 'started',
            timestamp: new Date(),
            ...task
        };
        
        await this.saveToMem0(memory);
        this.updateSession(memory);
    }
    
    // ... outros métodos
}
```

### Integração no Guardian
```typescript
// No guardian-orchestrator-mcp.ts
private memory: GuardianMemorySystem;

async processMessage(message: Message): Promise<Message> {
    // Primeiro, registra o início
    await this.memory.rememberTaskStart({
        taskName: 'Process user message',
        context: { userRequest: message.content }
    });
    
    // ... resto do processamento
}
```

## 🎯 Resultado Final

Com este sistema, o Guardian terá memória completa e contínua, permitindo:

1. **"Guardian, o que você estava fazendo?"**
   - "Estava executando limpeza de código morto, parei em 70%"

2. **"Continue"**
   - "Retomando limpeza de onde parei..."

3. **"O que decidimos sobre os arquivos Docker?"**
   - "Em 15/06, decidimos manter docker-compose.frontend.yml pois é configuração válida"

4. **Início de nova sessão**
   - "Olá! Vi que ontem você pediu limpeza semanal. Quer que eu execute agora?"

## 🔑 Conclusão

Este sistema transformará o Guardian em um assistente verdadeiramente contínuo, que nunca esquece e sempre sabe o contexto completo, eliminando a necessidade do usuário repetir informações ou lembrar o que estava fazendo.