#!/bin/bash
# Start Docker MCP Server usando container Docker

# Obter o diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Nome da imagem
IMAGE_NAME="docker-mcp:latest"

# Verificar se a imagem existe
if ! docker image inspect $IMAGE_NAME >/dev/null 2>&1; then
    echo "Imagem $IMAGE_NAME não encontrada. Construindo..."
    cd "$SCRIPT_DIR"
    docker build -t $IMAGE_NAME .
fi

# Executar o container
exec docker run -i --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e DOCKER_HOST=unix:///var/run/docker.sock \
    $IMAGE_NAME