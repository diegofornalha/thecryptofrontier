import config
import requests
import json
from datetime import datetime

# URL base da API Sanity
BASE_URL = f"https://{config.SANITY_PROJECT_ID}.api.sanity.io/v{config.SANITY_API_VERSION}"

# Headers para autenticação
HEADERS = {
    'Authorization': f'Bearer {config.SANITY_API_TOKEN}',
    'Content-Type': 'application/json'
}

def buscar_posts(texto=None, data=None, padrao_id=None, limite=50):
    """
    Busca posts no Sanity por critérios diversos.
    
    Args:
        texto: String para buscar no título ou conteúdo dos posts
        data: String no formato "YYYY-MM" para filtrar por mês/ano
        padrao_id: String para buscar no ID do post
        limite: Número máximo de resultados
    """
    query_conditions = []
    
    if texto:
        # Adicionar filtro por título ou conteúdo
        query_conditions.append(f'(title match "*{texto}*" || excerpt match "*{texto}*")')
    
    if data:
        # Adicionar filtro por data de publicação (mês/ano)
        query_conditions.append(f'publishedAt match "{data}*"')
    
    if padrao_id:
        # Adicionar filtro por padrão no ID
        query_conditions.append(f'_id match "*{padrao_id}*"')
    
    # Construir a query GROQ
    conditions = " && ".join(query_conditions) if query_conditions else ""
    query = f"""*[_type == "post"{f" && {conditions}" if conditions else ""}] | order(publishedAt desc)[0...{limite}] {{
        _id,
        title,
        slug,
        publishedAt,
        categories
    }}"""
    
    print(f"Executando query: {query}")
    
    url = f"{BASE_URL}/data/query/{config.SANITY_DATASET}?query={requests.utils.quote(query)}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        posts = response.json().get('result', [])
        print(f"\nEncontrados {len(posts)} posts:")
        
        for i, post in enumerate(posts, 1):
            post_id = post.get('_id', 'Sem ID')
            title = post.get('title', 'Sem título')
            published_at = post.get('publishedAt', 'Sem data')
            published_at = published_at[:10] if published_at else 'Sem data'  # Extrair só a data
            
            print(f"{i}. ID: {post_id}")
            print(f"   Título: {title}")
            print(f"   Data: {published_at}")
            print(f"   Categorias: {post.get('categories', [])}")
            print()
            
        return posts
    else:
        print(f"Erro ao buscar posts: {response.status_code} - {response.text}")
        return []

if __name__ == "__main__":
    print("=== Busca de Posts no Sanity ===\n")
    
    # Buscar todos os posts
    buscar_posts()
    
    # Outros exemplos:
    # Por título ou conteúdo
    # buscar_posts(texto="Bitcoin")
    
    # Por data (mês/ano)
    # buscar_posts(data="2024-06")
    
    # Por padrão no ID
    # buscar_posts(padrao_id="cripto") 