# Sistema Unificado Guardian + Log + Mem0

## Visão Geral

Este documento descreve o sistema integrado de Guardian Inteligente com Logging Unificado e Memória Persistente (Mem0).

## Componentes

### 1. Agent Log Unified (`agent-log-unified.ts`)
Sistema centralizado de logging que:
- Registra todas as ações dos agentes
- Salva logs no Mem0 para persistência
- Fornece API REST para consulta
- Suporta diferentes formatos (texto, conversacional, estruturado)

### 2. Guardian Intelligent (`guardian-intelligent.ts`)
Guardian com capacidade de aprendizado que:
- Aprende com análises anteriores
- Identifica padrões de problemas recorrentes
- Cria planos inteligentes baseados em memória
- Se auto-organiza e melhora continuamente

### 3. Guardian Enhanced (`guardian-standalone-enhanced.ts`)
Versão do Guardian com logging integrado que:
- Registra automaticamente todas as ações
- Cria planos estruturados
- Documenta progresso de tarefas

## Como Usar

### 1. Iniciar o Mem0 (Pré-requisito)

```bash
cd /home/strapi/thecryptofrontier/claude-flow-diego
docker compose up -d mem0-bridge
```

### 2. Testar o Sistema Completo

```bash
cd /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow
npx tsx src/test-unified-system.ts
```

### 3. Executar Guardian Inteligente

#### Modo Análise Única:
```bash
npx tsx src/agents/guardian-intelligent.ts /home/strapi/thecryptofrontier
```

#### Modo Aprendizado Contínuo:
```bash
npx tsx src/agents/guardian-intelligent.ts /home/strapi/thecryptofrontier learning
```

### 4. Iniciar API de Logs

```bash
npx tsx src/agents/agent-log-unified.ts
```

A API estará disponível em http://localhost:3001 com os endpoints:
- `GET /health` - Status do serviço
- `POST /log` - Criar log genérico
- `POST /log/plan` - Registrar plano
- `POST /log/task/start` - Iniciar tarefa
- `POST /log/task/progress` - Progresso de tarefa
- `POST /log/task/complete` - Completar tarefa
- `POST /log/error` - Registrar erro
- `GET /logs/search` - Buscar logs
- `GET /stats` - Estatísticas

### 5. Deploy com Docker

```bash
cd /home/strapi/thecryptofrontier/claude-flow-diego
docker compose up -d agent-log-unified
```

## Fluxo de Funcionamento

1. **Guardian cria um plano** → Automaticamente registrado no Log Unificado
2. **Log Unificado salva no Mem0** → Persistência garantida
3. **Guardian executa tarefas** → Cada etapa é registrada
4. **Guardian aprende** → Salva padrões e soluções no Mem0
5. **Próxima execução** → Guardian usa memória para melhorar

## Benefícios

### 1. Logging Automático
- Toda ação é registrada sem código adicional
- Rastreabilidade completa das operações
- Histórico persistente

### 2. Aprendizado Contínuo
- Guardian identifica problemas recorrentes
- Propõe soluções baseadas em experiências
- Melhora a cada execução

### 3. Visibilidade Total
- API para consultar logs
- Relatórios detalhados
- Estatísticas em tempo real

### 4. Integração Transparente
- Funciona com agentes existentes
- Não requer mudanças no código atual
- Plug-and-play

## Arquivos Importantes

- `/claude-flow-diego/claude-diego-flow/src/agents/agent-log-unified.ts` - Sistema de log
- `/claude-flow-diego/claude-diego-flow/src/agents/guardian-intelligent.ts` - Guardian inteligente
- `/claude-flow-diego/claude-diego-flow/src/agents/guardian-standalone-enhanced.ts` - Guardian com log
- `/claude-flow-diego/docker-compose.yml` - Configuração Docker
- `/strapi/docs/GUARDIAN-INTELLIGENT-REPORT.md` - Relatórios gerados

## Troubleshooting

### Mem0 não está respondendo
```bash
# Verificar se está rodando
docker ps | grep mem0

# Ver logs
docker logs mem0-bridge

# Reiniciar
docker restart mem0-bridge
```

### Erro de permissão no Mem0
```bash
# Executar script de correção
./scripts/docker/fix-mem0-permissions-v2.sh
```

### Guardian não encontra memórias
- Verificar se Mem0 está acessível na porta 3002
- Confirmar que as memórias estão sendo salvas
- Usar o endpoint `/mcp/list_memories/guardian-intelligent`

## Próximos Passos

1. **Adicionar mais agentes** - Integrar outros agentes com o sistema de log
2. **Dashboard visual** - Interface web para visualizar logs e estatísticas
3. **Alertas inteligentes** - Notificações baseadas em padrões aprendidos
4. **Backup automático** - Exportar memórias periodicamente

## Conclusão

O sistema unificado Guardian + Log + Mem0 fornece uma solução completa para:
- Organização inteligente de projetos
- Logging centralizado e persistente
- Aprendizado contínuo e melhoria automática

Com este sistema, o Guardian não apenas organiza o projeto, mas aprende e melhora continuamente, tornando-se mais eficiente a cada execução.