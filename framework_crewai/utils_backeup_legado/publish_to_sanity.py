#!/usr/bin/env python
import os
import sys
import json
import time
import sqlite3
import requests
from pathlib import Path
from datetime import datetime

# Importar a função publish_direct que sabemos que funciona
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from blog_automacao.logic.business_logic import publish_direct

def check_duplicate_post(title, url=None):
    """
    Verifica se já existe um post com título similar no Sanity CMS.
    Retorna True se encontrar um post similar, False caso contrário.
    """
    # Obter tokens e configurações do Sanity
    PROJECT_ID = os.environ.get('NEXT_PUBLIC_SANITY_PROJECT_ID', 'brby2yrg')
    DATASET = os.environ.get('NEXT_PUBLIC_SANITY_DATASET', 'production')
    API_VERSION = os.environ.get('NEXT_PUBLIC_SANITY_API_VERSION', '2023-05-03')
    SANITY_TOKEN = os.environ.get('SANITY_DEV_TOKEN', '')
    
    # Remover quebras de linha do token
    SANITY_TOKEN = SANITY_TOKEN.replace('\n', '')
    
    # Formatar título para busca
    # Remove aspas, apóstrofes e caracteres especiais para evitar erros na consulta
    search_title = title.replace('"', '').replace("'", "").replace('*', '').replace('&', '').strip()
    
    # Extrair palavras-chave do título (primeiras 3 palavras maiores que 3 caracteres)
    words = [w.lower() for w in search_title.split() if len(w) > 3][:3]
    if not words:
        return False
    
    keyword = words[0]  # Usar a primeira palavra-chave significativa
    
    # Construir URL da API com consulta GROQ simplificada
    # Buscar todos os posts e filtrar no código em vez de na consulta
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query=*[_type == 'post']"
    
    # Definir headers com token
    headers = {
        "Authorization": f"Bearer {SANITY_TOKEN}"
    }
    
    try:
        # Fazer requisição à API
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Analisar resultado
        posts = response.json().get('result', [])
        
        # Filtrar os posts com títulos similares
        similar_posts = []
        for post in posts:
            post_title = post.get('title', '').lower()
            # Verificar se a palavra-chave está no título
            if keyword in post_title:
                similar_posts.append(post)
        
        if similar_posts:
            print(f"⚠️ ATENÇÃO: Encontrados {len(similar_posts)} posts similares no Sanity:")
            for i, post in enumerate(similar_posts, 1):
                post_id = post.get('_id', 'ID não disponível')
                post_title = post.get('title', 'Título não disponível')
                print(f"  {i}. ID: {post_id}, Título: {post_title}")
            
            return True
        
        return False
        
    except Exception as e:
        print(f"Erro ao verificar duplicatas: {e}")
        # Em caso de erro, é melhor continuar o processo
        return False

