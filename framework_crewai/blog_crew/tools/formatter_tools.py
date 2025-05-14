"""
Ferramentas para formatação de conteúdo para o Sanity CMS
"""

import re
import unicodedata
import logging
from langchain_core.tools import tool

logger = logging.getLogger("formatter_tools")

@tool
def create_slug(title):
    """
    Cria um slug a partir de um título.
    Converte o título para minúsculas, remove acentos e caracteres especiais,
    substitui espaços por hífens e remove caracteres não alfanuméricos.
    """
    try:
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
    except Exception as e:
        logger.error(f"Erro ao criar slug para '{title}': {str(e)}")
        return title.lower().replace(' ', '-')

@tool
def format_content_for_sanity(content_text):
    """
    Formata texto simples em formato Portable Text para o Sanity.
    Divide o texto em parágrafos e formata cada um deles conforme o schema do Sanity.
    """
    try:
        # Dividir o texto em parágrafos
        paragraphs = [p.strip() for p in content_text.split('\n\n') if p.strip()]
        
        # Formatar cada parágrafo como um bloco Portable Text
        blocks = []
        for p in paragraphs:
            # Detectar cabeçalhos
            if p.startswith('# '):
                blocks.append({
                    "_type": "block",
                    "style": "h1",
                    "children": [{"_type": "span", "text": p[2:].strip()}]
                })
            elif p.startswith('## '):
                blocks.append({
                    "_type": "block",
                    "style": "h2",
                    "children": [{"_type": "span", "text": p[3:].strip()}]
                })
            elif p.startswith('### '):
                blocks.append({
                    "_type": "block",
                    "style": "h3",
                    "children": [{"_type": "span", "text": p[4:].strip()}]
                })
            else:
                blocks.append({
                    "_type": "block",
                    "style": "normal",
                    "children": [{"_type": "span", "text": p}]
                })
        
        return blocks
    except Exception as e:
        logger.error(f"Erro ao formatar conteúdo para Sanity: {str(e)}")
        # Retornar um único bloco com todo o conteúdo em caso de erro
        return [{
            "_type": "block",
            "style": "normal",
            "children": [{"_type": "span", "text": content_text}]
        }]