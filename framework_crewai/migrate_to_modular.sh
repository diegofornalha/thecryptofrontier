#!/bin/bash

echo "Iniciando migração para versão modularizada..."

# Verificar se os diretórios já existem
if [ ! -d "static" ]; then
    echo "Criando diretório static..."
    mkdir -p static
else
    echo "Diretório static já existe."
fi

if [ ! -d "src/blog_automacao/ui" ]; then
    echo "Criando diretório src/blog_automacao/ui..."
    mkdir -p src/blog_automacao/ui
else
    echo "Diretório src/blog_automacao/ui já existe."
fi

if [ ! -d "src/blog_automacao/logic" ]; then
    echo "Criando diretório src/blog_automacao/logic..."
    mkdir -p src/blog_automacao/logic
else
    echo "Diretório src/blog_automacao/logic já existe."
fi

# Copiar arquivos
echo "Copiando arquivos de style.css..."
if [ ! -f "static/style.css" ]; then
    touch static/style.css
    echo "Arquivo style.css criado."
else
    echo "Arquivo style.css já existe."
fi

# Criar arquivos __init__.py
echo "Criando arquivos __init__.py..."
echo "from .components import *" > src/blog_automacao/ui/__init__.py
echo "from .session_manager import SessionManager
from .business_logic import (
    monitor_feeds,
    translate_article,
    publish_article,
    fetch_sanity_posts,
    get_db_posts,
    delete_db_post,
    clear_db,
    execute_full_flow,
    get_stats,
    load_feeds,
    save_feeds
)" > src/blog_automacao/logic/__init__.py

# Backup do app.py original
echo "Criando backup do app.py original..."
if [ -f "app.py" ]; then
    cp app.py app.py.bak
    echo "Backup criado como app.py.bak"
else
    echo "ATENÇÃO: app.py não encontrado para backup."
fi

echo "Migração completa!"
echo "Para executar a versão modularizada: streamlit run app_modular.py" 