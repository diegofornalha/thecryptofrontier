#!/bin/bash
# Script para iniciar o monitor RSS em background

# Diretório do projeto
PROJECT_DIR="/home/sanity/thecryptofrontier/framework_crewai/blog_crew"
LOG_FILE="$PROJECT_DIR/monitor_startup.log"
PID_FILE="$PROJECT_DIR/rss_monitor.pid"

# Função para verificar se o monitor já está rodando
check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "Monitor RSS já está rodando com PID: $PID"
            return 0
        else
            echo "PID file existe mas processo não está rodando. Removendo PID file..."
            rm -f "$PID_FILE"
        fi
    fi
    return 1
}

# Função para iniciar o monitor
start_monitor() {
    echo "$(date): Iniciando monitor RSS..." | tee -a "$LOG_FILE"
    
    cd "$PROJECT_DIR"
    
    # Ativar ambiente virtual se existir
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi
    
    # Iniciar monitor em background
    nohup python rss_monitor.py >> "$LOG_FILE" 2>&1 &
    PID=$!
    
    # Salvar PID
    echo $PID > "$PID_FILE"
    
    echo "$(date): Monitor RSS iniciado com PID: $PID" | tee -a "$LOG_FILE"
    echo "Logs em: $PROJECT_DIR/rss_monitor.log"
}

# Função para parar o monitor
stop_monitor() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "Parando monitor RSS (PID: $PID)..."
        kill $PID
        rm -f "$PID_FILE"
        echo "Monitor RSS parado."
    else
        echo "Monitor RSS não está rodando."
    fi
}

# Função para mostrar status
status_monitor() {
    if check_running; then
        echo "Status: RODANDO"
        echo "PID: $(cat $PID_FILE)"
        echo "Logs: tail -f $PROJECT_DIR/rss_monitor.log"
    else
        echo "Status: PARADO"
    fi
}

# Processar comando
case "$1" in
    start)
        if check_running; then
            exit 0
        fi
        start_monitor
        ;;
    stop)
        stop_monitor
        ;;
    restart)
        stop_monitor
        sleep 2
        start_monitor
        ;;
    status)
        status_monitor
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status}"
        echo ""
        echo "  start   - Inicia o monitor RSS"
        echo "  stop    - Para o monitor RSS"
        echo "  restart - Reinicia o monitor RSS"
        echo "  status  - Mostra o status do monitor"
        exit 1
        ;;
esac