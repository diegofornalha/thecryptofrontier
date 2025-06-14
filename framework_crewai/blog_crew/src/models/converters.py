"""
Funções para conversão entre formatos de dados
"""

import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
import uuid
import re
import unicodedata
from pathlib import Path

def fix_strapi_field_names(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Corrige nomes de campos para o formato esperado pelo Strapi.
    Converte 'type' para '_type', 'key' para '_key', 'ref' para '_ref', etc.
    
    Args:
        data: Dicionário com dados a serem corrigidos
        
    Returns:
        Dicionário com campos corrigidos
    """
    result = {}
    
    for key, value in data.items():
        # Converter campos especiais para formato Strapi
        if key == "type":
            result["_type"] = value
        elif key == "key":
            result["_key"] = value
        elif key == "ref":
            result["_ref"] = value
        else:
            # Processar valores aninhados
            if isinstance(value, dict):
                result[key] = fix_strapi_field_names(value)
            elif isinstance(value, list):
                result[key] = [
                    fix_strapi_field_names(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                result[key] = value
                
    return result

def save_json_file(data: Dict[str, Any], file_path: str) -> None:
    """
    Salva dados em um arquivo JSON, garantindo que a estrutura esteja correta para o Strapi.
    
    Args:
        data: Dicionário com dados a serem salvos
        file_path: Caminho do arquivo onde os dados serão salvos
    """
    # Criar diretório se não existir
    Path(file_path).parent.mkdir(parents=True, exist_ok=True)
    
    # Corrigir nomes de campos
    corrected_data = fix_strapi_field_names(data)
    
    # Salvar arquivo
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(corrected_data, f, ensure_ascii=False, indent=2, default=str)
    
    return corrected_data

def create_slug(title: str) -> str:
    """
    Cria um slug a partir de um título.
    
    Args:
        title: Título para criar o slug
        
    Returns:
        Slug gerado
    """
    # Converter para minúsculas
    slug = title.lower()
    
    # Remover acentos
    slug = unicodedata.normalize('NFKD', slug)
    slug = ''.join([c for c in slug if not unicodedata.combining(c)])
    
    # Substituir espaços por hífens e remover caracteres não alfanuméricos
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')
    
    return slug