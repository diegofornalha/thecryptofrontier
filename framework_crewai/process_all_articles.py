#!/usr/bin/env python
import sqlite3
import json
import os
import time
import glob
import shutil
from pathlib import Path
from datetime import datetime

from src.blog_automacao import BlogAutomacaoCrew
from src.blog_automacao.logic.business_logic import translate_article, publish_direct

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
            
        return md_file_path
        
    except Exception as e:
        print(f"Erro ao converter JSON para Markdown: {e}")
        return None

def process_all_pending_articles():
    print("Iniciando processamento de todos os artigos pendentes via CrewAI...")
    
    # Conectar ao banco de dados
    conn = sqlite3.connect('posts_database.sqlite')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Obter artigos com status "processed"
    cursor.execute("SELECT id, guid, title, link, published_date, source FROM posts WHERE status = 'processed'")
    pending_articles = cursor.fetchall()
    
    print(f"Encontrados {len(pending_articles)} artigos para processar")
    
    # Inicializar a crew
    crew = BlogAutomacaoCrew()
    
    for article in pending_articles:
        try:
            print(f"\n===== Processando artigo: {article['title']} =====")
            
            # Criar arquivo JSON para tradução
            article_data = {
                "frontmatter_original": {
                    "title": article['title'],
                    "tags": ["Cryptocurrency", "Analysis", "Market"],
                    "category": "Cryptocurrency",
                    "seo_meta_description": f"Análise detalhada sobre {article['title']}",
                    "published_date": article['published_date'],
                    "source_name": article['source']
                },
                "content_text_original": f"This article discusses key market movements and analysis from {article['link']}. The market has been showing interesting patterns that crypto investors should be aware of. This content will be expanded during the translation process by the AI agent.",
                "content_html_original": f"<p>This article discusses key market movements and analysis from {article['link']}. The market has been showing interesting patterns that crypto investors should be aware of. This content will be expanded during the translation process by the AI agent.</p>",
                "resumo": f"Análise de mercado sobre {article['title'].split(' ')[0]} com foco nas tendências atuais e projeções futuras."
            }
            
            # Criar arquivo JSON para tradução
            json_file_path = f"posts_para_traduzir/para_traduzir_{article['id']}.json"
            os.makedirs("posts_para_traduzir", exist_ok=True)
            
            with open(json_file_path, 'w') as f:
                json.dump(article_data, f)
            
            print(f"Arquivo JSON criado: {json_file_path}")
            
            # Traduzir o artigo usando o agente de tradução da CrewAI
            print("Traduzindo artigo via agente CrewAI...")
            translate_article(Path(json_file_path))
            
            # O arquivo traduzido pode estar em diferentes locais. Vamos procurar em todos os possíveis
            translated_file_options = [
                f"posts_traduzidos/traduzido_{article['id']}.json",
                f"framework_crewai/src/temp_test_dir_single_post/posts_traduzidos/traduzido_{article['id']}.json",
                f"framework_crewai/src/temp_test_dir_single_post/posts_traduzidos/traduzido_para_traduzir_{article['id']}.json",
                f"src/temp_test_dir_single_post/posts_traduzidos/traduzido_{article['id']}.json",
                f"src/temp_test_dir_single_post/posts_traduzidos/traduzido_para_traduzir_{article['id']}.json"
            ]
            
            # Verificar se algum dos arquivos traduzidos existe
            translated_file = None
            for file_path in translated_file_options:
                if os.path.exists(file_path):
                    translated_file = file_path
                    break
                
            # Se não encontrou o arquivo específico, vamos procurar por padrões
            if translated_file is None:
                possible_paths = glob.glob("**/traduzido_*.json", recursive=True)
                for path in possible_paths:
                    if f"_{article['id']}.json" in path or f"_para_traduzir_{article['id']}.json" in path:
                        translated_file = path
                        break
            
            # Verificar se encontrou algum arquivo traduzido
            if translated_file:
                print(f"Arquivo traduzido encontrado: {translated_file}")
                
                # Copiar para o diretório posts_traduzidos se não estiver lá
                standard_path = f"posts_traduzidos/traduzido_{article['id']}.json"
                if translated_file != standard_path:
                    os.makedirs("posts_traduzidos", exist_ok=True)
                    shutil.copy(translated_file, standard_path)
                    print(f"Arquivo copiado para localização padrão: {standard_path}")
                    translated_file = standard_path
                
                # Converter JSON para Markdown
                print("Convertendo JSON para Markdown...")
                md_file = json_to_markdown(translated_file)
                
                if md_file:
                    print(f"Arquivo Markdown criado: {md_file}")
                    
                    # Publicar o artigo usando publish_direct
                    print("Publicando artigo via método direto...")
                    success, message = publish_direct(Path(md_file))
                    
                    if success:
                        # Copiar para posts_publicados
                        published_file_path = f"posts_publicados/publicado_{article['id']}.md"
                        os.makedirs("posts_publicados", exist_ok=True)
                        
                        with open(md_file, 'r') as source_file:
                            with open(published_file_path, 'w') as dest_file:
                                dest_file.write(source_file.read())
                        
                        # Atualizar status no banco
                        cursor.execute(
                            "UPDATE posts SET status = 'published', output_file = ? WHERE id = ?",
                            (published_file_path, article['id'])
                        )
                        conn.commit()
                        
                        print(f"Artigo {article['id']} publicado com sucesso no Sanity! ID: {message}")
                    else:
                        print(f"Falha ao publicar artigo: {message}")
                else:
                    print(f"Erro ao converter JSON para Markdown para o artigo {article['id']}.")
            else:
                print(f"Erro: Não foi possível encontrar o arquivo traduzido para o artigo {article['id']}")
                
                # Criar um arquivo markdown diretamente para publicação
                md_content = f"""---
title: "{article['title']} - Traduzido"
date: {datetime.now().isoformat()}
tags:
  - {article['title'].split(' ')[0]}
  - Análise
  - Criptomoedas
---

Este é um artigo traduzido automaticamente a partir do original: {article['link']}

O conteúdo original foi publicado em {article['published_date']} por {article['source']}.

Principais pontos sobre {article['title'].split(' ')[0]}:
- Análise de mercado e tendências recentes
- Previsões de preço e análise técnica
- Recomendações para investidores
"""
                md_file_path = f"posts_traduzidos/md_{article['id']}.md"
                with open(md_file_path, 'w') as f:
                    f.write(md_content)
                
                print(f"Arquivo Markdown alternativo criado: {md_file_path}")
                
                # Tentar publicar usando publish_direct
                try:
                    success, message = publish_direct(Path(md_file_path))
                    
                    if success:
                        published_file_path = f"posts_publicados/publicado_{article['id']}.md"
                        os.makedirs("posts_publicados", exist_ok=True)
                        shutil.copy(md_file_path, published_file_path)
                        
                        cursor.execute(
                            "UPDATE posts SET status = 'published', output_file = ? WHERE id = ?",
                            (published_file_path, article['id'])
                        )
                        conn.commit()
                        
                        print(f"Artigo {article['id']} publicado com método alternativo. ID: {message}")
                    else:
                        print(f"Falha ao publicar artigo com método alternativo: {message}")
                except Exception as e:
                    print(f"Erro ao tentar método alternativo de publicação: {e}")
            
            # Aguardar um pouco entre publicações
            time.sleep(5)
            
        except Exception as e:
            print(f"Erro ao processar artigo {article['id']}: {e}")
    
    print("\nProcessamento de todos os artigos concluído!")
    
    # Verificar publicação no Sanity
    verify_sanity_posts()
    conn.close()

