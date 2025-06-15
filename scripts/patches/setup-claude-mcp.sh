#!/bin/bash

# Script para configurar o Claude Desktop com o MCP Diego Tools

echo "🔧 Configurando Claude Desktop MCP..."

CONFIG_FILE="$HOME/.config/Claude/claude_desktop_config.json"

# Criar diretório se não existir
mkdir -p "$(dirname "$CONFIG_FILE")"

# Caminho absoluto para o MCP
MCP_PATH="/home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools"

# Criar configuração
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "diego-tools": {
      "command": "bash",
      "args": ["$MCP_PATH/run.sh"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "INFO"
      }
    },
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@wonderwhy-er/desktop-commander",
        "--key",
        "8f573867-52c3-46bb-993e-fb65291459b2"
      ]
    }
  }
}
EOF

echo "✅ Configuração criada em: $CONFIG_FILE"
echo ""
echo "📋 Configuração atual:"
cat "$CONFIG_FILE" | jq .

echo ""
echo "⚠️  IMPORTANTE: Você precisa reiniciar o Claude Desktop para aplicar as mudanças!"
echo ""
echo "🎯 Após reiniciar, você terá acesso às seguintes ferramentas do diego-tools:"
echo "   - Puppeteer (navegação, screenshot, click, type, get_content)"
echo "   - Mem0 (add_memory, search_memory, list_memories, delete_memories)"
echo "   - Guardian (analyze, status, history, health)"