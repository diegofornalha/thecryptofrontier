#!/usr/bin/env python3
"""
Script para publicar manualmente um post no Sanity 
Este script substitui o manual_publish.py original, usando as mesmas funções que o CrewAI
"""

import os
import sys
import json
import logging
import requests
from pathlib import Path
from datetime import datetime

# Configurar diretório base para importações
base_dir = Path(__file__).parent.parent
sys.path.append(str(base_dir))

# Importações locais
try:
    from config import SANITY_CONFIG, get_sanity_api_url
except ImportError:
    # Fallback para valores padrão se não conseguir importar
    SANITY_CONFIG = {
        "project_id": os.environ.get("SANITY_PROJECT_ID", "brby2yrg"),
        "dataset": "production",
        "api_version": "2023-05-03"
    }
    
    def get_sanity_api_url(project_id=None, dataset=None, api_version=None):
        _project_id = project_id or SANITY_CONFIG["project_id"]
        _dataset = dataset or SANITY_CONFIG["dataset"]
        _api_version = api_version or SANITY_CONFIG["api_version"]
        
        return f"https://{_project_id}.api.sanity.io/v{_api_version}/data/mutate/{_dataset}"

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("manual_publish_script")

def publish_to_sanity(post_data, file_path=None):
    """Publica um post no Sanity CMS"""
    # Configurações do Sanity
    project_id = os.environ.get("SANITY_PROJECT_ID", SANITY_CONFIG.get("project_id"))
    dataset = SANITY_CONFIG.get("dataset", "production")
    api_token = os.environ.get("SANITY_API_TOKEN")
    
    if not project_id or not api_token:
        logger.error("Credenciais do Sanity não configuradas corretamente")
        return {"success": False, "error": "Credenciais do Sanity não configuradas"}
    
    # URL da API do Sanity
    url = get_sanity_api_url(project_id, dataset)
    
    # Configuração de autenticação
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_token}"
    }
    
    # Preparar a mutação
    mutations = {
        "mutations": [
            {
                "create": post_data
            }
        ]
    }
    
    logger.info(f"Enviando post '{post_data.get('title')}' para o Sanity")
    
    try:
        # Enviar a requisição
        response = requests.post(url, headers=headers, json=mutations, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            logger.debug(f"Resposta completa: {json.dumps(result, indent=2)}")
            
            # Verificar a estrutura da resposta
            if "results" not in result or not result.get("results"):
                logger.error(f"Resposta sem results: {json.dumps(result)}")
                return {
                    "success": False,
                    "error": f"Resposta sem results: {json.dumps(result)}"
                }
                
            document_id = result.get("results", [{}])[0].get("id")
            if not document_id:
                # Tentar outros campos
                document = result.get("results", [{}])[0].get("document", {})
                if document:
                    document_id = document.get("_id")
                
                if not document_id:
                    logger.error(f"ID do documento não encontrado na resposta: {json.dumps(result)}")
                    return {
                        "success": False,
                        "error": f"ID do documento não encontrado na resposta: {json.dumps(result)}"
                    }
            
            logger.info(f"Post publicado com sucesso no Sanity, ID: {document_id}")
            
            # Se temos um caminho de arquivo e ele existe, vamos movê-lo para a pasta de publicados
            if file_path and os.path.exists(file_path):
                try:
                    # Obter diretório base e nome do arquivo
                    dir_path = os.path.dirname(file_path)
                    file_name = os.path.basename(file_path)
                    # É um arquivo formatado, então o nome deve começar com "formatado_"
                    if file_name.startswith("formatado_"):
                        # Substituir "formatado_" por "publicado_"
                        new_file_name = file_name.replace("formatado_", "publicado_")
                        # Obter o caminho para a pasta de publicados
                        published_dir = os.path.join(os.path.dirname(dir_path), "posts_publicados")
                        # Garantir que a pasta de publicados existe
                        os.makedirs(published_dir, exist_ok=True)
                        # Caminho completo do novo arquivo
                        new_file_path = os.path.join(published_dir, new_file_name)
                        
                        # Copiar o arquivo para a pasta de publicados
                        import shutil
                        shutil.copy2(file_path, new_file_path)
                        logger.info(f"Arquivo movido para: {new_file_path}")
                        
                        return {
                            "success": True, 
                            "document_id": document_id,
                            "message": "Artigo publicado com sucesso no Sanity CMS",
                            "published_file": new_file_path
                        }
                except Exception as move_error:
                    logger.error(f"Erro ao mover arquivo: {str(move_error)}")
                    # Continuamos mesmo se falhar ao mover o arquivo
            
            return {
                "success": True, 
                "document_id": document_id,
                "message": "Artigo publicado com sucesso no Sanity CMS"
            }
        else:
            logger.error(f"Erro ao publicar: {response.status_code} - {response.text}")
            return {
                "success": False, 
                "error": f"Erro HTTP {response.status_code}: {response.text}"
            }
    except requests.RequestException as req_error:
        logger.error(f"Erro na requisição para o Sanity: {str(req_error)}")
        return {
            "success": False,
            "error": f"Erro na requisição: {str(req_error)}"
        }

def main():
    # Verificar se foi passado um arquivo como argumento
    if len(sys.argv) < 2:
        print(f"Uso: python {sys.argv[0]} <caminho_para_arquivo.json>")
        return
    
    file_path = sys.argv[1]
    
    # Verificar se o arquivo existe
    if not os.path.exists(file_path):
        logger.error(f"Arquivo não encontrado: {file_path}")
        return
    
    # Verificar token do Sanity
    api_token = os.environ.get("SANITY_API_TOKEN")
    if not api_token:
        logger.error("SANITY_API_TOKEN não configurado no ambiente")
        print("ERRO: Token do Sanity não configurado. Configure a variável de ambiente SANITY_API_TOKEN.")
        return
    
    # Exibir informações de configuração
    logger.info(f"Publicando no projeto Sanity: {SANITY_CONFIG.get('project_id')}")
    logger.info(f"Dataset: {SANITY_CONFIG.get('dataset')}")
    
    # Ler o arquivo JSON
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            post_data = json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Erro ao decodificar o JSON: {str(e)}")
        return
    
    # Publicar o post
    logger.info(f"Publicando o arquivo: {file_path}")
    result = publish_to_sanity(post_data, file_path)
    
    # Verificar resultado
    if result.get("success"):
        logger.info(f"✅ Publicação realizada com sucesso!")
        logger.info(f"ID do documento: {result.get('document_id')}")
        if "published_file" in result:
            logger.info(f"Arquivo movido para: {result.get('published_file')}")
    else:
        logger.error(f"❌ Erro na publicação: {result.get('error')}")
    
    # Retornar o resultado
    return result

if __name__ == "__main__":
    main()