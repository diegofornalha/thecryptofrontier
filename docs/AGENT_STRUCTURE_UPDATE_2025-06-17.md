# Atualização da Estrutura de Agentes - 17/06/2025

## Resumo das Mudanças

### Nova Estrutura de Agentes

O projeto foi reorganizado para ter 3 grupos distintos de agentes:

1. **`/agentes-python/`** - Agentes em Python
   - Scripts de automação
   - Processamento de dados
   - Integrações com APIs externas

2. **`/claude-agents_blog-ts/`** - Agentes TypeScript para Blog
   - Criação e edição de conteúdo
   - Publicação no CMS
   - Otimização SEO

3. **`/claude-flow-diego-cli/`** - Agentes CLI
   - Guardian Orchestrator (coordenador principal)
   - Agentes especialistas
   - Ferramentas de linha de comando

### Estruturas Removidas

As seguintes estruturas antigas foram removidas:
- `/framework_crewai/` - Conteúdo migrado para `/agentes-python/`
- `/claude-flow-diego/claude-diego-flow/` - Migrado para `/claude-flow-diego-cli/`

## Arquivos Atualizados

### 1. CLAUDE.md
- Atualizada estrutura de diretórios principal
- Removidas referências a `framework_crewai`
- Adicionada nova organização de agentes
- Atualizado checklist para novos arquivos

### 2. Guardian Orchestrator MCP
- **Arquivo**: `/claude-flow-diego-cli/claude-diego-flow/src/agents/guardian-orchestrator-mcp.ts`
- Adicionado comentário documentando nova estrutura
- Referência ao arquivo `AGENTS_STRUCTURE.md`

### 3. MCP Tools - Agents Index
- **Arquivo**: `/claude-flow-diego-cli/mcp-diego-tools/src/tools/agents/index.ts`
- Atualizado caminho base dos agentes

### 4. Docker Compose - Agents
- **Arquivo**: `/infrastructure/docker-yml/docker-compose.agents.yml`
- Atualizados todos os caminhos de contexto
- Atualizados volumes para novo caminho

## Novos Arquivos Criados

### 1. AGENTS_STRUCTURE.md
- **Local**: `/claude-flow-diego-cli/claude-diego-flow/src/agents/AGENTS_STRUCTURE.md`
- Documentação detalhada da nova estrutura
- Guia de migração
- Instruções para adicionar novos agentes

### 2. Este Documento
- **Local**: `/docs/AGENT_STRUCTURE_UPDATE_2025-06-17.md`
- Registro histórico das mudanças realizadas

## Próximos Passos

1. **Verificar** se existem outros arquivos com referências antigas
2. **Testar** a execução dos agentes após mudanças
3. **Atualizar** scripts de deploy se necessário
4. **Comunicar** a equipe sobre as mudanças

## Impacto

- Melhor organização e separação de responsabilidades
- Facilita manutenção e adição de novos agentes
- Clara distinção entre tecnologias e propósitos
- Guardian agora tem conhecimento documentado da estrutura