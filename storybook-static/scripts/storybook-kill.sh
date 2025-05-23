#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Porta padrão do Storybook
PORTA=6006

# Função de ajuda
show_help() {
  echo -e "${BLUE}=== Script para Encerrar o Storybook ===${NC}"
  echo ""
  echo "Uso: ./scripts/storybook-kill.sh [opções]"
  echo ""
  echo "Opções:"
  echo "  -h, --help         Mostra esta mensagem de ajuda"
  echo "  -p, --porta PORTA  Define a porta para procurar o Storybook (padrão: 6006)"
  echo ""
  echo "Exemplos:"
  echo "  ./scripts/storybook-kill.sh          # Encerra na porta padrão 6006"
  echo "  ./scripts/storybook-kill.sh -p 7007  # Encerra na porta 7007"
  echo ""
}

# Processar argumentos
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      exit 0
      ;;
    -p|--porta)
      PORTA="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Opção desconhecida: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Função para encontrar e encerrar processos do Storybook
kill_storybook() {
  echo -e "${BLUE}=== Encerrando processos do Storybook ===${NC}"
  echo -e "${YELLOW}Procurando processos do Storybook...${NC}"
  
  # Procura por processos do Storybook na porta especificada
  PIDS=$(lsof -t -i:$PORTA 2>/dev/null)
  
  if [ -z "$PIDS" ]; then
    # Procura por processos do Storybook em qualquer porta
    PIDS=$(ps aux | grep 'storybook dev\|storybook serve' | grep -v grep | awk '{print $2}')
  fi
  
  if [ -z "$PIDS" ]; then
    echo -e "${YELLOW}Nenhum processo do Storybook encontrado.${NC}"
    return 0
  fi
  
  echo -e "${YELLOW}Encontrado(s) processo(s) Storybook: $PIDS${NC}"
  
  # Tenta encerrar cada processo encontrado
  for PID in $PIDS; do
    echo -e "${YELLOW}Encerrando processo $PID...${NC}"
    kill $PID 2>/dev/null
    
    # Verifica se o processo foi encerrado
    sleep 1
    if ps -p $PID > /dev/null 2>&1; then
      echo -e "${YELLOW}Tentando encerrar o processo $PID com força...${NC}"
      kill -9 $PID 2>/dev/null
      sleep 1
    fi
  done
  
  # Verifica se todos os processos foram encerrados
  sleep 2
  for PID in $PIDS; do
    if ps -p $PID > /dev/null 2>&1; then
      echo -e "${RED}Não foi possível encerrar o processo $PID.${NC}"
      return 1
    fi
  done
  
  echo -e "${GREEN}Todos os processos do Storybook foram encerrados.${NC}"
  return 0
}

# Executa a função principal
kill_storybook

# Fim do script 