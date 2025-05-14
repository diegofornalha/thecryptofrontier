#!/bin/bash

# Script para parar todo o ambiente Docker
echo "Parando todo o ambiente..."

# Parar todos os serviços Docker
echo "Parando todos os containers Docker..."
cd "$(dirname "$0")" || { echo "Erro: Não foi possível acessar o diretório do script"; exit 1; }
docker-compose down

echo "Ambiente completamente desligado."