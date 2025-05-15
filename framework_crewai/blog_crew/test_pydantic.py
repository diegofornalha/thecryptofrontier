#!/usr/bin/env python3
"""
Script para testar a validação e serialização dos modelos Pydantic
"""

import json
import os
import sys
from datetime import datetime

# Adicionar diretório pai ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar modelos Pydantic
try:
    from models import Post, dict_to_post, post_to_sanity_format
    from models.feed import FeedArticle, TranslatedArticle, FormattedArticle
    from models.converters import fix_sanity_field_names, save_json_file
    print("Modelos Pydantic importados com sucesso!")
except ImportError as e:
    print(f"Erro ao importar modelos Pydantic: {str(e)}")
    sys.exit(1)

def test_post_validation():
    """Testa a validação de um post usando Pydantic"""
    try:
        # Carregar post de exemplo
        with open('posts_formatados/formatado_exemplo.json', 'r') as f:
            post_data = json.load(f)
        
        print(f"Post carregado: {post_data['title']}")
        
        # Converter para modelo Pydantic
        post_model = dict_to_post(post_data)
        print(f"Post convertido para modelo Pydantic com sucesso!")
        
        # Imprimir alguns campos do modelo
        print(f"Título: {post_model.title}")
        print(f"Slug: {post_model.slug.current}")
        print(f"Data de publicação: {post_model.publishedAt}")
        print(f"Número de blocos de conteúdo: {len(post_model.content)}")
        
        # Converter de volta para o formato do Sanity
        post_dict = post_model.model_dump(exclude_none=True)
        
        # Corrigir nomes de campos
        sanity_post = fix_sanity_field_names(post_dict)
        print(f"Post convertido para formato Sanity com sucesso!")
        
        # Verificar se os campos obrigatórios estão presentes
        required_fields = ["_type", "title", "slug", "publishedAt", "content"]
        missing_fields = [field for field in required_fields if field not in sanity_post]
        
        if missing_fields:
            print(f"ERRO: Campos obrigatórios ausentes: {missing_fields}")
        else:
            print("Todos os campos obrigatórios estão presentes!")
        
        # Salvar o post validado
        save_json_file(post_dict, 'posts_formatados/validado_exemplo.json')
        
        print(f"Post validado salvo em 'posts_formatados/validado_exemplo.json'")
        
        return True
    except Exception as e:
        print(f"Erro ao validar post: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_create_post():
    """Testa a criação de um post usando Pydantic"""
    try:
        # Criar um post a partir de dados simples
        post_data = {
            "title": "Artigo de Teste Criado via Pydantic",
            "content": "Este é um artigo de teste criado usando Pydantic.\n\nSegundo parágrafo de teste.\n\n# Cabeçalho H1\n\n## Cabeçalho H2\n\nMais um parágrafo de teste.",
            "link": "https://exemplo.com/artigo-teste",
            "summary": "Resumo do artigo de teste",
            "published": datetime.now().isoformat(),
            "source": "Teste Unitário"
        }
        
        print(f"Dados do post: {post_data['title']}")
        
        # Converter para modelo Pydantic
        post_model = dict_to_post(post_data)
        print(f"Post criado com modelo Pydantic com sucesso!")
        
        # Imprimir alguns campos do modelo
        print(f"Título: {post_model.title}")
        print(f"Slug: {post_model.slug.current}")
        print(f"Data de publicação: {post_model.publishedAt}")
        print(f"Número de blocos de conteúdo: {len(post_model.content)}")
        
        # Converter para o formato do Sanity
        post_dict = post_model.model_dump(exclude_none=True)
        
        # Corrigir nomes de campos
        sanity_post = fix_sanity_field_names(post_dict)
        print(f"Post convertido para formato Sanity com sucesso!")
        
        # Salvar o post criado
        save_json_file(post_dict, 'posts_formatados/criado_exemplo.json')
        
        print(f"Post criado salvo em 'posts_formatados/criado_exemplo.json'")
        
        return True
    except Exception as e:
        print(f"Erro ao criar post: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_feed_article():
    """Testa o modelo FeedArticle"""
    try:
        # Criar um artigo de feed
        feed_data = {
            "title": "Bitcoin atinge nova máxima histórica",
            "link": "https://exemplo.com/bitcoin-maxima",
            "summary": "Bitcoin supera US$ 100.000 pela primeira vez",
            "published": datetime.now().isoformat(),
            "content": "Conteúdo completo do artigo sobre Bitcoin",
            "source": "Portal de Notícias"
        }
        
        # Criar modelo
        feed_article = FeedArticle(**feed_data)
        print(f"Artigo de feed criado com sucesso: {feed_article.title}")
        
        # Converter para dict e salvar
        feed_dict = feed_article.model_dump()
        save_json_file(feed_dict, 'posts_para_traduzir/feed_exemplo.json')
        
        print(f"Artigo de feed salvo em 'posts_para_traduzir/feed_exemplo.json'")
        
        return True
    except Exception as e:
        print(f"Erro ao criar artigo de feed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_translated_article():
    """Testa o modelo TranslatedArticle"""
    try:
        # Criar um artigo traduzido
        translated_data = {
            "title": "Bitcoin atinge nova máxima histórica (traduzido)",
            "link": "https://exemplo.com/bitcoin-maxima",
            "summary": "Bitcoin supera US$ 100.000 pela primeira vez (traduzido)",
            "published": datetime.now().isoformat(),
            "content": "Conteúdo completo traduzido do artigo sobre Bitcoin",
            "source": "Portal de Notícias",
            "original_title": "Bitcoin reaches new all-time high"
        }
        
        # Criar modelo
        translated_article = TranslatedArticle(**translated_data)
        print(f"Artigo traduzido criado com sucesso: {translated_article.title}")
        
        # Converter para dict e salvar
        translated_dict = translated_article.model_dump()
        save_json_file(translated_dict, 'posts_traduzidos/traduzido_exemplo.json')
        
        print(f"Artigo traduzido salvo em 'posts_traduzidos/traduzido_exemplo.json'")
        
        return True
    except Exception as e:
        print(f"Erro ao criar artigo traduzido: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_formatted_article():
    """Testa o modelo FormattedArticle"""
    try:
        # Criar um artigo formatado para o Sanity
        formatted_data = {
            "_type": "post",
            "title": "Bitcoin atinge nova máxima histórica (formatado)",
            "slug": {"_type": "slug", "current": "bitcoin-atinge-nova-maxima-historica-formatado"},
            "publishedAt": datetime.now().isoformat(),
            "excerpt": "Bitcoin supera US$ 100.000 pela primeira vez",
            "content": [
                {
                    "_type": "block",
                    "_key": "a1b2c3d4",
                    "style": "h1",
                    "children": [
                        {
                            "_type": "span",
                            "_key": "e5f6g7h8",
                            "text": "Bitcoin Atinge Nova Máxima Histórica"
                        }
                    ]
                },
                {
                    "_type": "block",
                    "_key": "i9j0k1l2",
                    "style": "normal",
                    "children": [
                        {
                            "_type": "span",
                            "_key": "m3n4o5p6",
                            "text": "O Bitcoin atingiu um novo recorde de preço hoje."
                        }
                    ]
                }
            ],
            "originalSource": {
                "url": "https://exemplo.com/bitcoin-maxima",
                "title": "Bitcoin reaches new all-time high",
                "site": "Portal de Notícias"
            }
        }
        
        # Criar modelo
        formatted_article = FormattedArticle(**formatted_data)
        print(f"Artigo formatado criado com sucesso: {formatted_article.title}")
        
        # Converter para dict e salvar
        formatted_dict = formatted_article.model_dump()
        save_json_file(formatted_dict, 'posts_formatados/formatado_manual_exemplo.json')
        
        print(f"Artigo formatado salvo em 'posts_formatados/formatado_manual_exemplo.json'")
        
        return True
    except Exception as e:
        print(f"Erro ao criar artigo formatado: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testando validação de post...")
    test_post_validation()
    
    print("\nTestando criação de post...")
    test_create_post()
    
    print("\nTestando modelo FeedArticle...")
    test_feed_article()
    
    print("\nTestando modelo TranslatedArticle...")
    test_translated_article()
    
    print("\nTestando modelo FormattedArticle...")
    test_formatted_article()
    
    print("\nTestes concluídos!")