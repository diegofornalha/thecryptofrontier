#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para indexar conteúdo do Sanity no Algolia usando o CrewAI
"""

import os
import json
import sys
import subprocess
import tempfile
import importlib.util
from crewai import Crew, Task
from config import config as app_config
from tools import tools
from agents import IndexerAgent

# Verificar se a biblioteca algoliasearch está instalada
if not importlib.util.find_spec("algoliasearch"):
    print("ERRO: A biblioteca algoliasearch não está instalada.")
    print("Instale-a com: pip install algoliasearch")
    sys.exit(1)

# Correção do import do Algolia conforme documentação
from algoliasearch import search_index
from algoliasearch import search_client

# Configurar as credenciais do Algolia como variáveis de ambiente
os.environ["ALGOLIA_APP_ID"] = "42TZWHW8UP"
os.environ["ALGOLIA_API_KEY"] = "d0cb55ec8f07832bc5f57da0bd25c535"  # Usando ADMIN_API_KEY que tem permissões completas
os.environ["ALGOLIA_INDEX_NAME"] = "development_mcpx_content"

def get_sanity_documents():
    """Obtém a lista de documentos do Sanity e retorna como um dicionário"""
    try:
        # Chamar o script list_sanity_documents.py e capturar a saída
        result = subprocess.run(
            ["python", "list_sanity_documents.py", "post", "--json"],
            capture_output=True,
            text=True,
            check=True
        )
        
        if result.stdout:
            # Tenta carregar a saída como JSON
            try:
                return json.loads(result.stdout)
            except json.JSONDecodeError:
                print(f"Erro ao decodificar JSON de list_sanity_documents.py: {result.stdout}")
                return []
        else:
            print("Nenhum documento retornado pelo script list_sanity_documents.py")
            return []
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar list_sanity_documents.py: {str(e)}")
        return []

def check_indexed_documents():
    """Verifica quais documentos estão indexados no Algolia baseado no sanityId"""
    try:
        # Verificar se as credenciais existem
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            print("Credenciais do Algolia não configuradas.")
            return []
        
        # Conectar ao Algolia usando a API correta
        client = search_client.SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        # Buscar todos os objetos indexados
        results = index.browse_objects({'query': '', 'attributesToRetrieve': ['objectID', 'sanityId']})
        
        # Retornar a lista de IDs do Sanity que já estão indexados
        indexed_ids = []
        for hit in results:
            if 'sanityId' in hit:
                indexed_ids.append(hit['sanityId'])
            
        return indexed_ids
    
    except Exception as e:
        print(f"Erro ao verificar documentos indexados no Algolia: {str(e)}")
        return []

def check_for_duplicate_objectID(object_id):
    """Verifica se já existe um documento com o mesmo objectID no Algolia"""
    try:
        # Verificar se as credenciais existem
        app_id = os.environ.get('ALGOLIA_APP_ID')
        api_key = os.environ.get('ALGOLIA_API_KEY')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME')
        
        if not all([app_id, api_key, index_name]):
            print("Credenciais do Algolia não configuradas.")
            return False
        
        # Conectar ao Algolia
        client = search_client.SearchClient.create(app_id, api_key)
        index = client.init_index(index_name)
        
        # Verificar se existe um objeto com o mesmo objectID
        try:
            obj = index.get_object(object_id)
            if obj:
                return True
        except Exception:
            # Se ocorrer um erro ao buscar o objeto, provavelmente ele não existe
            return False
            
        return False
    
    except Exception as e:
        print(f"Erro ao verificar duplicatas no Algolia: {str(e)}")
        return False

def generate_unique_objectID(base_id, slug):
    """Gera um objectID único baseado no slug e ID do Sanity"""
    # Preferimos usar o slug como objectID por ser mais legível
    object_id = slug if slug else base_id
    
    # Verificar se já existe um documento com esse objectID
    if check_for_duplicate_objectID(object_id):
        # Se já existe, adicionamos um sufixo ao objectID
        count = 1
        while check_for_duplicate_objectID(f"{object_id}-{count}"):
            count += 1
        object_id = f"{object_id}-{count}"
    
    return object_id

def main():
    """Função principal que configura e executa o agente indexador"""
    try:
        # Verificar documentos do Sanity
        print("Buscando documentos do Sanity...")
        sanity_documents = get_sanity_documents()
        
        if not sanity_documents:
            print("Não foram encontrados documentos no Sanity.")
            return
            
        print(f"Encontrados {len(sanity_documents)} documentos no Sanity.")
        
        # Verificar documentos já indexados no Algolia
        print("Verificando documentos já indexados no Algolia...")
        indexed_ids = check_indexed_documents()
        print(f"Encontrados {len(indexed_ids)} documentos já indexados no Algolia.")
        
        # Filtrar documentos não indexados
        documents_to_index = [doc for doc in sanity_documents if doc.get("_id") not in indexed_ids]
        print(f"Total de documentos a serem indexados: {len(documents_to_index)}")
        
        if not documents_to_index:
            print("Todos os documentos já estão indexados no Algolia.")
            return
        
        # Adicionar dica sobre geração de objectID único para evitar duplicatas
        for doc in documents_to_index:
            # Verificar se temos um slug válido
            if "slug" in doc and isinstance(doc["slug"], dict) and "current" in doc["slug"]:
                slug = doc["slug"]["current"]
            else:
                slug = None
                
            # Gerar objectID único
            suggested_id = generate_unique_objectID(doc.get("_id", ""), slug)
            doc["_suggested_object_id"] = suggested_id
        
        # Salvar documentos não indexados em arquivo temporário para o agente processar
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
            json.dump(documents_to_index, temp_file)
            temp_file_path = temp_file.name
        
        print(f"Documentos a indexar salvos em arquivo temporário: {temp_file_path}")
        
        # Criar o agente indexador
        indexer = IndexerAgent.create(tools)
        
        # Criar uma tarefa para o agente
        task = Task(
            description=f"""
            Indexe no Algolia os documentos do Sanity que ainda não foram indexados.
            
            Os documentos estão no arquivo: {temp_file_path}
            
            Para cada documento:
            1. Leia o documento do arquivo
            2. Converta do formato Sanity para o formato Algolia, garantindo que tenha um objectID único
            3. Use o campo "_suggested_object_id" que foi adicionado a cada documento como o objectID para evitar duplicatas
            4. Indexe o conteúdo no Algolia usando a ferramenta index_to_algolia
            5. Registre o resultado da indexação
            
            Lembre-se que o formato esperado pelo Algolia é:
            {{
                "objectID": "ID único do artigo (use o valor em _suggested_object_id)",
                "title": "Título do artigo",
                "content": "Conteúdo textual do artigo",
                "date": "Data de publicação",
                "tags": ["tag1", "tag2"],
                "sanityId": "ID do documento no Sanity"
            }}
            
            IMPORTANTE: Use SEMPRE o valor do campo "_suggested_object_id" como objectID para evitar duplicatas!
            
            Ao final, forneça um relatório com os artigos indexados e qualquer erro encontrado.
            """,
            expected_output="Relatório detalhado dos documentos indexados no Algolia, incluindo sucessos e falhas.",
            agent=indexer
        )
        
        # Criar e executar a crew com o agente
        crew = Crew(
            agents=[indexer],
            tasks=[task],
            verbose=True
        )
        
        # Executar a crew
        result = crew.kickoff()
        
        # Mostrar o resultado
        print("\n\n----- Resultado da Indexação -----")
        print(result)
        
        # Remover arquivo temporário
        try:
            os.unlink(temp_file_path)
        except:
            pass
        
    except Exception as e:
        print(f"Erro ao executar o agente indexador: {str(e)}")
        return

if __name__ == "__main__":
    main() 