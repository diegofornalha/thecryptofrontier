#!/bin/bash
# Setup Docker MCP Server (Containerizado)

echo "🐳 Configurando Docker MCP Server (Docker)..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker não está instalado. Instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo "⚠️  Docker não está em execução. Inicie o Docker."
    exit 1
fi

# Construir imagem Docker
echo "Construindo imagem Docker..."
docker build -t docker-mcp:latest .

if [ $? -eq 0 ]; then
    echo "✅ Imagem Docker construída com sucesso!"
else
    echo "❌ Erro ao construir imagem Docker"
    exit 1
fi

echo ""
echo "✅ Docker MCP configurado com sucesso!"
echo ""
echo "Para adicionar ao Claude Code:"
echo "  claude mcp add docker-mcp -s user -- $PWD/start-docker.sh"
echo ""
echo "Para testar o container:"
echo "  ./start-docker.sh"
echo ""
echo "📝 NOTA: Não é mais necessário usar ambiente virtual (venv)"