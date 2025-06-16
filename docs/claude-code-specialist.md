# 🤖 Claude Code Specialist

## Visão Geral

O Claude Code Specialist é um agente especializado em boas práticas do Claude Code, gerenciamento de memória, convenções de código e produtividade no desenvolvimento. Ele evolui automaticamente através do sistema mem0, melhorando suas capacidades com o tempo.

## Funcionalidades

### 📌 Versão e Status
- **Versão Claude Code**: 0.2.9
- **Versão do Especialista**: 4.0.0
- **Status**: Beta Product
- **Disclaimer**: All code acceptance/rejection decisions constitute Feedback under Anthropic's Commercial Terms

### 🎯 Modos de Operação

1. **Modo Conciso** (padrão)
   - Respostas diretas e objetivas
   - Menos de 4 linhas quando possível
   - Sem preâmbulos desnecessários

2. **Modo Formal**
   - Apropriado para ambientes corporativos
   - Estrutura cuidadosa com seções claras
   - Tom formal mas claro

3. **Modo Explicativo**
   - Ensino detalhado e completo
   - Abordagem de professor
   - Explicações passo a passo

### 🚀 Capacidades

- **Melhores práticas do Claude Code**
- **Gerenciamento de memória (CLAUDE.md)**
- **Convenções de código**
- **Automação de tarefas**
- **Otimização de busca**
- **Eficiência no uso de ferramentas**
- **Conformidade de segurança**
- **Comandos slash**
- **Análise de artifacts**
- **Desenvolvimento proativo**

### 🔄 Evolução Automática

O especialista evolui automaticamente:
- Versão inicial: 4.0.0
- Aprende com interações via mem0
- Evolui incrementalmente (4.0.1, 4.0.2, etc.)
- Salva histórico de evolução
- Aplica melhorias dinamicamente

## Instalação e Uso

### Execução Local

```bash
# Executar diretamente
npx tsx src/agents/claude-code-specialist-agent.ts "sua consulta"

# Exemplos de consultas
npx tsx src/agents/claude-code-specialist-agent.ts "analisar produtividade"
npx tsx src/agents/claude-code-specialist-agent.ts "analisar artifacts"
npx tsx src/agents/claude-code-specialist-agent.ts "analisar convenções"
```

### Execução em Container

```bash
# Build da imagem
cd claude-diego-flow
docker build -f docker/Dockerfile.claude-code-specialist -t claude-flow/claude-code-specialist:latest .

# Executar com docker-compose
docker-compose -f docker-compose.agents-optimized.yml --profile specialists up -d

# Testar o container
./test-claude-code-specialist.sh
```

### Via Guardian Orchestrator

```bash
# O Guardian detecta automaticamente palavras-chave
npx tsx src/agents/guardian-orchestrator-mcp.ts "analisar produtividade claude code"
npx tsx src/agents/guardian-orchestrator-mcp.ts "convenções de código"
npx tsx src/agents/guardian-orchestrator-mcp.ts "gerenciamento de memória claude.md"
```

## Palavras-chave de Ativação

O Guardian ativa o Claude Code Specialist quando detecta:
- `claude code`
- `produtividade` / `productivity`
- `convenção` / `convention`
- `ferramenta` / `tool usage`
- `memory management`
- `claude.md`
- `slash command`
- `modo conciso` / `modo formal` / `modo explicativo`
- `artifact` / `artefato`

## Configuração do Container

### Volumes
- `/workspace`: Acesso read-only ao workspace
- `/app/CLAUDE.md`: Acesso ao arquivo CLAUDE.md
- `/app/logs`: Logs do especialista

### Variáveis de Ambiente
- `NODE_ENV=production`
- `ORCHESTRATOR_URL`: URL do Guardian
- `LOG_SERVICE_URL`: URL do serviço de logs
- `MCP_BRIDGE_URL`: URL do MCP Bridge para mem0

### Recursos
- CPU: 0.3 cores (limite)
- Memória: 256MB (limite)

## Análises Disponíveis

### 1. Análise de Memória
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar memória"
```
- Status do CLAUDE.md
- Análise de conteúdo
- Melhores práticas de memória

### 2. Análise de Convenções
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar convenções"
```
- Arquivos de convenção (ESLint, Prettier, etc.)
- Convenções documentadas
- Recomendações

### 3. Análise de Segurança
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar segurança"
```
- Regras de segurança do Claude Code
- Verificações de segurança
- Recomendações

### 4. Análise de Ferramentas
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar ferramentas"
```
- Ferramentas principais
- Melhores práticas de uso
- Otimizações

### 5. Análise de Produtividade
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar produtividade"
```
- Comandos slash
- Dicas de produtividade
- Análise do projeto

### 6. Análise de Artifacts
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar artifacts"
```
- Quando usar/não usar artifacts
- Tipos disponíveis
- Melhores práticas
- Estratégias de atualização

