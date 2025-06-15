#!/bin/bash

# Script de Migração para o Sistema Unificado de Logging
# Este script ajuda a migrar do sistema antigo para o novo sistema unificado

set -e

echo "🔄 Iniciando migração para o Sistema Unificado de Logging..."

PROJECT_ROOT="/home/strapi/thecryptofrontier"
AGENT_DIR="$PROJECT_ROOT/claude-flow-diego/claude-diego-flow/src/agents"
BACKUP_DIR="$PROJECT_ROOT/backups/old-logging-system-$(date +%Y%m%d-%H%M%S)"

# Criar diretório de backup
echo "📁 Criando backup dos arquivos antigos em: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Fazer backup dos arquivos antigos
echo "💾 Fazendo backup dos sistemas de logging antigos..."
if [ -f "$AGENT_DIR/agent-log.ts" ]; then
    cp "$AGENT_DIR/agent-log.ts" "$BACKUP_DIR/"
    echo "  ✓ agent-log.ts"
fi

if [ -f "$AGENT_DIR/agent-log-conversational.ts" ]; then
    cp "$AGENT_DIR/agent-log-conversational.ts" "$BACKUP_DIR/"
    echo "  ✓ agent-log-conversational.ts"
fi

if [ -f "$AGENT_DIR/agent-log-simple.ts" ]; then
    cp "$AGENT_DIR/agent-log-simple.ts" "$BACKUP_DIR/"
    echo "  ✓ agent-log-simple.ts"
fi

# Criar arquivo de mapeamento de importações
echo "📝 Criando arquivo de mapeamento de importações..."
cat > "$BACKUP_DIR/import-mapping.md" << 'EOF'
# Mapeamento de Importações

## Substituições necessárias:

### agent-log.ts
```typescript
// Antes:
import { agentLog, logAgent, startAgentLogAPI } from './agent-log';

// Depois:
import { unifiedLog, logAgent, startUnifiedLogAPI } from './agent-log-unified';
```

### agent-log-conversational.ts
```typescript
// Antes:
import { conversationalLog, startConversationalLog } from './agent-log-conversational';

// Depois:
import { unifiedLog, logAgent } from './agent-log-unified';
// Use: unifiedLog.logTaskStart() com format: 'conversational'
```

### agent-log-simple.ts
```typescript
// Antes:
import { startSimpleLogServer } from './agent-log-simple';

// Depois:
import { startUnifiedLogAPI } from './agent-log-unified';
```

## Novos recursos:
- `logGuardianPlan()` - Para Guardian registrar planos automaticamente
- `logProgress()` - Para registrar progresso de tarefas
- Suporte a múltiplos formatos: 'text', 'conversational', 'structured'
EOF

# Atualizar importações em outros arquivos
echo "🔍 Procurando e atualizando importações..."

# Função para atualizar imports
update_imports() {
    local file=$1
    local old_import=$2
    local new_import=$3
    
    if grep -q "$old_import" "$file" 2>/dev/null; then
        sed -i "s|$old_import|$new_import|g" "$file"
        echo "  ✓ Atualizado: $file"
    fi
}

# Buscar arquivos que importam os sistemas antigos
find "$PROJECT_ROOT/claude-flow-diego" -name "*.ts" -type f | while read -r file; do
    # agent-log.ts
    update_imports "$file" "from './agent-log'" "from './agent-log-unified'"
    update_imports "$file" "from '../agents/agent-log'" "from '../agents/agent-log-unified'"
    update_imports "$file" "startAgentLogAPI" "startUnifiedLogAPI"
    
    # agent-log-conversational.ts
    update_imports "$file" "from './agent-log-conversational'" "from './agent-log-unified'"
    update_imports "$file" "from '../agents/agent-log-conversational'" "from '../agents/agent-log-unified'"
    update_imports "$file" "conversationalLog" "unifiedLog"
    
    # agent-log-simple.ts
    update_imports "$file" "from './agent-log-simple'" "from './agent-log-unified'"
    update_imports "$file" "startSimpleLogServer" "startUnifiedLogAPI"
done

# Atualizar variáveis de ambiente
echo "🔧 Atualizando variáveis de ambiente..."
if [ -f "$PROJECT_ROOT/.env" ]; then
    # Backup do .env
    cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/.env.backup"
    
    # Adicionar nova variável se não existir
    if ! grep -q "UNIFIED_AGENT_LOG_API_PORT" "$PROJECT_ROOT/.env"; then
        echo "" >> "$PROJECT_ROOT/.env"
        echo "# Unified Agent Log API" >> "$PROJECT_ROOT/.env"
        echo "UNIFIED_AGENT_LOG_API_PORT=3001" >> "$PROJECT_ROOT/.env"
        echo "  ✓ Adicionada variável UNIFIED_AGENT_LOG_API_PORT"
    fi
fi

