#!/bin/bash

# Controle do serviço de monitoramento de posts
# Uso: ./controle_servico.sh [start|stop|status|restart|logs]

# Diretório base do script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Caminho para o Python
PYTHON="/usr/bin/python3"

# Caminho para o script principal (relativo ao diretório base)
SCRIPT="$DIR/main.py"

# Arquivo de log
LOG_FILE="$DIR/../log_monitor.txt"

# Arquivo para armazenar o PID do processo
PID_FILE="$DIR/../monitor_pid.txt"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  echo "Por favor, execute como root (sudo)"
  exit 1
fi

# Função para iniciar o serviço
start_service() {
  echo "Iniciando serviço de monitoramento..."
  
  # Verificar se já está rodando
  if [ -f "$PID_FILE" ] && ps -p $(cat "$PID_FILE") > /dev/null; then
    echo "O serviço já está rodando com PID $(cat $PID_FILE)"
    return 1
  fi
  
  # Iniciar o script usando Python do ambiente virtual
  nohup "$PYTHON" "$SCRIPT" --loop 60 > "$LOG_FILE" 2>&1 &
  
  # Salvar o PID
  PID=$!
  echo $PID > "$PID_FILE"
  
  echo "Serviço iniciado com PID $PID"
  echo "Logs sendo salvos em $LOG_FILE"
}

# Função para parar o serviço
stop_service() {
  echo "Parando serviço de monitoramento..."
  
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    
    if ps -p $PID > /dev/null; then
      echo "Encerrando processo com PID $PID"
      kill $PID
      rm "$PID_FILE"
      echo "Serviço parado com sucesso"
    else
      echo "Processo não está rodando, mas arquivo PID existe"
      rm "$PID_FILE"
    fi
  else
    echo "Arquivo PID não encontrado. Verificando processos..."
    PIDS=$(ps -ef | grep "[p]ython $SCRIPT" | awk '{print $2}')
    
    if [ -n "$PIDS" ]; then
      echo "Encontrados processos: $PIDS"
      for pid in $PIDS; do
        echo "Encerrando processo com PID $pid"
        kill $pid
      done
      echo "Serviço parado com sucesso"
    else
      echo "Nenhum processo em execução"
    fi
  fi
}

# Função para verificar o status do serviço
check_status() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    
    if ps -p $PID > /dev/null; then
      echo "Serviço rodando com PID $PID"
      echo "Uptime: $(ps -o etime= -p $PID)"
      return 0
    else
      echo "Arquivo PID existe, mas o processo não está rodando"
      return 1
    fi
  else
    echo "Serviço não está rodando (arquivo PID não encontrado)"
    return 1
  fi
}

# Função para mostrar os logs
show_logs() {
  if [ -f "$LOG_FILE" ]; then
    echo "Últimas 20 linhas do log:"
    tail -n 20 "$LOG_FILE"
  else
    echo "Arquivo de log não encontrado: $LOG_FILE"
  fi
}

# Processar o comando
case "$1" in
  start)
    start_service
    ;;
  stop)
    stop_service
    ;;
  restart)
    stop_service
    sleep 2
    start_service
    ;;
  status)
    check_status
    ;;
  logs)
    show_logs
    ;;
  *)
    echo "Uso: $0 [start|stop|status|restart|logs]"
    exit 1
    ;;
esac

exit 0 