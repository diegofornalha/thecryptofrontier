#!/bin/bash
# Script para configurar e iniciar o Redis usando Docker

PORT=${1:-6379}

if [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "🔧 Usando porta customizada: $PORT"
else
    echo "❌ Porta inválida: $PORT"
    exit 1
fi

echo "🐳 Verificando se o Docker está instalado..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado! Por favor, instale o Docker primeiro."
    echo "   Visite: https://docs.docker.com/get-docker/"
    exit 1
fi

CONTAINER_NAME="redis-crewai-$PORT"

echo "🔍 Verificando se o container Redis já está em execução..."
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Container Redis já está em execução! ($CONTAINER_NAME)"
    echo "   Use 'docker stop $CONTAINER_NAME' para parar"
    exit 0
fi

echo "🔍 Verificando se o container Redis existe mas está parado..."
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo "🔄 Container Redis encontrado, iniciando..."
    docker start $CONTAINER_NAME
    echo "✅ Redis iniciado com sucesso! ($CONTAINER_NAME)"
    exit 0
fi

echo "🚀 Criando e iniciando novo container Redis na porta $PORT..."
docker run --name $CONTAINER_NAME -p $PORT:6379 -d redis:latest

if [ $? -eq 0 ]; then
    echo "✅ Redis iniciado com sucesso!"
    echo "   Porta: $PORT"
    echo "   Nome do container: $CONTAINER_NAME"
    echo ""
    echo "📝 Para parar o Redis: docker stop $CONTAINER_NAME"
    echo "📝 Para iniciar novamente: docker start $CONTAINER_NAME"
    echo "📝 Para verificar logs: docker logs $CONTAINER_NAME"
else
    echo "❌ Falha ao iniciar o Redis!"
fi 