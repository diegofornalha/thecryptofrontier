# Guia de Memória Local para Agentes

## 🧠 Visão Geral

O sistema de memória local permite que os agentes do Claude Flow armazenem e recuperem informações de forma persistente, sem depender de serviços externos. Toda a memória é armazenada localmente em um container Docker.

## 🚀 Como Funciona

### Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     Agentes     │────▶│  Memory Client   │────▶│   Mem0 Local    │
│  (Claude Flow)  │     │   (TypeScript)   │     │    (Docker)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌───────────────┐
                                                   │ memory-store  │
                                                   │    (.json)    │
                                                   └───────────────┘
```

### Endpoints Disponíveis

- **POST /mcp/add_memory** - Adicionar nova memória
- **POST /mcp/search_memory** - Buscar memórias por texto
- **GET /mcp/list_memories/:user_id** - Listar memórias de um usuário
- **DELETE /mcp/delete_memories** - Deletar memórias
- **GET /stats** - Estatísticas do sistema
- **GET /health** - Status de saúde do serviço

## 📝 Como Usar nos Agentes

### 1. Importar o Cliente

```typescript
import { memoryClient } from '../memory/local-memory-client';
import { createLocalAgentMemory } from '../agents/memory-enhanced-agents-v2';
```

### 2. Criar Memória para o Agente

```typescript
const agentMemory = createLocalAgentMemory('Meu Agente');
```

### 3. Operações Básicas

#### Salvar uma Memória

```typescript
const result = await agentMemory.remember(
  'Descobri que o projeto usa React 18 com TypeScript',
  {
    category: 'project-analysis',
    tags: ['react', 'typescript', 'frontend'],
    projectName: 'exemplo-app'
  }
);
console.log('Memória salva com ID:', result.id);
```

#### Buscar Memórias

```typescript
const memories = await agentMemory.recall('React TypeScript');
console.log(`Encontradas ${memories.total} memórias relacionadas`);

for (const memory of memories.results) {
  console.log('- ', memory.content);
  console.log('  Score:', memory.score);
}
```

#### Listar Todas as Memórias

```typescript
const allMemories = await agentMemory.listMemories(50);
console.log(`Total de memórias: ${allMemories.total}`);
```

#### Deletar uma Memória

```typescript
await agentMemory.forget(memoryId);
console.log('Memória deletada');
```

#### Compartilhar com Outro Agente

```typescript
await agentMemory.shareWith(
  'agent:outro-agente',
  'Informação importante sobre configuração de deploy'
);
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# URL do serviço de memória local
MEM0_LOCAL_URL=http://localhost:3002

# Modo de operação (sempre 'local' para uso local)
MEM0_MODE=local
```

### Corrigir Permissões (se necessário)

Se houver problemas de permissão, execute:

```bash
bash /home/strapi/thecryptofrontier/scripts/docker/fix-mem0-permissions.sh
```

## 🏗️ Namespaces

O sistema usa namespaces hierárquicos para organizar memórias:

```typescript
// Guardian global (compartilhado entre todos)
MemoryNamespaces.GLOBAL = 'guardian'

// Por agente
MemoryNamespaces.AGENT('Smart Code Scout') = 'agent:smart-code-scout'

// Por projeto
MemoryNamespaces.PROJECT('meu-app') = 'project:meu-app'

// Por equipe
MemoryNamespaces.TEAM('frontend') = 'team:frontend'

// Por workflow
MemoryNamespaces.WORKFLOW('deploy-prod') = 'workflow:deploy-prod'
```

## 📊 Exemplos de Uso Avançado

### Agente que Aprende com Erros

```typescript
export const errorLearnerAgent = {
  memory: createLocalAgentMemory('Error Learner'),
  
  async learnFromError(error: Error, context: any) {
    // Buscar erros similares anteriores
    const similar = await this.memory.recall(error.message);
    
    if (similar.total > 0) {
      console.log('Já vi este erro antes!');
      // Aplicar solução conhecida
      const solution = similar.results[0].metadata?.solution;
      if (solution) {
        return solution;
      }
    }
    
    // Novo erro - salvar para aprendizado futuro
    await this.memory.remember(
      `Erro: ${error.message} - Stack: ${error.stack}`,
      {
        category: 'error-pattern',
        tags: ['error', error.name],
        context,
        timestamp: new Date().toISOString()
      }
    );
    
    return null;
  }
};
```

### Coordenação Multi-Agente

```typescript
// Registrar agentes no coordenador
localMemoryCoordinator.registerAgent('Scout', scoutAgent);
localMemoryCoordinator.registerAgent('Builder', builderAgent);

