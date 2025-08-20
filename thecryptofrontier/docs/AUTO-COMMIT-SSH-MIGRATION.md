# Migração do Sistema de Gerenciamento de Chaves SSH

## Resumo da Migração

O sistema de gerenciamento de chaves SSH do Auto Commit Agent foi migrado de Python para TypeScript, mantendo todas as funcionalidades e adicionando integração com Mem0 para persistência de histórico.

## Mudanças Realizadas

### 1. Código Migrado

**De:** `/home/strapi/thecryptofrontier/agentes-python/claude-agentes-commit-mem0/`
- `auto-commit-mem0-integration.py`
- `mem0-mcp-git-integration.py`

**Para:** `/home/strapi/thecryptofrontier/claude-flow-diego-cli/claude-diego-flow/src/agents/`
- `auto-commit-agent.ts` (funcionalidades integradas)
- `auto-commit-ssh-manager.ts` (CLI para gerenciamento)

### 2. Funcionalidades Mantidas

✅ **Armazenamento Seguro de Chaves SSH**
- Chaves armazenadas em `.diego-tools/ssh-key` com permissões 0600
- Metadata compartilhada em `.diego-tools/credentials`

✅ **Validação de Chaves**
- Validação periódica a cada 30 minutos
- Detecção automática de falhas de autenticação

✅ **Rotação de Chaves**
- Backup automático de chaves antigas
- Histórico de rotações armazenado no Mem0

✅ **Notificações de Falha**
- Detecção de múltiplas falhas consecutivas
- Notificação via Mem0 e arquivo local
- Solicitação automática de nova chave

✅ **Integração com MCP**
- Credenciais compartilhadas entre agentes
- Compatibilidade com MCP DiegoTools

### 3. Novas Funcionalidades

✨ **CLI Dedicado para Gerenciamento**
```bash
# Armazenar nova chave
npm run auto-commit:ssh store

# Rotacionar chave
npm run auto-commit:ssh rotate

# Verificar status
npm run auto-commit:ssh status

# Ver histórico
npm run auto-commit:ssh history

# Validar chave
npm run auto-commit:ssh validate

# Remover chave
npm run auto-commit:ssh remove
```

✨ **Integração Nativa com Mem0**
- Histórico persistente de rotações
- Busca de eventos passados
- Notificações centralizadas

## Como Usar

### 1. Configurar Chave SSH

```bash
# Opção 1: Fornecer arquivo
npm run auto-commit:ssh store -- --file ~/.ssh/id_rsa

# Opção 2: Colar interativamente
npm run auto-commit:ssh store
# Cole a chave e pressione Ctrl+D
```

### 2. Verificar Status

```bash
npm run auto-commit:ssh status
```

Saída esperada:
```
✅ Chave SSH configurada:
  📁 Tipo: ssh-key
  🤖 Agente: auto-commit-agent
  📅 Criada em: 2025-01-17T10:30:00.000Z
  📍 Localização: /home/user/project/.diego-tools/ssh-key
  ✅ Arquivo de chave existe
```

### 3. Rotacionar Chave

```bash
npm run auto-commit:ssh rotate -- --file ~/.ssh/new_key
```

### 4. Ver Histórico

```bash
# Histórico completo (local + Mem0)
npm run auto-commit:ssh history

# Apenas backups locais
npm run auto-commit:ssh history -- --local

# Apenas Mem0
npm run auto-commit:ssh history -- --mem0
```

## Estrutura de Arquivos

```
.diego-tools/
├── credentials          # Metadata da chave atual
├── ssh-key             # Chave SSH privada (0600)
├── ssh-key.backup.*    # Backups de chaves antigas
├── notifications.json  # Notificações de falhas
└── key-history.json    # Histórico local de rotações
```

## Integração com Auto Commit

O Auto Commit Agent carrega automaticamente as chaves SSH armazenadas:

1. Na inicialização, verifica `.diego-tools/ssh-key`
2. Se existir, configura `GIT_SSH_COMMAND` automaticamente
3. Valida a chave periodicamente
4. Em caso de falha, notifica e solicita nova chave

## Variáveis de Ambiente

```bash
# Opcional: Para integração com Mem0 cloud
export MEM0_API_KEY="sua-chave-aqui"
```

## Troubleshooting

### Chave não funciona

```bash
# Validar chave
npm run auto-commit:ssh validate

# Se falhar, rotacionar
npm run auto-commit:ssh rotate
```

### Ver logs de falha

```bash
cat .diego-tools/notifications.json | jq .
```

### Restaurar backup

```bash
# Listar backups
ls -la .diego-tools/ssh-key.backup.*

# Restaurar manualmente
cp .diego-tools/ssh-key.backup.1234567890 .diego-tools/ssh-key
chmod 600 .diego-tools/ssh-key
```

## Migração de Dados Antigos

Se você tinha chaves no sistema Python:

```bash
# 1. Copiar chave antiga
cp /caminho/antigo/.diego-tools/ssh-key ~/.ssh/old_key

# 2. Armazenar no novo sistema
npm run auto-commit:ssh store -- --file ~/.ssh/old_key

# 3. Verificar
npm run auto-commit:ssh status
```

## Próximos Passos

1. ✅ Sistema migrado e funcional
2. ✅ CLI implementado
3. ✅ Integração com Mem0
4. ⏳ Remover pasta Python após testes
5. ⏳ Adicionar integração com Guardian Agent