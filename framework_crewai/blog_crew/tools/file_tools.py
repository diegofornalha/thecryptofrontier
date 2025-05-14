"""
Ferramentas para manipulação de arquivos
"""

import os
import json
import logging
from langchain_core.tools import tool

logger = logging.getLogger("file_tools")

@tool
def save_to_file(data, file_path):
    """Salva dados em um arquivo JSON."""
    try:
        # Criar diretório se não existir
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Salvar dados no arquivo
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        return {"success": True, "path": file_path}
    except Exception as e:
        logger.error(f"Erro ao salvar arquivo {file_path}: {str(e)}")
        return {"success": False, "error": str(e)}

@tool
def read_from_file(file_path):
    """Lê dados de um arquivo JSON."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Erro ao ler arquivo {file_path}: {str(e)}")
        return {"error": str(e)}