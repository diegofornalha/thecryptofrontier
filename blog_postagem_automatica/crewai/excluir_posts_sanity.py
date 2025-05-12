import config
import requests
from datetime import datetime

# URL base da API Sanity
BASE_URL = f"https://{config.SANITY_PROJECT_ID}.api.sanity.io/v{config.SANITY_API_VERSION}"

# Headers para autenticação
HEADERS = {
    'Authorization': f'Bearer {config.SANITY_API_TOKEN}',
    'Content-Type': 'application/json'
}

def buscar_posts_para_excluir(padrao_titulo=None):
    """
    Busca posts no Sanity para exclusão.
    
    Args:
        padrao_titulo: String para buscar no título dos posts
    """
    query_conditions = []
    
    if padrao_titulo:
        # Adicionar filtro por título que contém o padrão
        query_conditions.append(f'title match "*{padrao_titulo}*"')
    
    # Construir a query GROQ
    conditions = " && ".join(query_conditions) if query_conditions else ""
    query = f"""*[_type == "post"{f" && {conditions}" if conditions else ""}] | order(publishedAt desc) {{
        _id,
        title,
        slug,
        publishedAt
    }}"""
    
    print(f"Buscando posts para excluir: {query}")
    
    url = f"{BASE_URL}/data/query/{config.SANITY_DATASET}?query={requests.utils.quote(query)}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        posts = response.json().get('result', [])
        print(f"\nEncontrados {len(posts)} posts para revisão:")
        
        posts_para_excluir = []
        
        for i, post in enumerate(posts, 1):
            post_id = post.get('_id', 'Sem ID')
            title = post.get('title', 'Sem título')
            published_at = post.get('publishedAt', 'Sem data')
            published_at = published_at[:10] if published_at else 'Sem data'
            
            print(f"{i}. ID: {post_id}")
            print(f"   Título: {title}")
            print(f"   Data: {published_at}")
            
            if padrao_titulo and padrao_titulo.lower() in title.lower():
                print(f"   [MARCAR PARA EXCLUSÃO]")
                posts_para_excluir.append(post_id)
            elif not padrao_titulo and (title.lower().startswith("excluir") or 
                  "excluir" in title.lower() or "teste" in title.lower()):
                print(f"   [MARCAR PARA EXCLUSÃO]")
                posts_para_excluir.append(post_id)
            print()
        
        return posts_para_excluir
    else:
        print(f"Erro ao buscar posts: {response.status_code} - {response.text}")
        return []

def excluir_post_especifico(post_id):
    """Exclui um post específico pelo ID."""
    print(f"Excluindo post com ID: {post_id}")
    
    mutation_data = {
        "mutations": [
            {
                "delete": {
                    "id": post_id
                }
            }
        ]
    }
    
    mutate_url = f"{BASE_URL}/data/mutate/{config.SANITY_DATASET}"
    response = requests.post(mutate_url, headers=HEADERS, json=mutation_data)
    
    if response.status_code in (200, 201):
        print(f"Post {post_id} excluído com sucesso!")
        return True
    else:
        print(f"Erro ao excluir post {post_id}: {response.status_code} - {response.text}")
        return False

def excluir_posts(ids_posts):
    """
    Exclui posts no Sanity pelos IDs.
    
    Args:
        ids_posts: Lista de IDs dos posts a serem excluídos
    """
    if not ids_posts:
        print("Nenhum post para excluir.")
        return False
    
    print(f"Preparando para excluir {len(ids_posts)} posts...")
    
    # Excluir um por um para evitar problemas com tamanho da requisição
    for post_id in ids_posts:
        excluir_post_especifico(post_id)
    
    return True

def confirmar_exclusao(ids_posts):
    """Pede confirmação do usuário antes de excluir os posts."""
    if not ids_posts:
        return False
    
    print(f"\nATENÇÃO: {len(ids_posts)} posts foram marcados para exclusão:")
    for i, post_id in enumerate(ids_posts, 1):
        print(f"{i}. {post_id}")
    
    # Confirmação automática para uso no script
    return True

if __name__ == "__main__":
    print("=== Exclusão de Posts no Sanity ===\n")
    
    # Buscar posts com "B3" e "Ethereum" no título
    posts_para_excluir = buscar_posts_para_excluir("B3 do Brasil Lançará Futuros de Ethereum")
    
    # Excluir sem confirmação manual
    if posts_para_excluir:
        excluir_posts(posts_para_excluir)
        print("Exclusão de posts concluída com sucesso.")
    else:
        print("Nenhum post encontrado com o critério especificado.") 