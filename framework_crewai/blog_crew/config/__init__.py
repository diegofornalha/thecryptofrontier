import os
import yaml
from .sanity_config import SANITY_CONFIG, get_sanity_api_url

def load_config():
    """Carrega as configurações do arquivo YAML"""
    config_path = os.path.join(os.path.dirname(__file__), 'settings.yaml')
    with open(config_path, 'r') as file:
        return yaml.safe_load(file)

# Exporta as configurações
config = load_config()

__all__ = ['config', 'SANITY_CONFIG', 'get_sanity_api_url']