def json_to_markdown(json_file_path):
    """
    Converte um arquivo JSON traduzido para um arquivo Markdown adequado para o Sanity.
    """
    # Verificar se o arquivo existe
    if not os.path.exists(json_file_path):
        print(f"Erro: Arquivo não encontrado: {json_file_path}")
        return None
        
    try:
        # Carregar o arquivo JSON
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Extrair os dados necessários
        frontmatter = data.get('frontmatter_traduzido', {})
        content = data.get('content_text_traduzido', '')
        
        if not frontmatter or not content:
            print(f"Erro: Arquivo JSON não contém dados traduzidos necessários: {json_file_path}")
            return None
            
        # Criar o conteúdo do arquivo Markdown
        markdown_content = "---\n"
        markdown_content += f"title: \"{frontmatter.get('title', 'Sem título')}\"\n"
        markdown_content += f"date: {frontmatter.get('published_date', datetime.now().isoformat())}\n"
        
        # Adicionar tags
        tags = frontmatter.get('tags', [])
        if tags:
            markdown_content += "tags:\n"
            for tag in tags:
                markdown_content += f"  - {tag}\n"
                
        # Adicionar categoria
        category = frontmatter.get('category', '')
        if category:
            markdown_content += f"category: {category}\n"
            
        # Adicionar descrição SEO
        seo_description = frontmatter.get('seo_meta_description', '')
        if seo_description:
            markdown_content += f"seo_meta_description: \"{seo_description}\"\n"
            
        # Adicionar slug
        slug = frontmatter.get('slug', '')
        if slug:
            markdown_content += f"slug: {slug}\n"
            
        # Fechar frontmatter
        markdown_content += "---\n\n"
        
        # Adicionar conteúdo
        markdown_content += content
        
        # Gerar caminho para o arquivo Markdown
        md_file_path = json_file_path.replace('.json', '.md')
        
        # Salvar arquivo Markdown
        with open(md_file_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
            
        return md_file_path, frontmatter.get('title', 'Sem título')
        
    except Exception as e:
        print(f"Erro ao converter JSON para Markdown: {e}")
        return None, None

def publish_articles():
    """
    Publica todos os artigos traduzidos no Sanity CMS.
    """
    # Conectar ao banco de dados
    conn = sqlite3.connect('posts_database.sqlite')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Buscar artigos marcados como "processed"
    cursor.execute("SELECT id, title, guid, status, output_file FROM posts WHERE status != 'published' OR output_file IS NULL")
    articles = cursor.fetchall()
    
    if not articles:
        print("Nenhum artigo pendente para publicação.")
        return
        
    print(f"Encontrados {len(articles)} artigos para publicar.\n")
    
    # Garantir que os diretórios existam
    os.makedirs('posts_traduzidos', exist_ok=True)
    os.makedirs('posts_publicados', exist_ok=True)
    
    # Processar cada artigo
    posts_publicados = 0
    posts_duplicados = 0
    
    for article in articles:
        article_id = article['id']
        title = article['title']
        guid = article['guid'] if 'guid' in article else ''
        status = article['status']
        
        print(f"\n===== Publicando artigo {article_id}: {title} =====")
        
        # Verificar se existe arquivo traduzido
        traducao_paths = [
            f"posts_traduzidos/traduzido_{article_id}.json",
            f"/src/temp_test_dir_single_post/posts_traduzidos/traduzido_{article_id}.json",
            f"src/temp_test_dir_single_post/posts_traduzidos/traduzido_{article_id}.json",
            f"posts_traduzidos/traduzido_para_traduzir_{article_id}.json"
        ]
        
        traducao_file = None
        for path in traducao_paths:
            if os.path.exists(path):
                traducao_file = path
                break
                
        # Se não encontrou a tradução, pular para o próximo artigo
        if not traducao_file:
            print(f"Nenhum arquivo de tradução encontrado para o artigo {article_id}.")
            continue
            
        print(f"Arquivo de tradução encontrado: {traducao_file}")
        
        # Converter o arquivo JSON para Markdown
        result = json_to_markdown(traducao_file)
        if not result or len(result) != 2:
            print(f"Falha ao converter JSON para Markdown para o artigo {article_id}.")
            continue
            
        md_file, post_title = result
        print(f"Arquivo Markdown criado: {md_file}")
        
        # Verificar se já existe um post similar no Sanity
        if check_duplicate_post(post_title, guid):
            print(f"Post similar já existe no Sanity! Marcando como duplicado e pulando...")
            # Marcar artigo como duplicado no banco de dados
            cursor.execute(
                "UPDATE posts SET status = 'duplicate' WHERE id = ?",
                (article_id,)
            )
            conn.commit()
            posts_duplicados += 1
            continue
        
        # Publicar o artigo no Sanity
        try:
            success, message = publish_direct(Path(md_file))
            
            if success:
                # Copiar para pasta de posts publicados
                published_file = f"posts_publicados/publicado_{article_id}.md"
                
                with open(md_file, 'r', encoding='utf-8') as source:
                    with open(published_file, 'w', encoding='utf-8') as dest:
                        dest.write(source.read())
                        
                # Atualizar o status no banco de dados
                cursor.execute(
                    "UPDATE posts SET status = 'published', output_file = ? WHERE id = ?",
                    (published_file, article_id)
                )
                conn.commit()
                posts_publicados += 1
                
                print(f"Artigo {article_id} publicado com sucesso! ID: {message}")
            else:
                print(f"Falha ao publicar artigo {article_id}: {message}")
                
        except Exception as e:
            print(f"Erro ao publicar artigo {article_id}: {e}")
            
        # Aguardar um pouco entre publicações
        time.sleep(3)
        
    conn.close()
    print(f"\nProcesso de publicação concluído! {posts_publicados} artigos publicados, {posts_duplicados} duplicados.")

def verify_publication():
    """
    Verifica no Sanity CMS quais artigos foram realmente publicados.
    """
    # Importar a função get_sanity_posts do módulo verify_sanity_posts
    sys.path.append(os.path.dirname(__file__))
    from framework_crewai.utils_backeup_legado.verify_sanity_posts import get_sanity_posts
    
    # Buscar posts no Sanity
    posts = get_sanity_posts()
    
    if not posts:
        print("Nenhum post encontrado no Sanity CMS.")
        return
        
    print(f"\nEncontrados {len(posts)} posts no Sanity CMS:\n")
    
    # Exibir IDs dos posts publicados
    for post in posts:
        post_id = post.get('_id', 'ID não disponível')
        title = post.get('title', 'Título não disponível')
        created_at = post.get('_createdAt', 'Data não disponível')
        
        print(f"- ID: {post_id}")
        print(f"  Título: {title}")
        print(f"  Criado em: {created_at}")
        print()

def verify_duplicates():
    """
    Verifica posts potencialmente duplicados no Sanity CMS.
    """
    # Importar a função get_sanity_posts do módulo verify_sanity_posts
    sys.path.append(os.path.dirname(__file__))
    from framework_crewai.utils_backeup_legado.verify_sanity_posts import get_sanity_posts
    
    # Buscar posts no Sanity
    posts = get_sanity_posts()
    
    if not posts:
        print("Nenhum post encontrado no Sanity CMS.")
        return
    
    # Agrupar posts por palavras-chave no título
    title_groups = {}
    
    for post in posts:
        title = post.get('title', '')
        
        # Extrair as três primeiras palavras significativas do título
        words = [w.lower() for w in title.split() if len(w) > 3][:3]
        
        if words:
            key = ' '.join(words)
            if key in title_groups:
                title_groups[key].append(post)
            else:
                title_groups[key] = [post]
    
    # Verificar grupos com mais de um post (potenciais duplicados)
    duplicates_found = False
    
    print("\nVerificando possíveis posts duplicados:")
    
    for key, group in title_groups.items():
        if len(group) > 1:
            duplicates_found = True
            print(f"\nPossíveis duplicatas encontradas ({key}):")
            
            for i, post in enumerate(group, 1):
                post_id = post.get('_id', 'ID não disponível')
                title = post.get('title', 'Título não disponível')
                created_at = post.get('_createdAt', 'Data não disponível')
                
                print(f"  {i}. ID: {post_id}")
                print(f"     Título: {title}")
                print(f"     Criado em: {created_at}")
    
    if not duplicates_found:
        print("  Nenhum post potencialmente duplicado encontrado.")

if __name__ == "__main__":
    # Publicar artigos
    publish_articles()
    
    # Verificar publicação
    verify_publication()
    
    # Verificar potenciais duplicados
    verify_duplicates() 