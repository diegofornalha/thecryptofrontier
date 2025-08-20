# 🚀 Plano de Ativação de Memória para Todos os Agentes

## Fase 1: Preparação (Imediata)

### 1.1 Criar Base Class com Memória
```typescript
// src/core/memory-enhanced-agent.ts
export abstract class MemoryEnhancedAgent extends BaseAgent {
    protected memoryUserId: string;
    protected memoryCategory: string;
    
    async saveMemory(content: string, tags: string[]): Promise<void> {
        await this.mcpClient.callTool('mem0_add_memory', {
            content,
            user_id: this.memoryUserId,
            category: this.memoryCategory,
            tags
        });
    }
    
    async searchMemories(query: string): Promise<any[]> {
        return await this.mcpClient.callTool('mem0_search_memory', {
            query,
            user_id: this.memoryUserId,
            limit: 10
        });
    }
}
```

### 1.2 Categorias de Memória Padronizadas
- `learning`: Aprendizados e melhorias
- `errors`: Erros encontrados e soluções
- `patterns`: Padrões identificados
- `interactions`: Interações importantes
- `state`: Estado e configurações
- `analysis`: Resultados de análises

## Fase 2: Implementação por Agente

### 2.1 NextJS Specialist
**O que salvar:**
- Estruturas de projeto analisadas
- Problemas comuns encontrados
- Soluções aplicadas
- Versões e configurações

**Exemplo:**
```typescript
// Após analisar projeto
await this.saveMemory(
    `Projeto ${projectName} usa Next.js ${version} com ${features.join(', ')}`,
    ['nextjs', 'project-analysis', version]
);
```

### 2.2 Strapi Specialist
**O que salvar:**
- Configurações de API
- Schemas de content types
- Integrações realizadas
- Problemas de performance

### 2.3 Cleanup Specialist
**O que salvar:**
- Padrões de arquivos limpos
- Diretórios problemáticos
- Estatísticas de limpeza
- Configurações de exclusão

### 2.4 Claude Code Specialist
**Já implementado parcialmente:**
- Melhorar para salvar:
  - Comandos mais usados
  - Preferências do usuário
  - Erros comuns
  - Soluções aplicadas

### 2.5 Docker Specialist
**O que salvar:**
- Imagens e containers criados
- Configurações de rede
- Problemas de build
- Otimizações aplicadas

### 2.6 Unified Guardian
**O que salvar:**
- Análises de sistema
- Métricas de saúde
- Ações tomadas
- Alertas gerados

### 2.7 MCP Direct Agent
**O que salvar:**
- Ferramentas executadas
- Sequências de comandos
- Resultados obtidos
- Erros de execução

### 2.8 Guardian Bridge Agent
**O que salvar:**
- Comunicações entre sistemas
- Status de integrações
- Falhas de conexão
- Métricas de latência

## Fase 3: Padrões de Implementação

### 3.1 Quando Salvar Memória
```typescript
// No início de cada análise
async analyzeProject() {
    const memories = await this.searchMemories(projectPath);
    // Usar memórias anteriores
    
    // ... fazer análise ...
    
    // Salvar novo aprendizado
    if (newInsight) {
        await this.saveMemory(insight, tags);
    }
}
```

### 3.2 Estrutura de Memória
```json
{
    "content": "Descrição clara do aprendizado",
    "user_id": "agent:nextjs-specialist",
    "category": "learning",
    "tags": ["nextjs", "v14", "app-router"],
    "metadata": {
        "project": "/path/to/project",
        "timestamp": "2025-06-16T04:00:00Z",
        "confidence": 0.95
    }
}
```

### 3.3 Busca Inteligente
```typescript
// Antes de executar tarefa
const relevantMemories = await this.searchMemories(
    `${taskType} ${projectTech}`
);

// Aplicar conhecimento prévio
if (relevantMemories.length > 0) {
    this.applyPreviousKnowledge(relevantMemories);
}
```

## Fase 4: Métricas e Monitoramento

### 4.1 Métricas por Agente
- Memórias criadas por dia
- Taxa de reutilização
- Tempo economizado
- Erros evitados

### 4.2 Dashboard de Memória
```bash
# Endpoint para visualizar
GET /agents/memory-stats
{
    "agents": [
        {
            "name": "nextjs-specialist",
            "memories": 45,
            "last_access": "2025-06-16T03:55:00Z",
            "reuse_rate": 0.72
        }
    ]
}
```

## Fase 5: Políticas de Gestão

### 5.1 Retenção
- Memórias de erro: 30 dias
- Aprendizados: 90 dias
- Configurações: Permanente
- Interações: 7 dias

### 5.2 Limpeza Automática
```typescript
// Cron job semanal
async cleanOldMemories() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    await this.deleteMemoriesBefore(cutoffDate, 'errors');
}
```

### 5.3 Backup
- Backup diário das memórias
- Export para JSON
- Versionamento no Git

## Fase 6: Evolução e Aprendizado

### 6.1 Compartilhamento entre Agentes
```typescript
// Guardian pode ler memórias de todos
const allAgentMemories = await this.searchAllAgentMemories(query);
```

### 6.2 Aprendizado Coletivo
- Identificar padrões comuns
- Compartilhar soluções
- Evoluir em conjunto

### 6.3 Métricas de Evolução
- Taxa de aprendizado
- Redução de erros
- Melhoria de performance

## Cronograma de Implementação

**Semana 1:**
- [x] Criar base class
- [ ] Implementar em 3 agentes prioritários (NextJS, Strapi, Cleanup)
- [ ] Testes básicos

**Semana 2:**
- [ ] Implementar nos demais agentes
- [ ] Dashboard de monitoramento
- [ ] Políticas de retenção

**Semana 3:**
- [ ] Otimizações
- [ ] Documentação completa
- [ ] Treinamento de uso

## Benefícios Esperados

1. **Redução de 40% no tempo de análise** (reutilização)
2. **Menos erros repetidos** (aprendizado)
3. **Melhor colaboração** (compartilhamento)
4. **Evolução contínua** (sem perder conhecimento)
5. **Insights valiosos** (padrões identificados)