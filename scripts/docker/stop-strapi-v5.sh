#!/bin/bash

# Script para parar Strapi v5

echo "🛑 Parando Strapi v5..."

if [ "$(docker ps -q -f name=strapi-v5)" ]; then
    docker stop strapi-v5
    echo "✅ Strapi v5 parado"
else
    echo "⚠️  Strapi v5 não está rodando"
fi