import streamlit as st
import os
import psutil
import time
import re
from datetime import datetime

st.set_page_config(page_title="Status do Serviço de Postagem Automática", layout="centered")
st.title("Dashboard - Postagem Automática no Blog")

# Caminhos de arquivos
PID_FILE = "../monitor_pid.txt"
LOG_FILE = "../log_monitor.txt"

# Função para verificar status do serviço
def check_service_status():
    status = "Desconhecido"
    detalhe = ""

    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, "r") as f:
                pid = int(f.read().strip())
            if psutil.pid_exists(pid):
                status = "🟢 Ativado e rodando"
                p = psutil.Process(pid)
                uptime = datetime.fromtimestamp(p.create_time())
                uptime_str = (datetime.now() - uptime).total_seconds()
                
                # Formata o uptime em dias, horas, minutos
                days, remainder = divmod(uptime_str, 86400)
                hours, remainder = divmod(remainder, 3600)
                minutes, seconds = divmod(remainder, 60)
                
                uptime_formatted = ""
                if days > 0:
                    uptime_formatted += f"{int(days)} dias, "
                if hours > 0 or days > 0:
                    uptime_formatted += f"{int(hours)} horas, "
                uptime_formatted += f"{int(minutes)} minutos"
                
                detalhe = f"PID: {pid} | Uptime: {uptime_formatted}"
            else:
                status = "🔴 Parado (PID não encontrado)"
                detalhe = f"PID no arquivo: {pid} (mas não está rodando)"
        except Exception as e:
            status = "⚠️ Erro ao ler PID"
            detalhe = str(e)
    else:
        status = "🔴 Parado (arquivo PID não encontrado)"
    
    return status, detalhe

# Função para ler as últimas linhas do log
def get_recent_logs(num_lines=50):
    if not os.path.exists(LOG_FILE):
        return ["Arquivo de log não encontrado: " + LOG_FILE]
    
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        # Pegar as últimas linhas
        last_lines = lines[-num_lines:] if len(lines) > num_lines else lines
        return last_lines
    except Exception as e:
        return [f"Erro ao ler logs: {str(e)}"]

# Adiciona cor aos logs com base no conteúdo
def colorize_log(log_line):
    if "erro" in log_line.lower() or "error" in log_line.lower() or "exception" in log_line.lower():
        return f"<span style='color:red'>{log_line}</span>"
    elif "aviso" in log_line.lower() or "warning" in log_line.lower():
        return f"<span style='color:orange'>{log_line}</span>"
    elif "sucesso" in log_line.lower() or "success" in log_line.lower() or "publicado" in log_line.lower():
        return f"<span style='color:green'>{log_line}</span>"
    else:
        return log_line

# Status do serviço
status, detalhe = check_service_status()

st.header("Status do Serviço de Postagem Automática:")
st.markdown(f"**{status}**")
if detalhe:
    st.caption(detalhe)

# Seção de logs
st.header("Logs em Tempo Real")
st.caption("Últimas entradas do arquivo de log do serviço")

num_lines = st.slider("Número de linhas para exibir", min_value=10, max_value=200, value=50, step=10)

if st.button("Atualizar Logs"):
    st.session_state.logs_last_update = time.time()
    
if 'logs_last_update' not in st.session_state:
    st.session_state.logs_last_update = time.time()

log_lines = get_recent_logs(num_lines)

if log_lines:
    # Contêiner de log com altura fixa e scrollbar
    log_container = st.container()
    with log_container:
        # Cabeçalho de atualização
        st.caption(f"Atualizado em: {datetime.now().strftime('%H:%M:%S')}")
        
        # Área de texto com rolagem para os logs
        log_text = "".join(log_lines)
        
        # Adiciona highlight de texto
        colorized_log = log_text
        for line in log_lines:
            colorized_log = log_text.replace(line, colorize_log(line))
            
        st.code(log_text, language="text")
else:
    st.warning("Nenhum log disponível.")

st.info("Esta dashboard será expandida com mais analytics em breve.") 