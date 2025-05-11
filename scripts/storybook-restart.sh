#!/bin/bash

# Script para reiniciar o Storybook
echo "Parando processos do Storybook..."
pkill -f "storybook"

# Aguardar 2 segundos para garantir que todos os processos foram encerrados
sleep 2

# Iniciar o Storybook novamente
echo "Iniciando o Storybook..."
npm run storybook 