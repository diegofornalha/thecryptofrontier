"""
Modelos Pydantic para estrutura de posts do Sanity
"""

from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator
from typing import List, Optional, Union, Dict, Any, Literal
from datetime import datetime
import uuid
import re
import unicodedata

class Span(BaseModel):
    """Modelo para spans dentro de blocos de texto"""
    key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8], alias="_key")
    type: Literal["span"] = Field("span", alias="_type")
    text: str
    marks: Optional[List[str]] = None

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "key" in d and d["key"] is not None:
            d["_key"] = d.pop("key")
        if "type" in d:
            d["_type"] = d.pop("type")
        return d

class Block(BaseModel):
    """Modelo para blocos de texto"""
    key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8], alias="_key")
    type: Literal["block"] = Field("block", alias="_type")
    style: str = "normal"
    children: List[Span]
    markDefs: Optional[List[Any]] = Field(default_factory=list)

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "key" in d and d["key"] is not None:
            d["_key"] = d.pop("key")
        if "type" in d:
            d["_type"] = d.pop("type")
        return d

class SlugField(BaseModel):
    """Modelo para slugs"""
    type: Literal["slug"] = Field("slug", alias="_type")
    current: str

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        return d

    @field_validator('current')
    @classmethod
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
    type: Literal["reference"] = Field("reference", alias="_type")
    ref: str = Field(alias="_ref")

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        if "ref" in d:
            d["_ref"] = d.pop("ref")
        return d

class ImageCrop(BaseModel):
    """Modelo para crop de imagem"""
    type: Literal["sanity.imageCrop"] = Field("sanity.imageCrop", alias="_type")
    top: float = 0
    bottom: float = 0
    left: float = 0
    right: float = 0

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        return d

class ImageHotspot(BaseModel):
    """Modelo para hotspot de imagem"""
    type: Literal["sanity.imageHotspot"] = Field("sanity.imageHotspot", alias="_type")
    x: float = 0.5
    y: float = 0.5
    height: float = 1.0
    width: float = 1.0

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        return d

class MainImage(BaseModel):
    """Modelo para imagem principal"""
    type: Literal["image"] = Field("image", alias="_type")
    asset: Asset
    alt: Optional[str] = None
    caption: Optional[str] = None
    hotspot: Optional[ImageHotspot] = None
    crop: Optional[ImageCrop] = None

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        return d

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
    type: Literal["reference"] = Field("reference", alias="_type")
    ref: str = Field(alias="_ref")
    key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8], alias="_key")

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        if "ref" in d:
            d["_ref"] = d.pop("ref")
        if "key" in d and d["key"] is not None:
            d["_key"] = d.pop("key")
        return d

class TagReference(BaseModel):
    """Referência para tag"""
    type: Literal["reference"] = Field("reference", alias="_type")
    ref: str = Field(alias="_ref")
    key: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4())[:8], alias="_key")

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        if "ref" in d:
            d["_ref"] = d.pop("ref")
        if "key" in d and d["key"] is not None:
            d["_key"] = d.pop("key")
        return d

class AuthorReference(BaseModel):
    """Referência para autor"""
    type: Literal["reference"] = Field("reference", alias="_type")
    ref: str = Field(alias="_ref")

    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        if "ref" in d:
            d["_ref"] = d.pop("ref")
        return d

class Post(BaseModel):
    """Modelo principal para posts"""
    type: Literal["post"] = Field("post", alias="_type")
    title: str = Field(..., min_length=5, max_length=150)
    slug: SlugField
    publishedAt: datetime
    mainImage: Optional[MainImage] = None
    categories: Optional[List[CategoryReference]] = None
    tags: Optional[List[TagReference]] = None
    author: Optional[AuthorReference] = None
    excerpt: Optional[str] = Field(None, max_length=300)
    content: List[Union[Block, Dict[str, Any]]]
    seo: Optional[SEO] = None
    originalSource: Optional[OriginalSource] = None
    
    model_config = {
        "populate_by_name": True
    }
        
    def model_dump(self, *args, **kwargs):
        """Sobrescrever para renomear os campos para o formato Sanity"""
        d = super().model_dump(*args, **kwargs)
        if "type" in d:
            d["_type"] = d.pop("type")
        return d
    
    @field_validator('title')
    @classmethod
    def title_validator(cls, v):
        """Validar título"""
        if len(v) < 5:
            raise ValueError('O título deve ter pelo menos 5 caracteres')
        if len(v) > 150:
            return v[:150]
        return v
    
    @field_validator('content')
    @classmethod
    def content_validator(cls, v):
        """Validar conteúdo"""
        if not v:
            raise ValueError('O conteúdo é obrigatório')
        return v
    
    @model_validator(mode='after')
    def check_source_and_make_slug(self):
        """Verificar fonte original e criar slug se necessário"""
        # Se não tiver slug mas tiver título, criar slug
        if not hasattr(self, 'slug') or self.slug is None:
            title = self.title
            # Gerar slug
            slug = title.lower()
            # Remover acentos
            slug = unicodedata.normalize('NFKD', slug)
            slug = ''.join([c for c in slug if not unicodedata.combining(c)])
            # Substituir espaços por hífens e remover caracteres não alfanuméricos
            slug = re.sub(r'[^a-z0-9\s-]', '', slug)
            slug = re.sub(r'[\s-]+', '-', slug)
            slug = slug.strip('-')
            self.slug = SlugField(current=slug)
            
        # Se tiver link mas não tiver originalSource, criar originalSource
        if not hasattr(self, 'originalSource') or self.originalSource is None:
            link = getattr(self, 'link', None)
            if link:
                self.originalSource = OriginalSource(
                    url=link,
                    title=getattr(self, 'original_title', None) or self.title,
                    site=getattr(self, 'source', None) or "Fonte Externa"
                )
                
        return self

