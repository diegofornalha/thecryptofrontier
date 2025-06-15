# Integração Guardian com MCP Diego Tools

## 📋 Estrutura Atual do Guardian

### Guardian Orchestrator
O Guardian Orchestrator (`guardian-orchestrator.ts`) é o agente central que coordena todos os especialistas:
- **Docker Specialist** - Já tem integração MCP (simulada)
- **NextJS Specialist**
- **Strapi Specialist**
- **Security Analyzer**

### Estrutura Básica
```typescript
export class GuardianOrchestrator extends Agent {
    private specialists: Map<string, Agent>;
    
    // Coordena e delega tarefas para especialistas
    async processMessage(message: Message): Promise<Message>
    
    // Analisa requisições e determina especialistas necessários
    private async analyzeRequest(request: string): Promise<RequestAnalysis>
    
    // Delega para especialistas e agrega resultados
    private async delegateToSpecialists(analysis: RequestAnalysis)
}
```

## 🔧 Como o Guardian Pode Usar MCP Diego Tools

### 1. Ferramentas Disponíveis no MCP Diego Tools

```typescript
export const MCP_TOOLS = {
  // Puppeteer - Navegação Web
  WEB_NAVIGATE: 'puppeteer_navigate',
  WEB_SCREENSHOT: 'puppeteer_screenshot',
  WEB_CLICK: 'puppeteer_click',
  WEB_TYPE: 'puppeteer_type',
  WEB_GET_CONTENT: 'puppeteer_get_content',
  
  // GitHub - Gerenciamento de Repositório
  GITHUB_CREATE_ISSUE: 'github_create_issue',
  GITHUB_LIST_ISSUES: 'github_list_issues',
  GITHUB_CREATE_PR: 'github_create_pr',
  GITHUB_CREATE_REPO: 'github_create_repo',
  GITHUB_PUSH_FILES: 'github_push_files',
  
  // Git - Controle de Versão
  GIT_STATUS: 'git_status',
  GIT_COMMIT: 'git_commit',
  GIT_PUSH: 'git_push',
  GIT_PULL: 'git_pull',
  
  // Mem0 - Gerenciamento de Memória
  MEMORY_ADD: 'mem0_add_memory',
  MEMORY_SEARCH: 'mem0_search_memory',
  MEMORY_LIST: 'mem0_list_memories',
  MEMORY_DELETE: 'mem0_delete_memories'
};
```

### 2. Integração via MCPBridge

O Guardian pode usar o `MCPBridge` existente para se conectar ao MCP Diego Tools:

```typescript
import { MCPBridge } from '../mcp/mcp-bridge';

export class GuardianOrchestrator extends Agent {
    private mcpBridge: MCPBridge;
    
    async initialize(): Promise<void> {
        // Inicializar conexão MCP
        this.mcpBridge = new MCPBridge();
        await this.mcpBridge.connect();
        
        // ... resto da inicialização
    }
}
```

## 💡 Exemplos Práticos de Uso

### 1. Documentação Automática com Screenshots

```typescript
// Guardian pode documentar o estado atual do projeto
async documentProjectState(): Promise<void> {
    // Navegar para a aplicação
    await this.mcpBridge.navigate('http://localhost:3000');
    
    // Capturar screenshot da home
    await this.mcpBridge.screenshot('./docs/screenshots/home.png', true);
    
    // Salvar na memória
    await this.mcpBridge.addMemory(
        'guardian',
        'Screenshot da home page capturado',
        { type: 'documentation', timestamp: new Date() }
    );
}
```

### 2. Gerenciamento de Issues no GitHub

```typescript
// Guardian pode criar issues para problemas encontrados
async createSecurityIssue(vulnerabilities: string[]): Promise<void> {
    const issueBody = `
## 🔒 Vulnerabilidades de Segurança Detectadas

O Guardian detectou as seguintes vulnerabilidades:

${vulnerabilities.map(v => `- ${v}`).join('\n')}

### Ações Recomendadas
1. Revisar cada vulnerabilidade
2. Aplicar patches necessários
3. Re-executar análise de segurança

---
*Issue criada automaticamente pelo Guardian Agent*
    `;
    
    await this.mcpBridge.createGithubIssue(
        'seu-usuario',
        'thecryptofrontier',
        '🚨 Vulnerabilidades de Segurança Detectadas',
        issueBody
    );
}
```

### 3. Monitoramento e Memória Persistente

```typescript
// Guardian pode manter histórico de análises
async saveAnalysisToMemory(analysis: any): Promise<void> {
    // Salvar análise completa
    await this.mcpBridge.addMemory(
        'guardian-analysis',
        JSON.stringify(analysis),
        { 
            type: 'analysis',
            specialists: analysis.specialists,
            timestamp: new Date(),
            priority: analysis.priority
        }
    );
    
    // Buscar análises anteriores para comparação
    const previousAnalyses = await this.mcpBridge.searchMemory(
        'guardian-analysis',
        'security vulnerabilities',
        5
    );
    
    // Comparar e identificar tendências
    this.analyzeTrends(previousAnalyses);
}
```

### 4. Automação de Git

