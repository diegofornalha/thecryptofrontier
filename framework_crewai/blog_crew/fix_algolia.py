#!/usr/bin/env python3
"""
Script para corrigir o problema de importação do Algolia nos arquivos de sincronização.
"""

import os
import fileinput
import sys
import re

def fix_imports(filename):
    """
    Corrige as importações do Algolia em um arquivo específico.
    """
    print(f"Processando arquivo: {filename}")
    
    with fileinput.FileInput(filename, inplace=True, backup='.bak') as file:
        for line in file:
            # Corrigir importação do SearchClient
            if "from algoliasearch.search_client import SearchClient" in line:
                print("from algoliasearch.search import Client as SearchClient  # Corrigido para versão 2.5.0", end='\n')
            elif "from algoliasearch import search_client" in line:
                print("from algoliasearch.search import Client  # Corrigido para versão 2.5.0", end='\n')
            # Corrigir inicialização do cliente
            elif re.search(r"client\s*=\s*search_client\.SearchClient\.create", line):
                print(line.replace("search_client.SearchClient.create", "Client"), end='')
            elif re.search(r"client\s*=\s*SearchClient\.create", line):
                print(line.replace("SearchClient.create", "SearchClient"), end='')
            # Manter outras linhas como estão
            else:
                print(line, end='')
    
    print(f"Arquivo {filename} corrigido com sucesso!")
    
def main():
    # Lista de arquivos que precisam ser corrigidos
    files_to_fix = [
        "sync_sanity_to_algolia.py",
        "index_to_algolia.py",
        "tools/algolia_tools.py",
        "tools/sync_algolia_tool.py"
    ]
    
    # Verificar se cada arquivo existe e corrigir
    for file in files_to_fix:
        if os.path.exists(file):
            fix_imports(file)
        else:
            print(f"Arquivo {file} não encontrado, pulando.")
    
    print("\nTodos os arquivos foram processados!")
    print("IMPORTANTE: Para que as correções tenham efeito, certifique-se de instalar a versão correta:")
    print("pip install \"algoliasearch==2.5.0\"")

if __name__ == "__main__":
    main()