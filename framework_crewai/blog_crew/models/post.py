"""
Modelos Pydantic para estrutura de posts do Sanity
"""

from pydantic import BaseModel, Field, HttpUrl, validator, root_validator
from typing import List, Optional, Union, Dict, Any, Literal
from datetime import datetime
import uuid
import re
import unicodedata

class Span(BaseModel):
    """Modelo para spans dentro de blocos de texto"""
    _key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    _type: Literal["span"] = "span"
    text: str
    marks: Optional[List[str]] = None

class Block(BaseModel):
    """Modelo para blocos de texto"""
    _key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    _type: Literal["block"] = "block"
    style: str = "normal"
    children: List[Span]
    markDefs: Optional[List[Any]] = Field(default_factory=list)

class SlugField(BaseModel):
    """Modelo para slugs"""
    _type: Literal["slug"] = "slug"
    current: str

    @validator('current')
    def validate_slug(cls, v):
        """Validar formatação do slug"""
        if not v:
            raise ValueError("Slug não pode ser vazio")
        
        if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', v):
            # Converter para formato correto
            slug = v.lower()
            # Remover acentos
            slug = unicodedata.normalize('NFKD', slug)
            slug = ''.join([c for c in slug if not unicodedata.combining(c)])
            # Substituir espaços por hífens e remover caracteres não alfanuméricos
            slug = re.sub(r'[^a-z0-9\s-]', '', slug)
            slug = re.sub(r'[\s-]+', '-', slug)
            slug = slug.strip('-')
            return slug
        return v

class Asset(BaseModel):
    """Modelo para assets de imagem"""
    _type: Literal["reference"] = "reference"
    _ref: str

class ImageCrop(BaseModel):
    """Modelo para crop de imagem"""
    _type: Literal["sanity.imageCrop"] = "sanity.imageCrop"
    top: float = 0
    bottom: float = 0
    left: float = 0
    right: float = 0

class ImageHotspot(BaseModel):
    """Modelo para hotspot de imagem"""
    _type: Literal["sanity.imageHotspot"] = "sanity.imageHotspot"
    x: float = 0.5
    y: float = 0.5
    height: float = 1.0
    width: float = 1.0

class MainImage(BaseModel):
    """Modelo para imagem principal"""
    _type: Literal["image"] = "image"
    asset: Asset
    alt: Optional[str] = None
    caption: Optional[str] = None
    hotspot: Optional[ImageHotspot] = None
    crop: Optional[ImageCrop] = None

class OriginalSource(BaseModel):
    """Modelo para fonte original"""
    url: HttpUrl
    title: Optional[str] = None
    site: Optional[str] = None

class SEO(BaseModel):
    """Modelo para metadados SEO"""
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    
class CategoryReference(BaseModel):
    """Referência para categoria"""
    _type: Literal["reference"] = "reference"
    _ref: str
    _key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8])

class TagReference(BaseModel):
    """Referência para tag"""
    _type: Literal["reference"] = "reference"
    _ref: str
    _key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8])

class AuthorReference(BaseModel):
    """Referência para autor"""
    _type: Literal["reference"] = "reference"
    _ref: str

class CryptoMeta(BaseModel):
    """Modelo para metadados de criptomoeda"""
    symbol: Optional[str] = None
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    price_change_24h: Optional[float] = None

class Post(BaseModel):
    """Modelo principal para posts"""
    _type: Literal["post"] = "post"
    title: str = Field(..., min_length=5, max_length=150)
    slug: SlugField
    publishedAt: datetime
    mainImage: Optional[MainImage] = None
    categories: Optional[List[CategoryReference]] = None
    tags: Optional[List[TagReference]] = None
    author: Optional[AuthorReference] = None
    excerpt: Optional[str] = Field(None, max_length=300)
    cryptoMeta: Optional[CryptoMeta] = None
    content: List[Union[Block, Dict[str, Any]]]
    seo: Optional[SEO] = None
    originalSource: Optional[OriginalSource] = None
    
    @validator('title')
    def title_validator(cls, v):
        """Validar título"""
        if len(v) < 5:
            raise ValueError('O título deve ter pelo menos 5 caracteres')
        if len(v) > 150:
            return v[:150]
        return v
    
    @validator('content')
    def content_validator(cls, v):
        """Validar conteúdo"""
        if not v:
            raise ValueError('O conteúdo é obrigatório')
        return v
    
    @root_validator
    def check_source_and_make_slug(cls, values):
        """Verificar fonte original e criar slug se necessário"""
        # Se não tiver slug mas tiver título, criar slug
        if 'title' in values and ('slug' not in values or values['slug'] is None):
            title = values['title']
            # Gerar slug
            slug = title.lower()
            # Remover acentos
            slug = unicodedata.normalize('NFKD', slug)
            slug = ''.join([c for c in slug if not unicodedata.combining(c)])
            # Substituir espaços por hífens e remover caracteres não alfanuméricos
            slug = re.sub(r'[^a-z0-9\s-]', '', slug)
            slug = re.sub(r'[\s-]+', '-', slug)
            slug = slug.strip('-')
            values['slug'] = SlugField(current=slug)
            
        # Se tiver link mas não tiver originalSource, criar originalSource
        if 'originalSource' not in values or values['originalSource'] is None:
            link = values.get('link')
            if link:
                values['originalSource'] = OriginalSource(
                    url=link,
                    title=values.get('original_title') or values.get('title'),
                    site=values.get('source') or "Fonte Externa"
                )
                
        return values