```typescript
// Guardian pode commitar mudanças automaticamente
async commitSecurityFixes(): Promise<void> {
    // Verificar status
    const status = await this.mcpBridge.gitStatus(true);
    
    if (status.hasChanges) {
        // Commitar mudanças
        await this.mcpBridge.callTool(MCP_TOOLS.GIT_COMMIT, {
            message: '🔒 fix: security patches applied by Guardian',
            addAll: true
        });
        
        // Push para o repositório
        await this.mcpBridge.callTool(MCP_TOOLS.GIT_PUSH, {});
    }
}
```

## 🏗️ Implementação Proposta

### 1. Adicionar MCPBridge ao Guardian

```typescript
// guardian-orchestrator.ts
export class GuardianOrchestrator extends Agent {
    private specialists: Map<string, Agent>;
    private projectRoot: string;
    private mcpBridge: MCPBridge; // NOVO
    
    async initialize(): Promise<void> {
        console.log('🛡️ Guardian Orchestrator initializing...');
        
        // Inicializar MCP Bridge
        this.mcpBridge = new MCPBridge();
        await this.mcpBridge.connect();
        console.log('✅ MCP Bridge connected');
        
        // ... resto da inicialização
    }
}
```

### 2. Criar Novos Métodos de Análise

```typescript
private async performWebAnalysis(): Promise<string> {
    console.log('🌐 Performing web analysis via MCP...');
    
    // Navegar para diferentes páginas
    const pages = [
        { url: 'http://localhost:3000', name: 'home' },
        { url: 'http://localhost:3000/blog', name: 'blog' },
        { url: 'http://localhost:1337/admin', name: 'strapi-admin' }
    ];
    
    for (const page of pages) {
        await this.mcpBridge.navigate(page.url);
        await this.mcpBridge.screenshot(
            `./reports/screenshots/${page.name}-${Date.now()}.png`
        );
    }
    
    return 'Web analysis completed with screenshots';
}

private async syncWithGitHub(): Promise<string> {
    // Listar issues abertas
    const issues = await this.mcpBridge.callTool(
        MCP_TOOLS.GITHUB_LIST_ISSUES,
        { owner: 'user', repo: 'thecryptofrontier', state: 'open' }
    );
    
    // Criar relatório
    return `Found ${issues.length} open issues on GitHub`;
}
```

### 3. Integrar com Sistema de Memória

```typescript
private async loadPreviousAnalyses(): Promise<any[]> {
    // Buscar análises anteriores da memória
    const memories = await this.mcpBridge.searchMemory(
        'guardian',
        'analysis report',
        10
    );
    
    return memories.map(m => JSON.parse(m.content));
}

private async saveReport(content: string): Promise<void> {
    // Salvar no filesystem (existente)
    await fs.writeFile(filepath, content, 'utf-8');
    
    // NOVO: Também salvar na memória MCP
    await this.mcpBridge.addMemory(
        'guardian-reports',
        content,
        {
            type: 'report',
            timestamp: new Date(),
            specialists: this.getActiveSpecialists()
        }
    );
}
```

## 🚀 Benefícios da Integração

### 1. **Persistência de Dados**
- Histórico completo de análises via Mem0
- Comparação temporal de métricas
- Aprendizado contínuo do sistema

### 2. **Automação Avançada**
- Criação automática de issues
- Commits e PRs automatizados
- Screenshots para documentação

### 3. **Monitoramento Visual**
- Captura de telas do sistema
- Validação visual de deploys
- Documentação automática com imagens

### 4. **Integração com CI/CD**
- Commits automáticos de fixes
- Criação de PRs para melhorias
- Tracking de issues

## 📝 Próximos Passos

1. **Implementar MCPBridge no Guardian**
   - Adicionar inicialização do MCPBridge
   - Criar métodos auxiliares para cada tipo de ferramenta

2. **Criar Especialistas MCP**
   - WebAnalyzer Agent (usando Puppeteer)
   - GitHubManager Agent (para issues e PRs)
   - MemoryKeeper Agent (para gestão de conhecimento)

3. **Testes e Validação**
   - Testar cada integração individualmente
   - Validar fluxo completo de análise

4. **Documentação**
   - Documentar novos comandos
   - Criar exemplos de uso
   - Atualizar README com novas capacidades

## 🔌 Configuração Necessária

```bash
# Variáveis de ambiente necessárias
export GITHUB_TOKEN="seu-token-github"
export MEM0_API_KEY="sua-api-key-mem0"
export MEM0_BASE_URL="https://api.mem0.ai"
```

## 🎯 Casos de Uso Específicos

### 1. **Análise de Deploy**
```typescript
// Guardian verifica se deploy foi bem sucedido
await guardian.analyzeDeployment({
    captureScreenshots: true,
    checkEndpoints: true,
    createIssueIfFailed: true
});
```

### 2. **Auditoria de Segurança**
```typescript
// Guardian faz scan completo e reporta
await guardian.securityAudit({
    scanCode: true,
    scanContainers: true,
    createSecurityReport: true,
    autoFixMinorIssues: true
});
```

### 3. **Documentação Automática**
```typescript
// Guardian gera documentação visual
await guardian.generateVisualDocs({
    captureAllPages: true,
    createflowDiagrams: true,
    updateReadme: true
});
```

---

Esta integração transformará o Guardian em um agente verdadeiramente autônomo, capaz de:
- 🔍 Monitorar visualmente o sistema
- 📝 Documentar automaticamente mudanças  
- 🚨 Criar issues para problemas encontrados
- 💾 Manter memória persistente de todas as análises
- 🔧 Executar ações corretivas automaticamente