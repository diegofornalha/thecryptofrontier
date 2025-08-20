#!/usr/bin/env python3
"""
Exemplo de uso do serviço unificado AlgoliaSyncService
"""

# Importar o serviço
from algolia_sync_service import AlgoliaSyncService, get_service

def exemplo_uso_basico():
    """Demonstra uso básico do serviço"""
    print("=== EXEMPLO DE USO DO ALGOLIA SYNC SERVICE ===\n")
    
    # Método 1: Criar instância direta
    service = AlgoliaSyncService()
    
    # Método 2: Usar singleton (recomendado)
    service = get_service()
    
    # 1. Obter estatísticas
    print("1. Estatísticas do índice:")
    stats = service.get_stats()
    print(f"   - Documentos no Algolia: {stats.get('algolia_total', 0)}")
    print(f"   - Documentos no Sanity: {stats.get('sanity_total', 0)}\n")
    
    # 2. Sincronização incremental
    print("2. Sincronização incremental:")
    print("   stats = service.sync_from_sanity(full_sync=False)")
    print("   # Sincroniza apenas documentos novos\n")
    
    # 3. Sincronização completa
    print("3. Sincronização completa:")
    print("   stats = service.sync_from_sanity(full_sync=True)")
    print("   # Reindexará todos os documentos\n")
    
    # 4. Atualizar documento específico
    print("4. Atualizar documento específico:")
    print("   success = service.update_record('post_id_123')")
    print("   # Busca no Sanity e atualiza no Algolia\n")
    
    # 5. Remover documento
    print("5. Remover documento:")
    print("   success = service.delete_record('post_id_123')")
    print("   # Remove do índice Algolia\n")
    
    # 6. Importar múltiplos posts
    print("6. Importar posts em lote:")
    print("""   posts = [
       {'_id': '1', 'title': 'Post 1', 'slug': {'current': 'post-1'}},
       {'_id': '2', 'title': 'Post 2', 'slug': {'current': 'post-2'}}
   ]
   stats = service.bulk_import(posts)""")
    print("   # Importa múltiplos posts de uma vez\n")
    
    # 7. Encontrar e remover duplicados
    print("7. Gerenciar duplicados:")
    print("   # Análise (dry run)")
    print("   stats = service.find_and_remove_duplicates(dry_run=True)")
    print("   # Remoção efetiva")
    print("   stats = service.find_and_remove_duplicates(dry_run=False)\n")
    
    # 8. Buscar documentos do Sanity
    print("8. Buscar documentos do Sanity:")
    print("   docs = service.get_sanity_documents('post')")
    print("   # Retorna lista de posts do Sanity\n")
    
    # 9. Transformar documento
    print("9. Transformar formato Sanity → Algolia:")
    print("""   sanity_post = {
       '_id': 'abc123',
       'title': 'Meu Post',
       'slug': {'current': 'meu-post'},
       'publishedAt': '2024-01-15T10:00:00Z'
   }
   algolia_doc = service.transform_post_to_algolia(sanity_post)""")
    print("   # Converte para formato Algolia com timestamp\n")

def exemplo_uso_ferramentas_crewai():
    """Demonstra uso das ferramentas @tool para CrewAI"""
    print("\n=== USO COM CREWAI TOOLS ===\n")
    
    print("As seguintes ferramentas @tool estão disponíveis:\n")
    
    tools = [
        ("sync_sanity_to_algolia", "Sincroniza Sanity → Algolia", "sync_sanity_to_algolia(full_sync=False)"),
        ("index_to_algolia", "Indexa documento JSON", 'index_to_algolia(\'{"objectID": "123", "title": "Teste"}\')'),
        ("search_algolia", "Pesquisa no índice", 'search_algolia("bitcoin", filters="categories:crypto")'),
        ("delete_from_algolia", "Remove documento", 'delete_from_algolia("post_123")'),
        ("find_algolia_duplicates", "Analisa duplicados", "find_algolia_duplicates(dry_run=True)"),
        ("update_algolia_document", "Atualiza documento", 'update_algolia_document("post_123")'),
        ("get_algolia_stats", "Obtém estatísticas", "get_algolia_stats()")
    ]
    
    for name, desc, example in tools:
        print(f"📌 {name}")
        print(f"   Descrição: {desc}")
        print(f"   Exemplo: {example}\n")

def exemplo_migracao():
    """Mostra como migrar dos scripts antigos"""
    print("\n=== GUIA DE MIGRAÇÃO ===\n")
    
    print("ANTES (múltiplos arquivos):")
    print("```python")
    print("# sync_sanity_to_algolia.py")
    print("from algoliasearch.search_client import SearchClient")
    print("client = SearchClient.create(app_id, api_key)")
    print("# ... código de sincronização ...")
    print("")
    print("# delete_algolia_duplicates.py") 
    print("# ... código separado para duplicados ...")
    print("```\n")
    
    print("DEPOIS (serviço unificado):")
    print("```python")
    print("from algolia_sync_service import get_service")
    print("")
    print("service = get_service()")
    print("# Sincronização")
    print("stats = service.sync_from_sanity()")
    print("# Duplicados")
    print("stats = service.find_and_remove_duplicates()")
    print("```\n")
    
    print("✅ Vantagens da migração:")
    print("- Código mais limpo e organizado")
    print("- Reutilização de configurações e cliente")
    print("- Métodos consistentes e documentados")
    print("- Melhor tratamento de erros")
    print("- Facilita testes e manutenção")

if __name__ == "__main__":
    exemplo_uso_basico()
    exemplo_uso_ferramentas_crewai()
    exemplo_migracao()