### 7. Análise de Git Workflow
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar git workflow"
```
- Processo detalhado de commit
- Formato de mensagens com HEREDOC
- Processo de Pull Request
- Regras e melhores práticas

### 8. Análise de Comandos Banidos
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar comandos banidos"
```
- Lista completa de comandos bloqueados
- Razões de segurança (prompt injection)
- Alternativas recomendadas
- Políticas de segurança

### 9. Análise de Verbosidade
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analisar verbosidade"
```
- Diretrizes de concisão
- Exemplos de respostas ideais
- Exceções quando ser detalhado
- Dicas para CLI mindset

### 10. Análise de Ferramentas Nativas
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analyze native tools"
```
- Lista completa de ferramentas core do Claude Code
- Ferramentas de prompt (init, pr-comments, review)
- Ferramentas locais (clear, compact)
- Melhores práticas de File Edit
- Nomes internos vs user-facing

### 11. Análise de Comandos CLI
```bash
npx tsx src/agents/claude-code-specialist-agent.ts "analyze CLI terminal"
```
- Comando principal e todas as opções
- Comandos de configuração
- Comandos MCP (Model Context Protocol)
- Ferramentas aprovadas
- Action verbs divertidos para progresso

## Comandos Slash

- `/help` - Obter ajuda sobre o uso do Claude Code
- `/compact` - Compactar e continuar a conversa (útil quando atinge limite de contexto)
- `/mode` - Alternar entre modos (concise, formal, explanatory)
- `/memory` - Gerenciar memória do projeto (CLAUDE.md)
- `claude -h` - Ver comandos e flags suportados (sempre verificar antes de assumir)

## Melhores Práticas

### Segurança
- Recusar código malicioso
- Não trabalhar em arquivos suspeitos
- Seguir práticas de segurança
- Nunca expor segredos

### Gerenciamento de Tarefas
- Usar ferramentas de busca
- Verificar com testes
- Executar lint e typecheck
- Nunca fazer commit sem solicitação

### Convenções de Código
- Seguir convenções existentes
- Nunca assumir bibliotecas
- Manter estilo consistente
- Seguir padrões do projeto

### Uso de Ferramentas
- Agent tool para reduzir contexto
- Múltiplas ferramentas em paralelo
- Batch tool calls
- Preferir search tools

## Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker logs claude-code-specialist

# Verificar rede
docker network ls | grep agent-network

# Criar rede se necessário
docker network create agent-network
```

### Erro de permissão CLAUDE.md
```bash
# Verificar se CLAUDE.md existe
ls -la ../CLAUDE.md

# Criar se não existir
touch ../CLAUDE.md
```

### MCP Connection Failed
- Normal em execução local
- Container precisa do mem0-bridge rodando
- Funciona sem MCP mas sem evolução automática

## Integração com Guardian

O Guardian automaticamente:
1. Detecta palavras-chave relacionadas
2. Inicializa o especialista
3. Delega a análise
4. Agrega resultados com outros especialistas
5. Gera relatório consolidado

## Evolução e Aprendizado

O especialista:
1. Carrega histórico de evolução na inicialização
2. Verifica aprendizados recentes
3. Aplica melhorias ao knowledge base
4. Incrementa versão quando evolui
5. Salva evolução no mem0

Para forçar evolução manual:
```javascript
// Adicionar aprendizados ao mem0 com tags apropriadas
// O especialista detectará na próxima inicialização
```

## Contribuindo

Para melhorar o especialista:
1. Adicione novos padrões ao `knowledgeBase`
2. Implemente novas análises
3. Melhore detecção de categorias
4. Adicione mais modos de operação
5. Expanda capacidades

## Integração com Claude Code Nativo

O especialista foi projetado para trabalhar perfeitamente com o Claude Code instalado no sistema:

### Compatibilidade
- **Versão suportada**: 0.2.9
- **Conhece todas as ferramentas nativas**
- **Entende políticas de segurança implementadas**
- **Segue diretrizes de verbosidade do Claude Code**

### Como usar junto
1. **Para análise de projeto**: Use o especialista via Guardian
2. **Para execução de código**: Use o Claude Code nativo
3. **Para documentação**: Especialista ajuda a criar CLAUDE.md
4. **Para melhores práticas**: Especialista fornece orientações

### Fluxo de trabalho recomendado
```bash
# 1. Analisar projeto com o especialista
npx tsx src/agents/guardian-orchestrator-mcp.ts "analisar projeto claude code"

# 2. Obter recomendações específicas
npx tsx src/agents/claude-code-specialist-agent.ts "analyze native tools"

# 3. Executar com Claude Code nativo
claude "implementar as recomendações do especialista"

# 4. Documentar em CLAUDE.md
claude init
```

## Roadmap

- [ ] Integração com mais ferramentas MCP
- [ ] Análise de performance de código
- [ ] Sugestões de refatoração
- [ ] Templates de código
- [ ] Integração com CI/CD
- [ ] Sincronização automática com atualizações do Claude Code