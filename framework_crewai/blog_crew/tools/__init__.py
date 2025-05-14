from crewai.tools import BaseTool
from crewai.tools import tool as crewai_tool

# Reimportar as ferramentas para garantir que elas sejam instâncias de BaseTool
from .rss_tools import read_rss_feeds
from .file_tools import save_to_file, read_from_file  
from .sanity_tools import publish_to_sanity
from .formatter_tools import create_slug, format_content_for_sanity

# Lista de tools decoradas (instâncias de BaseTool)
tools = [
    read_rss_feeds,
    save_to_file,
    read_from_file,
    publish_to_sanity,
    create_slug,
    format_content_for_sanity
]

def get_tool_by_name(name):
    for tool in tools:
        if hasattr(tool, 'name') and tool.name == name:
            return tool
    raise ValueError(f"Tool '{name}' não encontrada")

# Verificar se todas as ferramentas são instâncias de BaseTool
for t in tools:
    if not isinstance(t, BaseTool):
        raise TypeError(f"Ferramenta {t.name if hasattr(t, 'name') else t} não é uma instância de BaseTool")

__all__ = [
    'read_rss_feeds',
    'save_to_file',
    'read_from_file',
    'publish_to_sanity',
    'create_slug',
    'format_content_for_sanity',
    'tools',
    'get_tool_by_name',
    'crewai_tool'
]