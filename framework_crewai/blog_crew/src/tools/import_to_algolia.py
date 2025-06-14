#!/usr/bin/env python3
"""
Script para importar documentos do Strapi CMS diretamente para o Algolia.
Utiliza o list_strapi_documents.py com opção --algolia para processar os documentos.
"""

import os
import sys
import json
import subprocess
import argparse
import requests
from datetime import datetime

# Configurações do Algolia
ALGOLIA_APP_ID = os.environ.get("ALGOLIA_APP_ID", "42TZWHW8UP")
ALGOLIA_ADMIN_API_KEY = os.environ.get("ALGOLIA_ADMIN_API_KEY", "d0cb55ec8f07832bc5f57da0bd25c535")  # Admin API Key
ALGOLIA_INDEX_NAME = os.environ.get("ALGOLIA_INDEX_NAME", "development_mcpx_content")
strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")

def obter_documentos_do_strapi(tipo_documento="post"):
    """
    Obtém documentos do Strapi no formato adequado para Algolia.
    
    Args:
        tipo_documento: Tipo de documento a buscar no Strapi
        
    Returns:
        list: Lista de documentos preparados para o Algolia
    """
    # Verificar token do Strapi
    if not strapi_API_TOKEN:
        print("Erro: strapi_API_TOKEN não está definido", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Executar script de listagem com opção --algolia
        cmd = ["python", "list_strapi_documents.py", tipo_documento, "--algolia"]
        resultado = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        # Carregar resultado como JSON
        documentos = json.loads(resultado.stdout)
        print(f"Documentos obtidos do Strapi: {len(documentos)}")
        
        return documentos
    
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar list_strapi_documents.py: {e}", file=sys.stderr)
        print(f"Saída de erro: {e.stderr}", file=sys.stderr)
        sys.exit(1)
    
    except json.JSONDecodeError as e:
        print(f"Erro ao processar JSON: {e}", file=sys.stderr)
        sys.exit(1)

def obter_documentos_ja_indexados():
    """
    Obtém informações sobre documentos já indexados no Algolia.
    
    Returns:
        dict: Informações sobre IDs, slugs e URLs já indexados
    """
    try:
        print("Consultando documentos já indexados no Algolia...")
        
        # URL da API do Algolia
        url = f"https://{ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/{ALGOLIA_INDEX_NAME}/browse"
        
        # Headers necessários
        headers = {
            "X-Algolia-API-Key": ALGOLIA_ADMIN_API_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID
        }
        
        # Fazer a requisição
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extrair dados
        result = response.json()
        documents = result.get("hits", [])
        
        # Armazenar informações para evitar duplicação
        indexed_info = {
            'ids': set(),
            'slugs': set(),
            'urls': set()
        }
        
        for doc in documents:
            if 'objectID' in doc:
                indexed_info['ids'].add(doc['objectID'])
            
            if 'slug' in doc and doc['slug']:
                indexed_info['slugs'].add(doc['slug'])
            
            # Extrair URL da fonte original, se disponível
            if ('originalSource' in doc and isinstance(doc['originalSource'], dict) and 
                    'url' in doc['originalSource'] and doc['originalSource']['url']):
                indexed_info['urls'].add(doc['originalSource']['url'])
        
        print(f"Documentos já indexados no Algolia: {len(indexed_info['ids'])}")
        
        return indexed_info
    
    except Exception as e:
        print(f"Erro ao consultar Algolia: {str(e)}", file=sys.stderr)
        return {'ids': set(), 'slugs': set(), 'urls': set()}

def filtrar_documentos_duplicados(documentos, indexed_info):
    """
    Filtra documentos para evitar duplicação no Algolia.
    
    Args:
        documentos: Lista de documentos preparados para indexação
        indexed_info: Informações sobre documentos já indexados
    
    Returns:
        list: Lista de documentos filtrados (sem duplicações)
    """
    documentos_para_indexar = []
    documentos_ignorados = 0
    
    for doc in documentos:
        # Verificar duplicação por ID
        if doc.get('objectID') in indexed_info['ids']:
            documentos_ignorados += 1
            continue
        
        # Verificar duplicação por slug
        if doc.get('slug') and doc['slug'] in indexed_info['slugs']:
            print(f"  Ignorando documento '{doc.get('title')}' com slug duplicado: {doc['slug']}")
            documentos_ignorados += 1
            continue
        
        # Verificar duplicação por URL de origem
        original_source = doc.get('originalSource', {})
        if isinstance(original_source, dict) and 'url' in original_source and original_source['url']:
            if original_source['url'] in indexed_info['urls']:
                print(f"  Ignorando documento '{doc.get('title')}' com URL duplicada: {original_source['url']}")
                documentos_ignorados += 1
                continue
        
        # Se chegou aqui, não é duplicado
        documentos_para_indexar.append(doc)
    
    print(f"Documentos disponíveis para indexação: {len(documentos_para_indexar)}")
    print(f"Documentos ignorados por duplicação: {documentos_ignorados}")
    
    return documentos_para_indexar

def indexar_no_algolia(documentos):
    """
    Indexa documentos no Algolia usando o método save_objects.
    
    Args:
        documentos: Lista de documentos para indexar
    
    Returns:
        bool: True se a indexação foi bem-sucedida
    """
    if not documentos:
        print("Nenhum documento para indexar")
        return True
    
    try:
        print(f"Indexando {len(documentos)} documentos no Algolia...")
        
        # URL da API do Algolia para batch operations - conforme documentação:
        # https://www.algolia.com/doc/api-reference/api-methods/save-objects/
        url = f"https://{ALGOLIA_APP_ID}.algolia.net/1/indexes/{ALGOLIA_INDEX_NAME}/batch"
        
        # Headers necessários
        headers = {
            "X-Algolia-API-Key": ALGOLIA_ADMIN_API_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "Content-Type": "application/json"
        }
        
        # Verificar se todos os documentos possuem objectID (necessário para save_objects)
        for doc in documentos:
            if "objectID" not in doc:
                print(f"Aviso: Documento sem objectID: {doc.get('title', 'Sem título')}")
                doc["objectID"] = doc.get("_id", f"strapi_{hash(str(doc))}")
        
        # Preparar payload conforme documentação do batch
        payload = {
            "requests": [
                {
                    "action": "updateObject",
                    "body": doc
                }
                for doc in documentos
            ]
        }
        
        print(f"Enviando requisição para Algolia ({len(documentos)} documentos)...")
        response = requests.post(url, headers=headers, json=payload)
        
        # Verificar se houve erro HTTP
        response.raise_for_status()
        
        # Verificar resposta
        result = response.json()
        
        # Verificar se foi bem-sucedido (checkando campos na resposta)
        if "objectIDs" in result:
            print(f"✓ Indexação concluída com sucesso: {len(result['objectIDs'])} documentos indexados")
            
            # Verificar se algum documento não foi indexado
            if len(result['objectIDs']) != len(documentos):
                print(f"⚠️ Aviso: Nem todos os documentos foram indexados ({len(result['objectIDs'])} de {len(documentos)})")
            
            # Mostrar taxCount se disponível
            if "taskID" in result:
                print(f"ID da tarefa Algolia: {result['taskID']}")
            
            return True
        else:
            print(f"⚠️ Resposta inesperada do Algolia: {result}")
            return False
    
    except requests.exceptions.HTTPError as e:
        print(f"✗ Erro HTTP ao indexar no Algolia: {e}", file=sys.stderr)
        if e.response is not None:
            print(f"Resposta de erro: {e.response.text}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"✗ Erro ao indexar no Algolia: {str(e)}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Importa documentos do Strapi CMS para o Algolia.")
    parser.add_argument("tipo_documento", nargs="?", default="post", help="Tipo de documento no Strapi (padrão: post)")
    parser.add_argument("--force", action="store_true", help="Forçar reindexação de todos os documentos, mesmo os já existentes")
    args = parser.parse_args()
    
    print(f"=== Sincronização Strapi → Algolia ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===")
    
    # Obter documentos do Strapi
    documentos = obter_documentos_do_strapi(args.tipo_documento)
    
    if not documentos:
        print("Nenhum documento obtido do Strapi. Encerrando.")
        sys.exit(0)
    
    # Se não forçar reindexação, filtrar duplicados
    if not args.force:
        # Obter documentos já indexados no Algolia
        indexed_info = obter_documentos_ja_indexados()
        
        # Filtrar documentos duplicados
        documentos_para_indexar = filtrar_documentos_duplicados(documentos, indexed_info)
    else:
        print("Opção --force ativada: todos os documentos serão reindexados.")
        documentos_para_indexar = documentos
    
    # Indexar documentos no Algolia
    success = indexar_no_algolia(documentos_para_indexar)
    
    if success:
        print("\n✓ Sincronização concluída com sucesso!")
    else:
        print("\n✗ Erro durante a sincronização.")
        sys.exit(1)

if __name__ == "__main__":
    main()