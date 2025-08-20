# Estrutura de Agentes do Projeto

## Visão Geral

O projeto The Crypto Frontier possui 3 grupos distintos de agentes, organizados por tecnologia e propósito:

## 1. Agentes Python (`/agentes-phyton/`)

**Propósito**: Automação e processamento de dados
**Tecnologia**: Python
**Características**:
- Scripts de automação para tarefas repetitivas
- Integração com APIs externas (exchanges, feeds de notícias)
- Análise e processamento de dados de criptomoedas
- Ferramentas de scraping e coleta de informações

## 2. Agentes TypeScript para Blog (`/claude-agents_blog-ts/`)

**Propósito**: Gerenciamento de conteúdo do blog
**Tecnologia**: TypeScript
**Características**:
- Criação e edição de artigos
- Processamento de conteúdo (formatação, SEO)
- Publicação automática no CMS
- Integração com Strapi para gerenciamento de posts
- Otimização de imagens e mídia

## 3. Agentes CLI (`/claude-flow-diego-cli/`)

**Propósito**: Coordenação e execução via linha de comando
**Tecnologia**: TypeScript/JavaScript
**Localização**: `/claude-flow-diego-cli/claude-diego-flow/src/agents/`

### Agentes Principais:

#### Guardian Orchestrator MCP
- **Arquivo**: `guardian-orchestrator-mcp.ts`
- **Função**: Agente principal de coordenação
- **Capacidades**:
  - Coordenação de outros agentes
  - Sistema de memória persistente
  - Metodologia PDCA (Plan-Do-Check-Act)
  - Integração com MCP (Model Context Protocol)
  - API REST para consultas externas

#### Agentes Especialistas:
- **Docker Specialist**: Gerenciamento de containers
- **NextJS Specialist**: Desenvolvimento frontend
- **Strapi Specialist**: Gerenciamento do CMS
- **Claude Code Specialist**: Integração com Claude
- **Security Analyzer**: Análise de segurança
- **Cleanup Specialist**: Limpeza e organização

## Estrutura de Diretórios Atualizada

```
/home/strapi/thecryptofrontier/
├── agentes-phyton/          # Agentes Python
├── claude-agents_blog-ts/   # Agentes TypeScript para blog
├── claude-flow-diego-cli/   # Agentes CLI e Guardian
├── frontend-nextjs/         # Aplicação Next.js
├── strapi-cms/             # CMS Strapi
├── storybook/              # Componentes UI
└── docs/                   # Documentação
```

## Migração de Estrutura

### Estruturas Antigas (REMOVIDAS):
- `/framework_crewai/` - Migrado para `/agentes-phyton/`
- `/claude-flow-diego/claude-diego-flow/` - Migrado para `/claude-flow-diego-cli/`

### Nova Organização:
A nova estrutura separa claramente os agentes por:
1. **Linguagem**: Python vs TypeScript
2. **Propósito**: Blog, CLI, Automação
3. **Contexto**: Frontend, Backend, DevOps

## Integração entre Agentes

Os agentes podem se comunicar através de:
1. **API REST** do Guardian (porta 3004)
2. **Sistema de memória** compartilhada (Mem0)
3. **Arquivos JSON** de estado
4. **Mensagens MCP** para agentes compatíveis

## Como Adicionar Novos Agentes

1. **Identifique o tipo**: Python, TypeScript Blog ou CLI?
2. **Escolha o diretório** apropriado
3. **Siga o padrão** dos agentes existentes
4. **Registre no Guardian** se necessário
5. **Documente** as capacidades e propósito

## Manutenção

- Sempre atualize esta documentação ao adicionar/remover agentes
- Mantenha o CLAUDE.md sincronizado com mudanças estruturais
- Teste a integração entre agentes após mudanças