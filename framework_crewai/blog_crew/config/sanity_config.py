"""
Configuração do Sanity CMS
Este arquivo contém as configurações necessárias para conexão com o Sanity
"""

import os

# Configurações do Sanity
SANITY_CONFIG = {
    "name": "crypto-frontier",
    "title": "The Crypto Frontier",
    "project_id": os.environ.get("SANITY_PROJECT_ID", "brby2yrg"),
    "dataset": "production",
    "api_version": "2023-05-03"
}

# Endpoint da API do Sanity
def get_sanity_api_url(project_id=None, dataset=None, api_version=None):
    """Retorna a URL da API do Sanity com os parâmetros configurados"""
    _project_id = project_id or SANITY_CONFIG["project_id"]
    _dataset = dataset or SANITY_CONFIG["dataset"]
    _api_version = api_version or SANITY_CONFIG["api_version"]
    
    return f"https://{_project_id}.api.sanity.io/v{_api_version}/data/mutate/{_dataset}"