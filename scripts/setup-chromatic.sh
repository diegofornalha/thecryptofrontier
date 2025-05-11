#!/bin/bash

# Script para configurar o Chromatic

echo "Configurando o Chromatic para testes visuais..."

# Verificando se o token foi fornecido
if [ -z "$1" ]; then
  echo "Erro: Token do projeto não fornecido."
  echo "Uso: $0 <seu-token-do-chromatic>"
  exit 1
fi

# Cria o segredo no GitHub se o GitHub CLI estiver instalado
if command -v gh &> /dev/null; then
  echo "GitHub CLI detectado, tentando configurar o segredo CHROMATIC_PROJECT_TOKEN..."
  gh secret set CHROMATIC_PROJECT_TOKEN -b "$1"
  if [ $? -eq 0 ]; then
    echo "Segredo CHROMATIC_PROJECT_TOKEN configurado no GitHub com sucesso!"
  else
    echo "Falha ao configurar o segredo no GitHub. Configure manualmente em GitHub > Settings > Secrets."
  fi
else
  echo "GitHub CLI não detectado. Configure o segredo CHROMATIC_PROJECT_TOKEN manualmente em GitHub > Settings > Secrets."
fi

# Instruções para execução local
echo ""
echo "Para executar o Chromatic localmente, você pode usar:"
echo "CHROMATIC_PROJECT_TOKEN=$1 npx chromatic"
echo ""
echo "Ou utilizar o script run-chromatic.sh após atualizar o token:"
echo "scripts/run-chromatic.sh"
echo ""
echo "Configuração concluída!" 