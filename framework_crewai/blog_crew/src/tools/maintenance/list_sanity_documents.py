#!/usr/bin/env python3
"""
Script para listar todos os documentos de um tipo específico no Sanity CMS.
Uso: python list_sanity_documents.py [tipo_documento] [--json]
Ex.: python list_sanity_documents.py post
     python list_sanity_documents.py post --json
"""

import os
import sys
import json
import requests
from urllib.parse import quote

# Configurações do Sanity
PROJECT_ID = "uvuq2a47"
DATASET = "production"
API_VERSION = "2023-05-03"

def main():
    # Verificar argumentos
    if len(sys.argv) < 2:
        print("Erro: Nenhum tipo de documento especificado")
        print("Uso: python list_sanity_documents.py [tipo_documento] [--json|--algolia]")
        print("Ex.: python list_sanity_documents.py post")
        print("     python list_sanity_documents.py post --json")
        print("     python list_sanity_documents.py post --algolia")
        sys.exit(1)
    
    # Obter o tipo de documento
    document_type = sys.argv[1]
    
    # Verificar se é para saída em JSON ou formato para Algolia
    output_json = "--json" in sys.argv
    output_algolia = "--algolia" in sys.argv
    
    # Obter o token do Sanity
    SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
    if not SANITY_API_TOKEN:
        print("Erro: SANITY_API_TOKEN não está definido", file=sys.stderr)
        print("Defina a variável de ambiente SANITY_API_TOKEN", file=sys.stderr)
        sys.exit(1)
    
    # Construir a query GROQ - expandir para obter mais campos quando for JSON ou Algolia
    if output_json:
        query = f'*[_type == "{document_type}"]'
    elif output_algolia:
        # Query otimizada para campos relevantes para Algolia
        query = f'''*[_type == "{document_type}"]{{
            _id,
            title,
            slug,
            publishedAt,
            excerpt,
            "author": author->name,
            "categories": categories[]->title,
            "tags": tags[]->title,
            "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180),
            "mainImage": mainImage.asset->url,
            "originalSource": originalSource{{url, title, site}}
        }}'''
    else:
        query = f'*[_type == "{document_type}"]{{ _id, title }}'
    
    encoded_query = quote(query)
    
    # URL da API do Sanity
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query={encoded_query}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    try:
        # Fazer a requisição
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extrair os resultados
        result = response.json().get("result", [])
        
        # Verificar se há documentos
        if not result:
            if output_json or output_algolia:
                print(json.dumps([]))
            else:
                print(f"Nenhum documento do tipo '{document_type}' encontrado.")
            sys.exit(0)
        
        # Saída em diferentes formatos
        if output_json:
            print(json.dumps(result, indent=2))
        elif output_algolia:
            # Preparar documentos para Algolia
            algolia_docs = []
            for doc in result:
                algolia_doc = {
                    "objectID": doc.get("_id"),
                    "title": doc.get("title", "Sem título"),
                    "slug": doc.get("slug", {}).get("current") if isinstance(doc.get("slug"), dict) else doc.get("slug", ""),
                    "publishedAt": doc.get("publishedAt", ""),
                    "excerpt": doc.get("excerpt", ""),
                    "author": doc.get("author", ""),
                    "categories": doc.get("categories", []),
                    "tags": doc.get("tags", []),
                    "estimatedReadingTime": doc.get("estimatedReadingTime", 5),
                    "mainImage": doc.get("mainImage", ""),
                    "originalSource": doc.get("originalSource", {})
                }
                # Adicionar timestamp para facilitar ordenação
                if "publishedAt" in doc and isinstance(doc["publishedAt"], str):
                    try:
                        from datetime import datetime
                        dt = datetime.fromisoformat(doc["publishedAt"].replace("Z", "+00:00"))
                        algolia_doc["publishedAtTimestamp"] = int(dt.timestamp())
                    except Exception:
                        pass
                
                algolia_docs.append(algolia_doc)
            
            print(json.dumps(algolia_docs, indent=2))
        else:
            # Mostrar os documentos
            print(f"Documentos do tipo '{document_type}':")
            for doc in result:
                doc_id = doc.get("_id", "Sem ID")
                doc_title = doc.get("title", "Título Não Encontrado")
                print(f"ID: {doc_id} - Título: {doc_title}")
        
        # Retornar implicitamente os IDs para o script bash
        return 0
    
    except Exception as e:
        error_msg = f"Erro ao listar documentos: {str(e)}"
        if output_json or output_algolia:
            print(json.dumps({"error": error_msg}))
        else:
            print(error_msg, file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()