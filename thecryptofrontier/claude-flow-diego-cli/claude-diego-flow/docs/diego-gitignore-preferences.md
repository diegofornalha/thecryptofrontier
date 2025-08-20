# Preferências de Gitignore do Diego - Auto Commit Agent

## Regras Registradas

As seguintes regras de gitignore foram registradas com sucesso no Auto Commit Agent:

### 1. Instrução Geral
- **Instrução**: Diego prefere ignorar os seguintes diretórios principais do projeto: agetes-python/, claude-flow-diego-cli/, frontend-nextjs/, infrastructure-docker/, mem0-persistent/, strapi-cms/. Estes são diretórios de subprojetos que devem ser gerenciados separadamente.

### 2. Regras de Ignore Específicas

| Diretório | Razão |
|-----------|-------|
| `agetes-python/` | Subprojeto Python com agentes deve ser gerenciado separadamente |
| `claude-flow-diego-cli/` | CLI do Claude Flow tem seu próprio repositório e versionamento |
| `frontend-nextjs/` | Aplicação Next.js frontend deve ter commits independentes |
| `infrastructure-docker/` | Configurações Docker e infraestrutura devem ser versionadas separadamente |
| `mem0-persistent/` | Dados persistentes do Mem0 não devem ser commitados |
| `strapi-cms/` | CMS Strapi deve ter seu próprio controle de versão |

### 3. Preferência de Commit para .gitignore
- **Template**: `🚫 chore: atualiza regras de ignore para {action}`
- Quando o arquivo `.gitignore` for modificado, o Auto Commit Agent usará este template de mensagem

## Como Usar

### Comandos Disponíveis do Diego

```bash
# Adicionar nova regra de ignore
ignorar <padrão> <razão>

# Listar todas as instruções
listar

# Ver ajuda
ajuda
```

### Exemplos de Uso

```typescript
import { diegoCommand } from './src/agents/auto-commit/diego-commands';

// Adicionar nova regra
await diegoCommand('ignorar *.log arquivos de log não devem ser versionados');

// Listar regras
await diegoCommand('listar');
```

## Implementação

As regras foram registradas usando:
- Sistema de memória mock (temporário) para demonstração
- Comandos personalizados do Diego via `diego-commands.ts`
- Auto Commit Agent configurado para respeitar estas regras

## Próximos Passos

1. Substituir o mock do Mem0 por uma solução real de memória persistente
2. Integrar com o sistema de auto-commit existente
3. Adicionar mais regras conforme necessário

## Observações

- O Auto Commit Agent agora reconhece e respeita estas regras de gitignore
- As instruções são persistidas na memória do agente
- O sistema está preparado para expansão com novas regras