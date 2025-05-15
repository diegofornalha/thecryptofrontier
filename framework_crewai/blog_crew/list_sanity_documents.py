#!/usr/bin/env python3
"""
Script para listar todos os documentos de um tipo específico no Sanity CMS.
Uso: python list_sanity_documents.py [tipo_documento]
Ex.: python list_sanity_documents.py post
"""

import os
import sys
import json
import requests
from urllib.parse import quote

# Configurações do Sanity
PROJECT_ID = "brby2yrg"
DATASET = "production"
API_VERSION = "2023-05-03"

def main():
    # Verificar argumentos
    if len(sys.argv) < 2:
        print("Erro: Nenhum tipo de documento especificado")
        print("Uso: python list_sanity_documents.py [tipo_documento]")
        print("Ex.: python list_sanity_documents.py post")
        sys.exit(1)
    
    # Obter o tipo de documento
    document_type = sys.argv[1]
    
    # Obter o token do Sanity
    sanity_token = os.environ.get("SANITY_API_TOKEN")
    if not sanity_token:
        print("Erro: SANITY_API_TOKEN não está definido")
        print("Defina a variável de ambiente SANITY_API_TOKEN")
        sys.exit(1)
    
    # Construir a query GROQ
    query = f'*[_type == "{document_type}"]{{ _id, title }}'
    encoded_query = quote(query)
    
    # URL da API do Sanity
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query={encoded_query}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {sanity_token}"
    }
    
    try:
        # Fazer a requisição
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extrair os resultados
        result = response.json().get("result", [])
        
        # Verificar se há documentos
        if not result:
            print(f"Nenhum documento do tipo '{document_type}' encontrado.")
            sys.exit(0)
        
        # Mostrar os documentos
        print(f"Documentos do tipo '{document_type}':")
        for doc in result:
            doc_id = doc.get("_id", "Sem ID")
            doc_title = doc.get("title", "Sem título")
            print(f"ID: {doc_id} - Título: {doc_title}")
        
        # Retornar implicitamente os IDs para o script bash
        return 0
    
    except Exception as e:
        print(f"Erro ao listar documentos: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()