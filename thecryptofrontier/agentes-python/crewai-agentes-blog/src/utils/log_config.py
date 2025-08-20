#!/usr/bin/env python3
"""
Configuração centralizada de logging
Garante que todos os logs vão para a pasta logs/
"""

import logging
from pathlib import Path
from datetime import datetime
import sys

# Diretório de logs
BASE_DIR = Path(__file__).parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

def setup_logger(
    name: str,
    log_file: str = None,
    level: int = logging.INFO,
    format_string: str = None,
    console: bool = True
) -> logging.Logger:
    """
    Configura um logger com arquivo e console opcionais
    
    Args:
        name: Nome do logger
        log_file: Nome do arquivo de log (será criado em logs/)
        level: Nível de log (default: INFO)
        format_string: Formato customizado (opcional)
        console: Se deve logar no console também (default: True)
    
    Returns:
        Logger configurado
    """
    # Se não especificar arquivo, usa o nome do logger
    if log_file is None:
        log_file = f"{name.replace('.', '_')}.log"
    
    # Formato padrão
    if format_string is None:
        format_string = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    
    # Criar logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Remover handlers existentes para evitar duplicação
    logger.handlers.clear()
    
    # Handler para arquivo
    file_path = LOG_DIR / log_file
    file_handler = logging.FileHandler(file_path, encoding='utf-8')
    file_handler.setLevel(level)
    file_handler.setFormatter(logging.Formatter(format_string))
    logger.addHandler(file_handler)
    
    # Handler para console (opcional)
    if console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_handler.setFormatter(logging.Formatter(format_string))
        logger.addHandler(console_handler)
    
    # Evitar propagação para o logger raiz
    logger.propagate = False
    
    return logger

def setup_rotating_logger(
    name: str,
    log_file: str = None,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5,
    level: int = logging.INFO,
    console: bool = True
) -> logging.Logger:
    """
    Configura um logger com rotação de arquivos
    
    Args:
        name: Nome do logger
        log_file: Nome do arquivo de log
        max_bytes: Tamanho máximo do arquivo antes de rotacionar
        backup_count: Número de backups a manter
        level: Nível de log
        console: Se deve logar no console também
    
    Returns:
        Logger configurado com rotação
    """
    from logging.handlers import RotatingFileHandler
    
    # Se não especificar arquivo, usa o nome do logger
    if log_file is None:
        log_file = f"{name.replace('.', '_')}.log"
    
    # Criar logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Remover handlers existentes
    logger.handlers.clear()
    
    # Handler com rotação para arquivo
    file_path = LOG_DIR / log_file
    rotating_handler = RotatingFileHandler(
        file_path,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    rotating_handler.setLevel(level)
    rotating_handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    )
    logger.addHandler(rotating_handler)
    
    # Handler para console (opcional)
    if console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_handler.setFormatter(
            logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
        )
        logger.addHandler(console_handler)
    
    # Evitar propagação
    logger.propagate = False
    
    return logger

# Função para criar logger diário (útil para monitoramento)
def setup_daily_logger(
    name: str,
    base_filename: str = None,
    level: int = logging.INFO,
    console: bool = True
) -> logging.Logger:
    """
    Configura um logger que cria um novo arquivo por dia
    
    Args:
        name: Nome do logger
        base_filename: Nome base do arquivo (data será adicionada)
        level: Nível de log
        console: Se deve logar no console também
    
    Returns:
        Logger configurado com arquivo diário
    """
    # Nome base do arquivo
    if base_filename is None:
        base_filename = name.replace('.', '_')
    
    # Adicionar data ao nome do arquivo
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = f"{base_filename}_{today}.log"
    
    return setup_logger(name, log_file, level, console=console)

# Exemplo de uso
if __name__ == "__main__":
    # Teste básico
    logger = setup_logger("test_logger", "test.log")
    logger.info("Teste de log básico")
    
    # Teste com rotação
    rotating_logger = setup_rotating_logger("test_rotating", max_bytes=1024)
    for i in range(100):
        rotating_logger.info(f"Mensagem {i} - " + "x" * 100)
    
    # Teste diário
    daily_logger = setup_daily_logger("test_daily")
    daily_logger.info("Log diário criado")
    
    print(f"Logs criados em: {LOG_DIR}")