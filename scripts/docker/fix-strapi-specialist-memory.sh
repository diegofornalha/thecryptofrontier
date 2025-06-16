#!/bin/bash
# Script para corrigir o Strapi Specialist e conectá-lo ao sistema de memória

echo "🔧 Corrigindo Strapi Specialist e sistema de memória..."

# Parar container atual
echo "📦 Parando container atual..."
docker stop strapi-specialist 2>/dev/null
docker rm strapi-specialist 2>/dev/null

# Garantir que o diretório de logs existe com permissões corretas
echo "📂 Criando diretórios necessários..."
mkdir -p /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/logs
chmod 777 /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/logs

# Reiniciar o strapi-specialist com o comando correto e conexão à memória
echo "🚀 Iniciando Strapi Specialist com suporte a memória..."
docker run -d \
  --name strapi-specialist \
  --network claude-flow-network \
  -e NODE_ENV=production \
  -e ORCHESTRATOR_URL=http://guardian-orchestrator:3000 \
  -e LOG_SERVICE_URL=http://agent-log:3001 \
  -e MEM0_URL=http://mem0-bridge:3002 \
  -e MEMORY_ENABLED=true \
  -e LEARNING_MODE=active \
  -v /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/logs:/app/logs \
  -v /home/strapi/thecryptofrontier:/workspace:ro \
  -p 3007:3007 \
  --restart unless-stopped \
  --health-cmd "curl -f http://localhost:3007/health || exit 1" \
  --health-interval 30s \
  --health-timeout 10s \
  --health-retries 3 \
  claude-flow/strapi-specialist:latest \
  npx tsx src/agents/strapi-specialist-agent.ts

echo "✅ Strapi Specialist reiniciado com suporte a memória!"

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 5

# Verificar status
echo "📊 Status dos containers:"
docker ps | grep -E "(strapi-specialist|mem0-bridge|mem0-chroma)"

echo "📝 Logs do Strapi Specialist:"
docker logs strapi-specialist --tail 20

echo "🎯 Concluído!"