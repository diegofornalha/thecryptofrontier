import requests
import config
import json
import formatar_conteudo
import re

# URL base da API Sanity (com o prefixo "v" corrigido)
BASE_URL = f"https://{config.SANITY_PROJECT_ID}.api.sanity.io/v{config.SANITY_API_VERSION}"

# Headers para autenticação
HEADERS = {
    'Authorization': f'Bearer {config.SANITY_API_TOKEN}',
    'Content-Type': 'application/json'
}

def listar_posts():
    """Lista todos os posts no Sanity CMS."""
    # Busca posts com suas informações completas - usando aspas para os campos
    url = f"{BASE_URL}/data/query/{config.SANITY_DATASET}?query=*[_type == 'post']{{_id, title, slug, content, publishedAt, author, tags, mainImage}}"
    
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

def extrair_texto_de_blocos(blocos):
    """Extrai o texto dos blocos de conteúdo do Sanity."""
    if not blocos:
        return ""
    
    texto = ""
    for bloco in blocos:
        # Verifica se é um bloco de texto
        if bloco.get("_type") == "block":
            children = bloco.get("children", [])
            for child in children:
                if child.get("_type") == "span":
                    texto += child.get("text", "") + " "
            texto += "\n\n"
    
    return texto.strip()

def gerar_novos_blocos(texto_formatado):
    """Gera novos blocos de conteúdo com o texto formatado."""
    blocos = []
    
    # Divide o texto em parágrafos
    paragrafos = texto_formatado.split("\n\n")
    
    for paragrafo in paragrafos:
        if not paragrafo.strip():
            continue
            
        # Cria um bloco para cada parágrafo
        bloco = {
            "_type": "block",
            "_key": f"{hash(paragrafo) & 0xffffffff}",  # Gerar uma chave baseada no hash do texto
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": f"{hash(paragrafo + '1') & 0xffffffff}",
                    "text": paragrafo.strip(),
                    "marks": []
                }
            ],
            "markDefs": []
        }
        
        blocos.append(bloco)
    
    return blocos

def atualizar_post(post_id, post_corrigido, tags=None):
    """
    Atualiza um post específico no Sanity CMS.
    
    Args:
        post_id (str): ID do post a ser atualizado
        post_corrigido (list): Novos blocos de conteúdo
        tags (list, optional): Lista de tags a serem atualizadas
    """
    url = f"{BASE_URL}/data/mutate/{config.SANITY_DATASET}"
    
    # Campos a serem atualizados
    campos_atualizados = {
        "content": post_corrigido
    }
    
    # Adicionar tags se fornecidas
    if tags:
        campos_atualizados["tags"] = tags
    
    # Cria a mutação para atualizar
    data = {
        "mutations": [
            {
                "patch": {
                    "id": post_id,
                    "set": campos_atualizados
                }
            }
        ]
    }
    
    response = requests.post(url, headers=HEADERS, json=data)
    
    if response.status_code in (200, 201):
        print(f"Post {post_id} atualizado com sucesso!")
        return True
    else:
        print(f"Erro ao atualizar post {post_id}: {response.status_code} - {response.text}")
        return False

def corrigir_formatacao_post(post):
    """Corrige a formatação de um post."""
    post_id = post.get('_id')
    titulo = post.get('title', '')
    content_blocks = post.get('content', [])
    tags_atuais = post.get('tags', [])
    
    # Extrair o texto do conteúdo em blocos
    texto_conteudo = extrair_texto_de_blocos(content_blocks)
    
    # Se não houver conteúdo, pular
    if not texto_conteudo:
        print(f"Post {post_id} não possui conteúdo. Pulando.")
        return False
    
    # Verificar se o conteúdo já contém os metadados e precisa ser corrigido
    precisa_corrigir = False
    if "---" in texto_conteudo or "title:" in texto_conteudo or "date:" in texto_conteudo:
        precisa_corrigir = True
        
    if not precisa_corrigir:
        print(f"Post {post_id} parece estar bem formatado. Pulando.")
        return False
    
    print(f"Corrigindo formatação do post {post_id}...")
    
    # Formatar o conteúdo
    try:
        resultado_formatado = formatar_conteudo.limpar_formatacao(texto_conteudo)
        conteudo_limpo = resultado_formatado["content"]
        
        # Extrair tags do conteúdo formatado
        tags_do_conteudo = resultado_formatado.get("tags", [])
        tags_para_usar = tags_do_conteudo if tags_do_conteudo else tags_atuais
        
        # Gerar novos blocos com o conteúdo limpo
        novos_blocos = gerar_novos_blocos(conteudo_limpo)
        
        # Atualizar o post com conteúdo e tags
        if atualizar_post(post_id, novos_blocos, tags_para_usar):
            print(f"Post {post_id} corrigido com sucesso!")
            if tags_para_usar:
                print(f"Tags atualizadas: {', '.join(tags_para_usar)}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"Erro ao formatar post {post_id}: {e}")
        return False

def corrigir_todos_posts():
    """Corrige a formatação de todos os posts."""
    posts = listar_posts()
    
    if not posts:
        print("Nenhum post encontrado para corrigir.")
        return
    
    corrigidos = 0
    for post in posts:
        if corrigir_formatacao_post(post):
            corrigidos += 1
    
    print(f"Formatação concluída! {corrigidos} posts corrigidos de um total de {len(posts)}.")

def corrigir_posts_com_titulo(titulo_parcial):
    """Corrige a formatação de posts que contêm o título especificado."""
    posts = listar_posts()
    
    if not posts:
        print("Nenhum post encontrado para corrigir.")
        return
    
    posts_para_corrigir = []
    for post in posts:
        if titulo_parcial.lower() in post.get('title', '').lower():
            posts_para_corrigir.append(post)
    
    print(f"\nEncontrados {len(posts_para_corrigir)} posts com o título contendo '{titulo_parcial}':")
    
    for i, post in enumerate(posts_para_corrigir, 1):
        print(f"{i}. ID: {post.get('_id')} - Título: {post.get('title')}")
    
    if posts_para_corrigir:
        confirmar = input("\nDeseja corrigir a formatação destes posts? (s/n): ")
        
        if confirmar.lower() == 's':
            corrigidos = 0
            for post in posts_para_corrigir:
                if corrigir_formatacao_post(post):
                    corrigidos += 1
            print(f"Formatação concluída! {corrigidos} posts corrigidos de um total de {len(posts_para_corrigir)}.")
        else:
            print("Operação cancelada pelo usuário.")
    else:
        print(f"Nenhum post encontrado com o título contendo '{titulo_parcial}'.")

if __name__ == "__main__":
    print("=== Script para Corrigir Formatação de Posts no Sanity CMS ===\n")
    print("Opções:")
    print("1. Corrigir todos os posts")
    print("2. Corrigir posts com título específico")
    print("3. Sair")
    
    opcao = input("\nEscolha uma opção (1-3): ")
    
    if opcao == "1":
        confirmar = input("Tem certeza que deseja corrigir TODOS os posts? (s/n): ")
        if confirmar.lower() == 's':
            corrigir_todos_posts()
        else:
            print("Operação cancelada pelo usuário.")
    elif opcao == "2":
        titulo = input("Digite parte do título a buscar: ")
        corrigir_posts_com_titulo(titulo)
    elif opcao == "3":
        print("Saindo...")
    else:
        print("Opção inválida!") 