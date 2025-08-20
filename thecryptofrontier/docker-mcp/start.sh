#!/bin/bash
# Start Docker MCP Server

# Obter o diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ativar ambiente virtual
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Ambiente virtual não encontrado. Execute ./setup.sh primeiro."
    exit 1
fi

# Verificar se as dependências estão instaladas
if ! python -c "import mcp" 2>/dev/null; then
    echo "Instalando dependências..."
    pip install mcp httpx python-dotenv python-on-whales pyyaml
fi

# Executar o servidor
export PYTHONPATH="${SCRIPT_DIR}/src"
exec python "$SCRIPT_DIR/run.py"