def dict_to_post(data: Dict[str, Any]) -> Post:
    """
    Converte um dicionário para um objeto Post.
    Faz as transformações necessárias para adequar ao modelo Pydantic.
    """
    # Cópia para não modificar o original
    post_data = data.copy()
    
    # Processar campos com underlines (_type, _key, etc)
    if "_type" in post_data:
        post_data["type"] = post_data.pop("_type")
    
    # Processar conteúdo
    if 'content' in post_data:
        content = post_data['content']
        # Se for um dicionário com blocks (resultado de format_content_for_sanity)
        if isinstance(content, dict) and 'blocks' in content:
            post_data['content'] = content['blocks']
        # Se for um dicionário com success e blocks
        elif isinstance(content, dict) and 'success' in content and 'blocks' in content:
            post_data['content'] = content['blocks']
        
        # Processar cada bloco do conteúdo
        if isinstance(post_data['content'], list):
            for i, block in enumerate(post_data['content']):
                if isinstance(block, dict):
                    # Renomear campos com underlines
                    if "_type" in block:
                        block["type"] = block.pop("_type")
                    if "_key" in block:
                        block["key"] = block.pop("_key")
                    
                    # Processar children de cada bloco
                    if "children" in block and isinstance(block["children"], list):
                        for child in block["children"]:
                            if isinstance(child, dict):
                                if "_type" in child:
                                    child["type"] = child.pop("_type")
                                if "_key" in child:
                                    child["key"] = child.pop("_key")
    
    # Processar slug
    if 'slug' in post_data:
        slug = post_data['slug']
        # Se for string, converter para objeto
        if isinstance(slug, str):
            post_data['slug'] = {'type': 'slug', 'current': slug}
        # Se for objeto retornado por create_slug
        elif isinstance(slug, dict):
            if "_type" in slug:
                slug["type"] = slug.pop("_type")
            elif "slug" in slug:
                post_data['slug'] = {'type': 'slug', 'current': slug['slug']}
            elif 'success' in slug and 'slug' in slug:
                post_data['slug'] = {'type': 'slug', 'current': slug['slug']}
    
    # Garantir que a data de publicação esteja no formato correto
    if 'publishedAt' not in post_data or not post_data['publishedAt']:
        post_data['publishedAt'] = datetime.now().isoformat()
    
    # Criar objeto Post
    try:
        return Post(**post_data)
    except Exception as e:
        print(f"Erro ao criar Post a partir de dicionário: {str(e)}")
        # Tentativa alternativa com campos mínimos
        minimal_data = {
            'title': post_data.get('title', 'Título não especificado'),
            'publishedAt': datetime.now(),
            'content': [
                {
                    'type': 'block',
                    'style': 'normal', 
                    'children': [
                        {'type': 'span', 'text': post_data.get('content', 'Conteúdo não disponível')}
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
            minimal_data['slug'] = {'type': 'slug', 'current': slug}
            
        return Post(**minimal_data)

def post_to_sanity_format(post: Post) -> Dict[str, Any]:
    """
    Converte um objeto Post para o formato esperado pelo Sanity.
    """
    # Converter para dict
    post_dict = post.model_dump(exclude_none=True)
    
    # Garantir que cada bloco tenha _key
    if 'content' in post_dict and isinstance(post_dict['content'], list):
        for block in post_dict['content']:
            if isinstance(block, dict) and "_key" not in block and "key" not in block:
                block['_key'] = str(uuid.uuid4())[:8]
            
            # Garantir que cada span tenha _key
            if isinstance(block, dict) and 'children' in block and isinstance(block['children'], list):
                for child in block['children']:
                    if isinstance(child, dict) and "_key" not in child and "key" not in child:
                        child['_key'] = str(uuid.uuid4())[:8]
    
    return post_dict