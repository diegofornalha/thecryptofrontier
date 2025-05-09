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

if __name__ == "__main__":
    print("=== Exclusão de Posts Restantes no Sanity ===\n")
    
    # IDs dos posts "excluir 2" e "excluir01" e suas versões draft
    posts_para_excluir = [
        "post-20250509221252-76411069",  # excluir 2
        "drafts.post-20250509221252-76411069",  # draft de excluir 2
        "post-20250509221014-3e90401b",  # excluir01
        "drafts.post-20250509221014-3e90401b",  # draft de excluir01
    ]
    
    print("Excluindo posts mostrados na imagem...")
    excluir_posts(posts_para_excluir) 