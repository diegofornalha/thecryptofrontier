# Versão do pacote
__version__ = '1.0.0'

"""
Módulo de Agentes CrewAI para automação do blog The Crypto Frontier.
Contém agentes especializados organizados por função.
"""

AGENT_ROLES = {
    # Agentes de monitoramento
    "MONITOR": "Monitor de Feeds RSS",
    "SELECTOR": "Seletor de Conteúdo Relevante",
    
    # Agentes de tradução
    "TRANSLATOR": "Tradutor de Conteúdo",
    "LOCALIZER": "Adaptador de Conteúdo para Brasil",
    
    # Agentes de edição e formatação
    "EDITOR": "Editor de Conteúdo",
    "FORMATTER": "Formatador de Markdown",
    
    # Agentes de SEO e publicação
    "SEO_ANALYST": "Analista de SEO",
    "PUBLISHER": "Publicador de Conteúdo"
} 