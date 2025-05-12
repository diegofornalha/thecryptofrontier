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
  echo -e "${BLUE}=== Script de Reinicialização do Storybook ===${NC}"
  echo ""
  echo "Uso: ./scripts/storybook-restart.sh [opções]"
  echo ""
  echo "Opções:"
  echo "  -h, --help         Mostra esta mensagem de ajuda"
  echo "  -p, --porta PORTA  Define a porta para o Storybook (padrão: 6006)"
  echo ""
  echo "Exemplos:"
  echo "  ./scripts/storybook-restart.sh          # Reinicia na porta padrão 6006"
  echo "  ./scripts/storybook-restart.sh -p 7007  # Reinicia na porta 7007"
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
  echo -e "${YELLOW}Procurando processos do Storybook...${NC}"
  
  # Procura por processos do Storybook na porta especificada
  PIDS=$(lsof -t -i:$PORTA 2>/dev/null)
  
  if [ -z "$PIDS" ]; then
    # Procura por processos do Storybook em qualquer porta
    PIDS=$(ps aux | grep 'storybook dev' | grep -v grep | awk '{print $2}')
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

# Função para iniciar o Storybook
start_storybook() {
  echo -e "${BLUE}Iniciando Storybook na porta $PORTA...${NC}"
  
  # Constrói o comando para iniciar o Storybook
  STORYBOOK_CMD="npm run storybook -- -p $PORTA"
  
  # Executa o comando em segundo plano
  LOG_FILE="storybook-restart.log"
  eval "$STORYBOOK_CMD > $LOG_FILE 2>&1 &"
  
  # Espera alguns segundos para o Storybook iniciar
  echo -e "${YELLOW}Aguardando inicialização do Storybook...${NC}"
  sleep 5
  
  # Verifica se iniciou corretamente
  if grep -q "Storybook.*started" $LOG_FILE; then
    STORYBOOK_URL=$(grep -o "http://[^ ]*" $LOG_FILE | head -1)
    echo -e "${GREEN}Storybook reiniciado com sucesso!${NC}"
    echo -e "${GREEN}Acesse: $STORYBOOK_URL${NC}"
    
    # Tenta abrir no navegador se disponível
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open $STORYBOOK_URL
    elif command -v open >/dev/null 2>&1; then
      open $STORYBOOK_URL
    fi
    
    return 0
  else
    echo -e "${RED}Parece que houve um problema ao reiniciar o Storybook.${NC}"
    echo -e "${RED}Verifique o arquivo de log: $LOG_FILE${NC}"
    echo -e "${YELLOW}Para ver os logs em tempo real: tail -f $LOG_FILE${NC}"
    return 1
  fi
}

# Executa as operações principais
echo -e "${BLUE}=== Reinicializando Storybook na porta $PORTA ===${NC}"

# Tenta encerrar qualquer instância do Storybook em execução
kill_storybook

# Inicia uma nova instância do Storybook
start_storybook

# Mensagem final
echo -e "${BLUE}O Storybook está rodando em segundo plano.${NC}"
echo -e "${BLUE}Para encerrar, execute este script novamente com a opção --kill${NC}" 