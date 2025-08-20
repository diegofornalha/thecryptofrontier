# 🤝 Proposta: Integração Cleanup Specialist + Guardian

## 📋 Visão Geral

Integrar o **Cleanup Specialist Agent** com o **Guardian Orchestrator** para criar um sistema unificado de coordenação, planejamento e organização do projeto.

## 🎯 Objetivos

1. **Guardian** - Coordenação e planejamento estratégico
2. **Cleanup Specialist** - Execução de limpeza e organização
3. **Sinergia** - Guardian planeja, Cleanup executa

## 🏗️ Arquitetura Proposta

```
Guardian Orchestrator MCP
    ├── Análise de Requisições
    ├── Planejamento de Tarefas
    └── Delegação para Especialistas
              ↓
    Cleanup Specialist Agent
        ├── Limpeza de Código
        ├── Organização de Arquivos
        ├── Otimização de Estrutura
        └── Relatórios de Melhoria
```

## 💡 Funcionalidades Integradas

### 1. Análise Periódica Automática

```typescript
// No Guardian
async schedulePeriodicCleanup() {
    // Executar análise semanal
    setInterval(async () => {
        const cleanupTask = {
            type: 'analyze',
            assignedAgent: 'cleanup-specialist',
            priority: 'medium'
        };
        await this.delegateToSpecialist('cleanup', cleanupTask);
    }, 7 * 24 * 60 * 60 * 1000); // Semanalmente
}
```

### 2. Integração com Git Hooks

```bash
# pre-commit hook
#!/bin/bash
# Verificar organização antes de commits
npx tsx guardian-orchestrator.ts check-organization
```

### 3. Comandos Unificados

```bash
# Guardian delega para Cleanup
guardian organize /docs              # Organizar documentação
guardian cleanup --analyze           # Análise completa
guardian cleanup --execute           # Executar limpeza
guardian optimize-structure          # Otimizar estrutura do projeto
```

## 🔧 Implementação

### Fase 1: Corrigir Dependências do Cleanup Specialist

```typescript
// Criar file-system-service.ts ausente
export class FileSystemService {
    async glob(pattern: string, options?: any): Promise<string[]> {
        // Implementar usando glob ou fast-glob
    }
    
    async readFile(path: string): Promise<string> {
        return fs.readFile(path, 'utf-8');
    }
    
    async writeFile(path: string, content: string): Promise<void> {
        await fs.writeFile(path, content);
    }
}
```

### Fase 2: Adicionar Cleanup ao Guardian

```typescript
// Em guardian-orchestrator-mcp.ts
import { CleanupSpecialistAgent } from './cleanup-specialist-agent';

private async initialize() {
    // Adicionar Cleanup Specialist
    const cleanupAgent = new CleanupSpecialistAgent();
    this.specialists.set('cleanup', cleanupAgent);
    
    // Configurar análise periódica
    this.schedulePeriodicCleanup();
}

private analyzeRequest(request: string): string[] {
    const specialists = [];
    
    // Detectar necessidade de limpeza/organização
    if (request.match(/organiz|clean|limpe|estrutur|duplicate|unused/i)) {
        specialists.push('cleanup');
    }
    
    return specialists;
}
```

### Fase 3: Criar Fluxos de Trabalho

#### Fluxo de Organização de Documentação

```typescript
async organizeDocumentation() {
    const plan = [
        {
            agent: 'cleanup',
            task: 'analyze',
            input: { 
                path: '/docs',
                focus: 'organization'
            }
        },
        {
            agent: 'cleanup',
            task: 'organize',
            input: {
                createStructure: true,
                moveFiles: true
            }
        }
    ];
    
    return this.executePlan(plan);
}
```

#### Fluxo de Limpeza de Código

```typescript
async cleanupCodebase() {
    const plan = [
        {
            agent: 'cleanup',
            task: 'analyze',
            input: {
                includeTests: false,
                aggressive: false
            }
        },
        {
            agent: 'guardian',
            task: 'review',
            input: 'cleanup-report'
        },
        {
            agent: 'cleanup',
            task: 'cleanup',
            input: {
                dryRun: false,
                approved: true
            }
        }
    ];
    
    return this.executePlan(plan);
}
```

## 📊 Benefícios da Integração

### 1. Automação Inteligente
- Guardian identifica quando limpeza é necessária
- Cleanup executa com base em planos do Guardian
- Relatórios integrados no sistema de logs

### 2. Manutenção Proativa
- Análises periódicas automáticas
- Alertas sobre problemas de organização
- Sugestões de melhorias contínuas

### 3. Coordenação Eficiente
- Guardian prioriza tarefas de limpeza
- Cleanup reporta progresso em tempo real
- Integração com outros especialistas

## 🛠️ Tarefas de Implementação

### Imediatas
- [ ] Criar `file-system-service.ts`
- [ ] Criar `git-service.ts`
- [ ] Corrigir imports no cleanup-specialist
- [ ] Adicionar cleanup ao Guardian

### Próximas
- [ ] Implementar fluxos de trabalho
- [ ] Criar comandos CLI unificados
- [ ] Adicionar testes de integração
- [ ] Documentar novos comandos

### Futuras
- [ ] Dashboard de saúde do projeto
- [ ] Métricas de organização
- [ ] Integração com CI/CD
- [ ] Relatórios automáticos

## 📈 Métricas de Sucesso

1. **Redução de Duplicação**: -30% arquivos duplicados
2. **Organização**: 100% dos arquivos em estrutura correta
3. **Manutenibilidade**: Score de organização > 80%
4. **Automação**: 0 intervenções manuais necessárias

## 🚀 Próximos Passos

1. **Aprovar proposta**
2. **Implementar dependências faltantes**
3. **Integrar Cleanup ao Guardian**
4. **Testar fluxos básicos**
5. **Deploy gradual**

## 💡 Casos de Uso

### 1. "Organizar pasta docs"
```
User: Organize a pasta docs
Guardian: Analisando estrutura... delegando para Cleanup Specialist
Cleanup: Criando estrutura organizada, movendo 37 arquivos
Guardian: Organização concluída! Relatório disponível.
```

### 2. "Limpar código não utilizado"
```
User: Remover código morto do projeto
Guardian: Iniciando análise de código... 
Cleanup: Encontrados 15 arquivos com código não utilizado
Guardian: Deseja prosseguir com a limpeza? [s/n]
```

### 3. "Análise de saúde do projeto"
```
User: Como está a organização do projeto?
Guardian: Executando análise completa...
Cleanup: Score de organização: 75%
- 5 arquivos duplicados
- 12 dependências não utilizadas
- 3 diretórios vazios
Guardian: Recomendo executar limpeza. Prosseguir?
```

---

**Conclusão**: A integração do Cleanup Specialist com o Guardian criará um sistema robusto de manutenção automática, garantindo que o projeto permaneça organizado e otimizado continuamente.