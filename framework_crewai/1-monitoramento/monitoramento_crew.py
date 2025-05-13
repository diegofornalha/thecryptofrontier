#!/usr/bin/env python

import os
import sys
import argparse
import time
import json
import feedparser
from datetime import datetime
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process

# Adicionar diretório pai ao PATH para importar corretamente
sys.path.append(str(Path(__file__).parent.parent.parent))

# Importar módulos do pacote
from agentes_backup_legado import AGENT_ROLES, setup_logger
from agentes_backup_legado import db_manager  # Importar o módulo em vez da classe DatabaseManager

# Importar funções do módulo RSS
from agentes_backup_legado.1-monitoramento.rss_monitor import obter_feeds_rss, verificar_artigo_processado

# Configuração de logging
logger = setup_logger("monitoramento_crew")

# Configuração da API Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Diretório para salvar os artigos traduzidos
POSTS_DIR = Path(__file__).parent.parent.parent / "posts_traduzidos"
POSTS_DIR.mkdir(exist_ok=True)

# Limite de artigos por execução
MAX_ARTICLES_PER_RUN = 3

# ... resto do código permanece o mesmo ...

# Na linha 81 onde inicializa o DatabaseManager, substituir por:
    # Inicializar banco de dados
    db_manager.init_db()  # Inicializar o banco de dados em vez de criar uma instância
    
    # ... resto do código permanece o mesmo ... 