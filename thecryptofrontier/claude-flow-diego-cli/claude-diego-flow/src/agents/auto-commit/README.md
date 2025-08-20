# Auto Commit Agent - Arquitetura Modular

## Estrutura de Módulos

### 1. Core
- `auto-commit-core.ts` - Lógica principal do agente
- `interfaces.ts` - Interfaces e tipos TypeScript
- `constants.ts` - Constantes e configurações

### 2. Services
- `git-service.ts` - Operações Git
- `ssh-service.ts` - Gerenciamento de chaves SSH
- `file-watcher-service.ts` - Monitoramento de arquivos
- `notification-service.ts` - Sistema de notificações

### 3. Strategies
- `commit-strategy.ts` - Estratégias de commit (por tempo, por mudança, etc)
- `message-generator.ts` - Geração inteligente de mensagens
- `auth-strategy.ts` - Estratégias de autenticação

### 4. Integrations
- `mcp-integration.ts` - Integração com MCP
- `mem0-integration.ts` - Integração com Mem0
- `docker-integration.ts` - Containerização

### 5. Dashboard
- `dashboard-api.ts` - API para dashboard NextJS
- `metrics-collector.ts` - Coleta de métricas
- `config-manager.ts` - Gerenciamento de configurações

## Melhorias Implementadas

1. **Modularização**: Código separado em módulos reutilizáveis
2. **Docker**: Container para execução isolada
3. **Dashboard**: Interface web para monitoramento
4. **Persistência**: Integração com Strapi para histórico
5. **MCP Direct**: Comunicação direta com outros agentes

## Uso

```typescript
import { AutoCommitAgent } from './auto-commit-core';
import { DockerStrategy } from './strategies/docker-strategy';

const agent = new AutoCommitAgent({
  strategy: new DockerStrategy(),
  watchPath: '/path/to/project',
  dashboard: true,
  mcp: true
});

await agent.start();
```