#!/bin/bash

# Configurações padrão
PROJECT_TOKEN="chpt_10e25f8014659d3"
STORYBOOK_DIR="storybook-static"
FORCE_BUILD=false
AUTO_ACCEPT=false
EXIT_ZERO=false
EXIT_UPLOAD=false
BRANCH_NAME=""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função de ajuda
show_help() {
  echo -e "${BLUE}=== Script de Publicação no Chromatic ===${NC}"
  echo ""
  echo "Uso: ./scripts/chromatic.sh [opções]"
  echo ""
  echo "Opções:"
  echo "  -h, --help                 Mostra esta mensagem de ajuda"
  echo "  -b, --build                Força a construção do Storybook antes da publicação"
  echo "  -a, --auto-accept          Aceita automaticamente todas as alterações visuais"
  echo "  -z, --exit-zero            Retorna código 0 mesmo quando houver alterações visuais"
  echo "  -u, --exit-upload          Finaliza após o upload, sem esperar pelos resultados"
  echo "  -t, --token TOKEN          Define o token do projeto (padrão: configurado no script)"
  echo "  -d, --dir DIRECTORY        Define o diretório do Storybook (padrão: storybook-static)"
  echo "  -br, --branch BRANCH       Define a branch para comparação"
  echo ""
  echo "Exemplos:"
  echo "  ./scripts/chromatic.sh                      # Execução padrão"
  echo "  ./scripts/chromatic.sh -b -a               # Constrói e aceita alterações automaticamente"
  echo "  ./scripts/chromatic.sh -z -u               # Modo CI (sai com 0 e finaliza após upload)"
  echo "  ./scripts/chromatic.sh -br feature/button  # Compara com a branch feature/button"
  echo ""
}

# Função para construir o Storybook
build_storybook() {
  echo -e "${YELLOW}Construindo Storybook...${NC}"
  npm run build-storybook
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Falha ao construir o Storybook!${NC}"
    exit 1
  fi

  echo -e "${GREEN}Storybook construído com sucesso!${NC}"
}

# Processar argumentos
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      exit 0
      ;;
    -b|--build)
      FORCE_BUILD=true
      shift
      ;;
    -a|--auto-accept)
      AUTO_ACCEPT=true
      shift
      ;;
    -z|--exit-zero)
      EXIT_ZERO=true
      shift
      ;;
    -u|--exit-upload)
      EXIT_UPLOAD=true
      shift
      ;;
    -t|--token)
      PROJECT_TOKEN="$2"
      shift 2
      ;;
    -d|--dir)
      STORYBOOK_DIR="$2"
      shift 2
      ;;
    -br|--branch)
      BRANCH_NAME="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Opção desconhecida: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Construir o Storybook, se solicitado
if [ "$FORCE_BUILD" = true ]; then
  build_storybook
fi

# Construir o comando do Chromatic
CHROMATIC_CMD="npx chromatic --project-token=$PROJECT_TOKEN --storybook-build-dir=$STORYBOOK_DIR"

# Adicionar opções adicionais, se fornecidas
if [ "$AUTO_ACCEPT" = true ]; then
  CHROMATIC_CMD="$CHROMATIC_CMD --auto-accept-changes"
fi

if [ "$EXIT_ZERO" = true ]; then
  CHROMATIC_CMD="$CHROMATIC_CMD --exit-zero-on-changes"
fi

if [ "$EXIT_UPLOAD" = true ]; then
  CHROMATIC_CMD="$CHROMATIC_CMD --exit-once-uploaded"
fi

if [ -n "$BRANCH_NAME" ]; then
  CHROMATIC_CMD="$CHROMATIC_CMD --branch-name=$BRANCH_NAME"
fi

# Executar o comando
echo -e "${BLUE}Executando Chromatic com as seguintes opções:${NC}"
echo -e "${YELLOW}$CHROMATIC_CMD${NC}"
echo ""

eval $CHROMATIC_CMD

# Verificar o código de saída
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}Publicação no Chromatic concluída com sucesso!${NC}"
else
  echo -e "${YELLOW}Publicação no Chromatic concluída com alterações ou erros. Código de saída: $EXIT_CODE${NC}"
  echo -e "${YELLOW}Verifique o link acima para revisar as alterações no Chromatic.${NC}"
fi

exit $EXIT_CODE 