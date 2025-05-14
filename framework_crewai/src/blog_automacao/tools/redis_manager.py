#!/usr/bin/env python3
"""
Gerenciador de Redis local para ambiente de desenvolvimento.
Verifica se o Redis está rodando e inicializa automaticamente se necessário.
"""

import os
import socket
import subprocess
import time
import logging
import signal
from pathlib import Path
import shutil
import atexit

# Configuração de logging
logger = logging.getLogger("redis_manager")

# Configurações do Redis local
REDIS_PORT = 6379
REDIS_EXECUTABLE = "redis-server"  # Nome do executável Redis
REDIS_PID_FILE = "/tmp/redis_streamlit.pid"
REDIS_LOG_FILE = "/tmp/redis_streamlit.log"

def is_port_in_use(port):
    """Verifica se a porta está em uso"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def is_redis_running_on_port(port):
    """Verifica se o Redis está rodando na porta especificada"""
    try:
        # Verifica se a porta está em uso
        if not is_port_in_use(port):
            return False
            
        # Comando para verificar se o Redis responde na porta
        import redis
        client = redis.Redis(host='localhost', port=port, socket_timeout=1)
        return client.ping()
    except:
        return False

def find_redis_executable():
    """Procura pelo executável do Redis no sistema"""
    # Verifica se o redis-server está no PATH
    redis_path = shutil.which(REDIS_EXECUTABLE)
    if redis_path:
        return redis_path
    
    # Lista de caminhos comuns para o redis-server
    common_paths = [
        "/usr/bin/redis-server",
        "/usr/local/bin/redis-server",
        "/opt/homebrew/bin/redis-server",  # Para macOS com Homebrew
    ]
    
    for path in common_paths:
        if os.path.exists(path) and os.access(path, os.X_OK):
            return path
    
    return None

def start_redis_server():
    """Inicia o servidor Redis local se não estiver rodando"""
    # Verifica se já está rodando
    if is_redis_running_on_port(REDIS_PORT):
        logger.info(f"Redis já está rodando na porta {REDIS_PORT}")
        return True
    
    # Encontrar o executável redis-server
    redis_executable = find_redis_executable()
    if not redis_executable:
        logger.error("Redis não encontrado no sistema. Por favor, instale o Redis.")
        return False
    
    logger.info(f"Iniciando Redis na porta {REDIS_PORT}...")
    
    try:
        # Inicia o Redis como um processo em background
        with open(REDIS_LOG_FILE, "w") as log_file:
            process = subprocess.Popen(
                [redis_executable, "--port", str(REDIS_PORT)],
                stdout=log_file,
                stderr=log_file
            )
        
        # Salva o PID do processo
        with open(REDIS_PID_FILE, "w") as pid_file:
            pid_file.write(str(process.pid))
        
        # Espera até 5 segundos para o Redis iniciar
        for _ in range(10):
            if is_redis_running_on_port(REDIS_PORT):
                logger.info(f"Redis iniciado com sucesso na porta {REDIS_PORT}")
                return True
            time.sleep(0.5)
        
        logger.error("Timeout ao iniciar Redis. Verifique o log em " + REDIS_LOG_FILE)
        return False
    
    except Exception as e:
        logger.error(f"Erro ao iniciar Redis: {str(e)}")
        return False

def stop_redis_server():
    """Para o servidor Redis local se estiver rodando"""
    try:
        # Verifica se temos um PID salvo
        if os.path.exists(REDIS_PID_FILE):
            with open(REDIS_PID_FILE, "r") as pid_file:
                pid = int(pid_file.read().strip())
            
            # Tenta encerrar o processo graciosamente
            try:
                os.kill(pid, signal.SIGTERM)
                logger.info(f"Redis (PID {pid}) desligado com sucesso")
            except ProcessLookupError:
                logger.info("O processo Redis já não está mais rodando")
            except Exception as e:
                logger.error(f"Erro ao desligar Redis: {str(e)}")
            
            # Remove o arquivo PID
            os.remove(REDIS_PID_FILE)
        
        # Se a porta ainda estiver em uso, tenta uma abordagem alternativa
        if is_port_in_use(REDIS_PORT):
            logger.info(f"A porta {REDIS_PORT} ainda está em uso, tentando abordagem alternativa")
            try:
                # Tenta usar o redis-cli para desligar o servidor
                subprocess.run(["redis-cli", "-p", str(REDIS_PORT), "shutdown"], 
                              check=False, timeout=5)
                time.sleep(1)
            except:
                pass
                
    except Exception as e:
        logger.error(f"Erro ao tentar parar o Redis: {str(e)}")

def ensure_redis_running():
    """Garante que o Redis esteja rodando, iniciando-o se necessário"""
    
    # Verifica se estamos em um container Docker
    IN_DOCKER = os.path.exists('/.dockerenv')
    
    # Se estiver no Docker, não precisa gerenciar o Redis localmente
    if IN_DOCKER:
        logger.info("Ambiente Docker detectado, pulando inicialização local do Redis")
        return True
    
    # Verifica se o Redis já está rodando na porta padrão
    if is_redis_running_on_port(REDIS_PORT):
        logger.info(f"Redis já está rodando na porta {REDIS_PORT}")
        return True
    
    # Inicia o Redis se não estiver rodando
    return start_redis_server()

# Registra a função de limpeza para ser chamada quando o programa terminar
atexit.register(stop_redis_server)

# Inicialização automática
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    ensure_redis_running()