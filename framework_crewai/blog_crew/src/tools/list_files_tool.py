"""
Ferramenta para listar arquivos em diretórios
"""

import os
import json
from pathlib import Path
from crewai.tools import tool

@tool
def list_directory_files(directory_path: str, extension: str = ".json") -> dict:
    """
    Lista arquivos em um diretório
    
    Args:
        directory_path: Caminho do diretório
        extension: Extensão dos arquivos a listar (padrão: .json)
        
    Returns:
        dict com lista de arquivos encontrados
    """
    try:
        dir_path = Path(directory_path)
        
        if not dir_path.exists():
            return {
                "success": False,
                "error": f"Diretório não encontrado: {directory_path}"
            }
        
        if not dir_path.is_dir():
            return {
                "success": False,
                "error": f"O caminho não é um diretório: {directory_path}"
            }
        
        # Listar arquivos com a extensão especificada
        files = list(dir_path.glob(f"*{extension}"))
        
        file_list = []
        for file in files:
            file_info = {
                "filename": file.name,
                "full_path": str(file),
                "size": file.stat().st_size,
                "modified": file.stat().st_mtime
            }
            file_list.append(file_info)
        
        return {
            "success": True,
            "directory": directory_path,
            "count": len(file_list),
            "files": file_list
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro ao listar diretório: {str(e)}"
        }