#!/bin/bash
# Script de migração: docker-compose.frontend.yml -> infrastructure/docker/docker-compose.yml
# Este script mantém compatibilidade com comandos antigos

echo "⚠️  AVISO: docker-compose.frontend.yml foi migrado para infrastructure/docker/docker-compose.yml"
echo "📍 Redirecionando comando..."
echo ""

# Substituir referência ao arquivo antigo pelo novo
ARGS="${@/docker-compose.frontend.yml/infrastructure/docker/docker-compose.yml}"

# Se não houver referência específica, usar o arquivo principal
if [[ "$@" == *"-f"* ]]; then
    docker-compose $ARGS
else
    docker-compose -f infrastructure/docker/docker-compose.yml "$@"
fi