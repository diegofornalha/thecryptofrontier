"""
Modelos Pydantic para feeds RSS e artigos
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class FeedArticle(BaseModel):
    """Modelo para artigos extraídos de feeds RSS"""
    title: str
    link: HttpUrl
    summary: Optional[str] = None
    published: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None

class TranslatedArticle(BaseModel):
    """Modelo para artigos traduzidos"""
    title: str
    link: HttpUrl
    summary: Optional[str] = None
    published: Optional[str] = None
    content: str
    source: Optional[str] = None
    original_title: Optional[str] = None

class FormattedArticle(BaseModel):
    """Modelo para artigos formatados para o Sanity"""
    title: str
    slug: Dict[str, str]
    publishedAt: str
    excerpt: Optional[str] = None
    content: List[Dict[str, Any]]
    originalSource: Optional[Dict[str, Any]] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }