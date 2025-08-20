# Demonstração: Guardian usando MCP

## Visão Geral

Esta demonstração mostra como o Guardian integra com o MCP (Model Context Protocol) Diego Tools para gerenciar memória persistente e coordenar suas ações.

## 1. Adicionando Memórias de Análise

### Comando executado:
```bash
curl -X POST http://localhost:3002/mcp/add_memory \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Análise de organização do código realizada em 2025-06-15. Detectei que o diretório /scripts estava desorganizado com 15 arquivos soltos na raiz. Reorganizei em subdiretórios: /scripts/docker para scripts Docker (6 arquivos), /scripts/patches para patches (3 arquivos), e /scripts/utilities para utilitários gerais (6 arquivos). Esta organização segue as diretrizes do CLAUDE.md e melhora a manutenibilidade do projeto.",
    "user_id": "guardian-agent-001",
    "metadata": {
      "agent": "guardian",
      "action": "code_organization_analysis",
      "timestamp": "2025-06-15T10:30:00Z",
      "files_reorganized": 15,
      "directories_created": ["scripts/docker", "scripts/patches", "scripts/utilities"],
      "compliance_score": 95,
      "issues_found": ["scripts soltos na raiz", "falta de categorização"],
      "improvements": ["estrutura hierárquica clara", "facilita manutenção", "segue padrões CLAUDE.md"]
    }
  }'
```

### Resposta:
```json
{
  "id": "838ba9d6-c85c-43b0-bc16-7ece2c12e790",
  "content": "Análise de organização do código realizada em 2025-06-15...",
  "user_id": "guardian-agent-001",
  "created_at": "2025-06-15T01:24:30.455Z",
  "metadata": {
    "agent": "guardian",
    "action": "code_organization_analysis",
    ...
  }
}
```

## 2. Consultando Decisões Anteriores

### Comando executado:
```bash
curl -X POST http://localhost:3002/mcp/search_memory \
  -H "Content-Type: application/json" \
  -d '{
    "query": "análise",
    "user_id": "guardian-agent-001",
    "limit": 10
  }'
```

### Resposta:
```json
{
  "results": [
    {
      "id": "3f22a2b1-8300-47fc-ab96-ce3d00595e80",
      "content": "Análise de segurança realizada em componentes React...",
      "metadata": {
        "agent": "guardian",
        "action": "security_analysis",
        "vulnerabilities_found": 5,
        "severity": "high"
      },
      "score": 1
    },
    {
      "id": "838ba9d6-c85c-43b0-bc16-7ece2c12e790",
      "content": "Análise de organização do código realizada em 2025-06-15...",
      "metadata": {
        "agent": "guardian",
        "action": "code_organization_analysis",
        "files_reorganized": 15
      },
      "score": 1
    }
  ],
  "total": 2
}
```

## 3. Como o Guardian Usa o MCP

### Arquivo: guardian-orchestrator-mcp.ts

O Guardian usa o MCP através do MCPBridge para:

1. **Persistir análises**: Cada análise realizada é salva como memória
2. **Consultar histórico**: Antes de tomar decisões, consulta análises anteriores
3. **Aprender com o tempo**: Usa o histórico para melhorar suas decisões

### Fluxo de Trabalho

```typescript
// 1. Guardian analisa o código
const analysis = await this.analyzeCodeStructure();

// 2. Salva a análise na memória
await this.mcpBridge.tool(MCP_TOOLS.ADD_MEMORY, {
    content: analysis.summary,
    user_id: this.memoryUserId,
    metadata: {
        agent: 'guardian',
        action: 'code_analysis',
        timestamp: new Date().toISOString(),
        ...analysis.details
    }
});

// 3. Consulta análises anteriores para contexto
const previousAnalyses = await this.mcpBridge.tool(MCP_TOOLS.SEARCH_MEMORY, {
    query: 'code organization security',
    user_id: this.memoryUserId,
    limit: 5
});

// 4. Usa o contexto para tomar decisões melhores
const decision = this.makeInformedDecision(analysis, previousAnalyses);
```

## Benefícios da Integração

1. **Memória Persistente**: O Guardian não esquece análises anteriores
2. **Aprendizado Contínuo**: Cada análise melhora as próximas decisões
3. **Rastreabilidade**: Todo histórico de ações fica documentado
4. **Colaboração**: Outros agentes podem acessar o conhecimento do Guardian

## Exemplos de Uso Real

### Análise de Organização de Código
- Detecta arquivos desorganizados
- Sugere e implementa reorganizações
- Salva o resultado para referência futura

### Análise de Segurança
- Identifica vulnerabilidades (XSS, SQL Injection, etc.)
- Implementa correções
- Documenta as mudanças para auditoria

### Melhoria Contínua
- Consulta análises anteriores
- Identifica padrões recorrentes
- Sugere melhorias proativas