// Scout descobre algo importante
await scoutAgent.memory.remember(
  'Vulnerabilidade crítica no módulo de autenticação',
  { category: 'security', priority: 'high' }
);

// Compartilhar com o Builder
await localMemoryCoordinator.shareKnowledgeBetweenAgents(
  'Scout',
  'Builder', 
  'vulnerabilidade autenticação'
);

// Builder agora tem acesso ao conhecimento
const builderKnowledge = await builderAgent.memory.recall('vulnerabilidade');
```

### Sincronização Global

```typescript
// Sincronizar insights importantes de todos os agentes
const syncedCount = await localMemoryCoordinator.globalKnowledgeSync();
console.log(`${syncedCount} insights sincronizados com o Guardian`);

// Guardian pode acessar todos os insights
const globalInsights = await memoryClient.list({
  user_id: MemoryNamespaces.GLOBAL,
  limit: 100
});
```

## 🔍 Monitoramento

### Verificar Saúde do Serviço

```typescript
const health = await memoryClient.health();
console.log('Status:', health.status);
console.log('Memórias:', health.memory_count);
console.log('Usuários:', health.users_count);
```

### Obter Estatísticas

```typescript
const stats = await localMemoryCoordinator.getSystemStats();
console.log('Total de memórias:', stats.total_memories);
console.log('Por agente:', stats.agentStats);
```

## 🚨 Troubleshooting

### Problema: Permission Denied

**Solução:**
```bash
# Executar script de correção
bash /home/strapi/thecryptofrontier/scripts/docker/fix-mem0-permissions.sh
```

### Problema: Serviço não responde

**Verificar logs:**
```bash
docker logs mem0-bridge --tail 50
```

**Reiniciar serviço:**
```bash
docker restart mem0-bridge
```

### Problema: Memórias não persistem

**Verificar volume:**
```bash
docker inspect mem0-bridge | grep -A 5 Mounts
```

**Verificar arquivo:**
```bash
ls -la /home/strapi/thecryptofrontier/claude-flow-diego/data/memory/
```

## 🎯 Melhores Práticas

1. **Use categorias consistentes** - Facilita a busca e organização
2. **Tags descritivas** - Melhora a recuperação de informações
3. **Metadata rico** - Adicione contexto útil para uso futuro
4. **Limpeza periódica** - Delete memórias obsoletas
5. **Compartilhe conhecimento** - Use o coordenador para sincronizar insights

## 🔐 Segurança

- Todas as memórias são armazenadas localmente
- Não há transmissão de dados para serviços externos
- Backup regular do arquivo `memory-store.json` é recomendado
- Use namespaces para isolar dados sensíveis

## 📈 Performance

- Busca por substring (sem embeddings)
- Adequado para até ~100k memórias
- Auto-save a cada 30 segundos
- Carregamento completo na inicialização

## 🛠️ Desenvolvimento

### Executar Testes

```bash
cd /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow
npm test src/memory/__tests__/local-memory.test.ts
```

### Adicionar Novo Agente com Memória

```typescript
export const meuNovoAgente = {
  ...createMCPAgent('Meu Novo Agente', AgentType.ANALYST, [...]),
  memory: createLocalAgentMemory('Meu Novo Agente'),
  
  async minhaFuncao() {
    // Use this.memory para todas operações
    const dados = await this.memory.recall('query');
    // ...
  }
};
```

## 📚 Referências

- [local-memory-client.ts](../claude-flow-diego/claude-diego-flow/src/memory/local-memory-client.ts) - Cliente TypeScript
- [memory-enhanced-agents-v2.ts](../claude-flow-diego/claude-diego-flow/src/agents/memory-enhanced-agents-v2.ts) - Agentes com memória
- [simple-memory-adapter.ts](../claude-flow-diego/claude-diego-flow/src/bridges/simple-memory-adapter.ts) - Implementação do servidor