def dict_to_post(data: Dict[str, Any]) -> Post:
    """
    Converte um dicionário para um objeto Post.
    Faz as transformações necessárias para adequar ao modelo Pydantic.
    """
    # Cópia para não modificar o original
    post_data = data.copy()
    
    # Processar conteúdo
    if 'content' in post_data:
        content = post_data['content']
        # Se for um dicionário com blocks (resultado de format_content_for_sanity)
        if isinstance(content, dict) and 'blocks' in content:
            post_data['content'] = content['blocks']
        # Se for um dicionário com success e blocks
        elif isinstance(content, dict) and 'success' in content and 'blocks' in content:
            post_data['content'] = content['blocks']
    
    # Processar slug
    if 'slug' in post_data:
        slug = post_data['slug']
        # Se for string, converter para objeto
        if isinstance(slug, str):
            post_data['slug'] = {'_type': 'slug', 'current': slug}
        # Se for objeto retornado por create_slug
        elif isinstance(slug, dict) and 'slug' in slug:
            post_data['slug'] = {'_type': 'slug', 'current': slug['slug']}
        elif isinstance(slug, dict) and 'success' in slug and 'slug' in slug:
            post_data['slug'] = {'_type': 'slug', 'current': slug['slug']}
    
    # Garantir que a data de publicação esteja no formato correto
    if 'publishedAt' not in post_data or not post_data['publishedAt']:
        post_data['publishedAt'] = datetime.now().isoformat()
    
    # Criar objeto Post
    try:
        return Post(**post_data)
    except Exception as e:
        # Tentativa alternativa com campos mínimos
        minimal_data = {
            'title': post_data.get('title', 'Título não especificado'),
            'publishedAt': datetime.now(),
            'content': [
                {
                    '_type': 'block',
                    'style': 'normal', 
                    'children': [
                        {'_type': 'span', 'text': post_data.get('content', 'Conteúdo não disponível')}
                    ]
                }
            ]
        }
        # Se tiver slug, adicionar
        if 'slug' in post_data and isinstance(post_data['slug'], dict) and 'current' in post_data['slug']:
            minimal_data['slug'] = post_data['slug']
        else:
            # Criar slug a partir do título
            slug = minimal_data['title'].lower()
            slug = unicodedata.normalize('NFKD', slug)
            slug = ''.join([c for c in slug if not unicodedata.combining(c)])
            slug = re.sub(r'[^a-z0-9\s-]', '', slug)
            slug = re.sub(r'[\s-]+', '-', slug)
            slug = slug.strip('-')
            minimal_data['slug'] = {'_type': 'slug', 'current': slug}
            
        return Post(**minimal_data)

def post_to_sanity_format(post: Post) -> Dict[str, Any]:
    """
    Converte um objeto Post para o formato esperado pelo Sanity.
    """
    # Converter para dict
    post_dict = post.dict(exclude_none=True)
    
    # Verificar conteúdo e fazer ajustes se necessário
    if 'content' in post_dict:
        content = post_dict['content']
        # Garantir que cada bloco tenha _key
        for i, block in enumerate(content):
            if '_key' not in block:
                block['_key'] = str(uuid.uuid4())[:8]
            
            # Se for bloco de texto, garantir que cada span tenha _key
            if block.get('_type') == 'block' and 'children' in block:
                for j, child in enumerate(block['children']):
                    if '_key' not in child:
                        child['_key'] = str(uuid.uuid4())[:8]
    
    return post_dict