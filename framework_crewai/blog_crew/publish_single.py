#!/usr/bin/env python3
"""
Script para publicar um único arquivo no Sanity CMS
Substitui o manual_publish.py original
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
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("publish_single")

def publicar_post(file_path):
    """Publica um post no Sanity CMS"""
    # Verificar se o arquivo existe
    if not os.path.exists(file_path):
        logger.error(f"Arquivo não encontrado: {file_path}")
        return {"success": False, "error": "Arquivo não encontrado"}
    
    # Ler o arquivo JSON
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            post_data = json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Erro ao decodificar o JSON: {str(e)}")
        return {"success": False, "error": f"Erro ao decodificar o JSON: {str(e)}"}
    
    # Obter token do Sanity
    sanity_api_token = os.environ.get("SANITY_API_TOKEN")
    if not sanity_api_token:
        # Tentar ler do arquivo .env
        env_file = Path(".env")
        if env_file.exists():
            with open(env_file, "r") as f:
                for line in f:
                    if line.startswith("SANITY_API_TOKEN="):
                        sanity_api_token = line.split("=", 1)[1].strip()
                        break
        
        if not sanity_api_token:
            logger.error("Token do Sanity não encontrado")
            return {"success": False, "error": "Token do Sanity não encontrado"}
    
    # Configurações do Sanity
    project_id = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
    dataset = "production"
    api_version = "2023-05-03"
    
    # URL da API do Sanity
    url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
    
    # Headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {sanity_api_token}"
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
        
        logger.info(f"Status code: {response.status_code}")
        logger.info(f"Resposta: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Resposta completa: {json.dumps(result, indent=2)}")
            
            logger.info(f"Post publicado com sucesso: {post_data.get('title')}")
            
            # Mover o arquivo para a pasta de publicados
            file_path_obj = Path(file_path)
            dir_path = file_path_obj.parent
            file_name = file_path_obj.name
            
            # Se começa com "formatado_", substituir por "publicado_"
            if file_name.startswith("formatado_"):
                new_file_name = file_name.replace("formatado_", "publicado_")
                # Obter o caminho para a pasta de publicados
                dir_parent = dir_path.parent
                published_dir = dir_parent / "posts_publicados"
                # Garantir que a pasta existe
                published_dir.mkdir(exist_ok=True)
                # Caminho completo do novo arquivo
                new_file_path = published_dir / new_file_name
                
                # Copiar o arquivo
                import shutil
                shutil.copy2(file_path, new_file_path)
                logger.info(f"Arquivo movido para: {new_file_path}")
                
                return {
                    "success": True,
                    "message": f"Post publicado com sucesso: {post_data.get('title')}",
                    "published_file": str(new_file_path)
                }
            
            return {
                "success": True,
                "message": f"Post publicado com sucesso: {post_data.get('title')}"
            }
        else:
            logger.error(f"Erro na requisição: {response.status_code} - {response.text}")
            return {
                "success": False,
                "error": f"Erro HTTP {response.status_code}: {response.text}"
            }
    except Exception as e:
        logger.error(f"Erro ao publicar: {str(e)}")
        return {"success": False, "error": str(e)}

def main():
    # Verificar se foi passado um arquivo como argumento
    if len(sys.argv) < 2:
        print(f"Uso: python {sys.argv[0]} <caminho_para_arquivo.json>")
        return
    
    file_path = sys.argv[1]
    
    # Publicar o post
    logger.info(f"Publicando o post do arquivo: {file_path}")
    result = publicar_post(file_path)
    
    # Verificar resultado
    if result["success"]:
        logger.info(f"✅ {result['message']}")
        if "published_file" in result:
            logger.info(f"Arquivo movido para: {result['published_file']}")
    else:
        logger.error(f"❌ Erro na publicação: {result['error']}")

if __name__ == "__main__":
    main()