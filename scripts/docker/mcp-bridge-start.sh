#!/bin/bash

# Script para iniciar o MCP HTTP Bridge com Docker
# Mantém o MCP sempre ativo e permite reconexões

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MCP_DIR="$PROJECT_ROOT/claude-flow-diego/mcp-diego-tools"

echo "🚀 Iniciando MCP HTTP Bridge..."

# Criar rede Docker se não existir
docker network create mcp-network 2>/dev/null || true

# Parar container existente se houver
docker stop mcp-http-bridge 2>/dev/null || true
docker rm mcp-http-bridge 2>/dev/null || true

# Construir imagem
echo "🔨 Construindo imagem Docker..."
cat > "$MCP_DIR/Dockerfile.bridge" << EOF
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor portas
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Executar bridge
CMD ["node", "build/mcp-http-bridge.js"]
EOF

docker build -f "$MCP_DIR/Dockerfile.bridge" -t mcp-http-bridge "$MCP_DIR"

# Executar container
echo "🏃 Iniciando container..."
docker run -d \
  --name mcp-http-bridge \
  --network mcp-network \
  -p 3003:3003 \
  -e MCP_PATH="/app/build/index.js" \
  -e MCP_BRIDGE_PORT=3003 \
  -v "$MCP_DIR/build:/app/build:ro" \
  --restart unless-stopped \
  mcp-http-bridge

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
for i in {1..30}; do
  if curl -s http://localhost:3003/health > /dev/null; then
    echo "✅ MCP HTTP Bridge iniciado com sucesso!"
    break
  fi
  sleep 1
done

# Mostrar logs
echo ""
echo "📋 Logs do container:"
docker logs -f mcp-http-bridge &

# Salvar PID para poder parar depois
echo $! > /tmp/mcp-bridge-logs.pid

echo ""
echo "🌉 MCP HTTP Bridge está rodando!"
echo "📡 HTTP API: http://localhost:3003"
echo "🔌 WebSocket: ws://localhost:3003/ws"
echo "💚 Health: http://localhost:3003/health"
echo ""
echo "Para parar: docker stop mcp-http-bridge"
echo "Para ver logs: docker logs -f mcp-http-bridge"