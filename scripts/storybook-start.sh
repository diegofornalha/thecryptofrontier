#!/bin/bash

# Configurações padrão
PORTA=6006
MODO_CI=false
LOG_FILE="storybook.log"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função de ajuda
show_help() {
  echo -e "${BLUE}=== Script de Inicialização do Storybook ===${NC}"
  echo ""
  echo "Uso: ./scripts/storybook-start.sh [opções]"
  echo ""
  echo "Opções:"
  echo "  -h, --help         Mostra esta mensagem de ajuda"
  echo "  -p, --porta PORTA  Define a porta para o Storybook (padrão: 6006)"
  echo "  -c, --ci           Executa em modo CI (sem interação)"
  echo "  -l, --log ARQUIVO  Define o arquivo de log (padrão: storybook.log)"
  echo ""
  echo "Exemplos:"
  echo "  ./scripts/storybook-start.sh                  # Execução padrão na porta 6006"
  echo "  ./scripts/storybook-start.sh -p 7007         # Iniciar na porta 7007"
  echo "  ./scripts/storybook-start.sh -c -l sb.log    # Modo CI com log personalizado"
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
    -c|--ci)
      MODO_CI=true
      shift
      ;;
    -l|--log)
      LOG_FILE="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Opção desconhecida: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Verificar se a porta é um número válido
if ! [[ "$PORTA" =~ ^[0-9]+$ ]]; then
  echo -e "${RED}Erro: A porta deve ser um número válido.${NC}"
  exit 1
fi

# Verificar se a porta está disponível
if command -v nc >/dev/null 2>&1 && command -v lsof >/dev/null 2>&1; then
  if lsof -i :$PORTA >/dev/null 2>&1; then
    echo -e "${YELLOW}Aviso: A porta $PORTA já está em uso.${NC}"
    echo -e "${YELLOW}Tentando encerrar processos na porta $PORTA...${NC}"
    
    # Tenta encerrar o processo na porta
    PID=$(lsof -t -i:$PORTA)
    if [ -n "$PID" ]; then
      kill $PID
      sleep 2
      if lsof -i :$PORTA >/dev/null 2>&1; then
        echo -e "${RED}Não foi possível liberar a porta $PORTA. Tente manualmente ou use outra porta.${NC}"
        exit 1
      else
        echo -e "${GREEN}Porta $PORTA liberada com sucesso.${NC}"
      fi
    fi
  fi
fi

# Construir o comando do Storybook
STORYBOOK_CMD="npm run storybook -- -p $PORTA"

if [ "$MODO_CI" = true ]; then
  STORYBOOK_CMD="$STORYBOOK_CMD --ci"
fi

# Executar o comando
echo -e "${BLUE}Iniciando Storybook na porta $PORTA...${NC}"
echo -e "${YELLOW}$STORYBOOK_CMD${NC}"
echo -e "${BLUE}Logs serão salvos em: $LOG_FILE${NC}"
echo ""

# Executar o comando com redirecionamento de logs
if [ "$MODO_CI" = true ]; then
  eval "$STORYBOOK_CMD > $LOG_FILE 2>&1"
else
  # Executa em segundo plano e deixa o terminal livre
  eval "$STORYBOOK_CMD > $LOG_FILE 2>&1 &"
  
  # Espera alguns segundos para o Storybook iniciar
  echo -e "${YELLOW}Iniciando o Storybook...${NC}"
  sleep 5
  
  # Verifica se iniciou corretamente
  if grep -q "Storybook.*started" $LOG_FILE; then
    STORYBOOK_URL=$(grep -o "http://[^ ]*" $LOG_FILE | head -1)
    echo -e "${GREEN}Storybook iniciado com sucesso!${NC}"
    echo -e "${GREEN}Acesse: $STORYBOOK_URL${NC}"
    
    # Tenta abrir no navegador se disponível
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open $STORYBOOK_URL
    elif command -v open >/dev/null 2>&1; then
      open $STORYBOOK_URL
    fi
  else
    echo -e "${RED}Parece que houve um problema ao iniciar o Storybook.${NC}"
    echo -e "${RED}Verifique o arquivo de log: $LOG_FILE${NC}"
    echo -e "${YELLOW}Para ver os logs em tempo real: tail -f $LOG_FILE${NC}"
  fi
fi

# Mensagem final
if [ "$MODO_CI" = false ]; then
  echo -e "${BLUE}O Storybook está rodando em segundo plano.${NC}"
  echo -e "${BLUE}Para encerrar, execute: kill $(ps aux | grep 'storybook.*-p $PORTA' | grep -v grep | awk '{print $2}')${NC}"
fi 