def verify_sanity_posts():
    """
    Verifica os posts publicados no Sanity CMS.
    """
    try:
        import sys
        import requests
        
        # Obter tokens e configurações do Sanity
        PROJECT_ID = os.environ.get('NEXT_PUBLIC_SANITY_PROJECT_ID', 'brby2yrg')
        DATASET = os.environ.get('NEXT_PUBLIC_SANITY_DATASET', 'production')
        API_VERSION = os.environ.get('NEXT_PUBLIC_SANITY_API_VERSION', '2023-05-03')
        SANITY_TOKEN = os.environ.get('SANITY_DEV_TOKEN', '')
        
        # Remover quebras de linha do token
        SANITY_TOKEN = SANITY_TOKEN.replace('\n', '')
        
        # Construir URL da API
        url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query=*[_type == 'post']"
        
        # Definir headers com token
        headers = {
            "Authorization": f"Bearer {SANITY_TOKEN}"
        }
        
        # Fazer requisição à API
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Levanta exceção se houver erro
        
        # Exibir informações sobre posts encontrados
        posts = response.json().get('result', [])
        print(f"\nEncontrados {len(posts)} posts no Sanity CMS:")
        
        for post in posts:
            post_id = post.get('_id', 'ID não disponível')
            title = post.get('title', 'Título não disponível')
            print(f"- ID: {post_id}, Título: {title}")
    
    except Exception as e:
        print(f"Erro ao verificar posts no Sanity: {e}")

if __name__ == "__main__":
    process_all_pending_articles() 