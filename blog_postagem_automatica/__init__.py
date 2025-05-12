# Arquivo de inicialização do pacote crewai
# Define quais módulos estão disponíveis quando o pacote é importado

# Versão do pacote
__version__ = '1.0.0'

"""
Módulo de Agentes CrewAI para automação do blog The Crypto Frontier.
Contém agentes especializados organizados por função.
"""

# Importações para facilitar o acesso ao módulo
from agentes_backup_legado.config import *
from agentes_backup_legado.logger import setup_logger
import agentes_backup_legado.db_manager as db_manager  # Importar o módulo inteiro em vez da classe que não existe

# Importações da estrutura modular são feitas nos módulos que precisam deles
# Para evitar erros de importação circular e com módulos que contêm hífens no nome

# Definição dos diferentes papéis dos agentes no sistema
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