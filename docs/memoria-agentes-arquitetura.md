# 🧠 Arquitetura de Memória dos Agentes

## Visão Geral

O sistema usa uma **arquitetura centralizada de memória** através do mem0, onde:
- **NÃO** há memória individual por agente
- Todos compartilham o mesmo sistema de memória
- Cada agente usa um `user_id` único para suas memórias

## 🏗️ Componentes da Arquitetura

### 1. **mem0-bridge** (Porta 3002)
- Serviço central de memória
- Adaptador HTTP para o mem0
- Conecta agentes ao sistema de memória

### 2. **mem0-chroma** (Porta 8005)
- Banco de dados vetorial
- Armazena embeddings das memórias
- Permite busca semântica

## 📊 Estado Atual da Memória

### Estatísticas (16/06/2025):
- **Total de memórias**: 15
- **Total de usuários**: 3
- **Distribuição**:
  - `guardian`: 8 memórias
  - `agent-log`: 5 memórias
  - `agent:docker-specialist`: 2 memórias

## 🔍 Como Funciona

### 1. **Identificação por user_id**
Cada agente usa um identificador único:
```typescript
// Exemplo do Claude Code Specialist
await this.mcpClient.callTool('mem0_add_memory', {
    content: JSON.stringify(this.evolutionHistory),
    user_id: 'guardian-system',  // ID único do agente
    category: 'agent-evolution',
    tags: ['claude-code-specialist', 'evolution']
});
```

### 2. **Memória Compartilhada**
- Todos os agentes acessam o mesmo mem0-bridge
- Separação lógica por `user_id`
- Possibilidade de compartilhar memórias entre agentes

### 3. **Categorias de Memória**
- `agent-evolution`: Evolução e aprendizado
- `interaction`: Interações com usuários
- `system-state`: Estado do sistema
- `analysis-results`: Resultados de análises

## 🚨 Agentes SEM Memória Ativa

A maioria dos agentes **NÃO está usando** o sistema de memória:
- ❌ nextjs-specialist
- ❌ strapi-specialist
- ❌ cleanup-specialist
- ❌ mcp-direct-agent
- ❌ guardian-bridge-agent
- ❌ unified-guardian

Apenas 3 estão registrados:
- ✅ guardian
- ✅ agent-log
- ✅ docker-specialist

## 🛠️ Endpoints do mem0-bridge

```bash
POST /mcp/add_memory       # Adicionar memória
POST /mcp/search_memory    # Buscar memórias
GET  /mcp/list_memories/:id # Listar memórias de um agente
DELETE /mcp/delete_memories # Deletar memórias
GET  /stats                # Estatísticas
GET  /health               # Status do serviço
```

## 💡 Vantagens da Arquitetura Atual

1. **Centralização**: Fácil backup e gestão
2. **Compartilhamento**: Agentes podem aprender uns com os outros
3. **Escalabilidade**: Um único serviço para gerenciar
4. **Busca unificada**: Pesquisa em todas as memórias

## ⚠️ Limitações

1. **Sem isolamento**: Agentes podem ver memórias uns dos outros
2. **Ponto único de falha**: Se mem0 cai, todos perdem memória
3. **Subutilização**: Poucos agentes estão usando
4. **Sem políticas de retenção**: Memórias acumulam indefinidamente

## 🔧 Como Adicionar Memória a um Agente

```typescript
// 1. Importar MCP client
import { MCPClient } from '../core/mcp-client';

// 2. No agente, verificar se mem0 está disponível
const tools = await this.mcpClient.listTools();
if (tools.find(t => t.name === 'mem0_add_memory')) {
    
    // 3. Salvar memória
    await this.mcpClient.callTool('mem0_add_memory', {
        content: "Conteúdo da memória",
        user_id: `agent:${this.config.id}`,  // ID único
        category: 'categoria',
        tags: ['tag1', 'tag2'],
        metadata: { extra: 'info' }
    });
}
```

## 📈 Recomendações

1. **Ativar memória em todos os agentes**: Implementar salvamento de estado
2. **Definir políticas de retenção**: Limpar memórias antigas
3. **Criar categorias padronizadas**: Organizar tipos de memória
4. **Implementar permissões**: Controlar acesso entre agentes
5. **Adicionar métricas**: Monitorar uso de memória
6. **Backup automático**: Salvar memórias periodicamente