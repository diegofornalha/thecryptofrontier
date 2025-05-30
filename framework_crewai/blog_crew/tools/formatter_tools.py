"""
Ferramentas para formatação de conteúdo para o Sanity CMS
"""

import re
import unicodedata
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from crewai.tools import tool
import uuid

try:
    from models.post import Block, Span
except ImportError:
    Block = None
    Span = None

logger = logging.getLogger("formatter_tools")

@tool
def create_slug(title=None, **kwargs):
    """
    Cria um slug a partir de um título.
    Converte o título para minúsculas, remove acentos e caracteres especiais,
    substitui espaços por hífens e remove caracteres não alfanuméricos.
    """
    try:
        # Processar parâmetros
        if title is None:
            # Tentar extrair o título de diferentes formatos de argumentos
            if "title" in kwargs:
                title = kwargs["title"]
            elif "text" in kwargs:
                title = kwargs["text"]
            elif "content" in kwargs:
                title = kwargs["content"]
            elif "post" in kwargs and isinstance(kwargs["post"], dict) and "title" in kwargs["post"]:
                title = kwargs["post"]["title"]
            elif "data" in kwargs and isinstance(kwargs["data"], dict) and "title" in kwargs["data"]:
                title = kwargs["data"]["title"]
            elif len(kwargs) > 0:
                # Tentar usar o primeiro argumento string como título
                for k, v in kwargs.items():
                    if isinstance(v, str):
                        title = v
                        break
        
        # Verificar se o título é válido
        if title is None or not isinstance(title, str) or not title.strip():
            logger.error("Título não fornecido ou inválido")
            return {"success": False, "error": "Título é obrigatório para criar slug"}
        
        # Converter para minúsculas
        slug = title.lower()
        
        # Remover acentos
        slug = unicodedata.normalize('NFKD', slug)
        slug = ''.join([c for c in slug if not unicodedata.combining(c)])
        
        # Substituir espaços por hífens e remover caracteres não alfanuméricos
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s-]+', '-', slug)
        slug = slug.strip('-')
        
        return {"success": True, "slug": slug}
    except Exception as e:
        logger.error(f"Erro ao criar slug para '{title}': {str(e)}")
        if title:
            simple_slug = title.lower().replace(' ', '-')
            return {"success": True, "slug": simple_slug, "warning": "Usou método simplificado devido a erro"}
        return {"success": False, "error": str(e)}

