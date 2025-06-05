#!/usr/bin/env python3
"""
Ferramenta simplificada de geração de imagem para o CrewAI
"""

import os
import json
from pathlib import Path
from crewai.tools import tool

@tool
def generate_image_simple(post_file: str) -> str:
    """
    Gera imagem para um post usando script externo
    
    Args:
        post_file: Nome do arquivo JSON do post
        
    Returns:
        Mensagem de sucesso ou erro
    """
    try:
        # Usar o script que já funciona
        import subprocess
        
        result = subprocess.run(
            ["python", "process_images_working.py"], 
            cwd="/home/sanity/thecryptofrontier/framework_crewai/blog_crew",
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            return f"✅ Imagem gerada com sucesso para {post_file}"
        else:
            return f"❌ Erro ao gerar imagem: {result.stderr}"
            
    except Exception as e:
        return f"❌ Erro: {str(e)}"

# Exportar ferramenta
__all__ = ["generate_image_simple"]