# Versão do pacote
__version__ = '1.0.0'

"""
Módulo de Agentes CrewAI para automação do blog The Crypto Frontier.
Contém agentes especializados organizados por função.
"""

AGENT_ROLES = {
    # Agentes de monitoramento
    "MONITOR": "Monitor de Feeds RSS",
    # Agentes de tradução
    "TRANSLATOR": "Tradutor de Conteúdo",
    # Agentes Publicador no CMS
    "PUBLISHER": "Publicador de Conteúdo"
} 