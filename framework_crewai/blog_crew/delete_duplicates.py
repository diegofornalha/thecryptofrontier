#!/usr/bin/env python3
"""
Script para remover artigos duplicados ou de propaganda do Sanity CMS.
"""

import os
import sys
import requests
import json

# Lista de IDs duplicados a remover
DUPLICATE_IDS = [
    "EC84shJEENJ2Ei1xHNxs9P",
    "EC84shJEENJ2Ei1xHNxgs4",
    "bINVl60rCuopV1vTnzj2Ve",
    "xxjpUrvSZKbS0VWKYwozTV"
]

# Palavras/frases para identificar artigos de propaganda
BLACKLIST_KEYWORDS = [
    "LiteFinance",
    "litefinance",
    "lite finance",
    "Partner Application"
]

# Configurações do Sanity
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

def delete_document(doc_id):
    """
    Exclui um documento do Sanity CMS pelo ID.
    
    Args:
        doc_id: ID do documento a ser excluído
        
    Returns:
        bool: True se a exclusão foi bem-sucedida, False caso contrário
    """
    # Obter token do Sanity
    sanity_token = os.environ.get("SANITY_API_TOKEN")
    if not sanity_token:
        print(f"Erro: SANITY_API_TOKEN não está definido", file=sys.stderr)
        return False
    
    # URL da API do Sanity para mutações
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"
    
    # Headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {sanity_token}"
    }
    
    # Mutação para excluir o documento
    mutation = {
        "mutations": [
            {
                "delete": {
                    "id": doc_id
                }
            }
        ]
    }
    
    try:
        # Fazer a requisição
        response = requests.post(url, headers=headers, json=mutation)
        response.raise_for_status()
        
        # Verificar resposta
        result = response.json()
        if result.get("results") and len(result["results"]) > 0:
            print(f"✓ Documento {doc_id} excluído com sucesso!")
            return True
        else:
            print(f"⚠️ Falha ao excluir documento {doc_id}: {result}")
            return False
    
    except Exception as e:
        print(f"❌ Erro ao excluir documento {doc_id}: {str(e)}", file=sys.stderr)
        return False

def get_propaganda_documents():
    """
    Busca documentos que parecem ser de propaganda no Sanity.
    
    Returns:
        list: Lista de IDs de documentos identificados como propaganda
    """
    # Obter token do Sanity
    sanity_token = os.environ.get("SANITY_API_TOKEN")
    if not sanity_token:
        print(f"Erro: SANITY_API_TOKEN não está definido", file=sys.stderr)
        return []
    
    # Lista para armazenar IDs de documentos de propaganda
    propaganda_ids = []
    
    for keyword in BLACKLIST_KEYWORDS:
        # Construir a query GROQ para buscar documentos com a palavra-chave no título
        query = f'*[_type == "post" && title match "{keyword}"]._id'
        encoded_query = requests.utils.quote(query)
        
        # URL da API do Sanity
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}?query={encoded_query}"
        
        # Headers
        headers = {
            "Authorization": f"Bearer {sanity_token}"
        }
        
        try:
            # Fazer a requisição
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            # Extrair os resultados
            results = response.json().get("result", [])
            
            # Adicionar os IDs à lista
            propaganda_ids.extend(results)
            
            if results:
                print(f"Encontrados {len(results)} documentos com a palavra-chave '{keyword}'")
            
        except Exception as e:
            print(f"Erro ao buscar documentos com a palavra-chave '{keyword}': {str(e)}", file=sys.stderr)
    
    # Remover duplicatas
    propaganda_ids = list(set(propaganda_ids))
    
    return propaganda_ids

def main():
    """Função principal"""
    print("=== REMOVENDO DOCUMENTOS DUPLICADOS E DE PROPAGANDA ===")
    
    # 1. Remover documentos duplicados conhecidos
    print("\n1. Removendo documentos duplicados conhecidos...")
    for doc_id in DUPLICATE_IDS:
        delete_document(doc_id)
    
    # 2. Identificar e remover documentos de propaganda
    print("\n2. Identificando documentos de propaganda...")
    propaganda_ids = get_propaganda_documents()
    
    if propaganda_ids:
        print(f"Encontrados {len(propaganda_ids)} documentos de propaganda.")
        
        # Perguntar ao usuário se quer excluir esses documentos
        print("\nLista de IDs de documentos identificados como propaganda:")
        for doc_id in propaganda_ids:
            print(f"- {doc_id}")
        
        # Não excluir automaticamente, apenas mostrar os IDs para o usuário decidir
        print("\nPara excluir qualquer documento dessa lista, use o script delete_sanity_post_by_id.sh")
        print("Exemplo: ./delete_sanity_post_by_id.sh ID_DO_DOCUMENTO")
    else:
        print("Nenhum documento de propaganda encontrado.")
    
    print("\n=== OPERAÇÃO CONCLUÍDA ===")

if __name__ == "__main__":
    main()