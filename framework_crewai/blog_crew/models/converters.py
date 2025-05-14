"""
Funções utilitárias para converter entre formatos Pydantic e Sanity
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from .post import Post, Block, SlugField, MainImage, OriginalSource, CryptoMeta, Reference

logger = logging.getLogger("model_converters")

def post_to_sanity_format(post: Post) -> Dict[str, Any]:
    """
    Converte um objeto Post Pydantic para o formato esperado pelo Sanity CMS.
    
    Args:
        post: Objeto Post do modelo Pydantic
        
    Returns:
        Dicionário no formato esperado pelo Sanity CMS
    """
    try:
        # Criar objeto base no formato do Sanity
        sanity_post = {
            "_type": "post",
            "title": post.title,
            "slug": post.slug.dict() if hasattr(post.slug, 'dict') else post.slug,
            "publishedAt": post.publishedAt,
            "content": post.content,
            "excerpt": post.excerpt or "",
        }
        
        # Adicionar campos opcionais se presentes
        if post.mainImage:
            sanity_post["mainImage"] = post.mainImage.dict() if hasattr(post.mainImage, 'dict') else post.mainImage
            
        if post.categories and len(post.categories) > 0:
            sanity_post["categories"] = [
                cat.dict() if hasattr(cat, 'dict') else cat
                for cat in post.categories
            ]
            
        if post.tags and len(post.tags) > 0:
            sanity_post["tags"] = [
                tag.dict() if hasattr(tag, 'dict') else tag
                for tag in post.tags
            ]
            
        if post.author:
            sanity_post["author"] = post.author.dict() if hasattr(post.author, 'dict') else post.author
            
        if post.cryptoMeta:
            sanity_post["cryptoMeta"] = post.cryptoMeta.dict() if hasattr(post.cryptoMeta, 'dict') else post.cryptoMeta
            
        if post.originalSource:
            sanity_post["originalSource"] = post.originalSource.dict() if hasattr(post.originalSource, 'dict') else post.originalSource
        
        return sanity_post
    
    except Exception as e:
        logger.error(f"Erro ao converter post para formato Sanity: {str(e)}")
        # Fallback para conversão básica
        return {
            "_type": "post",
            "title": post.title if hasattr(post, 'title') else "Sem título",
            "slug": {"_type": "slug", "current": post.slug.current if hasattr(post, 'slug') and hasattr(post.slug, 'current') else "sem-titulo"},
            "publishedAt": post.publishedAt if hasattr(post, 'publishedAt') else datetime.now().isoformat(),
            "content": post.content if hasattr(post, 'content') else [],
            "excerpt": post.excerpt if hasattr(post, 'excerpt') else ""
        }


def dict_to_post(data: Dict[str, Any]) -> Post:
    """
    Converte um dicionário para um objeto Post Pydantic.
    
    Args:
        data: Dicionário contendo os dados do post
        
    Returns:
        Objeto Post do modelo Pydantic
    """
    try:
        # Processar slug
        slug_data = data.get('slug', {})
        if isinstance(slug_data, str):
            slug = SlugField(current=slug_data)
        elif isinstance(slug_data, dict):
            if 'current' in slug_data:
                slug = SlugField(current=slug_data['current'])
            elif 'slug' in slug_data:
                slug = SlugField(current=slug_data['slug'])
            else:
                slug = SlugField(current=data.get('title', '').lower().replace(' ', '-'))
        else:
            slug = SlugField(current=data.get('title', '').lower().replace(' ', '-'))
        
        # Processar conteúdo
        content = data.get('content', [])
        if isinstance(content, str):
            # Converter texto simples em blocos
            content = [
                {
                    "_type": "block",
                    "style": "normal",
                    "children": [{"_type": "span", "text": p}]
                }
                for p in content.split('\n\n') if p.strip()
            ]
        
        # Processar originalSource
        original_source = data.get('originalSource')
        if not original_source and 'link' in data:
            original_source = {
                'url': data.get('link'),
                'title': data.get('original_title', data.get('title')),
                'site': data.get('source', 'Desconhecido')
            }
        
        # Construir o objeto Post
        post_data = {
            'title': data.get('title', 'Sem título'),
            'slug': slug,
            'publishedAt': data.get('publishedAt', datetime.now().isoformat()),
            'content': content,
            'excerpt': data.get('excerpt', ''),
        }
        
        # Adicionar campos opcionais se presentes
        if 'mainImage' in data and data['mainImage']:
            post_data['mainImage'] = data['mainImage']
            
        if original_source:
            post_data['originalSource'] = original_source
            
        if 'categories' in data and data['categories']:
            post_data['categories'] = data['categories']
            
        if 'tags' in data and data['tags']:
            post_data['tags'] = data['tags']
            
        if 'author' in data and data['author']:
            post_data['author'] = data['author']
            
        if 'cryptoMeta' in data and data['cryptoMeta']:
            post_data['cryptoMeta'] = data['cryptoMeta']
        
        return Post(**post_data)
    
    except Exception as e:
        logger.error(f"Erro ao converter dicionário para Post: {str(e)}")
        # Criar um Post mínimo válido
        return Post(
            title="Erro na conversão - " + data.get('title', 'Sem título')[:50],
            slug=SlugField(current="erro-conversao"),
            publishedAt=datetime.now().isoformat(),
            content=[{
                "_type": "block",
                "style": "normal",
                "children": [{"_type": "span", "text": "Erro ao processar conteúdo."}]
            }],
            excerpt="Erro ao converter dados para o formato Post."
        )