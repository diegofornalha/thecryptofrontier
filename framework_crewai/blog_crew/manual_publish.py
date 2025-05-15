#!/usr/bin/env python3
"""
Script para publicar manualmente um post de teste no Sanity
"""

import os
import json
import logging
import sys
import requests
from datetime import datetime
from pathlib import Path

# Configuração de logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("manual_publish")

def main():
    # Verificar se foi passado um arquivo como argumento
    if len(sys.argv) < 2:
        print(f"Uso: python {sys.argv[0]} <caminho_para_arquivo.json>")
        return
    
    file_path = sys.argv[1]
    
    # Verificar se o arquivo existe
    if not os.path.exists(file_path):
        print(f"Arquivo não encontrado: {file_path}")
        return
    
    # Ler o arquivo JSON
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            post_data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Erro ao decodificar o JSON: {str(e)}")
            return
    
    # Publicar o post diretamente via API
    logger.info(f"Publicando o post do arquivo: {file_path}")
    
    try:
        # Configurações do Sanity
        project_id = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
        dataset = "production"
        api_version = "2023-05-03"
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not api_token:
            with open(".env") as f:
                for line in f:
                    if line.startswith("SANITY_API_TOKEN="):
                        api_token = line.split("=", 1)[1].strip()
                        break
        
        if not api_token:
            logger.error("Token do Sanity não encontrado")
            return
            
        # URL da API do Sanity
        url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
        
        # Headers
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
        
        logger.info(f"Enviando requisição para: {url}")
        
        # Enviar a requisição
        response = requests.post(url, headers=headers, json=mutations, timeout=30)
        
        logger.info(f"Status code: {response.status_code}")
        logger.info(f"Resposta: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Resposta completa: {json.dumps(result, indent=2)}")
            
            # Verificar o ID do documento
            document_id = None
            if "results" in result and len(result["results"]) > 0:
                document_id = result["results"][0].get("id")
                if document_id:
                    logger.info(f"ID do documento: {document_id}")
                    
                    # Mover o arquivo para a pasta de publicados
                    if os.path.exists(file_path):
                        dir_path = os.path.dirname(file_path)
                        file_name = os.path.basename(file_path)
                        
                        # Se começa com "formatado_", substituir por "publicado_"
                        if file_name.startswith("formatado_"):
                            new_file_name = file_name.replace("formatado_", "publicado_")
                            # Obter o caminho para a pasta de publicados
                            published_dir = os.path.join(os.path.dirname(dir_path), "posts_publicados")
                            # Garantir que a pasta existe
                            os.makedirs(published_dir, exist_ok=True)
                            # Caminho completo do novo arquivo
                            new_file_path = os.path.join(published_dir, new_file_name)
                            
                            # Copiar o arquivo
                            import shutil
                            shutil.copy2(file_path, new_file_path)
                            logger.info(f"Arquivo movido para: {new_file_path}")
                else:
                    logger.warning("ID do documento não encontrado na resposta")
            else:
                logger.warning("Campo 'results' não encontrado na resposta")
        else:
            logger.error(f"Erro na requisição: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Erro ao publicar: {str(e)}")

if __name__ == "__main__":
    main()