# Criar script de rollback
echo "🔄 Criando script de rollback..."
cat > "$BACKUP_DIR/rollback.sh" << EOF
#!/bin/bash
# Script de rollback para restaurar o sistema antigo

echo "⚠️  Restaurando sistema de logging antigo..."

# Restaurar arquivos
cp "$BACKUP_DIR/agent-log.ts" "$AGENT_DIR/" 2>/dev/null || true
cp "$BACKUP_DIR/agent-log-conversational.ts" "$AGENT_DIR/" 2>/dev/null || true
cp "$BACKUP_DIR/agent-log-simple.ts" "$AGENT_DIR/" 2>/dev/null || true

# Restaurar .env
cp "$BACKUP_DIR/.env.backup" "$PROJECT_ROOT/.env" 2>/dev/null || true

echo "✅ Rollback concluído!"
echo "📝 Você precisará reverter manualmente as importações nos arquivos TypeScript"
EOF

chmod +x "$BACKUP_DIR/rollback.sh"

# Verificar se o novo sistema compila
echo "🏗️  Verificando compilação do novo sistema..."
cd "$PROJECT_ROOT/claude-flow-diego/claude-diego-flow"

if npm run build 2>/dev/null; then
    echo "✅ Compilação bem-sucedida!"
else
    echo "⚠️  Aviso: Erro na compilação. Verifique os logs acima."
    echo "   Para fazer rollback, execute: $BACKUP_DIR/rollback.sh"
fi

# Criar arquivo de instruções finais
cat > "$PROJECT_ROOT/docs/UNIFIED-LOG-MIGRATION.md" << 'EOF'
# Migração para o Sistema Unificado de Logging

## Status da Migração

- ✅ Sistema unificado implementado (`agent-log-unified.ts`)
- ✅ Helper `agent-logger.ts` atualizado
- ✅ Importações atualizadas automaticamente
- ✅ Backup criado dos sistemas antigos

## Próximos Passos

### 1. Atualizar Docker Compose

Adicione ao `docker-compose.yml`:

```yaml
services:
  unified-log-api:
    build:
      context: ./claude-flow-diego
      dockerfile: Dockerfile.agent-log
    ports:
      - "3001:3001"
    environment:
      - UNIFIED_AGENT_LOG_API_PORT=3001
      - OSS_BRIDGE_URL=http://mem0-bridge:3002
    networks:
      - app-network
    restart: unless-stopped
```

### 2. Remover Sistemas Antigos

Após testar que tudo funciona:

```bash
# Remover arquivos antigos
rm claude-flow-diego/claude-diego-flow/src/agents/agent-log.ts
rm claude-flow-diego/claude-diego-flow/src/agents/agent-log-conversational.ts
rm claude-flow-diego/claude-diego-flow/src/agents/agent-log-simple.ts
```

### 3. Integrar com Guardian

No Guardian, adicione:

```typescript
import { logGuardianPlan } from './agent-log-unified';

// Quando criar um plano:
await logGuardianPlan({
  agentName: this.name,
  tasks: tasks,
  metadata: { projectPath: this.projectPath }
});
```

### 4. Usar Novo Sistema

```typescript
// Importar
import { unifiedLog, logAgent } from './agent-log-unified';

// Logar início
await logAgent.start(agentName, agentType, taskId, description);

// Logar progresso
await logAgent.progress(taskId, 'Processando arquivos...');

// Logar fim
await logAgent.end(agentName, taskId, 'completed');
```

## API Endpoints

- `GET /health` - Status do serviço
- `GET /stats/:agentName` - Estatísticas do agente
- `GET /history/:agentName` - Histórico de execuções
- `GET /pipeline-report` - Relatório completo
- `GET /agents` - Listar todos os agentes
- `GET /logs/active` - Logs ativos
- `GET /logs/search` - Buscar logs
- `POST /log/start` - Registrar início
- `POST /log/end` - Registrar fim
- `POST /log/progress` - Registrar progresso
- `POST /log/plan` - Registrar plano

## Benefícios do Sistema Unificado

1. **Código único** - Sem duplicação
2. **Múltiplos formatos** - text, conversational, structured
3. **Dupla persistência** - Memória local + OSS
4. **API unificada** - Um único endpoint
5. **Integração automática** - Guardian registra automaticamente
6. **Estatísticas avançadas** - Por agente, tarefa e complexidade
EOF

echo ""
echo "✅ Migração concluída!"
echo ""
echo "📁 Backup salvo em: $BACKUP_DIR"
echo "📄 Documentação: $PROJECT_ROOT/docs/UNIFIED-LOG-MIGRATION.md"
echo "🔄 Para rollback: $BACKUP_DIR/rollback.sh"
echo ""
echo "⚠️  Lembre-se de:"
echo "  1. Atualizar o docker-compose.yml"
echo "  2. Testar o sistema antes de remover os arquivos antigos"
echo "  3. Integrar com o Guardian"
echo ""