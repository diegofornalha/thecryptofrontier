"""
Configuração do Sanity CMS
Este arquivo contém as configurações necessárias para conexão com o Sanity
"""

import os
import logging
import requests

# Configurar logger
logger = logging.getLogger(__name__)

# Configurações do Sanity
SANITY_CONFIG = {
    "name": "crypto-frontier",
    "title": "The Crypto Frontier",
    "project_id": os.environ.get("SANITY_PROJECT_ID", "brby2yrg"),
    "dataset": "production",
    "api_version": "2023-05-03"
}

# Token padrão do Sanity com permissões corretas (usado apenas se não houver variável de ambiente)
# Note: É preferível usar variáveis de ambiente para tokens
DEFAULT_SANITY_TOKEN = os.environ.get("SANITY_API_TOKEN", "")

# Se o token estiver vazio, verificar se existe arquivo .env e carregá-lo
def load_env_token():
    """Carrega o token do arquivo .env se existir"""
    global DEFAULT_SANITY_TOKEN
    if not DEFAULT_SANITY_TOKEN:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        if os.path.exists(env_file):
            with open(env_file, "r") as f:
                for line in f:
                    if line.startswith("SANITY_API_TOKEN="):
                        DEFAULT_SANITY_TOKEN = line.split("=", 1)[1].strip()
                        break
    return DEFAULT_SANITY_TOKEN

# Endpoint da API do Sanity
def get_sanity_api_url(project_id=None, dataset=None, api_version=None):
    """Retorna a URL da API do Sanity com os parâmetros configurados"""
    _project_id = project_id or SANITY_CONFIG["project_id"]
    _dataset = dataset or SANITY_CONFIG["dataset"]
    _api_version = api_version or SANITY_CONFIG["api_version"]
    
    return f"https://{_project_id}.api.sanity.io/v{_api_version}/data/mutate/{_dataset}"

def verify_sanity_connection():
    """Verifica se a conexão com o Sanity está funcionando"""
    project_id = SANITY_CONFIG["project_id"]
    api_token = os.environ.get("SANITY_API_TOKEN")
    
    if not project_id or not api_token:
        logger.error("Credenciais do Sanity não configuradas")
        return False, "Credenciais do Sanity não configuradas"
    
    try:
        # URL para verificar se o projeto existe
        url = f"https://{project_id}.api.sanity.io/v{SANITY_CONFIG['api_version']}/projects/{project_id}"
        
        headers = {
            "Authorization": f"Bearer {api_token}"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            logger.info("Conexão com Sanity verificada com sucesso")
            return True, "Conexão com Sanity OK"
        else:
            logger.error(f"Erro ao verificar conexão com Sanity: Status {response.status_code}")
            return False, f"Erro ao acessar a API do Sanity: {response.status_code} - {response.text}"
    
    except Exception as e:
        logger.error(f"Erro ao verificar conexão com Sanity: {str(e)}")
        return False, f"Erro ao verificar conexão com Sanity: {str(e)}"