@tool
def format_content_for_sanity(content_text=None, **kwargs):
    """
    Formata texto simples em formato Portable Text para o Sanity.
    Divide o texto em parágrafos e formata cada um deles conforme o schema do Sanity.
    """
    try:
        # Processar parâmetros
        if content_text is None:
            # Tentar extrair o conteúdo de diferentes formatos de argumentos
            if "content" in kwargs:
                content_text = kwargs["content"]
            elif "text" in kwargs:
                content_text = kwargs["text"]
            elif "body" in kwargs:
                content_text = kwargs["body"]
            elif "post" in kwargs and isinstance(kwargs["post"], dict):
                if "content" in kwargs["post"]:
                    content_text = kwargs["post"]["content"]
                elif "body" in kwargs["post"]:
                    content_text = kwargs["post"]["body"]
                elif "text" in kwargs["post"]:
                    content_text = kwargs["post"]["text"]
            elif "data" in kwargs and isinstance(kwargs["data"], dict):
                if "content" in kwargs["data"]:
                    content_text = kwargs["data"]["content"]
                elif "body" in kwargs["data"]:
                    content_text = kwargs["data"]["body"]
                elif "text" in kwargs["data"]:
                    content_text = kwargs["data"]["text"]
            elif len(kwargs) > 0:
                # Tentar usar o primeiro argumento string como conteúdo
                for k, v in kwargs.items():
                    if isinstance(v, str) and len(v) > 50:  # Conteúdo provavelmente é maior que 50 caracteres
                        content_text = v
                        break
        
        # Verificar se o conteúdo é válido
        if content_text is None:
            logger.error("Conteúdo não fornecido")
            return {"success": False, "error": "Conteúdo é obrigatório para formatação"}
            
        # Se o conteúdo já for uma lista (pode ser que já esteja no formato do Sanity)
        if isinstance(content_text, list):
            # Verificar se já está no formato do Sanity
            if all(isinstance(block, dict) and "_type" in block for block in content_text):
                logger.info("Conteúdo já está no formato do Sanity")
                return {"success": True, "blocks": content_text}
        
        # Garantir que content_text seja uma string
        if not isinstance(content_text, str):
            content_text = str(content_text)
        
        # Dividir o texto em parágrafos
        paragraphs = [p.strip() for p in content_text.split('\n\n') if p.strip()]
        if len(paragraphs) == 0:
            # Se não houver parágrafos após split('\n\n'), tentar dividir por '\n'
            paragraphs = [p.strip() for p in content_text.split('\n') if p.strip()]
        if len(paragraphs) == 0:
            # Se ainda não houver parágrafos, usar o conteúdo inteiro como um único parágrafo
            paragraphs = [content_text.strip()]
        
        # Usar modelos Pydantic se disponíveis
        if Block is not None and Span is not None:
            logger.info("Usando modelos Pydantic para formatação do conteúdo")
            blocks = []
            for p in paragraphs:
                # Detectar cabeçalhos
                if p.startswith('# '):
                    blocks.append(
                        Block(
                            style="h1",
                            children=[Span(text=p[2:].strip())]
                        ).dict()
                    )
                elif p.startswith('## '):
                    blocks.append(
                        Block(
                            style="h2",
                            children=[Span(text=p[3:].strip())]
                        ).dict()
                    )
                elif p.startswith('### '):
                    blocks.append(
                        Block(
                            style="h3",
                            children=[Span(text=p[4:].strip())]
                        ).dict()
                    )
                else:
                    blocks.append(
                        Block(
                            style="normal",
                            children=[Span(text=p)]
                        ).dict()
                    )
            
            return {"success": True, "blocks": blocks}
        else:
            # Abordagem tradicional sem Pydantic
            logger.info("Usando abordagem tradicional para formatação do conteúdo")
            blocks = []
            for p in paragraphs:
                # Detectar cabeçalhos
                if p.startswith('# '):
                    blocks.append({
                        "_type": "block",
                        "_key": str(uuid.uuid4())[:8],
                        "style": "h1",
                        "children": [{
                            "_type": "span",
                            "_key": str(uuid.uuid4())[:8],
                            "text": p[2:].strip()
                        }]
                    })
                elif p.startswith('## '):
                    blocks.append({
                        "_type": "block",
                        "_key": str(uuid.uuid4())[:8],
                        "style": "h2",
                        "children": [{
                            "_type": "span",
                            "_key": str(uuid.uuid4())[:8],
                            "text": p[3:].strip()
                        }]
                    })
                elif p.startswith('### '):
                    blocks.append({
                        "_type": "block",
                        "_key": str(uuid.uuid4())[:8],
                        "style": "h3",
                        "children": [{
                            "_type": "span",
                            "_key": str(uuid.uuid4())[:8],
                            "text": p[4:].strip()
                        }]
                    })
                else:
                    blocks.append({
                        "_type": "block",
                        "_key": str(uuid.uuid4())[:8],
                        "style": "normal",
                        "children": [{
                            "_type": "span",
                            "_key": str(uuid.uuid4())[:8],
                            "text": p
                        }]
                    })
            
            return {"success": True, "blocks": blocks}
            
    except Exception as e:
        logger.error(f"Erro ao formatar conteúdo para Sanity: {str(e)}")
        # Retornar um único bloco com todo o conteúdo em caso de erro
        fallback_blocks = [{
            "_type": "block",
            "_key": str(uuid.uuid4())[:8],
            "style": "normal",
            "children": [{
                "_type": "span",
                "_key": str(uuid.uuid4())[:8],
                "text": str(content_text) if content_text else "Conteúdo não disponível"
            }]
        }]
        return {"success": True, "blocks": fallback_blocks, "warning": "Usou método simplificado devido a erro"}

def create_slug_simple(title: str) -> str:
    """Cria slug simples a partir do título"""
    import re
    import unicodedata
    
    # Normalizar unicode
    title = unicodedata.normalize('NFKD', title)
    title = ''.join([c for c in title if not unicodedata.combining(c)])
    
    # Converter para lowercase e remover caracteres especiais
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')
    
    # Limitar tamanho
    if len(slug) > 50:
        slug = slug[:50].rsplit('-', 1)[0]
    
    return slug