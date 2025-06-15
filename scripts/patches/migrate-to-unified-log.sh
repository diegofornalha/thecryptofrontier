#!/bin/bash
# Script de migração para o sistema unificado de logging
# Facilita a transição dos 3 agentes antigos para o agent-log-unified

echo "🔄 Iniciando migração para Unified Agent Log..."
echo "================================================"

AGENT_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/src/agents"
BACKUP_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/src/agents/backup-old-logs"

# 1. Criar diretório de backup
echo "1️⃣ Criando backup dos agentes antigos..."
mkdir -p "$BACKUP_DIR"

# 2. Fazer backup dos agentes antigos
if [ -f "$AGENT_DIR/agent-log.ts" ]; then
    cp "$AGENT_DIR/agent-log.ts" "$BACKUP_DIR/"
    echo "   ✅ Backup de agent-log.ts"
fi

if [ -f "$AGENT_DIR/agent-log-conversational.ts" ]; then
    cp "$AGENT_DIR/agent-log-conversational.ts" "$BACKUP_DIR/"
    echo "   ✅ Backup de agent-log-conversational.ts"
fi

if [ -f "$AGENT_DIR/agent-log-simple.ts" ]; then
    cp "$AGENT_DIR/agent-log-simple.ts" "$BACKUP_DIR/"
    echo "   ✅ Backup de agent-log-simple.ts"
fi

if [ -f "$AGENT_DIR/agent-log-simple-start.ts" ]; then
    cp "$AGENT_DIR/agent-log-simple-start.ts" "$BACKUP_DIR/"
    echo "   ✅ Backup de agent-log-simple-start.ts"
fi

# 3. Criar arquivo de redirecionamento para compatibilidade
echo ""
echo "2️⃣ Criando arquivos de compatibilidade..."

# agent-log.ts redirect
cat > "$AGENT_DIR/agent-log.ts" << 'EOF'
/**
 * ARQUIVO DE COMPATIBILIDADE
 * 
 * Este arquivo redireciona para o novo sistema unificado de logging.
 * Mantido para compatibilidade com código existente.
 */

export * from './agent-log-unified';
export { unifiedLog as default } from './agent-log-unified';

console.warn('[DEPRECADO] agent-log.ts foi migrado para agent-log-unified.ts');
EOF
echo "   ✅ Criado redirect para agent-log.ts"

# agent-log-conversational.ts redirect
cat > "$AGENT_DIR/agent-log-conversational.ts" << 'EOF'
/**
 * ARQUIVO DE COMPATIBILIDADE
 * 
 * Este arquivo redireciona para o novo sistema unificado de logging.
 * O formato conversacional agora está integrado no sistema unificado.
 */

export * from './agent-log-unified';
export { unifiedLog as ConversationalAgentLog } from './agent-log-unified';

console.warn('[DEPRECADO] agent-log-conversational.ts foi migrado para agent-log-unified.ts');
EOF
echo "   ✅ Criado redirect para agent-log-conversational.ts"

# 4. Verificar uso dos agentes antigos
echo ""
echo "3️⃣ Verificando uso dos agentes antigos no projeto..."
echo ""

# Buscar importações dos agentes antigos
echo "📍 Arquivos que importam agent-log.ts:"
grep -r "from.*agent-log'" "$AGENT_DIR/.." --include="*.ts" --include="*.js" | grep -v "agent-log-unified" | grep -v "backup-old-logs" || echo "   Nenhum encontrado"

echo ""
echo "📍 Arquivos que importam agent-log-conversational.ts:"
grep -r "from.*agent-log-conversational" "$AGENT_DIR/.." --include="*.ts" --include="*.js" | grep -v "backup-old-logs" || echo "   Nenhum encontrado"

echo ""
echo "📍 Arquivos que importam agent-log-simple:"
grep -r "from.*agent-log-simple" "$AGENT_DIR/.." --include="*.ts" --include="*.js" | grep -v "backup-old-logs" || echo "   Nenhum encontrado"

# 5. Criar script de exemplo de uso
echo ""
echo "4️⃣ Criando exemplo de uso..."

cat > "$AGENT_DIR/../examples/using-unified-log.ts" << 'EOF'
/**
 * Exemplo de uso do Unified Agent Log
 */

import { unifiedLog, logGuardianPlan, logTask } from '../agents/agent-log-unified';
import { AgentType } from '../core/agent-types';

// 1. Log de plano do Guardian
await logGuardianPlan({
  agentName: 'Guardian',
  tasks: [
    { id: 'task-1', description: 'Analisar projeto', type: 'analysis' },
    { id: 'task-2', description: 'Organizar arquivos', type: 'organization' }
  ],
  metadata: { projectPath: '/home/project' }
});

// 2. Log de tarefa individual
await logTask({
  agentName: 'FileAnalyzer',
  agentType: AgentType.ANALYST,
  taskId: 'task-1',
  taskDescription: 'Analisar estrutura do projeto',
  complexity: 'medium'
});

// 3. Log de progresso
await unifiedLog.logProgress('task-1', 'Analisando diretório src/...');

// 4. Log de conclusão
await unifiedLog.logTaskComplete('task-1', { filesAnalyzed: 150 });

// 5. Obter estatísticas
const stats = await unifiedLog.getAgentStats('FileAnalyzer');
console.log('Estatísticas:', stats);

// 6. Iniciar API
const api = await unifiedLog.startAPI(3001);
EOF
echo "   ✅ Exemplo criado em examples/using-unified-log.ts"

# 6. Informações finais
echo ""
echo "✅ Migração concluída!"
echo ""
echo "📋 Resumo:"
echo "   - Backups salvos em: $BACKUP_DIR"
echo "   - Arquivos de compatibilidade criados"
echo "   - agent-log-unified.ts está pronto para uso"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Executar fix-mem0-permissions.sh para configurar Mem0"
echo "   2. Testar com: npm run test:unified-log"
echo "   3. Integrar Guardian com guardian-with-unified-log.ts"
echo "   4. Remover backups após confirmar que tudo funciona"
echo ""
echo "💡 Para testar o sistema unificado:"
echo "   cd /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow"
echo "   npx ts-node src/scripts/test-unified-log.ts"