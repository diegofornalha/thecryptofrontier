#!/bin/bash
# Adicionar Docker MCP ao Claude Code

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo "🔧 Adicionando Docker MCP ao Claude Code..."

# Fazer backup
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"

# Usar Python para modificar o JSON
python3 << 'EOF'
import json
import os

config_file = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")

with open(config_file, 'r') as f:
    config = json.load(f)

# Adicionar Docker MCP
config['mcpServers']['docker'] = {
    "command": "/root/.claude/docker-mcp/start.sh"
}

# Adicionar RAG WebFetch se não existir
if 'rag-webfetch' not in config['mcpServers']:
    config['mcpServers']['rag-webfetch'] = {
        "command": "/root/.claude/mcp-rag-server/start.sh"
    }

# Salvar
with open(config_file, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Configuração atualizada!")
EOF

echo ""
echo "📋 Servidores MCP configurados:"
echo "  - docker: Gerenciamento de containers Docker"
echo "  - rag-webfetch: Cache RAG local"
echo ""
echo "⚠️  Reinicie o Claude Code para aplicar as mudanças!"