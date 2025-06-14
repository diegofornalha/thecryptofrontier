#!/bin/bash
# Script para corrigir permissões do Mem0 local

echo "🔧 Corrigindo permissões do Mem0 local..."

# Parar o container temporariamente
echo "⏸️  Parando container mem0-bridge..."
docker stop mem0-bridge

# Criar diretório de dados com permissões corretas
echo "📁 Criando diretório de dados..."
MEMORY_DATA_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/data/memory"
mkdir -p "$MEMORY_DATA_DIR"

# Criar arquivo inicial de memória se não existir
if [ ! -f "$MEMORY_DATA_DIR/memory-store.json" ]; then
    echo "📝 Criando arquivo inicial de memória..."
    echo '{
  "memories": {},
  "totalCount": 0,
  "lastUpdated": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
}' > "$MEMORY_DATA_DIR/memory-store.json"
fi

# Ajustar permissões (1001 é o UID do nodejs no container)
echo "🔐 Ajustando permissões..."
chown -R 1001:1001 "$MEMORY_DATA_DIR"
chmod -R 755 "$MEMORY_DATA_DIR"

# Remover container antigo
echo "🗑️  Removendo container antigo..."
docker rm mem0-bridge

# Recriar container com volume correto
echo "🚀 Recriando container com configurações corretas..."
docker run -d \
    --name mem0-bridge \
    --network claude-flow-diego_default \
    -p 3002:3002 \
    -v "$MEMORY_DATA_DIR:/data" \
    -e PORT=3002 \
    -e DATA_PATH=/data/memory-store.json \
    --health-cmd "curl -f http://localhost:3002/health || exit 1" \
    --health-interval 30s \
    --health-timeout 10s \
    --health-retries 3 \
    claude-flow-diego-mem0-bridge

# Aguardar container iniciar
echo "⏳ Aguardando container iniciar..."
sleep 5

# Verificar status
echo "✅ Verificando status..."
docker ps | grep mem0-bridge

# Testar endpoint de saúde
echo "🏥 Testando endpoint de saúde..."
curl -s http://localhost:3002/health | jq '.'

echo "✨ Configuração concluída!"