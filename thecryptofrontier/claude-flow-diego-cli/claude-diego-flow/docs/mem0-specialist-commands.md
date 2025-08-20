# 🧠 Comandos do Especialista Mem0

## Visão Geral

O Especialista Mem0 é responsável por gerenciar o sistema de memórias persistentes do Claude Flow. Ele permite armazenar, buscar e organizar contexto entre conversas.

## Como Executar

### Via Guardian (Recomendado)
```bash
./guardian-orchestrator-mcp.ts "mem0: [comando]"
```

### Diretamente
```bash
npx tsx src/agents/mem0-specialist-agent.ts "[comando]"
```

## Comandos Disponíveis

### 📋 Gerenciamento de Memórias

#### Listar Memórias
Lista todas as memórias armazenadas, organizadas por categoria.
```bash
# Via Guardian
./guardian "mem0: listar memórias"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "listar"
```

#### Buscar Memórias
Busca memórias específicas por palavra-chave ou conteúdo.
```bash
# Via Guardian
./guardian "mem0: buscar docker"
./guardian "mem0: encontrar configurações strapi"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "buscar docker"
```

#### Limpar Memórias Antigas
Analisa e sugere limpeza de memórias antigas ou duplicadas.
```bash
# Via Guardian
./guardian "mem0: limpar memórias antigas"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "limpar"
```

#### Categorizar Memórias
Organiza memórias sem categoria e sugere categorização automática.
```bash
# Via Guardian
./guardian "mem0: categorizar memórias"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "categorizar"
```

### 🏥 Monitoramento e Saúde

#### Verificar Saúde dos Serviços
Verifica o status de todos os serviços do sistema Mem0.
```bash
# Via Guardian
./guardian "mem0: verificar saúde"
./guardian "mem0: status dos serviços"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "saúde"
```

#### Health Check Automático
Script dedicado para verificação de saúde com opções avançadas.
```bash
# Verificação única
./scripts/mem0-health-check.sh check

# Modo daemon (verifica a cada 5 minutos)
./scripts/mem0-health-check.sh daemon

# Com auto-restart de serviços parados
./scripts/mem0-health-check.sh auto-restart
```

### 💾 Backup e Restauração

#### Criar Backup
Cria backup completo do sistema de memórias.
```bash
# Via Guardian
./guardian "mem0: fazer backup"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "backup"
```

#### Restaurar Backup
Lista backups disponíveis e fornece instruções de restauração.
```bash
# Via Guardian
./guardian "mem0: restaurar backup"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "restore"
```

### 📊 Análise e Estatísticas

#### Estatísticas de Uso
Mostra estatísticas detalhadas sobre as memórias armazenadas.
```bash
# Via Guardian
./guardian "mem0: estatísticas"
./guardian "mem0: analytics"

# Direto
npx tsx src/agents/mem0-specialist-agent.ts "estatísticas"
```

#### Monitoramento Contínuo
Gera relatórios periódicos sobre o sistema.
```bash
# Relatório único
npx tsx src/agents/mem0-monitor.ts report

# Monitoramento contínuo (padrão: 15 min)
npx tsx src/agents/mem0-monitor.ts monitor

# Status rápido
npx tsx src/agents/mem0-monitor.ts status
```

## 🔧 Exemplos de Uso

### Exemplo 1: Workflow Completo de Manutenção
```bash
# 1. Verificar saúde
./guardian "mem0: verificar saúde"

# 2. Ver estatísticas
./guardian "mem0: estatísticas"

# 3. Limpar memórias antigas
./guardian "mem0: limpar memórias"

# 4. Fazer backup
./guardian "mem0: fazer backup"
```

### Exemplo 2: Busca e Organização
```bash
# 1. Buscar memórias sobre um tópico
./guardian "mem0: buscar configuração docker"

# 2. Listar todas as memórias
./guardian "mem0: listar"

# 3. Categorizar não organizadas
./guardian "mem0: categorizar"
```

### Exemplo 3: Monitoramento Automatizado
```bash
# Iniciar health check em modo daemon
./scripts/mem0-health-check.sh daemon 300 &

# Iniciar monitor de estatísticas
npx tsx src/agents/mem0-monitor.ts monitor 15 &
```

## 📁 Estrutura de Logs

Os logs são salvos em:
```
/home/strapi/thecryptofrontier/logs/mem0/
├── health-check-YYYYMMDD.log    # Logs do health check
├── mem0-report-*.md              # Relatórios do monitor
└── ...
```

## 🚨 Troubleshooting

### Serviços não estão rodando
```bash
# Verificar status
docker ps --filter name=mem0

# Reiniciar serviços
docker-compose -f infrastructure-docker/docker-yml/docker-compose.yml up -d mem0-bridge mem0-chroma
```

### Endpoint não responde
```bash
# Verificar logs do container
docker logs mem0-bridge
docker logs mem0-chroma

# Reiniciar com logs
docker-compose -f infrastructure-docker/docker-yml/docker-compose.yml up mem0-bridge
```

### Memórias não são encontradas
```bash
# Verificar se o bridge está conectado
curl http://localhost:3002/health

# Testar busca diretamente
curl -X POST http://localhost:3002/mcp/search_memories \
  -H "Content-Type: application/json" \
  -d '{"query": "*", "limit": 10}'
```

## 🔗 Integração com Outros Agentes

Outros agentes podem usar o serviço Mem0 através do módulo auxiliar:

```typescript
import { mem0Service } from './mem0-specialist-service';

// Salvar contexto
await mem0Service.saveConversationContext({
    agentId: 'docker-specialist',
    userMessage: 'Como otimizar containers?',
    agentResponse: 'Use multi-stage builds...'
});

// Buscar conhecimento relacionado
const memories = await mem0Service.findRelatedKnowledge('docker optimization');
```

## 📝 Notas Importantes

1. **Performance**: Para grandes volumes de memórias (>10k), as buscas podem demorar mais
2. **Backup**: Recomenda-se fazer backup diário das memórias importantes
3. **Limpeza**: Execute limpeza mensal para remover duplicatas e memórias antigas
4. **Monitoramento**: Configure o health check em modo daemon para produção