import os
import sys
import time
from datetime import datetime

# Adiciona o diretório do ambiente virtual ao caminho de busca do Python
current_dir = os.path.dirname(os.path.abspath(__file__))
site_packages = os.path.join(current_dir, 'fresh_env', 'lib', 'python3.11', 'site-packages')
sys.path.insert(0, site_packages)
sys.path.insert(0, current_dir)

# Importa os módulos do sistema
import rss_monitor
import translator
import markdown_generator
import config
import formatar_conteudo

# Diretório para armazenar os arquivos gerados
OUTPUT_DIR = "posts_traduzidos"

# Configuração para publicação direta
PUBLISH_DIRECTLY = True  # Define se deve publicar diretamente ou apenas gerar arquivo local
PUBLISHING_PLATFORM = "sanity"  # Plataforma para publicação (wordpress, sanity, etc.)
DEFAULT_CATEGORY = config.DEFAULT_CATEGORY  # Categoria padrão para posts
DEFAULT_TAGS = config.DEFAULT_TAGS  # Tags padrão para posts

# Formato de saída - 'html' ou 'markdown'
OUTPUT_FORMAT = "markdown"  # Altere para 'html' se desejar o formato HTML

# Tratamento especial para publisher que pode não existir
class DummyPublisher:
    @staticmethod
    def publish_post(**kwargs):
        print("Módulo publisher não encontrado. Post não publicado.")
        return False, "Módulo publisher não encontrado"

try:
    import publisher
except ImportError:
    publisher = DummyPublisher()

def setup():
    """Configura o ambiente, criando diretórios necessários."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Diretório de saída criado: {OUTPUT_DIR}")
    else:
        print(f"Diretório de saída já existe: {OUTPUT_DIR}")

# ... existing code ... 