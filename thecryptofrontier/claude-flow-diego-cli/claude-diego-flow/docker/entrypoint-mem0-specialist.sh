#!/bin/bash
set -e

echo "🧠 Iniciando Mem0 Specialist..."

# Verificar se os serviços necessários estão disponíveis
echo "⏳ Aguardando serviços..."

# Aguardar mem0-bridge
until curl -sf "${MEM0_BRIDGE_URL}/health" > /dev/null 2>&1; do
    echo "   Aguardando mem0-bridge em ${MEM0_BRIDGE_URL}..."
    sleep 2
done
echo "✅ mem0-bridge disponível"

# Aguardar mem0-chroma
until curl -sf "${CHROMA_URL}/api/v1/heartbeat" > /dev/null 2>&1; do
    echo "   Aguardando mem0-chroma em ${CHROMA_URL}..."
    sleep 2
done
echo "✅ mem0-chroma disponível"

# Criar diretórios se não existirem
mkdir -p "${LOG_DIR}" "${BACKUP_DIR}"

echo "📁 Diretórios configurados:"
echo "   - Logs: ${LOG_DIR}"
echo "   - Backups: ${BACKUP_DIR}"

# Executar o especialista com servidor HTTP
echo "🚀 Iniciando Mem0 Specialist com servidor HTTP na porta ${PORT}..."
exec npx tsx src/agents/mem0-specialist-server.ts