# Guia de Criação de Agentes Especialistas

Este guia detalha como criar novos agentes especialistas para expandir as capacidades do Guardian Orchestrator MCP.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tipos de Agentes](#tipos-de-agentes)
- [Criação Automatizada](#criação-automatizada)
- [Criação Manual](#criação-manual)
- [Implementação](#implementação)
- [Integração com MCP](#integração-com-mcp)
- [Testes](#testes)
- [Boas Práticas](#boas-práticas)
- [Exemplos](#exemplos)

## 🎯 Visão Geral

Agentes especialistas são componentes modulares que estendem as capacidades do Guardian Orchestrator. Cada especialista é responsável por um domínio específico e pode ser invocado quando necessário.

### Arquitetura

```
Guardian Orchestrator MCP
    ├── Docker Specialist
    ├── NextJS Specialist
    ├── Strapi Specialist
    ├── Security Analyzer
    └── [Seu Novo Especialista]
```

## 🔧 Tipos de Agentes

### 1. Agente Completo (com MCP)

- Integração completa com MCP Diego Tools
- Capacidade de screenshots, navegação web, memória persistente
- Ideal para tarefas complexas que requerem múltiplas ferramentas

### 2. Agente Simples

- Sem dependência de MCP
- Focado em análise e processamento local
- Ideal para tarefas específicas e rápidas

## 🚀 Criação Automatizada

### Usando o Script create-specialist.ts

```bash
# Criar especialista completo
npx tsx scripts/create-specialist.ts performance

# Criar especialista simples
npx tsx scripts/create-specialist.ts database --simple

# Ver ajuda
npx tsx scripts/create-specialist.ts --help
```

### O que o script faz:

1. ✅ Cria arquivo do novo especialista a partir do template
2. ✅ Adiciona import ao Guardian Orchestrator
3. ✅ Registra o especialista no método initialize()
4. ✅ Adiciona lógica de roteamento básica
5. ✅ Cria teste unitário básico
6. ✅ Formata o código automaticamente

## 📝 Criação Manual

Se preferir criar manualmente:

### 1. Copiar Template

```typescript
// Copie de template-agents.ts
export class SeuEspecialistaAgent extends Agent {
    // ... implementação
}
```

### 2. Personalizar Identificação

```typescript
constructor() {
    super({
        id: 'seu-especialista',
        name: 'Seu Especialista Agent',
        description: 'Especialista em [domínio]',
        capabilities: [
            'analysis',
            'optimization',
            'validation'
        ]
    });
}
```

### 3. Adicionar ao Guardian

Em `guardian-orchestrator-mcp.ts`:

```typescript
// Import
import { SeuEspecialistaAgent } from './seu-especialista-agent';

// No initialize()
const seuAgent = new SeuEspecialistaAgent();
this.specialists.set('seu', seuAgent);

// No analyzeRequest()
if (lowerRequest.includes('seu domínio')) {
    specialists.push('seu');
}
```

## 💻 Implementação

### Estrutura Básica

```typescript
export class DatabaseSpecialistAgent extends Agent {
    private dbConnections: Map<string, any>;
    
    constructor() {
        super({
            id: 'database-specialist',
            name: 'Database Specialist',
            description: 'Especialista em análise e otimização de bancos de dados',
            capabilities: [
                'query-analysis',
                'performance-tuning',
                'schema-validation',
                'migration-planning'
            ]
        });
        
        this.dbConnections = new Map();
    }
    
    async initialize(): Promise<void> {
        // Inicializar conexões, carregar configs, etc.
    }
    
    async processMessage(message: Message): Promise<Message> {
        // Lógica principal do especialista
    }
}
```

### Implementando Análise de Requisição

```typescript
private async analyzeRequest(request: string): Promise<RequestAnalysis> {
    const lowerRequest = request.toLowerCase();
    const tasks: string[] = [];
    
    // Identificar tarefas baseadas no conteúdo
    if (lowerRequest.includes('query') || lowerRequest.includes('consulta')) {
        tasks.push('analyze-queries');
    }
    
    if (lowerRequest.includes('performance') || lowerRequest.includes('lento')) {
        tasks.push('performance-check');
    }
    
    if (lowerRequest.includes('schema') || lowerRequest.includes('estrutura')) {
        tasks.push('validate-schema');
    }
    
    return {
        request,
        tasks,
        requiresMCP: false,
        priority: this.determinePriority(request)
    };
}
```

### Implementando Tarefas Específicas

```typescript
private async analyzeQueries(): Promise<QueryAnalysis> {
    console.log('🔍 Analisando queries do banco...');
    
    // Conectar ao banco
    const connection = await this.getConnection();
    
    // Executar análise
    const slowQueries = await connection.query(`
        SELECT query, execution_time, calls
        FROM pg_stat_statements
        WHERE mean_time > 1000
        ORDER BY mean_time DESC
        LIMIT 10
    `);
    
    return {
        slowQueries,
        recommendations: this.generateQueryRecommendations(slowQueries)
    };
}
```

## 🔌 Integração com MCP

### Usando Ferramentas MCP

```typescript
private async captureDBDashboard(): Promise<any> {
    // Navegar para dashboard
    await this.mcpBridge.navigate('http://localhost:8080/admin/dashboard');
    
    // Capturar screenshot
    const screenshotPath = path.join(this.projectRoot, 'screenshots', 'db-dashboard.png');
    await this.mcpBridge.screenshot(screenshotPath, true);
    
    return { path: screenshotPath, captured: true };
}
```

### Salvando na Memória

```typescript
private async saveAnalysisToMemory(analysis: any): Promise<void> {
    await this.mcpBridge.addMemory(
        this.config.id,
        JSON.stringify({
            timestamp: new Date().toISOString(),
            type: 'database-analysis',
            findings: analysis.findings,
            metrics: analysis.metrics
        }),
        {
            category: 'specialist-analysis',
            tags: ['database', 'performance']
        }
    );
}
```

### Buscando Histórico

```typescript
private async getPreviousAnalyses(): Promise<any[]> {
    return await this.mcpBridge.searchMemory(
        this.config.id,
        'database analysis',
        10
    );
}
```

## 🧪 Testes

### Teste Básico (criado automaticamente)

```typescript
describe('Database Specialist', () => {
    let agent: DatabaseSpecialistAgent;
    
    beforeEach(async () => {
        agent = new DatabaseSpecialistAgent();
        await agent.initialize();
    });
    
    test('deve analisar queries lentas', async () => {
        const message: Message = {
            role: 'user',
            content: 'Analisar queries lentas do banco de dados'
        };
        
        const response = await agent.processMessage(message);
        
        expect(response.content).toContain('queries');
        expect(response.metadata?.tasksExecuted).toContain('analyze-queries');
    });
});
```

### Teste com Mock de MCP

```typescript
test('deve capturar screenshot do dashboard', async () => {
    // Mock do MCP Bridge
    const mockMCPBridge = {
        navigate: jest.fn(),
        screenshot: jest.fn()
    };
    
    agent['mcpBridge'] = mockMCPBridge as any;
    
    const message: Message = {
        role: 'user',
        content: 'Capturar screenshot do dashboard de banco'
    };
    
    await agent.processMessage(message);
    
    expect(mockMCPBridge.navigate).toHaveBeenCalledWith(
        expect.stringContaining('dashboard')
    );
    expect(mockMCPBridge.screenshot).toHaveBeenCalled();
});
```

## 📚 Boas Práticas

### 1. Nomenclatura

- **ID**: `kebab-case-specialist`
- **Classe**: `PascalCaseSpecialistAgent`
- **Arquivo**: `kebab-case-specialist-agent.ts`

### 2. Capacidades

Defina capacidades claras e específicas:

```typescript
capabilities: [
    'docker-analysis',      // Específico, não genérico
    'container-security',   // Claro sobre o que faz
    'image-optimization'    // Focado no domínio
]
```

### 3. Logs Informativos

```typescript
console.log(`🔍 ${this.config.name} analisando: ${específico}`);
console.log(`✅ Análise concluída: ${resultados.length} itens encontrados`);
console.log(`⚠️ Aviso: ${problema} detectado`);
```

### 4. Tratamento de Erros

```typescript
try {
    const result = await this.performRiskyOperation();
    return result;
} catch (error) {
    console.error(`❌ Erro em ${this.config.name}:`, error);
    
    // Retornar resposta de erro estruturada
    return {
        error: true,
        message: `Falha ao executar operação: ${error.message}`,
        recovery: 'Tente novamente ou execute manualmente'
    };
}
```

### 5. Métricas e Relatórios

```typescript
private async generateReport(results: any): Promise<string> {
    return `
# 📊 Relatório ${this.config.name}

## Resumo
- Itens analisados: ${results.total}
- Problemas encontrados: ${results.issues}
- Tempo de execução: ${results.duration}ms

## Descobertas
${results.findings.map(f => `- ${f}`).join('\n')}

## Recomendações
${results.recommendations.map(r => `1. ${r}`).join('\n')}
`;
}
```

## 🌟 Exemplos

### Exemplo 1: Performance Monitor

```typescript
export class PerformanceSpecialistAgent extends Agent {
    constructor() {
        super({
            id: 'performance-specialist',
            name: 'Performance Specialist',
            description: 'Monitora e otimiza performance do sistema',
            capabilities: [
                'metric-collection',
                'bottleneck-detection',
                'optimization-suggestions'
            ]
        });
    }
    
    private async collectMetrics(): Promise<Metrics> {
        return {
            cpu: await this.getCPUUsage(),
            memory: await this.getMemoryUsage(),
            disk: await this.getDiskUsage(),
            network: await this.getNetworkStats()
        };
    }
}
```

### Exemplo 2: API Tester

```typescript
export class APITesterSpecialistAgent extends Agent {
    constructor() {
        super({
            id: 'api-tester-specialist',
            name: 'API Tester Specialist',
            description: 'Testa e valida endpoints da API',
            capabilities: [
                'endpoint-testing',
                'load-testing',
                'security-scanning'
            ]
        });
    }
    
    private async testEndpoints(): Promise<TestResults> {
        const endpoints = await this.discoverEndpoints();
        const results = [];
        
        for (const endpoint of endpoints) {
            const result = await this.testEndpoint(endpoint);
            results.push(result);
        }
        
        return this.aggregateResults(results);
    }
}
```

## 🔍 Verificação de Duplicação

Antes de criar um novo especialista, verifique se já existe:

### Agentes Existentes:

- **Organização**: Universal Organization Guardian, Source Code Organizer
- **Automação**: Auto Commit, Auto Push
- **Análise**: Guardian Analyzer, Task Timer, Agent Log
- **Melhoria**: Autonomous Improvement
- **Domínio**: Docker, NextJS, Strapi, Security

### Quando criar novo vs. estender existente:

- ✅ **Criar novo**: Domínio completamente diferente
- ✅ **Criar novo**: Conjunto único de capacidades
- ❌ **Não criar**: Funcionalidade já coberta
- ❌ **Não criar**: Pequena variação de existente

## 🚨 Troubleshooting

### Erro: "Specialist not found"

```typescript
// Verificar registro no Guardian
console.log('Especialistas registrados:', this.specialists.keys());
```

### Erro: "MCP Bridge connection failed"

```typescript
// Tornar MCP opcional
if (this.requiresMCP()) {
    try {
        await this.mcpBridge.connect();
    } catch (error) {
        console.warn('MCP não disponível, continuando sem recursos MCP');
        this.mcpAvailable = false;
    }
}
```

### Performance lenta

```typescript
// Executar tarefas em paralelo quando possível
const results = await Promise.all([
    this.analyzeTask1(),
    this.analyzeTask2(),
    this.analyzeTask3()
]);
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte os templates em `template-agents.ts`
2. Examine especialistas existentes como referência
3. Execute testes para validar implementação
4. Verifique logs do Guardian para debug

---

**Lembre-se**: Um bom especialista é focado, confiável e bem documentado. Mantenha o código limpo e as responsabilidades claras!