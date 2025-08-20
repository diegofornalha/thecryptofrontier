"""
Ferramentas simplificadas para manipulação de arquivos
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime
from crewai.tools import tool

logger = logging.getLogger("file_tools_simple")

@tool
def save_json_file(content: str, filename: str, directory: str = "posts_para_traduzir") -> str:
    """
    Salva conteúdo JSON em arquivo
    
    Args:
        content: String JSON com o conteúdo a salvar
        filename: Nome do arquivo (sem extensão)
        directory: Diretório onde salvar (padrão: posts_para_traduzir)
        
    Returns:
        Caminho do arquivo salvo ou mensagem de erro
    """
    try:
        # Garantir que o diretório existe
        dir_path = Path(directory)
        dir_path.mkdir(exist_ok=True)
        
        # Adicionar .json se não tiver
        if not filename.endswith('.json'):
            filename = f"{filename}.json"
            
        # Caminho completo
        file_path = dir_path / filename
        
        # Parse do JSON se for string
        if isinstance(content, str):
            data = json.loads(content)
        else:
            data = content
            
        # Salvar arquivo
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        logger.info(f"✅ Arquivo salvo: {file_path}")
        return f"Arquivo salvo com sucesso: {file_path}"
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ Erro ao decodificar JSON: {e}")
        return f"Erro: JSON inválido - {str(e)}"
    except Exception as e:
        logger.error(f"❌ Erro ao salvar arquivo: {e}")
        return f"Erro ao salvar arquivo: {str(e)}"

@tool
def save_article(title: str, link: str, summary: str, content: str, 
                 published: str, source: str, directory: str = "posts_para_traduzir") -> str:
    """
    Salva um artigo em formato JSON
    
    Args:
        title: Título do artigo
        link: URL do artigo
        summary: Resumo do artigo
        content: Conteúdo completo
        published: Data de publicação
        source: Fonte do artigo
        directory: Diretório onde salvar
        
    Returns:
        Caminho do arquivo salvo ou mensagem de erro
    """
    try:
        # Criar estrutura do artigo
        article = {
            "title": title,
            "link": link,
            "summary": summary,
            "content": content,
            "published": published,
            "source": source
        }
        
        # Gerar nome único
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"para_traduzir_{timestamp}_{hash(title) % 1000}.json"
        
        # Usar a função save_json_file
        result = save_json_file(
            content=json.dumps(article, ensure_ascii=False),
            filename=filename,
            directory=directory
        )
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Erro ao salvar artigo: {e}")
        return f"Erro ao salvar artigo: {str(e)}"

@tool
def list_json_files(directory: str = "posts_para_traduzir") -> str:
    """
    Lista arquivos JSON em um diretório
    
    Args:
        directory: Diretório para listar
        
    Returns:
        Lista de arquivos ou mensagem de erro
    """
    try:
        dir_path = Path(directory)
        if not dir_path.exists():
            return f"Diretório {directory} não existe"
            
        files = list(dir_path.glob("*.json"))
        
        if not files:
            return f"Nenhum arquivo JSON encontrado em {directory}"
            
        file_list = []
        for f in sorted(files)[:10]:  # Máximo 10 arquivos
            file_list.append(f.name)
            
        return f"Arquivos em {directory}: " + ", ".join(file_list)
        
    except Exception as e:
        return f"Erro ao listar arquivos: {str(e)}"