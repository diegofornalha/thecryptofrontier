#!/bin/bash

# Script para fazer deploy das configurações do blog
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
  echo -e "${MAGENTA}║               DEPLOY DE CONFIGURAÇÕES                  ║${NC}"
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

# Verifica se o sanity-cli está instalado
if ! command -v sanity &> /dev/null; then
  echo -e "${RED}[ERRO] Sanity CLI não está instalado.${NC}"
  echo -e "${YELLOW}Instalando Sanity CLI globalmente...${NC}"
  npm install -g @sanity/cli
fi

# Pasta raiz do projeto
PROJECT_ROOT="/home/sanity/thecryptofrontier"
BLOG_AUTOMACAO="${PROJECT_ROOT}/framework_crewai"
SANITY_PATH="${BLOG_AUTOMACAO}/src/sanity"

# Passo 1: Deploy do Sanity Studio
exibir_passo "Passo 1: Deploy do Sanity Schema"

if [ -d "$SANITY_PATH" ]; then
  echo -e "${CYAN}Navegando para ${SANITY_PATH}${NC}"
  cd "$SANITY_PATH"
  
  echo -e "${CYAN}Verificando login no Sanity...${NC}"
  sanity login
  
  echo -e "${CYAN}Fazendo deploy do Sanity Studio...${NC}"
  sanity deploy
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deploy do Sanity Studio concluído com sucesso!${NC}"
  else
    echo -e "${RED}✗ Erro no deploy do Sanity Studio.${NC}"
    echo -e "${YELLOW}Continuando com os próximos passos...${NC}"
  fi
else
  echo -e "${RED}✗ Diretório do Sanity não encontrado: ${SANITY_PATH}${NC}"
  echo -e "${YELLOW}Pulando este passo...${NC}"
fi

# Voltar para o diretório do blog
cd "$BLOG_AUTOMACAO"

# Passo 2: Criar/verificar configuração no Sanity
exibir_passo "Passo 2: Verificar configuração no Sanity"

echo -e "${CYAN}Verificando configuração do blog no Sanity...${NC}"
node utils/configuracao-sanity.js

echo -e "${CYAN}Criando configuração padrão se não existir...${NC}"
node utils/configuracao-sanity.js --criar

# Passo 3: Verificar autor padrão
exibir_passo "Passo 3: Verificar configuração do autor"

echo -e "${CYAN}Verificando se o sistema está usando a configuração do autor...${NC}"
node publicar_posts_markdown.js --verify

# Finalização
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   DEPLOY CONCLUÍDO                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Para editar as configurações:${NC}"
echo -e "1. Acesse o Sanity Studio: ${YELLOW}https://thecryptofrontier.sanity.studio${NC}"
echo -e "2. Navegue até ${YELLOW}\"Configurações do Blog\"${NC} no menu lateral"
echo -e "3. Edite a configuração existente para alterar o autor padrão"
echo ""
echo -e "${CYAN}Para publicar posts com a nova configuração:${NC}"
echo -e "${YELLOW}node publicar_posts_markdown.js${NC}" 