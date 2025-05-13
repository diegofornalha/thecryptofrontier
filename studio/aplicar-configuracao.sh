#!/bin/bash

# Script simplificado para verificar e aplicar configurações
# Autor: The Crypto Frontier Team
# Data: Maio/2023

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir cabeçalho
function exibir_cabecalho() {
  echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${MAGENTA}║            APLICAÇÃO DE CONFIGURAÇÕES                  ║${NC}"
  echo -e "${MAGENTA}║                THE CRYPTO FRONTIER                     ║${NC}"
  echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# Função para exibir passo
function exibir_passo() {
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}▶ $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

# Exibir cabeçalho
exibir_cabecalho

# Passo 1: Verificar configuração no Sanity
exibir_passo "Passo 1: Verificar configuração no Sanity"

echo -e "${CYAN}Verificando configuração do blog no Sanity...${NC}"
node utils/configuracao-sanity.js

echo -e "${CYAN}Criando configuração padrão se não existir...${NC}"
node utils/configuracao-sanity.js --criar

# Passo 2: Verificar autor padrão
exibir_passo "Passo 2: Verificar configuração do autor"

echo -e "${CYAN}Verificando se o sistema está usando a configuração do autor...${NC}"
node publicar_posts_markdown.js --verify

# Finalização
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              CONFIGURAÇÃO APLICADA                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Para editar as configurações:${NC}"
echo -e "1. Acesse o Sanity Studio: ${YELLOW}https://thecryptofrontier.sanity.studio${NC}"
echo -e "2. Navegue até ${YELLOW}\"Configurações do Blog\"${NC} no menu lateral"
echo -e "3. Edite a configuração existente para alterar o autor padrão"
echo ""
echo -e "${CYAN}Para publicar posts com a nova configuração:${NC}"
echo -e "${YELLOW}node publicar_posts_markdown.js${NC}" 