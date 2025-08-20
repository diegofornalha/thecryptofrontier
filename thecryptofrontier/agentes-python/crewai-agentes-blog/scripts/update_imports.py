#!/usr/bin/env python3
"""
Script para atualizar imports após reestruturação
"""

import os
import re
from pathlib import Path

# Mapeamento de imports antigos para novos
IMPORT_MAPPINGS = {
    # Agents
    r'from agents\.': 'from src.agents.',
    r'import agents': 'import src.agents',
    
    # Tasks
    r'from tasks\.': 'from src.tasks.',
    r'import tasks': 'import src.tasks',
    
    # Tools (antigas utilities)
    r'from utilities\.': 'from src.tools.',
    r'import utilities': 'import src.tools',
    
    # Tools (antigo tools)
    r'from tools\.': 'from src.tools.',
    r'import tools': 'import src.tools',
    
    # Models
    r'from models\.': 'from src.models.',
    r'import models': 'import src.models',
    
    # Logic
    r'from logic\.': 'from src.logic.',
    r'import logic': 'import src.logic',
    
    # Config
    r'from config\.': 'from src.config.',
    r'import config': 'import src.config',
    
    # Utils
    r'from utils\.': 'from src.utils.',
    r'import utils': 'import src.utils',
    
    # Schemas
    r'from schemas\.': 'from src.schemas.',
    r'import schemas': 'import src.schemas',
    
    # Monitoring
    r'from monitoring\.': 'from src.monitoring.',
    r'import monitoring': 'import src.monitoring',
}


def update_file_imports(file_path):
    """Atualiza imports em um arquivo Python"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Aplicar mapeamentos
        for old_pattern, new_pattern in IMPORT_MAPPINGS.items():
            content = re.sub(old_pattern, new_pattern, content)
        
        # Se houve mudanças, salvar
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Atualizado: {file_path}")
            return True
        
        return False
    
    except Exception as e:
        print(f"❌ Erro em {file_path}: {e}")
        return False


def main():
    """Atualiza todos os arquivos Python do projeto"""
    project_root = Path(__file__).parent.parent
    
    updated_count = 0
    total_count = 0
    
    # Percorrer todos os arquivos .py
    for py_file in project_root.rglob("*.py"):
        # Pular venv e __pycache__
        if "venv" in str(py_file) or "__pycache__" in str(py_file):
            continue
        
        # Pular este próprio script
        if py_file.name == "update_imports.py":
            continue
        
        total_count += 1
        if update_file_imports(py_file):
            updated_count += 1
    
    print(f"\n📊 Resumo:")
    print(f"   Total de arquivos: {total_count}")
    print(f"   Arquivos atualizados: {updated_count}")


if __name__ == "__main__":
    main()