#!/usr/bin/env python3
"""
Exemplos de uso do serviço unificado AlgoliaSyncService
(Versão sem dependências para demonstração)
"""

def mostrar_exemplos():
    print("""
╔═══════════════════════════════════════════════════════════════╗
║        EXEMPLOS DE USO - ALGOLIA SYNC SERVICE                 ║
╚═══════════════════════════════════════════════════════════════╝

🚀 INICIALIZAÇÃO DO SERVIÇO:

```python
from algolia_sync_service import AlgoliaSyncService, get_service

# Método 1: Instância direta
service = AlgoliaSyncService()

# Método 2: Singleton (recomendado)
service = get_service()
```

📊 1. OBTER ESTATÍSTICAS:

```python
stats = service.get_stats()
print(f"Documentos no Algolia: {stats['algolia_total']}")
print(f"Documentos no Sanity: {stats['sanity_total']}")
```

🔄 2. SINCRONIZAÇÃO INCREMENTAL:

```python
# Sincroniza apenas documentos novos
stats = service.sync_from_sanity(full_sync=False)

print(f"Novos indexados: {stats['indexed']}")
print(f"Duplicados evitados: {stats['duplicates_prevented']}")
```

♻️ 3. SINCRONIZAÇÃO COMPLETA:

```python
# Reindexará todos os documentos
stats = service.sync_from_sanity(full_sync=True)
```

📝 4. ATUALIZAR DOCUMENTO ESPECÍFICO:

```python
# Busca no Sanity e atualiza no Algolia
success = service.update_record('post_abc123')
if success:
    print("Documento atualizado com sucesso!")
```

🗑️ 5. REMOVER DOCUMENTO:

```python
# Remove do índice Algolia
success = service.delete_record('post_abc123')
```

📦 6. IMPORTAR POSTS EM LOTE:

```python
posts = [
    {
        '_id': 'post_1',
        'title': 'Como usar Bitcoin',
        'slug': {'current': 'como-usar-bitcoin'},
        'publishedAt': '2024-01-15T10:00:00Z',
        'excerpt': 'Guia completo sobre Bitcoin'
    },
    {
        '_id': 'post_2',
        'title': 'Ethereum Explicado',
        'slug': {'current': 'ethereum-explicado'},
        'publishedAt': '2024-01-16T10:00:00Z',
        'excerpt': 'Entenda o Ethereum'
    }
]

stats = service.bulk_import(posts)
print(f"Importados: {stats['success']}, Erros: {stats['errors']}")
```

🔍 7. GERENCIAR DUPLICADOS:

```python
# Análise (dry run)
stats = service.find_and_remove_duplicates(dry_run=True)
print(f"Duplicados encontrados: {stats['duplicates_by_title']}")
print(f"Documentos órfãos: {stats['orphaned_documents']}")

# Remoção efetiva
stats = service.find_and_remove_duplicates(dry_run=False)
print(f"Removidos: {stats['removed']}")
```

📚 8. BUSCAR DOCUMENTOS DO SANITY:

```python
# Buscar todos os posts
docs = service.get_sanity_documents('post')

# Buscar com campos específicos
fields = '{ _id, title, slug { current }, publishedAt }'
docs = service.get_sanity_documents('post', fields=fields)
```

🔄 9. TRANSFORMAR DOCUMENTO:

```python
sanity_post = {
    '_id': 'abc123',
    'title': 'Meu Post sobre Crypto',
    'slug': {'current': 'meu-post-crypto'},
    'publishedAt': '2024-01-15T10:00:00Z',
    'excerpt': 'Introdução ao mundo crypto',
    'author': 'João Silva',
    'categories': ['Cryptocurrency', 'Technology'],
    'tags': ['bitcoin', 'blockchain']
}

# Converte para formato Algolia
algolia_doc = service.transform_post_to_algolia(sanity_post)

# Resultado:
# {
#     'objectID': 'abc123',
#     'title': 'Meu Post sobre Crypto',
#     'slug': 'meu-post-crypto',
#     'publishedAt': '2024-01-15T10:00:00Z',
#     'publishedAtTimestamp': 1705318800,
#     'excerpt': 'Introdução ao mundo crypto',
#     'author': 'João Silva',
#     'categories': ['Cryptocurrency', 'Technology'],
#     'tags': ['bitcoin', 'blockchain'],
#     'estimatedReadingTime': 0
# }
```

═══════════════════════════════════════════════════════════════

🛠️ FERRAMENTAS CREWAI (@tool):

1️⃣ sync_sanity_to_algolia
   ```python
   result = sync_sanity_to_algolia(full_sync=False)
   ```

2️⃣ index_to_algolia
   ```python
   json_content = '{"objectID": "123", "title": "Bitcoin 101"}'
   result = index_to_algolia(json_content)
   ```

3️⃣ search_algolia
   ```python
   results = search_algolia("bitcoin", filters="categories:crypto")
   ```

4️⃣ delete_from_algolia
   ```python
   result = delete_from_algolia("post_123")
   ```

5️⃣ find_algolia_duplicates
   ```python
   result = find_algolia_duplicates(dry_run=True)
   ```

6️⃣ update_algolia_document
   ```python
   result = update_algolia_document("post_123")
   ```

7️⃣ get_algolia_stats
   ```python
   stats = get_algolia_stats()
   ```

═══════════════════════════════════════════════════════════════

📋 CASOS DE USO COMUNS:

1. PIPELINE DE PUBLICAÇÃO:
```python
# 1. Publicar novo post no Sanity
# 2. Sincronizar com Algolia
stats = service.sync_from_sanity()

# 3. Verificar duplicados
duplicates = service.find_and_remove_duplicates(dry_run=True)
if duplicates['duplicates_by_title'] > 0:
    service.find_and_remove_duplicates(dry_run=False)
```

2. MANUTENÇÃO PERIÓDICA:
```python
# Script para rodar diariamente
def daily_maintenance():
    service = get_service()
    
    # 1. Sincronizar novos posts
    sync_stats = service.sync_from_sanity()
    
    # 2. Limpar duplicados
    dup_stats = service.find_and_remove_duplicates()
    
    # 3. Gerar relatório
    final_stats = service.get_stats()
    
    print(f"Sincronizados: {sync_stats['indexed']}")
    print(f"Duplicados removidos: {dup_stats['removed']}")
    print(f"Total no índice: {final_stats['algolia_total']}")
```

3. ATUALIZAÇÃO EM MASSA:
```python
# Atualizar todos os posts de uma categoria
def update_category_posts(category):
    service = get_service()
    
    # Buscar posts da categoria
    query = f'*[_type == "post" && "{category}" in categories[]->title]'
    posts = service.get_sanity_documents('post', fields=query)
    
    # Atualizar cada post
    for post in posts:
        service.update_record(post['_id'])
```

═══════════════════════════════════════════════════════════════
""")

if __name__ == "__main__":
    mostrar_exemplos()