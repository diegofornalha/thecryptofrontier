import requests
import config

# URL base da API Sanity (com o prefixo "v" corrigido)
BASE_URL = f"https://{config.SANITY_PROJECT_ID}.api.sanity.io/v{config.SANITY_API_VERSION}"

# Headers para autenticação
HEADERS = {
    'Authorization': f'Bearer {config.SANITY_API_TOKEN}',
    'Content-Type': 'application/json'
}

def listar_posts():
    """Lista todos os posts no Sanity CMS."""
    url = f"{BASE_URL}/data/query/{config.SANITY_DATASET}?query=*[_type == 'post']{{_id, title, slug}}"
    
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        posts = response.json().get('result', [])
        print(f"Encontrados {len(posts)} posts:")
        
        for i, post in enumerate(posts, 1):
            print(f"{i}. ID: {post.get('_id')} - Título: {post.get('title')}")
        
        return posts
    else:
        print(f"Erro ao listar posts: {response.status_code} - {response.text}")
        return []

def remover_post(post_id):
    """Remove um post específico do Sanity CMS pelo ID."""
    url = f"{BASE_URL}/data/mutate/{config.SANITY_DATASET}"
    
    data = {
        "mutations": [
            {
                "delete": {
                    "id": post_id
                }
            }
        ]
    }
    
    response = requests.post(url, headers=HEADERS, json=data)
    
    if response.status_code in (200, 201):
        print(f"Post {post_id} removido com sucesso!")
        return True
    else:
        print(f"Erro ao remover post {post_id}: {response.status_code} - {response.text}")
        return False

def remover_posts_com_titulo(titulo_parcial):
    """Remove todos os posts que contêm o título especificado."""
    posts = listar_posts()
    
    posts_para_remover = []
    for post in posts:
        if titulo_parcial.lower() in post.get('title', '').lower():
            posts_para_remover.append(post)
    
    print(f"\nEncontrados {len(posts_para_remover)} posts com o título contendo '{titulo_parcial}':")
    
    for i, post in enumerate(posts_para_remover, 1):
        print(f"{i}. ID: {post.get('_id')} - Título: {post.get('title')}")
    
    if posts_para_remover:
        confirmar = input("\nDeseja remover estes posts? (s/n): ")
        
        if confirmar.lower() == 's':
            for post in posts_para_remover:
                remover_post(post.get('_id'))
            print(f"Remoção concluída! {len(posts_para_remover)} posts removidos.")
        else:
            print("Operação cancelada pelo usuário.")
    else:
        print(f"Nenhum post encontrado com o título contendo '{titulo_parcial}'.")

if __name__ == "__main__":
    print("=== Script para Remover Posts Duplicados do Sanity CMS ===\n")
    
    # Remover os posts duplicados sobre "B3 do Brasil"
    remover_posts_com_titulo("B3 do Brasil") 